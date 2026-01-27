<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

require_once __DIR__ . '/../../db_conn.php';
require_once __DIR__ . '/helpers/AuthMiddleware.php';

AuthMiddleware::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'GET') {
    $sql = "SELECT p.*, u.full_name as owner_name 
            FROM hotels p 
            LEFT JOIN users u ON p.vendor_id = u.id 
            ORDER BY p.created_at DESC";
    $res = db_query($sql);
    $hotels = [];
    while($row = mysqli_fetch_assoc($res)) {
        $row['is_active'] = (bool)$row['is_active'];
        $row['is_verified'] = (bool)$row['is_verified'];
        $hotels[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $hotels]);

} elseif ($method === 'POST') {
    // Actions: create, update, toggle_active
    $action = $input['action'] ?? 'create';
    
    if ($action === 'toggle_active') {
        // Emergency Stop / Activation
        $id = (int)($input['id'] ?? 0);
        $active = (int)($input['is_active'] ?? 1);
        
        if (db_query("UPDATE hotels SET is_active = ? WHERE id = ?", 'ii', [$active, $id])) {
            echo json_encode(['success' => true, 'message' => 'Status updated']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Update failed']);
        }
    } 
    // Add create/update logic later if needed (keeping it simple for now)
    else {
        echo json_encode(['success' => false, 'message' => 'Action not supported yet']);
    }
} elseif ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (db_query("DELETE FROM hotels WHERE id = ?", 'i', [$id])) {
        echo json_encode(['success' => true, 'message' => 'Hotel deleted']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Delete failed']);
    }
}
?>
