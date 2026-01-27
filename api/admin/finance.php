<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';
session_start();
require_once __DIR__ . '/../../db_conn.php';
require_once __DIR__ . '/helpers/AuthMiddleware.php';

AuthMiddleware::requireAdmin();

$response = [
    'success' => true,
    'stats' => [
        'total_volume' => 0,
        'total_commission' => 0,
        'active_payouts' => 0
    ],
    'recent_transactions' => []
];

// 1. Calculate Stats
$stats_sql = "SELECT 
    SUM(CASE WHEN type = 'payment' THEN ABS(amount) ELSE 0 END) as volume,
    SUM(CASE WHEN type = 'commission' THEN amount ELSE 0 END) as revenue,
    SUM(CASE WHEN type = 'payout' AND amount > 0 THEN amount ELSE 0 END) as payouts
 FROM transactions";
$res_stats = db_query($stats_sql);
if ($row = mysqli_fetch_assoc($res_stats)) {
    $response['stats']['total_volume'] = (float)($row['volume'] ?? 0);
    $response['stats']['total_revenue'] = (float)($row['revenue'] ?? 0);
    $response['stats']['total_payouts'] = (float)($row['payouts'] ?? 0);
}

// 2. Fetch Recent Transactions with User info
$trans_sql = "SELECT t.*, u.full_name as user_name, u.user_type
              FROM transactions t
              JOIN users u ON t.user_id = u.id
              ORDER BY t.created_at DESC LIMIT 50";
$res_trans = db_query($trans_sql);
while ($row = mysqli_fetch_assoc($res_trans)) {
    $response['recent_transactions'][] = $row;
}

echo json_encode($response);
?>
