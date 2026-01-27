<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
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

$data = json_decode(file_get_contents('php://input'), true);
$notif_id = $data['notification_id'] ?? null;
$user_id = $_SESSION['user_id'];

if ($notif_id === 'all') {
    $sql = "UPDATE notifications SET is_read = 1 WHERE user_id = ?";
    $success = db_query($sql, 'i', [$user_id]);
} else if ($notif_id) {
    $sql = "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?";
    $success = db_query($sql, 'ii', [$notif_id, $user_id]);
} else {
    echo json_encode(['success' => false, 'message' => 'Missing notification ID']);
    exit();
}

echo json_encode(['success' => $success, 'message' => $success ? 'Notification(s) marked as read' : 'Failed to update notification']);
?>
