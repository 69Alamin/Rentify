<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'vendor') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$hotel_id = isset($_GET['hotel_id']) ? (int)$_GET['hotel_id'] : 0;
$vendor_id = $_SESSION['user_id'];

// Verify hotel ownership
$check_sql = "SELECT id, name, image_url FROM hotels WHERE id = ? AND vendor_id = ?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("ii", $hotel_id, $vendor_id);
$check_stmt->execute();
$prop_result = $check_stmt->get_result();

if ($prop_result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Hotel not found or unauthorized']);
    exit();
}

$property = $prop_result->fetch_assoc();

// 1. Total Bookings
$sql_total_bookings = "SELECT COUNT(*) as total FROM bookings b 
                       JOIN rooms r ON b.room_id = r.id 
                       JOIN room_types rt ON r.room_type_id = rt.id 
                       WHERE rt.hotel_id = ?";
$stmt = $conn->prepare($sql_total_bookings);
$stmt->bind_param("i", $hotel_id);
$stmt->execute();
$total_bookings = $stmt->get_result()->fetch_assoc()['total'];

// 2. Total Rooms
$sql_total_rooms = "SELECT COUNT(*) as total FROM rooms r 
                    JOIN room_types rt ON r.room_type_id = rt.id 
                    WHERE rt.hotel_id = ?";
$stmt = $conn->prepare($sql_total_rooms);
$stmt->bind_param("i", $hotel_id);
$stmt->execute();
$total_rooms = $stmt->get_result()->fetch_assoc()['total'];

// 3. Current Active Bookings (Booked Rooms)
// Active means: status is 'confirmed' or 'active' AND check_out_time > NOW() AND check_in_time <= NOW()
// Or simplify to: Currently occupied rooms.
// A simpler metric might be "Future & Active Bookings" or just "Active"
$now = date('Y-m-d H:i:s');
$sql_active_bookings = "SELECT COUNT(*) as total FROM bookings b 
                        JOIN rooms r ON b.room_id = r.id 
                        JOIN room_types rt ON r.room_type_id = rt.id 
                        WHERE rt.hotel_id = ? 
                        AND b.booking_status IN ('confirmed', 'active') 
                        AND b.check_out_time > ?";
$stmt = $conn->prepare($sql_active_bookings);
$stmt->bind_param("is", $hotel_id, $now);
$stmt->execute();
$active_bookings = $stmt->get_result()->fetch_assoc()['total'];

// 4. Available Rooms
// Total Rooms - Occupied Rooms
$available_rooms = max(0, $total_rooms - $active_bookings);

// 5. Total Revenue
$sql_revenue = "SELECT SUM(total_price) as total FROM bookings b 
                JOIN rooms r ON b.room_id = r.id 
                JOIN room_types rt ON r.room_type_id = rt.id 
                WHERE rt.hotel_id = ? 
                AND b.booking_status IN ('completed', 'confirmed', 'active')";
$stmt = $conn->prepare($sql_revenue);
$stmt->bind_param("i", $hotel_id);
$stmt->execute();
$revenue = $stmt->get_result()->fetch_assoc()['total'] ?? 0;

// 6. Recent bookings for trend (last 7 days?)
// Let's just return raw stats for now
$stats = [
    'hotel_name' => $property['name'],
    'image_url' => $property['image_url'],
    'total_bookings' => $total_bookings,
    'total_rooms' => $total_rooms,
    'booked_rooms' => $active_bookings,
    'available_rooms' => $available_rooms,
    'revenue' => (float)$revenue
];

echo json_encode(['success' => true, 'data' => $stats]);
?>
