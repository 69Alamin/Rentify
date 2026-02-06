<?php
require_once __DIR__ . '/../../db_conn.php';
require_once __DIR__ . '/../../api/cors.php';

handle_cors();
require_login();

$user_id = $_SESSION['user_id'];

// Get total unread count for the current user
$sql = "SELECT COUNT(*) as unread_count 
        FROM chat_messages 
        WHERE receiver_id = ? AND is_read = 0";

$stmt = mysqli_prepare($conn, $sql);
if (!$stmt) {
    send_json(['success' => false, 'message' => mysqli_error($conn)], 500);
}
mysqli_stmt_bind_param($stmt, 'i', $user_id);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);
$row = mysqli_fetch_assoc($res);

send_json([
    'success' => true, 
    'unread_count' => (int)($row['unread_count'] ?? 0)
]);
?>
