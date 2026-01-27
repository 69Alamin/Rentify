<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

require_once __DIR__ . '/../../db_conn.php';
require_once __DIR__ . '/helpers/AuthMiddleware.php';

AuthMiddleware::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'GET') {
    $sql = "SELECT jr.*, u.full_name as customer_name, d.full_name as driver_name 
            FROM journey_requests jr
            LEFT JOIN users u ON jr.user_id = u.id
            LEFT JOIN users d ON jr.driver_id = d.id
            ORDER BY jr.created_at DESC LIMIT 100";
    $res = db_query($sql);
    $rides = [];
    while($row = mysqli_fetch_assoc($res)) {
        $rides[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $rides]);

} elseif ($method === 'POST') {
    $action = $input['action'] ?? '';
    $ride_id = (int)($input['ride_id'] ?? 0);

    if ($action === 'cancel') {
        db_query("UPDATE journey_requests SET status = 'cancelled' WHERE id = ?", 'i', [$ride_id]);
        echo json_encode(['success' => true, 'message' => 'Ride cancelled']);
    } elseif ($action === 'assign_driver') {
        $driver_id = (int)($input['driver_id'] ?? 0);
        if ($driver_id) {
            db_query("UPDATE journey_requests SET driver_id = ?, status = 'accepted' WHERE id = ?", 'ii', [$driver_id, $ride_id]);
            echo json_encode(['success' => true, 'message' => 'Driver assigned manually']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Driver ID required']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
}
?>
