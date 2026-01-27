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

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'driver') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$driver_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $type = $_GET['type'] ?? 'pending'; // pending, mine
    
    if ($type === 'pending') {
        $sql = "SELECT 
                    jr.id, jr.status, jr.created_at,
                    u.full_name AS customer_name, u.phone AS customer_phone,
                    jr.fare AS estimated_fare,
                    jr.pickup_latitude AS pickup_lat,
                    jr.pickup_longitude AS pickup_lng,
                    jr.dropoff_latitude AS destination_lat,
                    jr.dropoff_longitude AS destination_lng,
                    jr.destination_name AS destination_address,
                    '' AS pickup_address,
                    jr.vehicle_type,
                    b.check_in_time
                FROM journey_requests jr 
                JOIN users u ON jr.user_id = u.id 
                JOIN bookings b ON jr.booking_id = b.id
                WHERE jr.status = 'requested' AND (jr.rider_id IS NULL OR jr.rider_id = 0)";
    } else {
        $sql = "SELECT 
                    jr.id, jr.status, jr.created_at,
                    u.full_name AS customer_name, u.phone AS customer_phone,
                    jr.fare AS estimated_fare,
                    jr.pickup_latitude AS pickup_lat,
                    jr.pickup_longitude AS pickup_lng,
                    jr.dropoff_latitude AS destination_lat,
                    jr.dropoff_longitude AS destination_lng,
                    jr.destination_name AS destination_address,
                    '' AS pickup_address,
                    jr.vehicle_type,
                    b.check_in_time
                FROM journey_requests jr 
                JOIN users u ON jr.user_id = u.id 
                JOIN bookings b ON jr.booking_id = b.id
                WHERE jr.rider_id = ? 
                ORDER BY jr.created_at DESC";
    }
    
    $res = $type === 'pending' ? db_query($sql) : db_query($sql, 'i', [$driver_id]);
    $rides = [];
    while($row = mysqli_fetch_assoc($res)) $rides[] = $row;
    echo json_encode(['success' => true, 'data' => $rides]);
}
?>
