<?php
require_once __DIR__ . '/../cors.php';
handle_cors();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'vendor') {
    send_json(['success' => false, 'message' => 'Unauthorized']);
}

$hotel_id = isset($_GET['hotel_id']) ? (int)$_GET['hotel_id'] : 0;
$vendor_id = $_SESSION['user_id'];

// Verify hotel ownership
$check_sql = "SELECT id, name, image_url FROM hotels WHERE id = ? AND vendor_id = ?";
$prop_result = db_query($check_sql, 'ii', [$hotel_id, $vendor_id]);

if (!$prop_result || mysqli_num_rows($prop_result) === 0) {
    send_json(['success' => false, 'message' => 'Hotel not found or unauthorized']);
}

$property = mysqli_fetch_assoc($prop_result);

// 1. Total Bookings
$sql_total_bookings = "SELECT COUNT(*) as total FROM bookings b 
                       JOIN rooms r ON b.room_id = r.id 
                       JOIN room_types rt ON r.room_type_id = rt.id 
                       WHERE rt.hotel_id = ?";
$res_total = db_query($sql_total_bookings, 'i', [$hotel_id]);
$total_bookings = mysqli_fetch_assoc($res_total)['total'];

// 2. Total Rooms
$sql_total_rooms = "SELECT COUNT(*) as total FROM rooms r 
                    JOIN room_types rt ON r.room_type_id = rt.id 
                    WHERE rt.hotel_id = ?";
$res_rooms = db_query($sql_total_rooms, 'i', [$hotel_id]);
$total_rooms = mysqli_fetch_assoc($res_rooms)['total'];

// 3. Current Active Bookings (Booked Rooms)
$now = date('Y-m-d H:i:s');
$sql_active_bookings = "SELECT COUNT(*) as total FROM bookings b 
                        JOIN rooms r ON b.room_id = r.id 
                        JOIN room_types rt ON r.room_type_id = rt.id 
                        WHERE rt.hotel_id = ? 
                        AND b.booking_status IN ('confirmed', 'active') 
                        AND b.check_out_time > ?";
$res_active = db_query($sql_active_bookings, 'is', [$hotel_id, $now]);
$active_bookings = mysqli_fetch_assoc($res_active)['total'];

// 4. Available Rooms
$available_rooms = max(0, $total_rooms - $active_bookings);

// 5. Total Revenue
$sql_revenue = "SELECT SUM(total_price) as total FROM bookings b 
                JOIN rooms r ON b.room_id = r.id 
                JOIN room_types rt ON r.room_type_id = rt.id 
                WHERE rt.hotel_id = ? 
                AND b.booking_status IN ('completed', 'confirmed', 'active')";
$res_rev = db_query($sql_revenue, 'i', [$hotel_id]);
$revenue = mysqli_fetch_assoc($res_rev)['total'] ?? 0;

$stats = [
    'hotel_name' => $property['name'],
    'image_url' => $property['image_url'],
    'total_bookings' => (int)$total_bookings,
    'total_rooms' => (int)$total_rooms,
    'booked_rooms' => (int)$active_bookings,
    'available_rooms' => (int)$available_rooms,
    'revenue' => (float)$revenue
];

send_json(['success' => true, 'data' => $stats]);
?>
