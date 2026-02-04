<?php
require_once __DIR__ . '/../cors.php';
handle_cors();

session_start();

if (isset($_SESSION['user_id'])) {
    require_once __DIR__ . '/../../db_conn.php';
    $uid = $_SESSION['user_id'];
    $res = db_query("SELECT wallet_balance FROM users WHERE id = ?", 'i', [$uid]);
    $u = mysqli_fetch_assoc($res);
    
    send_json([
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'full_name' => $_SESSION['full_name'] ?? 'Vendor',
            'email' => $_SESSION['email'] ?? '',
            'type' => $_SESSION['user_type'],
            'profile_photo' => $_SESSION['profile_photo'] ?? null
        ]
    ]);
} else {
    send_json(['authenticated' => false]);
}
?>
