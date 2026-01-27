<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../db_conn.php';
require_once __DIR__ . '/helpers/AuthMiddleware.php';

AuthMiddleware::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch unverified hotels
    $sql = "SELECT p.*, u.full_name as owner_name 
            FROM hotels p 
            JOIN users u ON p.vendor_id = u.id 
            WHERE p.is_verified = 0 
            ORDER BY p.created_at DESC";
    $res = db_query($sql);
    $pending = [];
    while($row = mysqli_fetch_assoc($res)) {
        $pending[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $pending]);

} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $hotel_id = (int)($input['hotel_id'] ?? 0);
    $action = $input['action'] ?? '';

    if ($action === 'verify') {
        $sql = "UPDATE hotels SET is_verified = 1 WHERE id = ?";
        if (db_query($sql, 'i', [$hotel_id])) {
            echo json_encode(['success' => true, 'message' => 'Hotel verified successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to verify hotel']);
        }
    } elseif ($action === 'reject') {
        // Just delete or mark as rejected? Deleting is simpler for this project
        $sql = "DELETE FROM hotels WHERE id = ?";
        if (db_query($sql, 'i', [$hotel_id])) {
            echo json_encode(['success' => true, 'message' => 'Hotel rejected and removed']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to remove hotel']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
}
?>
