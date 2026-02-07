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

// Header and session already set up above

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$user_id = $_SESSION['user_id'];

$sql = "SELECT 
            id,
            full_name,
            email,
            phone,
            user_type,
            vehicle_model,
            number_plate,
            rating_avg,
            total_earnings,
            rider_online_status AS online_status,
            is_verified,
            max_passengers,
            luggage_support,
            COALESCE(wallet_balance, 0) AS balance
        FROM user_profiles_complete
        WHERE id = ?
        LIMIT 1";
$res = db_query($sql, 'i', [$user_id]);

if ($row = mysqli_fetch_assoc($res)) {
    echo json_encode(['success' => true, 'data' => $row]);
} else {
    echo json_encode(['success' => false, 'message' => 'User not found']);
}
?>
