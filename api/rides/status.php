<?php
header('Content-Type: application/json');
// Allow common dev ports
$allowed_origins = ['http://localhost:5173','http://localhost:5174','http://localhost:5175','http://localhost:5176','http://localhost:5177','http://127.0.0.1:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header('Access-Control-Allow-Origin: ' . (in_array($origin, $allowed_origins, true) ? $origin : 'http://localhost:5173'));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$ride_id = (int)($input['ride_id'] ?? 0);
$status = sanitize($input['status'] ?? '');

if ($ride_id <= 0 || empty($status)) {
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
    exit();
}

$user_id = $_SESSION['user_id'];
$user_type = $_SESSION['user_type'];

// Drivers can update status of rides they accepted
// Admins can update any ride
// Statuses: 'requested', 'accepted', 'on_the_way', 'picked_up', 'completed', 'cancelled'

if ($user_type === 'driver' || $user_type === 'rider') {
    // journey_requests uses rider_id for assigned driver
    $sql = "UPDATE journey_requests SET status = ? WHERE id = ? AND rider_id = ?";
    $params = [$status, $ride_id, $user_id];
    $types = 'sii';
} elseif ($user_type === 'admin') {
    $sql = "UPDATE journey_requests SET status = ? WHERE id = ?";
    $params = [$status, $ride_id];
    $types = 'si';
} else {
    echo json_encode(['success' => false, 'message' => 'Unauthorized to update status']);
    exit();
}

if (db_query($sql, $types, $params)) {
    if ($status === 'completed' && ($user_type === 'driver' || $user_type === 'rider')) {
        db_query("UPDATE users SET online_status = 'online' WHERE id = ?", 'i', [$user_id]);
    }
    
    // Realtime notification
    update_realtime_status('ride', $ride_id, $status);
    
    echo json_encode(['success' => true, 'message' => 'Ride status updated']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update ride status']);
}
?>
