<?php
/**
 * TransactionHelper
 * Handles all financial operations: creating logs, updating user balances, and processing commissions.
 */

class TransactionHelper {
    private static $commission_rate = 0.10; // 10% Platform fee

    /**
     * Records a movement of funds and updates user balance.
     * @param mysqli $conn
     * @param int $user_id
     * @param float $amount (can be negative for deductions)
     * @param string $type ('payment', 'refund', 'commission', 'payout', 'deposit')
     * @param int|null $booking_id
     * @param string $description
     * @return bool
     */
    public static function log($conn, $user_id, $amount, $type, $booking_id = null, $description = '') {
        $amount = (float)$amount;
        
        // 1. Log the transaction
        $sql = "INSERT INTO transactions (user_id, booking_id, amount, type, status, description, created_at) 
                VALUES (?, ?, ?, ?, 'completed', ?, NOW())";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, 'iidss', $user_id, $booking_id, $amount, $type, $description);
        
        if (!mysqli_stmt_execute($stmt)) {
            error_log("Transaction log failed: " . mysqli_error($conn));
            return false;
        }

        // 2. Update user's wallet balance
        $update_sql = "UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?";
        $up_stmt = mysqli_prepare($conn, $update_sql);
        mysqli_stmt_bind_param($up_stmt, 'di', $amount, $user_id);
        
        if (!mysqli_stmt_execute($up_stmt)) {
            error_log("Balance update failed: " . mysqli_error($conn));
            return false;
        }

        return true;
    }

    /**
     * Processes a full booking payment from customer.
     * Deducts from customer, calculates commission, and credits vendor.
     */
    public static function processBookingPayment($conn, $customer_id, $vendor_id, $booking_id, $total_amount) {
        $total_amount = (float)$total_amount;
        $commission = $total_amount * self::$commission_rate;
        $vendor_amount = $total_amount - $commission;

        // 1. Deduct from Customer
        if (!self::log($conn, $customer_id, -$total_amount, 'payment', $booking_id, "Booking #$booking_id Payment")) {
            return false;
        }

        // 2. Platform Commission (Logic: Admin is usually ID 1 or a specific role)
        // Find an admin to credit commission (or just log it as platform gain)
        $admin_res = mysqli_query($conn, "SELECT id FROM users WHERE user_type = 'admin' LIMIT 1");
        if ($admin_res && mysqli_num_rows($admin_res) > 0) {
            $admin = mysqli_fetch_assoc($admin_res);
            self::log($conn, $admin['id'], $commission, 'commission', $booking_id, "Commission from Booking #$booking_id");
        }

        // 3. Credit Vendor
        if (!self::log($conn, $vendor_id, $vendor_amount, 'payout', $booking_id, "Payout for Booking #$booking_id")) {
            return false;
        }

        return true;
    }

    /**
     * Processes a full refund.
     * Reclaims from vendor/admin and credits back to customer.
     */
    public static function processRefund($conn, $booking_id) {
        // Fetch original transaction details
        $res = mysqli_query($conn, "SELECT b.user_id as customer_id, b.total_price, h.vendor_id 
                                    FROM bookings b 
                                    JOIN rooms r ON b.room_id = r.id 
                                    JOIN room_types rt ON r.room_type_id = rt.id 
                                    JOIN hotels h ON rt.hotel_id = h.id 
                                    WHERE b.id = $booking_id");
        
        if (!$res || mysqli_num_rows($res) === 0) return false;
        $data = mysqli_fetch_assoc($res);
        
        $total = (float)$data['total_price'];
        $commission = $total * self::$commission_rate;
        $vendor_part = $total - $commission;

        // 1. Credit Customer
        self::log($conn, $data['customer_id'], $total, 'refund', $booking_id, "Refund for Booking #$booking_id");

        // 2. Deduct from Vendor
        self::log($conn, $data['vendor_id'], -$vendor_part, 'payout', $booking_id, "Refund clawback for Booking #$booking_id");

        // 3. Deduct from Admin
        $admin_res = mysqli_query($conn, "SELECT id FROM users WHERE user_type = 'admin' LIMIT 1");
        if ($admin_res && mysqli_num_rows($admin_res) > 0) {
            $admin = mysqli_fetch_assoc($admin_res);
            self::log($conn, $admin['id'], -$commission, 'commission', $booking_id, "Commission Refund for Booking #$booking_id");
        }

        return true;
    }
}
?>
