<?php
require_once __DIR__ . '/../cors.php';
handle_cors();

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
if (!in_array($status, ['pending', 'preparing', 'ready', 'delivered', 'cancelled'], true)) {
    send_json(['success' => false, 'message' => 'Invalid status']);
}

$sql = "UPDATE food_orders SET status = ?, updated_at = NOW() WHERE id = ?";
if (db_query($sql, 'si', [$status, $order_id])) {
    send_json(['success' => true, 'message' => 'Order status updated']);
} else {
    send_json(['success' => false, 'message' => 'Failed to update status']);
}
?>
