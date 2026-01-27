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

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$booking_id = (int)($input['booking_id'] ?? 0);
$user_id = $_SESSION['user_id'];

if (!$booking_id) {
    echo json_encode(['success' => false, 'message' => 'Booking ID required']);
    exit();
}

// Verify booking belongs to user and is confirmed
$sql = "SELECT id, booking_status, check_in_time, check_out_time FROM bookings 
        WHERE id = ? AND user_id = ? AND booking_status = 'confirmed'";
$result = db_query($sql, 'ii', [$booking_id, $user_id]);

if (!$result || mysqli_num_rows($result) === 0) {
    echo json_encode(['success' => false, 'message' => 'Booking not found or cannot be checked in']);
    exit();
}

$booking = mysqli_fetch_assoc($result);

// NEW: Prevent multiple active check-ins
$activeCheckSql = "SELECT id FROM bookings WHERE user_id = ? AND booking_status = 'active' AND id != ?";
$activeCheckRes = db_query($activeCheckSql, 'ii', [$user_id, $booking_id]);
if ($activeCheckRes && mysqli_num_rows($activeCheckRes) > 0) {
    echo json_encode(['success' => false, 'message' => 'You already have an active stay. Please check out from your current booking before checking into a new one.']);
    exit();
}

// Check if already checked out (allow buffer of 5 minutes after checkout)
$checkoutTime = strtotime($booking['check_out_time']);
if ($checkoutTime < (time() - 300)) {
    echo json_encode(['success' => false, 'message' => 'Check-out time has passed']);
    exit();
}

// Check for active ride requests if not forcing manual check-in
$force_manual = !empty($input['force_manual']);

$rideSql = "SELECT id, status FROM journey_requests WHERE booking_id = ? AND status IN ('requested', 'assigned', 'on_the_way', 'picked')";
$rideResult = db_query($rideSql, 'i', [$booking_id]);
$hasActiveRide = ($rideResult && mysqli_num_rows($rideResult) > 0);

if ($hasActiveRide && !$force_manual) {
    http_response_code(409); // Conflict
    echo json_encode([
        'success' => false,
        'message' => 'Active ride found. Please cancel the ride or wait for completion before check-in.',
        'has_active_ride' => true
    ]);
    exit();
}

// If force_manual, cancel active rides
if ($force_manual && $hasActiveRide) {
    $cancelRideSql = "UPDATE journey_requests SET status = 'cancelled' WHERE booking_id = ? AND status IN ('requested', 'assigned', 'on_the_way', 'picked')";
    db_query($cancelRideSql, 'i', [$booking_id]);
}

// Update booking status to active
$updateSql = "UPDATE bookings SET booking_status = 'active' WHERE id = ?";
if (db_query($updateSql, 'i', [$booking_id])) {
    echo json_encode([
        'success' => true,
        'message' => 'Checked in successfully!',
        'booking_id' => $booking_id,
        'checked_in_at' => date('Y-m-d H:i:s')
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Check-in failed']);
}
?>
