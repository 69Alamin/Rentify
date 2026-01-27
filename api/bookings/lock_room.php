<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

$session_id = session_id();
$input = json_decode(file_get_contents('php://input'), true);
$room_type_id = (int)($input['room_type_id'] ?? 0);
$action = $input['action'] ?? 'lock'; // 'lock' or 'release'

if ($room_type_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid room type']);
    exit();
}

if ($action === 'release') {
    $sql = "UPDATE rooms SET locked_at = NULL, locked_by_session = NULL 
            WHERE room_type_id = ? AND locked_by_session = ?";
    db_query($sql, 'is', [$room_type_id, $session_id]);
    echo json_encode(['success' => true, 'message' => 'Room released']);
    exit();
}

// 1. Release expired locks globally
db_query("UPDATE rooms SET locked_at = NULL, locked_by_session = NULL WHERE locked_at < DATE_SUB(NOW(), INTERVAL 10 MINUTE)");

// 2. Try to find/lock a room
mysqli_begin_transaction($conn);
try {
    // Check if we already have one locked
    $check_query = "SELECT id FROM rooms WHERE room_type_id = ? AND locked_by_session = ? LIMIT 1";
    $check_res = db_query($check_query, 'is', [$room_type_id, $session_id]);
    
    if ($check_res && mysqli_num_rows($check_res) > 0) {
        $room = mysqli_fetch_assoc($check_res);
        // Refresh lock
        db_query("UPDATE rooms SET locked_at = NOW() WHERE id = ?", 'i', [$room['id']]);
        mysqli_commit($conn);
        echo json_encode(['success' => true, 'room_id' => $room['id'], 'message' => 'Lock refreshed']);
        exit();
    }

    // Find a new one
    $query = "SELECT id FROM rooms 
              WHERE room_type_id = ? 
              AND status = 'available' 
              AND (locked_at IS NULL OR locked_at < DATE_SUB(NOW(), INTERVAL 10 MINUTE))
              LIMIT 1 FOR UPDATE";
              
    $res = db_query($query, 'i', [$room_type_id]);
    if (!$res || mysqli_num_rows($res) === 0) {
        throw new Exception('No rooms available for this type');
    }
    
    $room = mysqli_fetch_assoc($res);
    $room_id = $room['id'];
    
    // Lock it
    db_query("UPDATE rooms SET locked_at = NOW(), locked_by_session = ? WHERE id = ?", 'si', [$session_id, $room_id]);
    
    mysqli_commit($conn);
    echo json_encode(['success' => true, 'room_id' => $room_id, 'message' => 'Room locked']);
} catch (Exception $e) {
    mysqli_rollback($conn);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
