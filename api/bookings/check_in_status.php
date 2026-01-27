<?php
header('Content-Type: application/json');
// Allow common dev ports
$allowed_origins = ['http://localhost:5173','http://localhost:5174','http://localhost:5175','http://localhost:5176','http://localhost:5177','http://127.0.0.1:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header('Access-Control-Allow-Origin: ' . (in_array($origin, $allowed_origins, true) ? $origin : 'http://localhost:5173'));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$user_id = (int)$_SESSION['user_id'];

// Get active (checked-in) booking for the user
$sql = "SELECT b.id as booking_id, b.check_in_time, b.check_out_time, b.room_id,
               p.id as hotel_id, p.name as hotel_name, p.latitude, p.longitude, p.has_restaurant as food_service_enabled,
               rt.name as room_type_name
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.id
        LEFT JOIN room_types rt ON r.room_type_id = rt.id
        LEFT JOIN hotels p ON rt.hotel_id = p.id
        WHERE b.user_id = ? 
        AND b.booking_status = 'active'
        AND b.check_in_time <= NOW()
        AND b.check_out_time > NOW()
        ORDER BY b.check_in_time DESC
        LIMIT 1";

$result = db_query($sql, 'i', [$user_id]);

if (!$result || mysqli_num_rows($result) === 0) {
    echo json_encode([
        'success' => true, 
        'is_checked_in' => false,
        'message' => 'No active check-in'
    ]);
    exit();
}

$booking = mysqli_fetch_assoc($result);

// Check if food service is available (enabled & within service hours)
$food_available = false;
if ($booking['food_service_enabled']) {
    // Assume food service is available during business hours (7 AM - 10 PM)
    $current_hour = (int)date('H');
    $food_available = ($current_hour >= 7 && $current_hour < 22);
}

echo json_encode([
    'success' => true,
    'is_checked_in' => true,
    'booking' => [
        'id' => $booking['booking_id'],
        'hotel_id' => $booking['hotel_id'],
        'hotel_name' => $booking['hotel_name'],
        'room_type_name' => $booking['room_type_name'],
        'room_id' => $booking['room_id'],
        'latitude' => $booking['latitude'],
        'longitude' => $booking['longitude'],
        'check_in_time' => $booking['check_in_time'],
        'check_out_time' => $booking['check_out_time']
    ],
    'services' => [
        'food_service' => [
            'enabled' => (bool)$booking['food_service_enabled'],
            'available' => $food_available,
            'reason' => !$booking['food_service_enabled'] ? 'Hotel does not offer food service' : 
                       (!$food_available ? 'Service available 7 AM - 10 PM' : 'Available now')
        ],
        'journey_service' => [
            'enabled' => true,
            'available' => true,
            'reason' => 'Alternative journey available for checked-in guests'
        ]
    ]
]);
?>
