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

// Ensure missing columns exist (reset script omits total_earnings)
$checkCol = db_query("SELECT COUNT(*) AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'total_earnings'");
if ($checkCol && ($rowCol = mysqli_fetch_assoc($checkCol)) && intval($rowCol['c']) === 0) {
    db_query("ALTER TABLE users ADD COLUMN total_earnings DECIMAL(12,2) DEFAULT 0");
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$user_id = $_SESSION['user_id'];
$sql = "SELECT id, full_name, email, phone, user_type, vehicle_model, number_plate, rating_avg, total_earnings, online_status, is_verified, max_passengers, luggage_support FROM users WHERE id = ? LIMIT 1";
$res = db_query($sql, 'i', [$user_id]);

if ($row = mysqli_fetch_assoc($res)) {
    echo json_encode(['success' => true, 'data' => $row]);
} else {
    echo json_encode(['success' => false, 'message' => 'User not found']);
}
?>
