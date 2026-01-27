<?php
header('Content-Type: application/json');
// Allow common dev ports
$allowed_origins = ['http://localhost:5173','http://localhost:5174','http://localhost:5175','http://localhost:5176','http://localhost:5177','http://127.0.0.1:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header('Access-Control-Allow-Origin: ' . (in_array($origin, $allowed_origins, true) ? $origin : 'http://localhost:5173'));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id']) || !in_array($_SESSION['user_type'], ['driver','rider'], true)) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$user_id = $_SESSION['user_id'];

// Get Daily Earnings
$daily_sql = "SELECT SUM(fare) as earnings FROM journey_requests WHERE rider_id = ? AND status = 'completed' AND DATE(created_at) = CURDATE()";
$daily_res = db_query($daily_sql, 'i', [$user_id]);
$daily = mysqli_fetch_assoc($daily_res)['earnings'] ?? 0;

// Get Weekly Earnings
$weekly_sql = "SELECT SUM(fare) as earnings FROM journey_requests WHERE rider_id = ? AND status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
$weekly_res = db_query($weekly_sql, 'i', [$user_id]);
$weekly = mysqli_fetch_assoc($weekly_res)['earnings'] ?? 0;

// Get All Time
$all_sql = "SELECT SUM(fare) as earnings, COUNT(id) as total_trips FROM journey_requests WHERE rider_id = ? AND status = 'completed'";
$all_res = db_query($all_sql, 'i', [$user_id]);
$all = mysqli_fetch_assoc($all_res);

echo json_encode([
    'success' => true,
    'data' => [
        'daily' => number_format($daily, 2),
        'weekly' => number_format($weekly, 2),
        'total' => number_format($all['earnings'] ?? 0, 2),
        'trips' => $all['total_trips'] ?? 0
    ]
]);
?>
