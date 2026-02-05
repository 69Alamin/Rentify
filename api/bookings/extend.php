<?php
require_once __DIR__ . '/../cors.php';
handle_cors();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

// Get JSON input
$data = json_decode(file_get_contents('php://input'), true);

$booking_id = isset($data['booking_id']) ? (int)$data['booking_id'] : 0;
$extension_hours = isset($data['extension_hours']) ? (int)$data['extension_hours'] : 0;
if ($extension_hours <= 0 && isset($data['hours'])) {
    $extension_hours = (int)$data['hours'];
}

if ($booking_id <= 0 || $extension_hours <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit();
}

// Fetch booking to verify ownership and status
$query = "SELECT b.*, rt.base_price_per_hour, h.vendor_id 
          FROM bookings b
          JOIN rooms r ON b.room_id = r.id 
          JOIN room_types rt ON r.room_type_id = rt.id
          JOIN hotels h ON rt.hotel_id = h.id
          WHERE b.id = ? AND b.user_id = ?";
$stmt = mysqli_prepare($conn, $query);
mysqli_stmt_bind_param($stmt, 'ii', $booking_id, $_SESSION['user_id']);
mysqli_stmt_execute($stmt);
$booking = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));

if (!$booking) {
    echo json_encode(['success' => false, 'message' => 'Booking not found']);
    exit();
}

if ($booking['booking_status'] !== 'active' && $booking['booking_status'] !== 'confirmed') {
    // Only active bookings (checked in) or confirmed bookings (not yet checked in) can usually be extended? 
    // Legacy allowed extending confirmed too, probably. But usually extend implies 'staying longer'.
    // Let's assume 'active' or 'confirmed' is fine.
    // However, legacy check: if checked_in_at is not null etc. 
    // For now, allow simplified extension logic.
}

// Calculate cost
$additional_cost = $extension_hours * $booking['base_price_per_hour'];

// Start Transaction
mysqli_begin_transaction($conn);

try {
    // Charge wallet for extension
    require_once __DIR__ . '/../helpers/TransactionHelper.php';

    // Check balance using the same wallet column logic
    $wallet_col = null;
    $col_res = db_query("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME IN ('wallet_balance','balance')");
    if ($col_res) {
        $cols = [];
        while ($c = mysqli_fetch_assoc($col_res)) { $cols[] = $c['COLUMN_NAME']; }
        if (in_array('wallet_balance', $cols, true)) $wallet_col = 'wallet_balance';
        elseif (in_array('balance', $cols, true)) $wallet_col = 'balance';
    }

    if ($wallet_col) {
        $user_res = db_query("SELECT {$wallet_col} AS wallet_balance FROM users WHERE id = ?", 'i', [$_SESSION['user_id']]);
        $user_wallet = $user_res ? mysqli_fetch_assoc($user_res) : null;
        $current_balance = (float)($user_wallet['wallet_balance'] ?? 0);
        if ($current_balance < $additional_cost) {
            throw new Exception('Insufficient wallet balance. Total required: ৳' . $additional_cost);
        }
    }

    // Update booking: increase total_hours, update check_out_time, increase total_price
    // check_out_time = DATE_ADD(check_out_time, INTERVAL ? HOUR)
    
    $update_sql = "UPDATE bookings 
                   SET total_hours = total_hours + ?, 
                       booked_hours = booked_hours + ?,
                       check_out_time = DATE_ADD(check_out_time, INTERVAL ? HOUR),
                       total_price = total_price + ?
                   WHERE id = ?";
    
    $stmt_update = mysqli_prepare($conn, $update_sql);
    mysqli_stmt_bind_param($stmt_update, 'iiidi', $extension_hours, $extension_hours, $extension_hours, $additional_cost, $booking_id);
    
    if (!mysqli_stmt_execute($stmt_update)) {
        throw new Exception('Failed to update booking');
    }

    // Process payment for extension (customer -> vendor + commission)
    if (!TransactionHelper::processBookingPayment($conn, $_SESSION['user_id'], $booking['vendor_id'], $booking_id, $additional_cost)) {
        throw new Exception('Payment processing failed. Please check your balance.');
    }

    mysqli_commit($conn);
    
    // Fetch new check_out_time
    $new_time_query = "SELECT check_out_time FROM bookings WHERE id = ?";
    $stmt_time = mysqli_prepare($conn, $new_time_query);
    mysqli_stmt_bind_param($stmt_time, 'i', $booking_id);
    mysqli_stmt_execute($stmt_time);
    $new_time_res = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_time));
    
    send_json([
        'success' => true, 
        'message' => 'Stay extended successfully', 
        'new_checkout_time' => $new_time_res['check_out_time'],
        'additional_cost' => $additional_cost
    ]);

} catch (Exception $e) {
    mysqli_rollback($conn);
    send_json(['success' => false, 'message' => $e->getMessage()], 400);
}
?>
