<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'driver') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$ride_id = (int)($input['ride_id'] ?? 0);

if ($ride_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid ride ID']);
    exit();
}

$sql = "UPDATE journey_requests SET driver_id = ?, status = 'accepted' WHERE id = ? AND (driver_id IS NULL OR driver_id = 0)";
if (db_query($sql, 'ii', [$_SESSION['user_id'], $ride_id])) {
    if (($GLOBALS['db_affected_rows'] ?? 0) > 0) {
        echo json_encode(['success' => true, 'message' => 'Ride accepted']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Ride already taken or not found']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to accept ride']);
}
?>
