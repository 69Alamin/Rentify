<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();

if (isset($_SESSION['user_id'])) {
    require_once __DIR__ . '/../../db_conn.php';
    $uid = $_SESSION['user_id'];
    $res = db_query("SELECT wallet_balance FROM users WHERE id = ?", 'i', [$uid]);
    $u = mysqli_fetch_assoc($res);
    
    echo json_encode([
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['name'],
            'email' => $_SESSION['email'],
            'type' => $_SESSION['user_type'],
            'balance' => (float)($u['wallet_balance'] ?? 0)
        ]
    ]);
} else {
    echo json_encode(['authenticated' => false]);
}
?>
