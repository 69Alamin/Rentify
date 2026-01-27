<?php
error_reporting(E_ALL);
ini_set('display_errors', '0');

header('Content-Type: application/json');
// Allow common dev ports
$allowed_origins = ['http://localhost:5173','http://localhost:5174','http://localhost:5175','http://localhost:5176','http://localhost:5177','http://127.0.0.1:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header('Access-Control-Allow-Origin: ' . (in_array($origin, $allowed_origins, true) ? $origin : 'http://localhost:5173'));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

set_error_handler(function($errno, $errstr) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $errstr]);
    exit();
});

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user_id = $_SESSION['user_id'];
    $user_type = $_SESSION['user_type'];

    if ($user_type === 'admin') {
        $sql = "SELECT jr.*, u.full_name as customer_name, d.full_name as driver_name 
                FROM journey_requests jr 
                JOIN users u ON jr.user_id = u.id 
                LEFT JOIN users d ON jr.driver_id = d.id
                ORDER BY jr.created_at DESC";
        $res = db_query($sql);
    } elseif ($user_type === 'driver' || $user_type === 'rider') {
        $lat = (float)($_GET['lat'] ?? 0);
        $lng = (float)($_GET['lng'] ?? 0);
        $radius = 10; // 10km radius

        if ($lat && $lng) {
            // Proximity search + already accepted rides (use rider_id as assigned driver field)
            $sql = "SELECT 
                        jr.id, jr.status, jr.created_at,
                        u.full_name AS customer_name, u.phone AS customer_phone,
                        jr.fare AS estimated_fare,
                        jr.pickup_latitude AS pickup_lat,
                        jr.pickup_longitude AS pickup_lng,
                        jr.dropoff_latitude AS destination_lat,
                        jr.dropoff_longitude AS destination_lng,
                        jr.destination_name AS destination_address,
                        '' AS pickup_address,
                        jr.vehicle_type,
                        jr.rider_id AS driver_id,
                        (6371 * acos(cos(radians(?)) * cos(radians(jr.pickup_latitude)) * cos(radians(jr.pickup_longitude) - radians(?)) + sin(radians(?)) * sin(radians(jr.pickup_latitude)))) AS distance_km
                    FROM journey_requests jr
                    JOIN users u ON jr.user_id = u.id
                    JOIN users d_check ON d_check.id = ?
                    WHERE (
                        jr.status = 'requested'
                        AND d_check.online_status = 'online'
                        AND (jr.locked_at IS NULL OR jr.locked_at < DATE_SUB(NOW(), INTERVAL 30 SECOND))
                        AND (6371 * acos(cos(radians(?)) * cos(radians(jr.pickup_latitude)) * cos(radians(jr.pickup_longitude) - radians(?)) + sin(radians(?)) * sin(radians(jr.pickup_latitude)))) <= ?
                    )
                    OR jr.rider_id = ?
                    ORDER BY 
                        CASE WHEN jr.rider_id = ? THEN 0 ELSE 1 END,
                        distance_km ASC, 
                        jr.created_at DESC";
            $res = db_query($sql, 'dddiddddii', [$lat, $lng, $lat, $user_id, $lat, $lng, $lat, $radius, $user_id, $user_id]);
        } else {
            // No location: show all pending plus my rides
            $sql = "SELECT 
                        jr.id, jr.status, jr.created_at,
                        u.full_name AS customer_name, u.phone AS customer_phone,
                        jr.fare AS estimated_fare,
                        jr.pickup_latitude AS pickup_lat,
                        jr.pickup_longitude AS pickup_lng,
                        jr.dropoff_latitude AS destination_lat,
                        jr.dropoff_longitude AS destination_lng,
                        jr.destination_name AS destination_address,
                        '' AS pickup_address,
                        jr.vehicle_type,
                        jr.rider_id AS driver_id
                    FROM journey_requests jr 
                    JOIN users u ON jr.user_id = u.id 
                    WHERE jr.status = 'requested' AND (jr.rider_id IS NULL OR jr.rider_id = 0)
                    ORDER BY jr.created_at DESC";
            $resPending = db_query($sql);

            $sqlMine = "SELECT 
                        jr.id, jr.status, jr.created_at,
                        u.full_name AS customer_name, u.phone AS customer_phone,
                        jr.fare AS estimated_fare,
                        jr.pickup_latitude AS pickup_lat,
                        jr.pickup_longitude AS pickup_lng,
                        jr.dropoff_latitude AS destination_lat,
                        jr.dropoff_longitude AS destination_lng,
                        jr.destination_name AS destination_address,
                        '' AS pickup_address,
                        jr.vehicle_type,
                        jr.rider_id AS driver_id
                    FROM journey_requests jr 
                    JOIN users u ON jr.user_id = u.id 
                    WHERE jr.rider_id = ?
                    ORDER BY jr.created_at DESC";
            $resMine = db_query($sqlMine, 'i', [$user_id]);
        }
    } else {
        // Customer: show their ride requests with assigned rider
        $sql = "SELECT jr.*, jr.fare AS estimated_fare,
                jr.dropoff_latitude AS destination_lat, 
                jr.dropoff_longitude AS destination_lng,
                d.full_name as driver_name, d.phone as driver_phone, d.last_lat as driver_lat, d.last_lng as driver_lng, d.rating_avg as driver_rating, d.is_verified as driver_verified, d.vehicle_model
                FROM journey_requests jr 
                LEFT JOIN users d ON jr.rider_id = d.id
                WHERE jr.user_id = ?
                ORDER BY jr.created_at DESC";
        $res = db_query($sql, 'i', [$user_id]);
    }

    $rides = [];
    if (isset($resPending) && $resPending) {
        while($row = mysqli_fetch_assoc($resPending)) $rides[] = $row;
    }
    if (isset($resMine) && $resMine) {
        while($row = mysqli_fetch_assoc($resMine)) $rides[] = $row;
    }
    if (!isset($resPending) && isset($res) && $res) {
        while($row = mysqli_fetch_assoc($res)) $rides[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $rides]);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
    exit();
}

$booking_id = (int)($input['booking_id'] ?? 0);
$pickup_addr = $input['pickup_address'] ?? 'Pickup Location';
$pickup_lat = (float)($input['pickup_lat'] ?? 0);
$pickup_lng = (float)($input['pickup_lng'] ?? 0);
$dest_addr = $input['destination_address'] ?? 'Destination';
$dest_lat = (float)($input['dest_lat'] ?? 0);
$dest_lng = (float)($input['dest_lng'] ?? 0);
$vehicle_type = $input['vehicle_type'] ?? 'car';
$distance = (float)($input['distance_km'] ?? 0);
$fare = (float)($input['estimated_fare'] ?? 0);

$user_id = $_SESSION['user_id'];

// Validate required fields
if (!$pickup_addr || !$dest_addr || !$pickup_lat || !$pickup_lng || !$dest_lat || !$dest_lng) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit();
}

// Note: journey_requests table does not have pickup_address column
$sql = "INSERT INTO journey_requests 
    (booking_id, user_id, pickup_latitude, pickup_longitude, destination_name, dropoff_latitude, dropoff_longitude, vehicle_type, distance, fare, status, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'requested', NOW())";

try {
    $result = db_query($sql, 'iiddsddsdd', [$booking_id, $user_id, $pickup_lat, $pickup_lng, $dest_addr, $dest_lat, $dest_lng, $vehicle_type, $distance, $fare]);
    
    if ($result) {
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Ride requested successfully']);
    } else {
        http_response_code(500);
        $error = isset($GLOBALS['mysqli']) ? mysqli_error($GLOBALS['mysqli']) : 'Unknown database error';
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $error]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Exception: ' . $e->getMessage()]);
}
?>
