<?php
require_once __DIR__ . '/../cors.php';
handle_cors();

session_start();
require_once __DIR__ . '/../../db_conn.php';

// Debug logging
error_log("=== Vendor Booking Status Update ===");
error_log("Session user_id: " . ($_SESSION['user_id'] ?? 'NOT SET'));
error_log("Session user_type: " . ($_SESSION['user_type'] ?? 'NOT SET'));

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'vendor') {
    error_log("Authorization failed");
    send_json(['success' => false, 'message' => 'Unauthorized']);
}

$data = json_decode(file_get_contents('php://input'), true);
$booking_id = $data['booking_id'] ?? null;
$new_status = $data['status'] ?? null;
$vendor_id = $_SESSION['user_id'];

error_log("Booking ID: " . $booking_id);
error_log("New Status: " . $new_status);
error_log("Vendor ID: " . $vendor_id);

if (!$booking_id || !$new_status) {
    error_log("Missing parameters");
    send_json(['success' => false, 'message' => 'Missing parameters']);
}

// 1. Verify that this booking belongs to this vendor
$verify_sql = "SELECT b.id, b.user_id, b.booking_status, p.name as hotel_name, p.vendor_id 
               FROM bookings b
               JOIN rooms r ON b.room_id = r.id
               JOIN room_types rt ON r.room_type_id = rt.id
               JOIN hotels p ON rt.hotel_id = p.id
               WHERE b.id = ? AND p.vendor_id = ?";

$verify_res = db_query($verify_sql, 'ii', [$booking_id, $vendor_id]);
$booking_info = mysqli_fetch_assoc($verify_res);

error_log("Booking info: " . json_encode($booking_info));

if (!$booking_info) {
    error_log("Booking not found or access denied");
    send_json(['success' => false, 'message' => 'Booking not found or access denied']);
}

// Enforce final state: Cannot change status if already completed or cancelled
if (in_array($booking_info['booking_status'], ['completed', 'cancelled'])) {
    error_log("Attempt to modify finalized booking");
    send_json(['success' => false, 'message' => 'Cannot modify a booking that is ' . $booking_info['booking_status']]);
}

// Check for active ride requests when checking in
if ($new_status === 'active') {
    $force_manual = !empty($data['force_manual']);
    
    $rideSql = "SELECT id, status FROM journey_requests WHERE booking_id = ? AND status IN ('requested', 'assigned', 'on_the_way', 'picked')";
    $rideResult = db_query($rideSql, 'i', [$booking_id]);
    $hasActiveRide = ($rideResult && mysqli_num_rows($rideResult) > 0);

    if ($hasActiveRide && !$force_manual) {
        send_json([
            'success' => false,
            'message' => 'Active ride found. User has an ongoing pickup request. Please cancel the ride or wait for completion before check-in.',
            'has_active_ride' => true
        ], 409);
    }

    if ($force_manual && $hasActiveRide) {
        $cancelRideSql = "UPDATE journey_requests SET status = 'cancelled' WHERE booking_id = ? AND status IN ('requested', 'assigned', 'on_the_way', 'picked')";
        db_query($cancelRideSql, 'i', [$booking_id]);
    }

    // NEW: Prevent multiple active check-ins for the guest
    $guest_id = $booking_info['user_id'];
    $activeCheckSql = "SELECT id FROM bookings WHERE user_id = ? AND booking_status = 'active' AND id != ?";
    $activeCheckRes = db_query($activeCheckSql, 'ii', [$guest_id, $booking_id]);
    if ($activeCheckRes && mysqli_num_rows($activeCheckRes) > 0) {
        send_json(['success' => false, 'message' => 'Guest already has an active stay elsewhere. They must check out of their current stay first.']);
    }
}

// 2. Update booking status
$update_sql = "UPDATE bookings SET booking_status = ? WHERE id = ?";
$update_result = db_query($update_sql, 'si', [$new_status, $booking_id]);

error_log("Update result: " . ($update_result ? 'SUCCESS' : 'FAILED'));

if ($update_result) {
    
    // 3. Create Notification for the user
    $user_id = $booking_info['user_id'];
    $hotel_name = $booking_info['hotel_name'];
    $title = "Booking Update: " . ucfirst($new_status);
    $message = "Your booking for '$hotel_name' has been $new_status.";
    
    $notif_sql = "INSERT INTO notifications (user_id, title, message, type, reference_id) VALUES (?, ?, ?, ?, ?)";
    $notif_result = db_query($notif_sql, 'isssi', [$user_id, $title, $message, 'booking_status', $booking_id]);
    
    error_log("Notification result: " . ($notif_result ? 'SUCCESS' : 'FAILED'));

    // 4. If confirmed, activate any associated ride request
    if ($new_status === 'confirmed') {
        $activate_ride_sql = "UPDATE journey_requests SET status = 'requested' WHERE booking_id = ? AND status = 'pending_vendor'";
        db_query($activate_ride_sql, 'i', [$booking_id]);
    }

    // NEW: If cancelled, cancel any active or pending ride requests
    if ($new_status === 'cancelled') {
        $cancel_ride_sql = "UPDATE journey_requests SET status = 'cancelled' WHERE booking_id = ? AND status NOT IN ('completed', 'cancelled')";
        db_query($cancel_ride_sql, 'i', [$booking_id]);
    }

    // 5. Update Room Status based on new booking status
    $getRoomSql = "SELECT room_id FROM bookings WHERE id = ?";
    $roomRes = db_query($getRoomSql, 'i', [$booking_id]);
    $roomData = mysqli_fetch_assoc($roomRes);

    if ($roomData && $roomData['room_id']) {
        $rid = $roomData['room_id'];
        if (in_array($new_status, ['completed', 'cancelled'])) {
            db_query("UPDATE rooms SET status = 'available' WHERE id = ?", 'i', [$rid]);
        } elseif ($new_status === 'active') {
            db_query("UPDATE rooms SET status = 'occupied' WHERE id = ?", 'i', [$rid]);
        }
    }

    send_json(['success' => true, 'message' => 'Booking status updated and user notified']);
} else {
    error_log("Failed to update booking status - database error");
    send_json(['success' => false, 'message' => 'Failed to update booking status']);
}
?>
