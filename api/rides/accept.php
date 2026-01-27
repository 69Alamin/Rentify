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

if (!isset($_SESSION['user_id']) || !in_array($_SESSION['user_type'], ['driver','rider'], true)) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$ride_id = (int)($input['ride_id'] ?? 0);
$driver_id = $_SESSION['user_id'];

if ($ride_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid ride ID']);
    exit();
}

// Atomic update: only update if status is still 'requested' and NOT locked by others (or lock is expired)
$sql = "UPDATE journey_requests 
        SET rider_id = ?, status = 'assigned', locked_at = NOW(), locked_by = ? 
        WHERE id = ? 
        AND status = 'requested' 
        AND (locked_at IS NULL OR locked_at < DATE_SUB(NOW(), INTERVAL 30 SECOND) OR locked_by = ?)";

if (db_query($sql, 'iiii', [$driver_id, $driver_id, $ride_id, $driver_id])) {
    // Check if any rows were affected
    if (($GLOBALS['db_affected_rows'] ?? 0) > 0) {
        // Set driver to BUSY
        db_query("UPDATE users SET online_status = 'busy' WHERE id = ?", 'i', [$driver_id]);
        echo json_encode(['success' => true, 'message' => 'Ride accepted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Ride already taken or temporarily locked']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to accept ride']);
}
?>
