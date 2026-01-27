<?php
header('Content-Type: application/json');
// Allow common dev ports
$allowed_origins = ['http://localhost:5173','http://localhost:5174','http://localhost:5175','http://localhost:5176','http://localhost:5177','http://127.0.0.1:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header('Access-Control-Allow-Origin: ' . (in_array($origin, $allowed_origins, true) ? $origin : 'http://localhost:5173'));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

// Get available riders (online drivers with good ratings)
$sql = "SELECT 
    u.id,
    u.full_name,
    u.phone,
    u.rating_avg as rating,
    u.is_verified,
    u.vehicle_model,
    u.last_lat,
    u.last_lng,
    u.online_status,
    COUNT(DISTINCT jr.id) as completed_rides
FROM users u
LEFT JOIN journey_requests jr ON u.id = jr.rider_id AND jr.status = 'completed'
WHERE u.user_type = 'rider' 
  AND u.online_status = 'online'
  AND (u.rating_avg >= 4 OR u.rating_avg IS NULL)
GROUP BY u.id
ORDER BY u.rating_avg DESC, u.created_at DESC
LIMIT 20";

$result = db_query($sql);
$riders = [];

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $riders[] = [
            'id' => $row['id'],
            'name' => $row['full_name'],
            'phone' => $row['phone'],
            'rating' => $row['rating'] ? (float)$row['rating'] : 4.5,
            'is_verified' => $row['is_verified'],
            'vehicle_model' => $row['vehicle_model'] ?: 'Standard Vehicle',
            'completed_rides' => (int)$row['completed_rides'],
            'lat' => $row['last_lat'],
            'lng' => $row['last_lng']
        ];
    }
}

echo json_encode(['success' => true, 'data' => $riders]);
?>
