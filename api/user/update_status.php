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

// Ensure required columns exist (reset script currently omits them)
function ensure_user_column($name, $definition) {
    $exists_sql = "SELECT COUNT(*) AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = ?";
    $res = db_query($exists_sql, 's', [$name]);
    $row = $res ? mysqli_fetch_assoc($res) : null;
    if (!$row || intval($row['c']) === 0) {
        db_query("ALTER TABLE users ADD COLUMN $name $definition");
    }
}

ensure_user_column('online_status', "ENUM('offline','online','busy') DEFAULT 'offline'");
ensure_user_column('last_lat', 'DECIMAL(10,8) NULL');
ensure_user_column('last_lng', 'DECIMAL(11,8) NULL');
ensure_user_column('vehicle_model', 'VARCHAR(255) NULL');
ensure_user_column('number_plate', 'VARCHAR(100) NULL');
ensure_user_column('max_passengers', 'INT DEFAULT 2');
ensure_user_column('luggage_support', 'TINYINT DEFAULT 0');
ensure_user_column('rating_avg', 'DECIMAL(3,2) DEFAULT 5.00');

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized',
        'debug' => ['has_session' => false]
    ]);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$status = $input['status'] ?? ''; // offline, online, busy

if (!in_array($status, ['offline', 'online', 'busy'], true)) {
    $status = 'online'; // fallback to online if unknown to keep UX moving
}

$user_id = $_SESSION['user_id'];
$sql = "UPDATE users SET online_status = ? WHERE id = ?";

$ok = db_query($sql, 'si', [$status, $user_id]);

if ($ok) {
    echo json_encode(['success' => true, 'message' => 'Status updated to ' . $status, 'status' => $status]);
    exit();
}

// Provide explicit SQL error
echo json_encode([
    'success' => false,
    'message' => 'Failed to update status',
    'debug' => ['sql_error' => mysqli_error($conn)]
]);
?>
