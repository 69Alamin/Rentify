<?php
/**
 * Ride Status Workflow API
 * Features: Track ride status (accepted -> on_the_way -> picked_up -> completed)
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
// 1. UPDATE RIDE STATUS
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'update_status') {
    if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'driver') {
        echo json_encode(['success' => false, 'message' => 'Only drivers can update status']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $ride_id = (int)($input['ride_id'] ?? 0);
    $new_status = sanitize($input['status'] ?? '');
    $rider_id = $_SESSION['user_id'];

    if ($ride_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid ride ID']);
        exit();
    }

    // Valid status transitions
    $valid_statuses = ['accepted', 'on_the_way', 'picked_up', 'completed', 'cancelled'];
    if (!in_array($new_status, $valid_statuses)) {
        echo json_encode(['success' => false, 'message' => 'Invalid status']);
        exit();
    }

    // Get current ride
    $get_sql = "SELECT status, rider_id FROM ride_history WHERE id = ?";
    $get_stmt = mysqli_prepare($conn, $get_sql);
    mysqli_stmt_bind_param($get_stmt, 'i', $ride_id);
    mysqli_stmt_execute($get_stmt);
    $current_ride = mysqli_fetch_assoc(mysqli_stmt_get_result($get_stmt));

    if (!$current_ride) {
        echo json_encode(['success' => false, 'message' => 'Ride not found']);
        exit();
    }

    // Verify rider owns this ride
    if ($current_ride['rider_id'] != $rider_id) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    // Validate status transition
    $allowed_transitions = [
        'requested' => ['accepted'],
        'accepted' => ['on_the_way', 'cancelled'],
        'on_the_way' => ['picked_up', 'cancelled'],
        'picked_up' => ['completed', 'cancelled'],
        'completed' => [],
        'cancelled' => []
    ];

    $current_status = $current_ride['status'];
    if (!isset($allowed_transitions[$current_status]) || !in_array($new_status, $allowed_transitions[$current_status])) {
        echo json_encode(['success' => false, 'message' => "Cannot transition from $current_status to $new_status"]);
        exit();
    }

    // Update status based on transition
    $update_fields = "status = ?";
    if ($new_status === 'completed') {
        $update_fields .= ", completed_at = NOW(), actual_time_minutes = TIMESTAMPDIFF(MINUTE, accepted_at, NOW())";
    } elseif ($new_status === 'on_the_way') {
        $update_fields .= ", pickup_time = NOW()";
    }

    $sql = "UPDATE ride_history SET $update_fields WHERE id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'si', $new_status, $ride_id);

    if (mysqli_stmt_execute($stmt)) {
        // Fetch ride details for notifications
        $ride_info_sql = "SELECT user_id, fare_amount FROM ride_history WHERE id = ?";
        $ride_info_stmt = mysqli_prepare($conn, $ride_info_sql);
        mysqli_stmt_bind_param($ride_info_stmt, 'i', $ride_id);
        mysqli_stmt_execute($ride_info_stmt);
        $ride_info = mysqli_fetch_assoc(mysqli_stmt_get_result($ride_info_stmt));
        $cust_id = $ride_info['user_id'];
        $fare = "৳" . number_format($ride_info['fare_amount'], 2);

        if ($new_status === 'on_the_way') {
            $notif_sql = "INSERT INTO notifications (user_id, title, message, notification_type, reference_id)
                          VALUES (?, 'Driver on the Way', ?, 'ride_update', ?)";
            $msg = "Your driver is heading to your pickup location. Fare: $fare";
            $notif_stmt = mysqli_prepare($conn, $notif_sql);
            mysqli_stmt_bind_param($notif_stmt, 'isi', $cust_id, $msg, $ride_id);
            mysqli_stmt_execute($notif_stmt);
        } elseif ($new_status === 'picked_up') {
            $notif_sql = "INSERT INTO notifications (user_id, title, message, notification_type, reference_id)
                          VALUES (?, 'Trip Started', ?, 'ride_update', ?)";
            $msg = "You have been picked up. Your journey has started. Fare: $fare";
            $notif_stmt = mysqli_prepare($conn, $notif_sql);
            mysqli_stmt_bind_param($notif_stmt, 'isi', $cust_id, $msg, $ride_id);
            mysqli_stmt_execute($notif_stmt);
        }

        // If completed, create earning record
        if ($new_status === 'completed') {
            create_earning_record($conn, $ride_id, $rider_id);
            
            // Update rider stats
            update_rider_stats($conn, $rider_id);

            // Send notification to user
            $ride_sql = "SELECT user_id, fare_amount FROM ride_history WHERE id = ?";
            $ride_stmt = mysqli_prepare($conn, $ride_sql);
            mysqli_stmt_bind_param($ride_stmt, 'i', $ride_id);
            mysqli_stmt_execute($ride_stmt);
            $ride_data = mysqli_fetch_assoc(mysqli_stmt_get_result($ride_stmt));

            $notif_sql = "INSERT INTO notifications (user_id, title, message, notification_type, reference_id)
                          VALUES (?, ?, ?, 'ride_completed', ?)";
            $title = 'Ride Completed!';
            $message = "Your ride is complete. Fare: ৳" . number_format($ride_data['fare_amount'], 2);
            
            $notif_stmt = mysqli_prepare($conn, $notif_sql);
            mysqli_stmt_bind_param($notif_stmt, 'issi', $ride_data['user_id'], $title, $message, $ride_id);
            mysqli_stmt_execute($notif_stmt);
        }

        error_log("Ride $ride_id status changed to $new_status");

        echo json_encode(['success' => true, 'message' => "Status updated to $new_status"]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update status']);
    }
    exit();
}

// ========================
// 2. GET RIDE STATUS
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'get_status') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $ride_id = (int)($_GET['ride_id'] ?? 0);

    if ($ride_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid ride ID']);
        exit();
    }

    $sql = "SELECT rh.*, rp.vehicle_type, u.full_name, u.phone,
            rh.pickup_lat,
            rh.pickup_lng,
            rh.drop_lat AS destination_lat,
            rh.drop_lng AS destination_lng,
            (SELECT COUNT(*) FROM rider_ratings WHERE ride_id = ?) as has_rating
            FROM ride_history rh
            JOIN users u ON rh.user_id = u.id
            LEFT JOIN rider_profiles rp ON rh.rider_id = rp.user_id
            WHERE rh.id = ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'ii', $ride_id, $ride_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    if ($row = mysqli_fetch_assoc($result)) {
        echo json_encode(['success' => true, 'data' => $row]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Ride not found']);
    }
    exit();
}

// ========================
// 3. CANCEL RIDE
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'cancel_ride') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $ride_id = (int)($input['ride_id'] ?? 0);
    $reason = sanitize($input['reason'] ?? 'User requested cancellation');
    $user_id = $_SESSION['user_id'];

    if ($ride_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid ride ID']);
        exit();
    }

    // Get ride details
    $get_sql = "SELECT status, rider_id FROM ride_history WHERE id = ?";
    $get_stmt = mysqli_prepare($conn, $get_sql);
    mysqli_stmt_bind_param($get_stmt, 'i', $ride_id);
    mysqli_stmt_execute($get_stmt);
    $ride = mysqli_fetch_assoc(mysqli_stmt_get_result($get_stmt));

    if (!$ride || $ride['status'] === 'completed' || $ride['status'] === 'cancelled') {
        echo json_encode(['success' => false, 'message' => 'Cannot cancel this ride']);
        exit();
    }

    $cancelled_by = ($_SESSION['user_type'] === 'driver') ? 'rider' : 'user';

    // Cancel the ride
    $sql = "UPDATE ride_history SET 
            status = 'cancelled',
            cancelled_by = ?,
            cancellation_reason = ?,
            cancelled_at = NOW()
            WHERE id = ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'ssi', $cancelled_by, $reason, $ride_id);

    if (mysqli_stmt_execute($stmt)) {
        // Record penalty if rider cancellation
        if ($cancelled_by === 'rider' && $ride['rider_id']) {
            $settings_sql = "SELECT setting_value FROM rider_settings 
                            WHERE setting_key = 'cancellation_penalty_amount'";
            $settings_result = mysqli_query($conn, $settings_sql);
            $settings_row = mysqli_fetch_assoc($settings_result);
            $penalty_amount = (float)($settings_row['setting_value'] ?? 50);

            $penalty_sql = "INSERT INTO cancellation_penalties 
                           (rider_id, ride_id, reason, penalty_amount)
                           VALUES (?, ?, ?, ?)";
            $penalty_stmt = mysqli_prepare($conn, $penalty_sql);
            mysqli_stmt_bind_param($penalty_stmt, 'iiss', $ride['rider_id'], $ride_id, $reason, $penalty_amount);
            mysqli_stmt_execute($penalty_stmt);

            // Deduct from wallet
            deduct_from_wallet($conn, $ride['rider_id'], $penalty_amount, 'penalty', 'Cancellation penalty');
        }

        error_log("Ride $ride_id cancelled by $cancelled_by");

        echo json_encode(['success' => true, 'message' => 'Ride cancelled']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to cancel ride']);
    }
    exit();
}

// ========================
// 4. GET RIDE HISTORY
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'get_history') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $rider_id = $_GET['rider_id'] ?? $_SESSION['user_id'];
    $type = $_GET['type'] ?? 'all'; // all, completed, cancelled
    $page = (int)($_GET['page'] ?? 1);
    $limit = 20;
    $offset = ($page - 1) * $limit;

    // Check permission
    if ($rider_id != $_SESSION['user_id'] && $_SESSION['user_type'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $where = "rh.rider_id = ?";
    if ($type !== 'all') {
        $where .= " AND rh.status = ?";
    }

    $sql = "SELECT rh.*, u.full_name, u.phone
            FROM ride_history rh
            JOIN users u ON rh.user_id = u.id
            WHERE $where
            ORDER BY rh.completed_at DESC
            LIMIT ? OFFSET ?";

    $stmt = mysqli_prepare($conn, $sql);
    
    if ($type === 'all') {
        mysqli_stmt_bind_param($stmt, 'iii', $rider_id, $limit, $offset);
    } else {
        mysqli_stmt_bind_param($stmt, 'isii', $rider_id, $type, $limit, $offset);
    }

    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $rides = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $rides[] = $row;
    }

    // Count total
    $count_sql = "SELECT COUNT(*) as total FROM ride_history rh WHERE $where";
    $count_stmt = mysqli_prepare($conn, $count_sql);
    
    if ($type === 'all') {
        mysqli_stmt_bind_param($count_stmt, 'i', $rider_id);
    } else {
        mysqli_stmt_bind_param($count_stmt, 'is', $rider_id, $type);
    }

    mysqli_stmt_execute($count_stmt);
    $count_row = mysqli_fetch_assoc(mysqli_stmt_get_result($count_stmt));

    echo json_encode([
        'success' => true,
        'data' => $rides,
        'pagination' => [
            'total' => $count_row['total'],
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($count_row['total'] / $limit)
        ]
    ]);
    exit();
}

// ========================
// HELPER FUNCTIONS
// ========================

function create_earning_record($conn, $ride_id, $rider_id) {
    $ride_sql = "SELECT fare_amount FROM ride_history WHERE id = ?";
    $ride_stmt = mysqli_prepare($conn, $ride_sql);
    mysqli_stmt_bind_param($ride_stmt, 'i', $ride_id);
    mysqli_stmt_execute($ride_stmt);
    $ride = mysqli_fetch_assoc(mysqli_stmt_get_result($ride_stmt));

    if (!$ride) return;

    $settings_sql = "SELECT setting_value FROM rider_settings WHERE setting_key = 'commission_percentage'";
    $settings_result = mysqli_query($conn, $settings_sql);
    $settings_row = mysqli_fetch_assoc($settings_result);
    $commission_percentage = (float)($settings_row['setting_value'] ?? 20);

    $fare = $ride['fare_amount'];
    $commission = ($fare * $commission_percentage) / 100;
    $earning = $fare - $commission;

    $sql = "INSERT INTO rider_earnings (rider_id, ride_id, fare_amount, commission_percentage, commission_amount, earning_amount)
            VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'iidddd', $rider_id, $ride_id, $fare, $commission_percentage, $commission, $earning);
    mysqli_stmt_execute($stmt);

    // Add to wallet
    add_to_wallet($conn, $rider_id, $earning, 'earning', "Earning from ride #$ride_id");
}

function update_rider_stats($conn, $rider_id) {
    $sql = "UPDATE rider_profiles SET 
            total_rides = (SELECT COUNT(*) FROM ride_history WHERE rider_id = ? AND status = 'completed'),
            total_earnings = (SELECT SUM(earning_amount) FROM rider_earnings WHERE rider_id = ?),
            rating = (SELECT AVG(rating) FROM rider_ratings WHERE rider_id = ?)
            WHERE user_id = ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'iiii', $rider_id, $rider_id, $rider_id, $rider_id);
    mysqli_stmt_execute($stmt);
}

function add_to_wallet($conn, $rider_id, $amount, $type, $description) {
    // Get current balance
    $get_sql = "SELECT balance FROM rider_wallet WHERE rider_id = ?";
    $get_stmt = mysqli_prepare($conn, $get_sql);
    mysqli_stmt_bind_param($get_stmt, 'i', $rider_id);
    mysqli_stmt_execute($get_stmt);
    $wallet = mysqli_fetch_assoc(mysqli_stmt_get_result($get_stmt));

    $balance_before = $wallet['balance'] ?? 0;
    $balance_after = $balance_before + $amount;

    // Update wallet
    $update_sql = "INSERT INTO rider_wallet (rider_id, balance, total_added) VALUES (?, ?, ?)
                   ON DUPLICATE KEY UPDATE 
                   balance = balance + ?,
                   total_added = total_added + ?,
                   last_transaction_at = NOW()";
    $update_stmt = mysqli_prepare($conn, $update_sql);
    mysqli_stmt_bind_param($update_stmt, 'iddd', $rider_id, $amount, $amount, $amount, $amount);
    mysqli_stmt_execute($update_stmt);

    // Log transaction
    $log_sql = "INSERT INTO wallet_transactions (rider_id, transaction_type, amount, balance_before, balance_after, reference_type, description)
                VALUES (?, 'credit', ?, ?, ?, ?, ?)";
    $log_stmt = mysqli_prepare($conn, $log_sql);
    mysqli_stmt_bind_param($log_stmt, 'iddss', $rider_id, $amount, $balance_before, $balance_after, $type, $description);
    mysqli_stmt_execute($log_stmt);
}

function deduct_from_wallet($conn, $rider_id, $amount, $type, $description) {
    add_to_wallet($conn, $rider_id, -$amount, $type, $description);
}

// ========================
// DEFAULT RESPONSE
// ========================
echo json_encode(['success' => false, 'message' => 'Invalid action']);
?>
