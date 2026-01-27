<?php
/**
 * Ride Request & Acceptance System API
 * Features: Receive ride requests, Accept/Reject, Auto-cancel timeout, Assignment logic
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
// 1. RECEIVE RIDE REQUEST (Triggered by user)
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'send_ride_request') {
    if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'customer') {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Only authenticated customers can request rides']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $user_id = $_SESSION['user_id'];
    $booking_id = (int)($input['booking_id'] ?? 0);
    $pickup_lat = floatval($input['pickup_lat'] ?? 0);
    $pickup_lng = floatval($input['pickup_lng'] ?? 0);
    $drop_lat = floatval($input['drop_lat'] ?? 0);
    $drop_lng = floatval($input['drop_lng'] ?? 0);
    $vehicle_type = sanitize($input['vehicle_type'] ?? 'car');
    $estimated_distance = floatval($input['estimated_distance'] ?? 0);
    $is_emergency = (int)($input['is_emergency'] ?? 0);

    if ($booking_id <= 0 || $pickup_lat == 0 || $pickup_lng == 0 || $drop_lat == 0 || $drop_lng == 0) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit();
    }

    // Verify booking exists and belongs to user
    $verify_sql = "SELECT id FROM bookings WHERE id = ? AND user_id = ?";
    $verify_stmt = mysqli_prepare($conn, $verify_sql);
    mysqli_stmt_bind_param($verify_stmt, 'ii', $booking_id, $user_id);
    mysqli_stmt_execute($verify_stmt);
    if (mysqli_num_rows(mysqli_stmt_get_result($verify_stmt)) === 0) {
        echo json_encode(['success' => false, 'message' => 'Booking not found']);
        exit();
    }

    // Get user phone
    $user_sql = "SELECT phone FROM users WHERE id = ?";
    $user_stmt = mysqli_prepare($conn, $user_sql);
    mysqli_stmt_bind_param($user_stmt, 'i', $user_id);
    mysqli_stmt_execute($user_stmt);
    $user_row = mysqli_fetch_assoc(mysqli_stmt_get_result($user_stmt));
    $user_phone = $user_row['phone'];

    // Calculate estimated time and fare
    $estimated_time = max(5, (int)($estimated_distance / 25 * 60)); // Rough estimate: 25 km/h average
    
    $base_fare = 50; // Base fare
    $per_km_fare = 8;
    $fare_amount = $base_fare + ($estimated_distance * $per_km_fare);

    // Create ride request in ride_history
    $sql = "INSERT INTO ride_history 
            (ride_id, rider_id, user_id, status, pickup_lat, pickup_lng, 
             drop_lat, drop_lng, distance_km, estimated_time_minutes, 
             fare_amount, payment_status, created_at)
            VALUES (?, ?, ?, 'requested', ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())";

    $ride_id = 0; // Will be auto-generated
    $null_rider = NULL;
    
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'iiddddidid', $ride_id, $null_rider, $user_id, 
                          $pickup_lat, $pickup_lng, $drop_lat, $drop_lng, 
                          $estimated_distance, $estimated_time, $fare_amount);
    
    if (!mysqli_stmt_execute($stmt)) {
        echo json_encode(['success' => false, 'message' => 'Failed to create request']);
        exit();
    }

    $ride_history_id = mysqli_insert_id($conn);

    // Find and assign nearby riders (in queue)
    $get_riders_sql = "SELECT ra.*, rp.vehicle_type, u.id as user_id
                       FROM rider_availability ra
                       JOIN rider_profiles rp ON ra.rider_id = rp.user_id
                       JOIN users u ON rp.user_id = u.id
                       WHERE ra.is_online = 1 
                       AND rp.is_approved = 1 
                       AND rp.is_active = 1
                       AND rp.vehicle_type = ?
                       AND rp.rating >= 3.5
                       ORDER BY ra.current_location_lat DESC
                       LIMIT 5";

    $riders_stmt = mysqli_prepare($conn, $get_riders_sql);
    mysqli_stmt_bind_param($riders_stmt, 's', $vehicle_type);
    mysqli_stmt_execute($riders_stmt);
    $riders_result = mysqli_stmt_get_result($riders_stmt);

    $assignment_order = 1;
    while ($rider_row = mysqli_fetch_assoc($riders_result)) {
        // Create assignment queue entry
        $assign_sql = "INSERT INTO ride_assignment_queue 
                       (ride_id, assigned_rider_id, offer_status, assignment_order)
                       VALUES (?, ?, 'offered', ?)";
        
        $assign_stmt = mysqli_prepare($conn, $assign_sql);
        mysqli_stmt_bind_param($assign_stmt, 'iii', $ride_history_id, $rider_row['user_id'], $assignment_order);
        mysqli_stmt_execute($assign_stmt);

        // Send notification to rider
        $notif_sql = "INSERT INTO rider_notifications 
                      (rider_id, title, message, notification_type, reference_id, reference_type)
                      VALUES (?, ?, ?, 'ride_request', ?, 'ride')";
        
        $title = 'New Ride Request!';
        $message = "Distance: {$estimated_distance}km | Fare: ৳" . number_format($fare_amount, 2);
        
        $notif_stmt = mysqli_prepare($conn, $notif_sql);
        mysqli_stmt_bind_param($notif_stmt, 'issi', $rider_row['user_id'], $title, $message, $ride_history_id);
        mysqli_stmt_execute($notif_stmt);

        $assignment_order++;
    }

    // Send notification to customer that request is sent
    $user_notif_sql = "INSERT INTO notifications (user_id, title, message, notification_type, reference_id)
                       VALUES (?, ?, ?, 'ride_requested', ?)";
    $user_title = 'Ride Request Sent';
    $user_message = "Your request for a {$vehicle_type} has been sent. Estimated fare: ৳" . number_format($fare_amount, 2);
    $user_notif_stmt = mysqli_prepare($conn, $user_notif_sql);
    mysqli_stmt_bind_param($user_notif_stmt, 'issi', $user_id, $user_title, $user_message, $ride_history_id);
    mysqli_stmt_execute($user_notif_stmt);

    echo json_encode([
        'success' => true, 
        'message' => 'Ride request sent',
        'ride_id' => $ride_history_id,
        'fare' => $fare_amount,
        'estimated_time' => $estimated_time
    ]);
    exit();
}

// ========================
// 2. ACCEPT RIDE REQUEST
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'accept_ride') {
    if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'driver') {
        echo json_encode(['success' => false, 'message' => 'Only drivers can accept rides']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $ride_id = (int)($input['ride_id'] ?? 0);
    $rider_id = $_SESSION['user_id'];

    if ($ride_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid ride ID']);
        exit();
    }

    // Verify ride is still pending
    $verify_sql = "SELECT id, status FROM ride_history WHERE id = ? AND status = 'requested'";
    $verify_stmt = mysqli_prepare($conn, $verify_sql);
    mysqli_stmt_bind_param($verify_stmt, 'i', $ride_id);
    mysqli_stmt_execute($verify_stmt);
    
    if (mysqli_num_rows(mysqli_stmt_get_result($verify_stmt)) === 0) {
        echo json_encode(['success' => false, 'message' => 'Ride no longer available']);
        exit();
    }

    // Accept the ride
    $sql = "UPDATE ride_history SET 
            rider_id = ?,
            status = 'accepted',
            accepted_at = NOW()
            WHERE id = ? AND status = 'requested' AND rider_id IS NULL";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'ii', $rider_id, $ride_id);

    if (mysqli_stmt_execute($stmt) && mysqli_affected_rows($conn) > 0) {
        // Update assignment queue
        $queue_sql = "UPDATE ride_assignment_queue SET offer_status = 'rejected' 
                      WHERE ride_id = ? AND assigned_rider_id != ?";
        $queue_stmt = mysqli_prepare($conn, $queue_sql);
        mysqli_stmt_bind_param($queue_stmt, 'ii', $ride_id, $rider_id);
        mysqli_stmt_execute($queue_stmt);

        // Mark this rider's offer as accepted
        $accept_queue_sql = "UPDATE ride_assignment_queue SET offer_status = 'accepted' 
                             WHERE ride_id = ? AND assigned_rider_id = ?";
        $accept_stmt = mysqli_prepare($conn, $accept_queue_sql);
        mysqli_stmt_bind_param($accept_stmt, 'ii', $ride_id, $rider_id);
        mysqli_stmt_execute($accept_stmt);

        // Get ride and user details
        $details_sql = "SELECT rh.*, u.full_name, u.phone FROM ride_history rh 
                        JOIN users u ON rh.user_id = u.id WHERE rh.id = ?";
        $details_stmt = mysqli_prepare($conn, $details_sql);
        mysqli_stmt_bind_param($details_stmt, 'i', $ride_id);
        mysqli_stmt_execute($details_stmt);
        $ride_details = mysqli_fetch_assoc(mysqli_stmt_get_result($details_stmt));

        // Notify user
        $user_id = $ride_details['user_id'];
        $notif_sql = "INSERT INTO notifications (user_id, title, message, notification_type, reference_id)
                      VALUES (?, ?, ?, 'ride_accepted', ?)";
        $title = 'Driver Accepted Your Request!';
        $message = "Your driver {$ride_details['full_name']} has accepted your ride. Fare: ৳" . number_format($ride_details['fare_amount'], 2);
        $notif_stmt = mysqli_prepare($conn, $notif_sql);
        mysqli_stmt_bind_param($notif_stmt, 'issi', $user_id, $title, $message, $ride_id);
        mysqli_stmt_execute($notif_stmt);

        error_log("Rider $rider_id accepted ride $ride_id");

        echo json_encode([
            'success' => true,
            'message' => 'Ride accepted',
            'ride_details' => $ride_details
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to accept ride']);
    }
    exit();
}

// ========================
// 3. REJECT RIDE REQUEST
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'reject_ride') {
    if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'driver') {
        echo json_encode(['success' => false, 'message' => 'Only drivers can reject rides']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $ride_id = (int)($input['ride_id'] ?? 0);
    $reason = sanitize($input['reason'] ?? 'No reason provided');
    $rider_id = $_SESSION['user_id'];

    if ($ride_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid ride ID']);
        exit();
    }

    // Update assignment queue
    $sql = "UPDATE ride_assignment_queue SET offer_status = 'rejected' 
            WHERE ride_id = ? AND assigned_rider_id = ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'ii', $ride_id, $rider_id);

    if (mysqli_stmt_execute($stmt)) {
        // Check if there are other riders in queue
        $check_sql = "SELECT COUNT(*) as pending FROM ride_assignment_queue 
                      WHERE ride_id = ? AND offer_status = 'offered'";
        $check_stmt = mysqli_prepare($conn, $check_sql);
        mysqli_stmt_bind_param($check_stmt, 'i', $ride_id);
        mysqli_stmt_execute($check_stmt);
        $check_result = mysqli_fetch_assoc(mysqli_stmt_get_result($check_stmt));

        // If no more riders, mark as auto-cancelled
        if ($check_result['pending'] == 0) {
            $cancel_sql = "UPDATE ride_history SET status = 'cancelled', cancelled_by = 'system', 
                           cancellation_reason = 'No drivers available' WHERE id = ? AND status = 'requested'";
            $cancel_stmt = mysqli_prepare($conn, $cancel_sql);
            mysqli_stmt_bind_param($cancel_stmt, 'i', $ride_id);
            mysqli_stmt_execute($cancel_stmt);

            // Notify user of cancellation
            $cancel_notif_sql = "INSERT INTO notifications (user_id, title, message, notification_type, reference_id)
                                 VALUES (?, 'Ride Request Cancelled', 'We could not find any drivers for your request at this time.', 'ride_cancelled', ?)";
            $cancel_notif_stmt = mysqli_prepare($conn, $cancel_notif_sql);
            mysqli_stmt_bind_param($cancel_notif_stmt, 'ii', $user_id, $ride_id);
            mysqli_stmt_execute($cancel_notif_stmt);
        }

        error_log("Rider $rider_id rejected ride $ride_id. Reason: $reason");

        echo json_encode(['success' => true, 'message' => 'Ride rejected']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to reject ride']);
    }
    exit();
}

// ========================
// 4. GET PENDING RIDES FOR RIDER
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'get_pending_rides') {
    if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'driver') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $rider_id = $_SESSION['user_id'];

    $sql = "SELECT raq.*, rh.distance_km, rh.estimated_time_minutes, rh.fare_amount, 
            rh.pickup_lat, rh.pickup_lng, rh.drop_lat, rh.drop_lng,
            u.full_name, u.phone
            FROM ride_assignment_queue raq
            JOIN ride_history rh ON raq.ride_id = rh.id
            JOIN users u ON rh.user_id = u.id
            WHERE raq.assigned_rider_id = ? AND raq.offer_status = 'offered'
            AND rh.status = 'requested'
            ORDER BY raq.offered_at ASC";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'i', $rider_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $rides = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $rides[] = $row;
    }

    echo json_encode(['success' => true, 'data' => $rides, 'count' => count($rides)]);
    exit();
}

// ========================
// 5. GET RIDER'S ACTIVE RIDES
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'get_active_rides') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $rider_id = $_GET['rider_id'] ?? $_SESSION['user_id'];

    // Check permission
    if ($rider_id != $_SESSION['user_id'] && $_SESSION['user_type'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $sql = "SELECT rh.*, u.full_name, u.phone, rp.vehicle_type
            FROM ride_history rh
            JOIN users u ON rh.user_id = u.id
            LEFT JOIN rider_profiles rp ON rh.rider_id = rp.user_id
            WHERE rh.rider_id = ? 
            AND rh.status IN ('accepted', 'on_the_way', 'picked_up')
            ORDER BY rh.updated_at DESC";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'i', $rider_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $rides = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $rides[] = $row;
    }

    echo json_encode(['success' => true, 'data' => $rides]);
    exit();
}

// ========================
// DEFAULT RESPONSE
// ========================
echo json_encode(['success' => false, 'message' => 'Invalid action']);
?>
