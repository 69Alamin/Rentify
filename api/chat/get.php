<?php
require_once __DIR__ . '/../../db_conn.php';
require_once __DIR__ . '/../../api/cors.php';

handle_cors();
require_login();

$user_id = $_SESSION['user_id'];
$other_id = (int)($_GET['other_id'] ?? 0);
$context_type = sanitize($_GET['context_type'] ?? 'general');
$context_id = (int)($_GET['context_id'] ?? 0);

if (!$other_id) {
    send_json(['success' => false, 'message' => 'Missing Other User ID'], 400);
}

$sql = "SELECT cm.*, u.full_name as sender_name 
        FROM (
            SELECT * FROM chat_messages 
            WHERE sender_id = ? AND receiver_id = ? AND context_type = ? AND context_id = ?
            
            UNION ALL
            
            SELECT * FROM chat_messages 
            WHERE sender_id = ? AND receiver_id = ? AND context_type = ? AND context_id = ?
        ) cm
        JOIN users u ON cm.sender_id = u.id
        ORDER BY cm.created_at ASC";

$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 'iisiiisi', $user_id, $other_id, $context_type, $context_id, $other_id, $user_id, $context_type, $context_id);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);

$messages = [];
while ($row = mysqli_fetch_assoc($res)) {
    $messages[] = $row;
}

// Mark as read
$update_sql = "UPDATE chat_messages SET is_read = 1 
               WHERE receiver_id = ? AND sender_id = ? AND context_type = ? AND context_id = ?";
$update_stmt = mysqli_prepare($conn, $update_sql);
mysqli_stmt_bind_param($update_stmt, 'iisi', $user_id, $other_id, $context_type, $context_id);
mysqli_stmt_execute($update_stmt);

send_json(['success' => true, 'data' => $messages]);
?>
