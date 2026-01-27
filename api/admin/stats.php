<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$stats = [
    'total_users' => 0,
    'total_hotels' => 0,
    'total_bookings' => 0,
    'total_revenue' => 0.00,
    'pending_verifications' => 0
];

$res = db_query("SELECT COUNT(*) as c FROM users");
$stats['total_users'] = (int)mysqli_fetch_assoc($res)['c'];

$res = db_query("SELECT COUNT(*) as c FROM hotels");
$stats['total_hotels'] = (int)mysqli_fetch_assoc($res)['c'];

$res = db_query("SELECT COUNT(*) as c FROM hotels WHERE is_verified = 0");
$stats['pending_verifications'] = (int)mysqli_fetch_assoc($res)['c'];

$res = db_query("SELECT COUNT(*) as c FROM bookings");
$stats['total_bookings'] = (int)mysqli_fetch_assoc($res)['c'];

$res = db_query("SELECT SUM(amount) as s FROM transactions WHERE type = 'commission'");
$stats['total_revenue'] = (float)(mysqli_fetch_assoc($res)['s'] ?? 0);

$res = db_query("SELECT SUM(amount) as s FROM transactions WHERE type = 'payment'");
$stats['total_volume'] = (float)(mysqli_fetch_assoc($res)['s'] ?? 0);

echo json_encode(['success' => true, 'data' => $stats]);
?>
