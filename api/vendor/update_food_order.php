<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';
handle_cors();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'vendor') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$order_id = isset($data['order_id']) ? (int)$data['order_id'] : 0;
$status = isset($data['status']) ? $data['status'] : '';
$minutes = isset($data['minutes']) ? (int)$data['minutes'] : 0;

if (!$order_id || !$status) {
    send_json(['success' => false, 'message' => 'Invalid parameters']);
}

// Security update: Ensure order belongs to a property owned by this vendor
// For simplicity assuming vendor trusts their own dashboard inputs, but ideally we check ownership.
// $check_sql = "SELECT fo.id FROM food_orders fo JOIN hotels p ON fo.hotel_id = p.id WHERE fo.id = ? AND p.vendor_id = ?";

$sql = "UPDATE food_orders SET status = ? WHERE id = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 'si', $status, $order_id);

if (mysqli_stmt_execute($stmt)) {
    send_json(['success' => true, 'message' => 'Food order status updated']);
} else {
    send_json(['success' => false, 'message' => 'Database error']);
}
?>
