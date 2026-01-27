<?php
header('Content-Type: application/json');
$allowed_origins = ['http://localhost:5173','http://localhost:5174','http://localhost:5175','http://localhost:5176','http://localhost:5177','http://127.0.0.1:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header('Access-Control-Allow-Origin: ' . (in_array($origin, $allowed_origins, true) ? $origin : 'http://localhost:5173'));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$ride_id = (int)($input['ride_id'] ?? 0);
$lat = (float)($input['lat'] ?? 0);
$lng = (float)($input['lng'] ?? 0);

if ($ride_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid ride ID']);
    exit();
}

$driver_id = $_SESSION['user_id'];

// Get ride details to find customer
$sql = "SELECT user_id, status, pickup_address, destination_name, rider_id 
        FROM journey_requests 
        WHERE id = ? AND rider_id = ?";
$res = db_query($sql, 'ii', [$ride_id, $driver_id]);
$ride = mysqli_fetch_assoc($res);

if (!$ride) {
    echo json_encode(['success' => false, 'message' => 'Ride not found']);
    exit();
}

$customer_id = $ride['user_id'];

// Get driver info for notification
$driverRes = db_query("SELECT full_name, phone FROM users WHERE id = ?", 'i', [$driver_id]);
$driver = mysqli_fetch_assoc($driverRes);

// Insert notification for customer with location
$stage = '';
if ($ride['status'] === 'on_the_way') {
    $stage = $ride['pickup_address'] ? "Driver is on the way to pickup" : "Driver is arriving at pickup";
} elseif ($ride['status'] === 'picked') {
    $stage = "Driver heading to " . $ride['destination_name'];
}

$message = "$stage - Driver: {$driver['full_name']} • {$driver['phone']}";
$locationData = json_encode(['lat' => $lat, 'lng' => $lng, 'ride_id' => $ride_id]);

$notifSql = "INSERT INTO notifications (user_id, type, title, message, data, is_read, created_at) 
             VALUES (?, 'ride_location', 'Driver Location Update', ?, ?, 0, NOW())";

if (db_query($notifSql, 'iss', [$customer_id, $message, $locationData])) {
    echo json_encode([
        'success' => true, 
        'message' => 'Location sent to customer',
        'stage' => $stage
    ]);
} else {
    echo json_encode([
        'success' => false, 
        'message' => 'Failed to send location',
        'debug' => mysqli_error($conn)
    ]);
}
?>
