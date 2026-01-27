<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

require_once __DIR__ . '/../../db_conn.php';
require_once __DIR__ . '/helpers/AuthMiddleware.php';

AuthMiddleware::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'GET') {
    $sql = "SELECT id, full_name, email, phone, is_verified, is_blocked, online_status, vehicle_model, vehicle_number 
            FROM users 
            WHERE user_type = 'rider' 
            ORDER BY created_at DESC";
    $res = db_query($sql);
    $drivers = [];
    while($row = mysqli_fetch_assoc($res)) {
        $row['is_verified'] = (bool)$row['is_verified'];
        $row['is_blocked'] = (bool)$row['is_blocked'];
        $drivers[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $drivers]);

} elseif ($method === 'POST') {
    // Actions: verify, update_vehicle
    $action = $input['action'] ?? '';
    $driver_id = (int)($input['driver_id'] ?? 0);

    if (!$driver_id) {
        echo json_encode(['success' => false, 'message' => 'Driver ID required']);
        exit();
    }

    if ($action === 'verify') {
        $status = (int)($input['is_verified'] ?? 0);
        db_query("UPDATE users SET is_verified = ? WHERE id = ?", 'ii', [$status, $driver_id]);
        echo json_encode(['success' => true, 'message' => 'Verification status updated']);
    } elseif ($action === 'update_vehicle') {
        $model = sanitize($input['vehicle_model'] ?? '');
        $plate = sanitize($input['vehicle_number'] ?? '');
        db_query("UPDATE users SET vehicle_model = ?, vehicle_number = ? WHERE id = ?", 'ssi', [$model, $plate, $driver_id]);
        echo json_encode(['success' => true, 'message' => 'Vehicle details updated']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
}
?>
