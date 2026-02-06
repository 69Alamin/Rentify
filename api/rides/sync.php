<?php
header('Content-Type: application/json');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$user_id = $_SESSION['user_id'];
$user_type = $_SESSION['user_type'];

if ($user_type !== 'driver' && $user_type !== 'rider') {
    echo json_encode(['success' => false, 'message' => 'Rider/Driver access only']);
    exit();
}

$lat = isset($_GET['lat']) && $_GET['lat'] != 0 ? (float)$_GET['lat'] : null;
$lng = isset($_GET['lng']) && $_GET['lng'] != 0 ? (float)$_GET['lng'] : null;

// 1. Get Profile
$profile_sql = "SELECT id, full_name, user_type, phone, online_status, rating_avg, vehicle_model, number_plate, max_passengers, luggage_support FROM users WHERE id = ?";
$p_res = db_query($profile_sql, 'i', [$user_id]);
$profile = mysqli_fetch_assoc($p_res);

// 2. Get Earnings Stats
$daily_sql = "SELECT SUM(fare) as earnings FROM journey_requests WHERE rider_id = ? AND status = 'completed' AND DATE(created_at) = CURDATE()";
$daily_res = db_query($daily_sql, 'i', [$user_id]);
$daily = mysqli_fetch_assoc($daily_res)['earnings'] ?? 0;

$weekly_sql = "SELECT SUM(fare) as earnings FROM journey_requests WHERE rider_id = ? AND status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
$weekly_res = db_query($weekly_sql, 'i', [$user_id]);
$weekly = mysqli_fetch_assoc($weekly_res)['earnings'] ?? 0;

$all_sql = "SELECT SUM(fare) as earnings, COUNT(id) as total_trips FROM journey_requests WHERE rider_id = ? AND status = 'completed'";
$all_res = db_query($all_sql, 'i', [$user_id]);
$all = mysqli_fetch_assoc($all_res);

$stats = [
    'daily' => number_format($daily, 2, '.', ''),
    'weekly' => number_format($weekly, 2, '.', ''),
    'total' => number_format($all['earnings'] ?? 0, 2, '.', ''),
    'trips' => $all['total_trips'] ?? 0
];

// 3. Get Rides (Requests + Assigned)
$rides = [];
$rides_sql = "SELECT 
            jr.*,
            u.full_name AS customer_name, u.phone AS customer_phone,
            jr.fare AS estimated_fare,
            jr.pickup_latitude AS pickup_lat,
            jr.pickup_longitude AS pickup_lng,
            jr.dropoff_latitude AS destination_lat,
            jr.dropoff_longitude AS destination_lng,
            jr.destination_name AS destination_address,
            jr.rider_id AS driver_id,
            (6371 * acos(cos(radians(?)) * cos(radians(jr.pickup_latitude)) * cos(radians(jr.pickup_longitude) - radians(?)) + sin(radians(?)) * sin(radians(jr.pickup_latitude)))) AS distance_km
        FROM journey_requests jr
        JOIN users u ON jr.user_id = u.id
        WHERE (jr.status = 'requested' AND (jr.rider_id IS NULL OR jr.rider_id = 0))
        OR jr.rider_id = ?
        ORDER BY 
            CASE WHEN jr.rider_id = ? THEN 0 ELSE 1 END,
            jr.created_at DESC";

$r_res = db_query($rides_sql, 'dddii', [$lat, $lng, $lat, $user_id, $user_id]);
if ($r_res) while($row = mysqli_fetch_assoc($r_res)) $rides[] = $row;

echo json_encode([
    'success' => true,
    'profile' => $profile,
    'stats' => $stats,
    'rides' => $rides
]);
?>
