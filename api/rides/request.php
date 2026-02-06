<?php
error_reporting(E_ALL);
ini_set('display_errors', '0');

header('Content-Type: application/json');
// Allow common dev ports
// Allow dynamic origins for mobile testing
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
// Always allow the specific origin requesting
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

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
    $rides = [];

    // Debug logging disabled for performance

    if ($user_type === 'admin') {
        $sql = "SELECT jr.*, u.full_name as customer_name, d.full_name as driver_name 
                FROM journey_requests jr 
                JOIN users u ON jr.user_id = u.id 
                LEFT JOIN users d ON jr.driver_id = d.id
                ORDER BY jr.created_at DESC";
        $res = db_query($sql);
        if ($res) while($row = mysqli_fetch_assoc($res)) $rides[] = $row;
    } elseif ($user_type === 'driver' || $user_type === 'rider') {
        $lat = isset($_GET['lat']) && $_GET['lat'] != 0 ? (float)$_GET['lat'] : null;
        $lng = isset($_GET['lng']) && $_GET['lng'] != 0 ? (float)$_GET['lng'] : null;
        
        // LOGGING DISABLED

        // We'll show ALL unassigned requested rides to make it easy for the user to see
        // We'll show ALL unassigned requested rides AND the driver's assigned rides
        $sql = "SELECT 
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
        
        $res = db_query($sql, 'dddii', [$lat, $lng, $lat, $user_id, $user_id]);
        if ($res) while($row = mysqli_fetch_assoc($res)) $rides[] = $row;
        
        
        
        $debug = [
            'lat' => $lat,
            'lng' => $lng,
            'user_id' => $user_id,
            'found_count' => count($rides)
        ];
    } else {
        // Customer: show their ride requests with assigned rider
        $sql = "SELECT jr.*, jr.fare AS estimated_fare,
                jr.pickup_latitude AS pickup_lat,
                jr.pickup_longitude AS pickup_lng,
                jr.dropoff_latitude AS destination_lat, 
                jr.dropoff_longitude AS destination_lng,
                jr.pickup_address,
                d.full_name as driver_name, d.phone as driver_phone, d.last_lat as driver_lat, d.last_lng as driver_lng, d.rating_avg as driver_rating, d.is_verified as driver_verified, d.vehicle_model
                FROM journey_requests jr 
                LEFT JOIN users d ON jr.rider_id = d.id
                WHERE jr.user_id = ?
                ORDER BY jr.created_at DESC";
        $res = db_query($sql, 'i', [$user_id]);
        if ($res) while($row = mysqli_fetch_assoc($res)) $rides[] = $row;
    }

    echo json_encode([
        'success' => true, 
        'data' => $rides,
        'debug' => $debug ?? null
    ]);
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
    file_put_contents(__DIR__ . '/debug_rides.log', "Validation failed: missing fields\n", FILE_APPEND);
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit();
}

// Updated INSERT to include pickup_address
$sql = "INSERT INTO journey_requests 
    (booking_id, user_id, pickup_address, pickup_latitude, pickup_longitude, destination_name, dropoff_latitude, dropoff_longitude, vehicle_type, distance, fare, status, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'requested', NOW())";

try {
    $b_id = ($booking_id === 0) ? NULL : $booking_id;
    $result = db_query($sql, 'iisddsddsdd', [$b_id, $user_id, $pickup_addr, $pickup_lat, $pickup_lng, $dest_addr, $dest_lat, $dest_lng, $vehicle_type, $distance, $fare]);
    
    if ($result) {
        $new_ride_id = isset($b_id) ? $b_id : mysqli_insert_id($conn);
        
        // Notify global channel that a new ride exists
        update_realtime_status('global', 0, 'new_request_' . microtime(true));
        
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Ride requested successfully', 'ride_id' => $new_ride_id]);
    } else {
        $error = isset($GLOBALS['mysqli']) ? mysqli_error($GLOBALS['mysqli']) : 'Unknown database error';
        file_put_contents(__DIR__ . '/debug_rides.log', "Database error for ride creation: $error\n", FILE_APPEND);
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $error]);
    }
} catch (Exception $e) {
    file_put_contents(__DIR__ . '/debug_rides.log', "Exception in ride creation: " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Exception: ' . $e->getMessage()]);
}
?>
