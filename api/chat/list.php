<?php
require_once __DIR__ . '/../../db_conn.php';
require_once __DIR__ . '/../../api/cors.php';

handle_cors();
require_login();

$user_id = $_SESSION['user_id'];

$sql = "SELECT 
            m.other_user_id,
            u.full_name AS other_user_name,
            u.avatar AS other_user_avatar,
            m.context_type,
            m.context_id,
            c.message AS last_message,
            c.created_at AS last_message_time,
            c.is_read,
            c.sender_id
        FROM (
            SELECT 
                other_user_id, context_type, context_id, MAX(last_id) as last_id
            FROM (
                SELECT receiver_id as other_user_id, context_type, context_id, MAX(id) as last_id
                FROM chat_messages 
                WHERE sender_id = ?
                GROUP BY other_user_id, context_type, context_id
                
                UNION ALL
                
                SELECT sender_id as other_user_id, context_type, context_id, MAX(id) as last_id
                FROM chat_messages 
                WHERE receiver_id = ?
                GROUP BY other_user_id, context_type, context_id
            ) u
            GROUP BY other_user_id, context_type, context_id
        ) m
        JOIN users u ON m.other_user_id = u.id
        JOIN chat_messages c ON m.last_id = c.id
        ORDER BY c.created_at DESC
        LIMIT 50";

$stmt = mysqli_prepare($conn, $sql);
if (!$stmt) {
    send_json(['success' => false, 'message' => mysqli_error($conn)], 500);
}
mysqli_stmt_bind_param($stmt, 'ii', $user_id, $user_id);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);

$conversations = [];
while ($row = mysqli_fetch_assoc($res)) {
    $conversations[] = [
        'other_user_id' => (int)$row['other_user_id'],
        'other_user_name' => $row['other_user_name'] ?? 'User #'.$row['other_user_id'],
        'other_user_avatar' => $row['other_user_avatar'],
        'context_type' => $row['context_type'],
        'context_id' => (int)$row['context_id'],
        'last_message' => $row['last_message'],
        'last_message_time' => $row['last_message_time'],
        'unread' => ($row['is_read'] == 0 && $row['sender_id'] != $user_id)
    ];
}

send_json(['success' => true, 'data' => $conversations]);
?>
