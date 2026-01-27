<?php
header('Content-Type: application/json');
// Allow common dev ports
$allowed_origins = ['http://localhost:5173','http://localhost:5174','http://localhost:5175','http://localhost:5176','http://localhost:5177','http://127.0.0.1:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header('Access-Control-Allow-Origin: ' . (in_array($origin, $allowed_origins, true) ? $origin : 'http://localhost:5173'));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$lat = (float)($input['lat'] ?? 0);
$lng = (float)($input['lng'] ?? 0);
$user_id = $_SESSION['user_id'];

if (!$lat || !$lng) {
    echo json_encode(['success' => false, 'message' => 'Invalid coordinates']);
    exit();
}

$sql = "UPDATE users SET last_lat = ?, last_lng = ? WHERE id = ?";
if (db_query($sql, 'ddi', [$lat, $lng, $user_id])) {
    echo json_encode(['success' => true, 'message' => 'Location updated']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update location']);
}
?>
