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

$input = json_decode(file_get_contents('php://input'), true);
$pickup_lat = (float)($input['pickup_lat'] ?? 0);
$pickup_lng = (float)($input['pickup_lng'] ?? 0);
$dest_lat = (float)($input['dest_lat'] ?? 0);
$dest_lng = (float)($input['dest_lng'] ?? 0);
$vehicle_type = strtolower($input['vehicle_type'] ?? 'car');

// Normalize aliases - DB expects 'motorbike'
if ($vehicle_type === 'bike') {
    $vehicle_type = 'motorbike';
}

if (!$pickup_lat || !$pickup_lng || !$dest_lat || !$dest_lng) {
    echo json_encode(['success' => false, 'message' => 'Invalid coordinates']);
    exit();
}

// Simple Haversine for distance
function getDistance($lat1, $lon1, $lat2, $lon2) {
    $earth_radius = 6371;
    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);
    $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon/2) * sin($dLon/2);
    $c = 2 * atan2(sqrt($a), sqrt(1-$a));
    return $earth_radius * $c;
}

$distance = getDistance($pickup_lat, $pickup_lng, $dest_lat, $dest_lng);
$base_fare = ($vehicle_type === 'motorbike') ? 50 : 100;
$rate_per_km = ($vehicle_type === 'motorbike') ? 15 : 40;

$estimated_fare = $base_fare + ($distance * $rate_per_km);

echo json_encode([
    'success' => true,
    'data' => [
        'distance_km' => round($distance, 2),
        'estimated_fare' => round($estimated_fare, 2),
        'vehicle_type' => $vehicle_type
    ]
]);
?>
