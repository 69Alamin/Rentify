<?php
/**
 * Rider Availability Management API
 * Features: Online/Offline toggle, Working hours, Auto-offline, Location tracking
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

// ========================
// 1. TOGGLE ONLINE/OFFLINE STATUS
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'toggle_online') {
    if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'driver') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $is_online = (int)($input['is_online'] ?? 0);
    $latitude = floatval($input['latitude'] ?? 0);
    $longitude = floatval($input['longitude'] ?? 0);
    $rider_id = $_SESSION['user_id'];

    // Verify rider is approved
    $check_sql = "SELECT is_approved, is_active FROM rider_profiles WHERE user_id = ?";
    $check_stmt = mysqli_prepare($conn, $check_sql);
    mysqli_stmt_bind_param($check_stmt, 'i', $rider_id);
    mysqli_stmt_execute($check_stmt);
    $check_result = mysqli_stmt_get_result($check_stmt);
    
    if (!$check_result || !$row = mysqli_fetch_assoc($check_result)) {
        echo json_encode(['success' => false, 'message' => 'Rider profile not found']);
        exit();
    }

    if (!$row['is_approved']) {
        echo json_encode(['success' => false, 'message' => 'Profile not approved yet']);
        exit();
    }

    if (!$row['is_active']) {
        echo json_encode(['success' => false, 'message' => 'Account suspended']);
        exit();
    }

    // Update availability
    $sql = "INSERT INTO rider_availability (rider_id, is_online, current_location_lat, 
            current_location_lng, last_activity_at, last_location_update)
            VALUES (?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE 
            is_online = ?,
            current_location_lat = ?,
            current_location_lng = ?,
            last_activity_at = NOW(),
            last_location_update = NOW()";

    $stmt = mysqli_prepare($conn, $sql);
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'DB error: ' . mysqli_error($conn)]);
        exit();
    }

    mysqli_stmt_bind_param($stmt, 'idddi', $rider_id, $is_online, $latitude, $longitude, $is_online);

    if (mysqli_stmt_execute($stmt)) {
        $status = ($is_online) ? 'Online' : 'Offline';
        error_log("Rider $rider_id is now $status at ($latitude, $longitude)");
        echo json_encode(['success' => true, 'message' => "Rider $status", 'is_online' => $is_online]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update status']);
    }
    exit();
}

// ========================
// 2. GET AVAILABILITY STATUS
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'get_status') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $rider_id = $_GET['rider_id'] ?? $_SESSION['user_id'];

    $sql = "SELECT is_online, current_location_lat, current_location_lng, 
            working_hours_start, working_hours_end, last_activity_at, last_location_update
            FROM rider_availability WHERE rider_id = ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'i', $rider_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    if ($row = mysqli_fetch_assoc($result)) {
        // Check if should auto-offline (inactivity)
        if ($row['is_online'] && $row['last_activity_at']) {
            $settings_sql = "SELECT setting_value FROM rider_settings WHERE setting_key = 'auto_offline_minutes'";
            $settings_result = mysqli_query($conn, $settings_sql);
            $settings_row = mysqli_fetch_assoc($settings_result);
            $auto_offline_minutes = (int)($settings_row['setting_value'] ?? 30);

            $inactivity_seconds = strtotime('now') - strtotime($row['last_activity_at']);
            if ($inactivity_seconds > ($auto_offline_minutes * 60)) {
                // Auto-offline
                $update_sql = "UPDATE rider_availability SET is_online = 0 WHERE rider_id = ?";
                $update_stmt = mysqli_prepare($conn, $update_sql);
                mysqli_stmt_bind_param($update_stmt, 'i', $rider_id);
                mysqli_stmt_execute($update_stmt);
                $row['is_online'] = 0;
            }
        }

        echo json_encode(['success' => true, 'data' => $row]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Status not found']);
    }
    exit();
}

// ========================
// 3. SET WORKING HOURS
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'set_working_hours') {
    if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'driver') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $start_time = sanitize($input['start_time'] ?? '');
    $end_time = sanitize($input['end_time'] ?? '');
    $rider_id = $_SESSION['user_id'];

    if (empty($start_time) || empty($end_time)) {
        echo json_encode(['success' => false, 'message' => 'Time fields required']);
        exit();
    }

    // Validate time format
    if (!preg_match('/^\d{2}:\d{2}$/', $start_time) || !preg_match('/^\d{2}:\d{2}$/', $end_time)) {
        echo json_encode(['success' => false, 'message' => 'Invalid time format']);
        exit();
    }

    $sql = "INSERT INTO rider_availability (rider_id, working_hours_start, working_hours_end)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            working_hours_start = ?,
            working_hours_end = ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'issss', $rider_id, $start_time, $end_time, $start_time, $end_time);

    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(['success' => true, 'message' => 'Working hours updated']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update']);
    }
    exit();
}

// ========================
// 4. UPDATE LOCATION
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'update_location') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $latitude = floatval($input['latitude'] ?? 0);
    $longitude = floatval($input['longitude'] ?? 0);
    $accuracy = floatval($input['accuracy'] ?? 0);
    $speed = floatval($input['speed'] ?? 0);
    $heading = (int)($input['heading'] ?? 0);
    $altitude = floatval($input['altitude'] ?? 0);
    $ride_id = (int)($input['ride_id'] ?? 0);
    $rider_id = $_SESSION['user_id'];

    if ($latitude == 0 || $longitude == 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid coordinates']);
        exit();
    }

    // Update real-time location
    $sql = "UPDATE rider_availability SET 
            current_location_lat = ?,
            current_location_lng = ?,
            last_activity_at = NOW(),
            last_location_update = NOW()
            WHERE rider_id = ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'ddi', $latitude, $longitude, $rider_id);
    mysqli_stmt_execute($stmt);

    // Store in location history (for tracking)
    $history_sql = "INSERT INTO rider_location_history 
                    (rider_id, ride_id, latitude, longitude, accuracy_meters, speed_kmh, heading, altitude)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    $history_stmt = mysqli_prepare($conn, $history_sql);
    $ride_id_nullable = $ride_id > 0 ? $ride_id : NULL;
    mysqli_stmt_bind_param($history_stmt, 'iiddddii', $rider_id, $ride_id_nullable, 
                          $latitude, $longitude, $accuracy, $speed, $heading, $altitude);
    mysqli_stmt_execute($history_stmt);

    echo json_encode(['success' => true, 'message' => 'Location updated']);
    exit();
}

// ========================
// 5. GET NEARBY RIDERS (For ride assignment)
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'get_nearby') {
    $pickup_lat = floatval($_GET['lat'] ?? 0);
    $pickup_lng = floatval($_GET['lng'] ?? 0);
    $radius_km = floatval($_GET['radius'] ?? 5);
    $vehicle_type = sanitize($_GET['vehicle_type'] ?? 'car');

    if ($pickup_lat == 0 || $pickup_lng == 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid coordinates']);
        exit();
    }

    // Calculate distance using Haversine formula
    $sql = "SELECT ra.*, rp.vehicle_type, rp.rating, u.full_name, u.phone,
            (6371 * acos(cos(radians(?)) * cos(radians(ra.current_location_lat)) * 
             sin(radians(?) - sin(radians(?)) * sin(radians(ra.current_location_lat))) +
             sin(radians(?)) * sin(radians(ra.current_location_lat)))) AS distance_km
            FROM rider_availability ra
            JOIN rider_profiles rp ON ra.rider_id = rp.user_id
            JOIN users u ON rp.user_id = u.id
            WHERE ra.is_online = 1 
            AND rp.is_approved = 1 
            AND rp.is_active = 1
            AND rp.vehicle_type = ?
            AND rp.rating >= 3.5
            HAVING distance_km <= ?
            ORDER BY distance_km ASC
            LIMIT 10";

    $stmt = mysqli_prepare($conn, $sql);
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'DB error']);
        exit();
    }

    mysqli_stmt_bind_param($stmt, 'dddsdd', $pickup_lat, $pickup_lng, $pickup_lat, 
                          $pickup_lat, $vehicle_type, $radius_km);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $riders = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $riders[] = $row;
    }

    echo json_encode(['success' => true, 'data' => $riders, 'count' => count($riders)]);
    exit();
}

// ========================
// 6. GET ALL ONLINE RIDERS (Admin)
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'get_online_riders') {
    if ($_SESSION['user_type'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        exit();
    }

    $sql = "SELECT ra.*, rp.vehicle_type, rp.rating, rp.total_rides, u.full_name, u.phone
            FROM rider_availability ra
            JOIN rider_profiles rp ON ra.rider_id = rp.user_id
            JOIN users u ON rp.user_id = u.id
            WHERE ra.is_online = 1 AND rp.is_approved = 1
            ORDER BY ra.last_activity_at DESC";

    $result = mysqli_query($conn, $sql);
    $riders = [];

    while ($row = mysqli_fetch_assoc($result)) {
        $riders[] = $row;
    }

    echo json_encode(['success' => true, 'data' => $riders, 'count' => count($riders)]);
    exit();
}

// ========================
// DEFAULT RESPONSE
// ========================
echo json_encode(['success' => false, 'message' => 'Invalid action']);
?>
