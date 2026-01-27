<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

require_once __DIR__ . '/../../db_conn.php';
require_once __DIR__ . '/helpers/AuthMiddleware.php';

AuthMiddleware::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'GET') {
    $res = db_query("SELECT pr.*, p.name as hotel_name 
                     FROM pricing_rules pr 
                     LEFT JOIN hotels p ON pr.hotel_id = p.id 
                     ORDER BY pr.created_at DESC");
    $rules = [];
    while ($row = mysqli_fetch_assoc($res)) {
        $row['is_active'] = (bool)$row['is_active'];
        $rules[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $rules]);
} elseif ($method === 'POST') {
    $name = sanitize($input['rule_name'] ?? '');
    $multiplier = (float)($input['multiplier'] ?? 1.0);
    $active = (int)($input['is_active'] ?? 1);
    
    if (!$name) {
        echo json_encode(['success' => false, 'message' => 'Rule name required']);
        exit();
    }

    $sql = "INSERT INTO pricing_rules (rule_name, multiplier, is_active) VALUES (?, ?, ?)";
    if (db_query($sql, 'sdi', [$name, $multiplier, $active])) {
        echo json_encode(['success' => true, 'message' => 'Rule created']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed']);
    }
} elseif ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    db_query("DELETE FROM pricing_rules WHERE id = ?", 'i', [$id]);
    echo json_encode(['success' => true, 'message' => 'Rule deleted']);
}
?>
