<?php
require_once __DIR__ . '/../../db_conn.php';
require_once __DIR__ . '/../../api/cors.php';

handle_cors();
require_login();

$data = json_decode(file_get_contents('php://input'), true);
$receiver_id = (int)($data['receiver_id'] ?? 0);
$message = sanitize($data['message'] ?? '');
$context_type = sanitize($data['context_type'] ?? 'general');
$context_id = (int)($data['context_id'] ?? 0);
$sender_id = $_SESSION['user_id'];

if (!$receiver_id || !$message) {
    send_json(['success' => false, 'message' => 'Missing fields'], 400);
}

$sql = "INSERT INTO chat_messages (sender_id, receiver_id, message, context_type, context_id) 
        VALUES (?, ?, ?, ?, ?)";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 'iissi', $sender_id, $receiver_id, $message, $context_type, $context_id);

if (mysqli_stmt_execute($stmt)) {
    $msg_id = mysqli_insert_id($conn);
    
    // Update realtime status for the receiver
    update_realtime_status('chat', $receiver_id, 'new_message_' . $msg_id);
    
    send_json([
        'success' => true, 
        'message' => 'Sent successfully', 
        'data' => [
            'id' => $msg_id,
            'sender_id' => $sender_id,
            'receiver_id' => $receiver_id,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s'),
            'context_type' => $context_type,
            'context_id' => $context_id
        ]
    ]);
} else {
    send_json(['success' => false, 'message' => 'Failed to send message'], 500);
}
?>
