<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

require_once __DIR__ . '/../../db_conn.php';
require_once __DIR__ . '/helpers/AuthMiddleware.php';

AuthMiddleware::requireAdmin();

$user_id = (int)($_GET['user_id'] ?? 0);
if (!$user_id) {
    echo json_encode(['success' => false, 'message' => 'User ID required']);
    exit();
}

$response = [
    'profile' => null,
    'bookings' => [],
    'rides' => []
];

// 1. Profile
$res = db_query("SELECT id, full_name, email, phone, user_type, is_verified, is_blocked, created_at, wallet_balance as balance FROM users WHERE id = ?", 'i', [$user_id]);
if ($res && mysqli_num_rows($res) > 0) {
    $response['profile'] = mysqli_fetch_assoc($res);
} else {
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit();
}

// 2. Bookings (Last 10)
$sql_bookings = "SELECT b.id, b.check_in_time, b.check_out_time, b.total_price, b.booking_status, 
                        p.name as hotel_name, rt.name as room_name
                 FROM bookings b
                 LEFT JOIN rooms r ON b.room_id = r.id
                 LEFT JOIN room_types rt ON r.room_type_id = rt.id
                 LEFT JOIN hotels p ON rt.hotel_id = p.id
                 WHERE b.user_id = ?
                 ORDER BY b.created_at DESC LIMIT 10";
$res_b = db_query($sql_bookings, 'i', [$user_id]);
while($row = mysqli_fetch_assoc($res_b)) {
    $response['bookings'][] = $row;
}

// 3. Rides (Last 10) - Temporarily disabled due to schema mismatch
// TODO: Fix journey_requests table schema or update query
/*
$sql_rides = "SELECT id, pickup_name as pickup_location, destination_name as dropoff_location, status, created_at 
              FROM journey_requests 
              WHERE user_id = ? 
              ORDER BY created_at DESC LIMIT 10";
$res_r = db_query($sql_rides, 'i', [$user_id]);
if ($res_r) {
    while($row = mysqli_fetch_assoc($res_r)) {
        $response['rides'][] = $row;
    }
}
*/


echo json_encode(['success' => true, 'data' => $response]);
?>
