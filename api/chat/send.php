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

// ---------------------------------------------------------
// Chat Restriction Logic: Only Vendors/Riders -> Admin
// ---------------------------------------------------------
$role_sql = "SELECT id, user_type FROM users WHERE id IN (?, ?)";
$role_stmt = mysqli_prepare($conn, $role_sql);
mysqli_stmt_bind_param($role_stmt, 'ii', $sender_id, $receiver_id);
mysqli_stmt_execute($role_stmt);
$role_res = mysqli_stmt_get_result($role_stmt);

$u_roles = [];
while ($row = mysqli_fetch_assoc($role_res)) {
    $u_roles[$row['id']] = $row['user_type'];
}

$s_role = $u_roles[$sender_id] ?? '';
$r_role = $u_roles[$receiver_id] ?? '';

if ($r_role === 'admin') {
    $allowed_senders = ['vendor', 'rider', 'driver', 'admin'];
    if (!in_array($s_role, $allowed_senders)) {
        send_json(['success' => false, 'message' => 'Only Vendors and Riders are authorized to chat with Admin.'], 403);
    }
}
// ---------------------------------------------------------

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
