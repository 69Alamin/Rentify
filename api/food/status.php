<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'vendor') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$order_id = (int)($input['order_id'] ?? 0);
$status = $input['status'] ?? ''; // preparing, ready, delivered, cancelled

$allowed_status = ['preparing', 'ready', 'delivered', 'cancelled'];
if (!in_array($status, $allowed_status)) {
    echo json_encode(['success' => false, 'message' => 'Invalid status']);
    exit();
}

$sql = "UPDATE food_orders SET status = ?, updated_at = NOW() WHERE id = ?";
if (db_query($sql, 'si', [$status, $order_id])) {
    echo json_encode(['success' => true, 'message' => 'Order status updated']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update status']);
}
?>
