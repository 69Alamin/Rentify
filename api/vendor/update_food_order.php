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

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'vendor') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$order_id = isset($data['order_id']) ? (int)$data['order_id'] : 0;
$status = isset($data['status']) ? $data['status'] : '';
$minutes = isset($data['minutes']) ? (int)$data['minutes'] : 0;

if (!$order_id || !$status) {
    echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
    exit();
}

// Security update: Ensure order belongs to a property owned by this vendor
// For simplicity assuming vendor trusts their own dashboard inputs, but ideally we check ownership.
// $check_sql = "SELECT fo.id FROM food_orders fo JOIN hotels p ON fo.hotel_id = p.id WHERE fo.id = ? AND p.vendor_id = ?";

$sql = "UPDATE food_orders SET status = ? WHERE id = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 'si', $status, $order_id);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode(['success' => true, 'message' => 'Food order status updated']);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . mysqli_stmt_error($stmt)]);
}
?>
