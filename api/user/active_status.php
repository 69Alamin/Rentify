<?php
header('Content-Type: application/json');
// Allow common dev ports
$allowed_origins = ['http://localhost:5173','http://localhost:5174','http://localhost:5175','http://localhost:5176','http://localhost:5177','http://127.0.0.1:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header('Access-Control-Allow-Origin: ' . (in_array($origin, $allowed_origins, true) ? $origin : 'http://localhost:5173'));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'active' => false, 'message' => 'Unauthorized']);
    exit();
}

$user_id = $_SESSION['user_id'];
$response = [
    'success' => true,
    'active' => false,
    'type' => null, // 'food', 'ride', 'stay'
    'message' => ''
];

// 1. Check active ride requests
// Assuming table is ride_requests - checking if table exists effectively via query
// If ride_requests table doesn't exist yet, we skips.
// Based on previous user context "requestingRide" logic in Dashboard, let's assume table `rides` or `ride_requests`.
// Let's use a safe check.
$sql_rides = "SHOW TABLES LIKE 'ride_requests'";
if(mysqli_num_rows(db_query($sql_rides)) > 0) {
    $sql = "SELECT status FROM ride_requests WHERE user_id = ? AND status IN ('pending', 'accepted', 'in_progress') LIMIT 1";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'i', $user_id);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    if ($row = mysqli_fetch_assoc($res)) {
        $response['active'] = true;
        $response['type'] = 'ride';
        $response['message'] = 'Ride ' . ucfirst($row['status']);
        echo json_encode($response);
        exit();
    }
}

// 2. Check active food orders
$sql = "SELECT status FROM food_orders WHERE user_id = ? AND status IN ('pending', 'accepted', 'cooking', 'ready') LIMIT 1";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 'i', $user_id);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);
if ($row = mysqli_fetch_assoc($res)) {
    $response['active'] = true;
    $response['type'] = 'food';
    $st = $row['status'];
    if($st == 'accepted' || $st == 'cooking') $st = 'Preparing';
    $response['message'] = 'Food: ' . ucfirst($st);
    echo json_encode($response);
    exit();
}

// 3. Check active bookings (checked in) via joins (bookings -> rooms -> room_types -> hotels)
$sql = "SELECT p.id as hotel_id 
        FROM bookings b 
        LEFT JOIN rooms r ON b.room_id = r.id 
        LEFT JOIN room_types rt ON r.room_type_id = rt.id 
        LEFT JOIN hotels p ON rt.hotel_id = p.id 
        WHERE b.user_id = ? AND b.booking_status = 'active' 
        LIMIT 1";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 'i', $user_id);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);
if ($row = mysqli_fetch_assoc($res)) {
    $response['active'] = true;
    $response['type'] = 'stay';
    $response['message'] = 'Stay Active';
}

echo json_encode($response);
?>
