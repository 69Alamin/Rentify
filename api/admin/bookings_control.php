<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

require_once __DIR__ . '/../../db_conn.php';
require_once __DIR__ . '/helpers/AuthMiddleware.php';

AuthMiddleware::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'GET') {
    // Filters: status, date, search
    $status = $_GET['status'] ?? '';
    // Basic master list
        $query = "SELECT b.id, b.check_in_time, b.check_out_time, b.total_price, b.booking_status, b.payment_status, b.is_emergency,
                b.user_name, b.user_email,
                b.hotel_name, b.room_number, b.room_type_name as room_type
            FROM bookings_detailed b
            ORDER BY b.is_emergency DESC, b.created_at DESC LIMIT 100";
              
    $res = db_query($query);
    $bookings = [];
    while ($row = mysqli_fetch_assoc($res)) $bookings[] = $row;
    
    echo json_encode(['success' => true, 'data' => $bookings]);

} elseif ($method === 'POST') {
    // Actions: approve, cancel, force_checkout
    $action = $input['action'] ?? '';
    $booking_id = (int)($input['booking_id'] ?? 0);

    if (!$booking_id) {
        echo json_encode(['success' => false, 'message' => 'Booking ID required']);
        exit();
    }

    if ($action === 'cancel') {
        // 1. Get booking details for refund amount
        $b_res = db_query("SELECT * FROM bookings WHERE id = ?", 'i', [$booking_id]);
        $booking = mysqli_fetch_assoc($b_res);

        if (!$booking) {
            echo json_encode(['success' => false, 'message' => 'Booking not found']);
            exit();
        }

        // 2. Set status to cancelled
        db_query("UPDATE bookings SET booking_status = 'cancelled' WHERE id = ?", 'i', [$booking_id]);
        
        // 3. Release room
        if ($booking['room_id']) {
            db_query("UPDATE rooms SET status = 'available' WHERE id = ?", 'i', [$booking['room_id']]);
        }

        // 4. Record Refund Transaction
        require_once __DIR__ . '/../helpers/TransactionHelper.php';
        if ($booking['total_price'] > 0) {
            if (!TransactionHelper::processRefund($conn, $booking_id)) {
                error_log("Refund failed in admin control for booking #$booking_id");
            }
        }
        
        // Notify User & Vendor
        // Fetch Vendor ID
        $v_res = db_query("SELECT p.vendor_id, p.name FROM bookings b JOIN rooms r ON b.room_id = r.id JOIN room_types rt ON r.room_type_id = rt.id JOIN hotels p ON rt.hotel_id = p.id WHERE b.id = ?", 'i', [$booking_id]);
        $v_info = mysqli_fetch_assoc($v_res);
        
        // Notify User
        $u_title = "Booking Cancelled by Admin";
        $u_msg = "Your booking #$booking_id has been cancelled and refunded.";
        db_query("INSERT INTO notifications (user_id, title, message, type, reference_id, created_at, is_read) VALUES (?, ?, ?, 'booking_cancelled', ?, NOW(), 0)", 'issi', [$booking['user_id'], $u_title, $u_msg, $booking_id]);
        
        // Notify Vendor
        if ($v_info && $v_info['vendor_id']) {
            $v_title = "Booking #$booking_id Cancelled";
            $v_msg = "Booking was cancelled by Admin. Room is now available.";
            db_query("INSERT INTO notifications (user_id, title, message, type, reference_id, created_at, is_read) VALUES (?, ?, ?, 'booking_cancelled', ?, NOW(), 0)", 'issi', [$v_info['vendor_id'], $v_title, $v_msg, $booking_id]);
        }

        echo json_encode(['success' => true, 'message' => 'Booking cancelled, room freed, and refund recorded']);
    } elseif ($action === 'approve') {
        db_query("UPDATE bookings SET booking_status = 'confirmed' WHERE id = ?", 'i', [$booking_id]);
        echo json_encode(['success' => true, 'message' => 'Booking confirmed']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
}
?>
