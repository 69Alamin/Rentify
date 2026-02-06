<?php
require_once __DIR__ . '/../../db_conn.php';
require_once __DIR__ . '/../../api/cors.php';

handle_cors();

$sql = "SELECT id, full_name AS name FROM users WHERE user_type = 'admin' LIMIT 1";
$result = mysqli_query($conn, $sql);

if ($row = mysqli_fetch_assoc($result)) {
    echo json_encode(['success' => true, 'data' => $row]);
} else {
    echo json_encode(['success' => false, 'message' => 'No admin found']);
}
?>
