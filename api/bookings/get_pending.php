<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

if (!isset($_SESSION['pending_booking']) || empty($_SESSION['pending_booking'])) {
    echo json_encode(['success' => false, 'message' => 'No pending booking found']);
    exit();
}

$pending = $_SESSION['pending_booking'];
$room_type_id = (int)($pending['room_type_id'] ?? 0);
$hotel_id = (int)($pending['hotel_id'] ?? 0);

// Fetch Room & Hotel Info for display
$query = "SELECT rt.name as room_name, rt.base_price_per_hour, h.name as hotel_name, h.address, h.image_url 
          FROM room_types rt 
          JOIN hotels h ON rt.hotel_id = h.id 
          WHERE rt.id = ? AND h.id = ?";
$res = db_query($query, 'ii', [$room_type_id, $hotel_id]);

if ($res && mysqli_num_rows($res) > 0) {
    $data = mysqli_fetch_assoc($res);
    $pending['details'] = $data;
    
    // Calculate totals
    $total_hours = (int)($pending['booked_hours'] ?? 1);
    $room_total = $total_hours * (float)$data['base_price_per_hour'];
    $ride_total = !empty($pending['vehicle_needed']) ? 150 : 0; // Simplified flat rate or from session if exists
    $pending['pricing'] = [
        'room_total' => $room_total,
        'ride_total' => $ride_total,
        'grand_total' => $room_total + $ride_total
    ];

    echo json_encode(['success' => true, 'data' => $pending]);
} else {
    echo json_encode(['success' => false, 'message' => 'Linked hotel or room no longer exists']);
}
?>
