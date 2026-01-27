<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['booking_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit();
}

$booking_id = (int)$input['booking_id'];
$requester_id = $_SESSION['user_id'];
$requester_type = $_SESSION['user_type'] ?? 'user';

mysqli_begin_transaction($conn);

try {
    // 1. Fetch booking details along with Property and Vendor info
    $query = "SELECT b.*, p.vendor_id, p.name as hotel_name, u.full_name as guest_name 
              FROM bookings b
              JOIN rooms r ON b.room_id = r.id
              JOIN room_types rt ON r.room_type_id = rt.id
              JOIN hotels p ON rt.hotel_id = p.id
              JOIN users u ON b.user_id = u.id
              WHERE b.id = ? FOR UPDATE";
              
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, 'i', $booking_id);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    $booking = mysqli_fetch_assoc($res);
    mysqli_stmt_close($stmt);

    if (!$booking) {
        throw new Exception('Booking not found');
    }

    // 2. Permission Check
    $is_admin = ($requester_type === 'admin');
    $is_vendor = ($requester_type === 'vendor' && $booking['vendor_id'] == $requester_id);
    $is_owner = ($booking['user_id'] == $requester_id);

    if (!$is_admin && !$is_vendor && !$is_owner) {
        throw new Exception('Unauthorized to cancel this booking');
    }

    // 3. Validation: Only Pending or Confirmed
    if (!in_array($booking['booking_status'], ['pending', 'confirmed'])) {
        throw new Exception('Cannot cancel booking with status: ' . $booking['booking_status']);
    }

    // 4. Update Booking Status
    $update_sql = "UPDATE bookings SET booking_status = 'cancelled' WHERE id = ?";
    if (!db_query($update_sql, 'i', [$booking_id])) {
        throw new Exception('Failed to update booking status');
    }

    // 5. Free Room
    if ($booking['room_id']) {
         db_query("UPDATE rooms SET status = 'available', locked_at = NULL, locked_by_session = NULL WHERE id = ?", 'i', [$booking['room_id']]);
    }

    // 6. Cancel Associated Ride
    $ride_update = "UPDATE journey_requests SET status = 'cancelled' WHERE booking_id = ? AND status IN ('requested', 'accepted', 'assigned', 'on_the_way')";
    db_query($ride_update, 'i', [$booking_id]);
    
    // 7. Record Refund (if applicable)
    require_once __DIR__ . '/../helpers/TransactionHelper.php';
    if ($booking['total_price'] > 0 && ($booking['payment_status'] === 'completed' || $booking['booking_status'] === 'confirmed')) {
        if (!TransactionHelper::processRefund($conn, $booking_id)) {
            error_log("Transaction conversion failed for booking #$booking_id during refund");
        }
    }

    // 8. Notifications
    $notif_type = 'booking_cancelled';
    
    // Notify Guest (if requester is not guest)
    if (!$is_owner) {
        $title = "Booking Cancelled";
        $msg = "Your booking for {$booking['hotel_name']} was cancelled by " . ($is_admin ? "Support" : "the Host") . ".";
        db_query("INSERT INTO notifications (user_id, title, message, type, reference_id, created_at, is_read) VALUES (?, ?, ?, ?, ?, NOW(), 0)", 'isssi', [$booking['user_id'], $title, $msg, $notif_type, $booking_id]);
    }

    // Notify Vendor (if requester is not vendor)
    if (!$is_vendor && $booking['vendor_id']) {
        $title = "Booking Cancelled";
        $msg = "Booking #$booking_id for {$booking['hotel_name']} was cancelled by " . ($is_admin ? "Support" : "the Guest") . ".";
        db_query("INSERT INTO notifications (user_id, title, message, type, reference_id, created_at, is_read) VALUES (?, ?, ?, ?, ?, NOW(), 0)", 'isssi', [$booking['vendor_id'], $title, $msg, $notif_type, $booking_id]);
    }

    mysqli_commit($conn);
    echo json_encode(['success' => true, 'message' => 'Booking cancelled successfully']);

} catch (Exception $e) {
    mysqli_rollback($conn);
    http_response_code(400); // Bad Request for logical errors, or 403 for permissions? Using 400 for simplicity in frontend handling.
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
