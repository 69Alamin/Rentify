<?php
/**
 * Rider Earnings & Wallet System API
 * Features: View earnings, Wallet balance, Withdrawal requests, Transaction history
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
// 1. GET WALLET BALANCE
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'wallet_balance') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $rider_id = $_GET['rider_id'] ?? $_SESSION['user_id'];

    if ($rider_id != $_SESSION['user_id'] && $_SESSION['user_type'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $sql = "SELECT balance, total_added, total_withdrawn, last_transaction_at
            FROM rider_wallet WHERE rider_id = ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'i', $rider_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    if ($row = mysqli_fetch_assoc($result)) {
        echo json_encode(['success' => true, 'data' => $row]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Wallet not found']);
    }
    exit();
}

// ========================
// 2. GET EARNINGS SUMMARY
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'earnings_summary') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $rider_id = $_GET['rider_id'] ?? $_SESSION['user_id'];
    $period = $_GET['period'] ?? 'today'; // today, week, month, all

    if ($rider_id != $_SESSION['user_id'] && $_SESSION['user_type'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $where = "re.rider_id = ?";
    
    if ($period === 'today') {
        $where .= " AND DATE(re.created_at) = CURDATE()";
    } elseif ($period === 'week') {
        $where .= " AND re.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
    } elseif ($period === 'month') {
        $where .= " AND MONTH(re.created_at) = MONTH(CURDATE()) AND YEAR(re.created_at) = YEAR(CURDATE())";
    }

    $sql = "SELECT 
            COUNT(*) as total_rides,
            SUM(re.fare_amount) as total_fare,
            SUM(re.earning_amount) as total_earning,
            AVG(re.earning_amount) as avg_earning,
            MIN(re.fare_amount) as min_fare,
            MAX(re.fare_amount) as max_fare,
            SUM(re.commission_amount) as total_commission
            FROM rider_earnings re
            WHERE $where";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'i', $rider_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    if ($row = mysqli_fetch_assoc($result)) {
        // Get breakdown by day
        $breakdown_sql = "SELECT DATE(re.created_at) as date,
                         COUNT(*) as rides,
                         SUM(re.earning_amount) as daily_earning
                         FROM rider_earnings re
                         WHERE $where
                         GROUP BY DATE(re.created_at)
                         ORDER BY date DESC";

        $breakdown_stmt = mysqli_prepare($conn, $breakdown_sql);
        mysqli_stmt_bind_param($breakdown_stmt, 'i', $rider_id);
        mysqli_stmt_execute($breakdown_stmt);
        $breakdown_result = mysqli_stmt_get_result($breakdown_stmt);

        $breakdown = [];
        while ($break_row = mysqli_fetch_assoc($breakdown_result)) {
            $breakdown[] = $break_row;
        }

        echo json_encode([
            'success' => true,
            'period' => $period,
            'summary' => $row,
            'breakdown' => $breakdown
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No earnings found']);
    }
    exit();
}

// ========================
// 3. GET EARNINGS DETAILS (Per-ride breakdown)
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'earnings_details') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $rider_id = $_GET['rider_id'] ?? $_SESSION['user_id'];
    $page = (int)($_GET['page'] ?? 1);
    $limit = 20;
    $offset = ($page - 1) * $limit;

    if ($rider_id != $_SESSION['user_id'] && $_SESSION['user_type'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $sql = "SELECT re.*, rh.pickup_lat, rh.pickup_lng, rh.drop_lat, rh.drop_lng,
            rh.distance_km, rh.completed_at, u.full_name
            FROM rider_earnings re
            JOIN ride_history rh ON re.ride_id = rh.id
            JOIN users u ON rh.user_id = u.id
            WHERE re.rider_id = ?
            ORDER BY re.created_at DESC
            LIMIT ? OFFSET ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'iii', $rider_id, $limit, $offset);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $earnings = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $earnings[] = $row;
    }

    // Get total count
    $count_sql = "SELECT COUNT(*) as total FROM rider_earnings WHERE rider_id = ?";
    $count_stmt = mysqli_prepare($conn, $count_sql);
    mysqli_stmt_bind_param($count_stmt, 'i', $rider_id);
    mysqli_stmt_execute($count_stmt);
    $count_row = mysqli_fetch_assoc(mysqli_stmt_get_result($count_stmt));

    echo json_encode([
        'success' => true,
        'data' => $earnings,
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
// 4. GET TRANSACTION HISTORY
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'transaction_history') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $rider_id = $_GET['rider_id'] ?? $_SESSION['user_id'];
    $page = (int)($_GET['page'] ?? 1);
    $limit = 20;
    $offset = ($page - 1) * $limit;

    if ($rider_id != $_SESSION['user_id'] && $_SESSION['user_type'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $sql = "SELECT * FROM wallet_transactions
            WHERE rider_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'iii', $rider_id, $limit, $offset);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $transactions = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $transactions[] = $row;
    }

    // Get total
    $count_sql = "SELECT COUNT(*) as total FROM wallet_transactions WHERE rider_id = ?";
    $count_stmt = mysqli_prepare($conn, $count_sql);
    mysqli_stmt_bind_param($count_stmt, 'i', $rider_id);
    mysqli_stmt_execute($count_stmt);
    $count_row = mysqli_fetch_assoc(mysqli_stmt_get_result($count_stmt));

    echo json_encode([
        'success' => true,
        'data' => $transactions,
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
// 5. REQUEST WITHDRAWAL
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'request_withdrawal') {
    if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'driver') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $amount = floatval($input['amount'] ?? 0);
    $bank_account = sanitize($input['bank_account'] ?? '');
    $bank_name = sanitize($input['bank_name'] ?? '');
    $ifsc_code = sanitize($input['ifsc_code'] ?? '');
    $rider_id = $_SESSION['user_id'];

    if ($amount <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid amount']);
        exit();
    }

    // Check balance
    $wallet_sql = "SELECT balance FROM rider_wallet WHERE rider_id = ?";
    $wallet_stmt = mysqli_prepare($conn, $wallet_sql);
    mysqli_stmt_bind_param($wallet_stmt, 'i', $rider_id);
    mysqli_stmt_execute($wallet_stmt);
    $wallet = mysqli_fetch_assoc(mysqli_stmt_get_result($wallet_stmt));

    if (!$wallet || $wallet['balance'] < $amount) {
        echo json_encode(['success' => false, 'message' => 'Insufficient balance']);
        exit();
    }

    // Minimum withdrawal check
    if ($amount < 500) {
        echo json_encode(['success' => false, 'message' => 'Minimum withdrawal amount is ₹500']);
        exit();
    }

    // Create withdrawal request
    $sql = "INSERT INTO withdrawal_requests 
            (rider_id, amount, bank_account, bank_name, ifsc_code, status)
            VALUES (?, ?, ?, ?, ?, 'pending')";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'idsss', $rider_id, $amount, $bank_account, $bank_name, $ifsc_code);

    if (mysqli_stmt_execute($stmt)) {
        $request_id = mysqli_insert_id($conn);

        // Send notification to admin
        $admin_notif = "INSERT INTO notifications (user_id, title, message, notification_type, reference_id)
                       SELECT id, 'New Withdrawal Request', ?, 'withdrawal_request', ?
                       FROM users WHERE user_type = 'admin'";
        $msg = "Rider requested withdrawal of ₹" . number_format($amount, 2);
        $admin_stmt = mysqli_prepare($conn, $admin_notif);
        mysqli_stmt_bind_param($admin_stmt, 'si', $msg, $request_id);
        mysqli_stmt_execute($admin_stmt);

        // Notify rider
        $rider_notif = "INSERT INTO rider_notifications (rider_id, title, message, notification_type)
                       VALUES (?, 'Withdrawal Initiated', ?, 'payment')";
        $rider_msg = "Your withdrawal request of ₹" . number_format($amount, 2) . " is being processed.";
        $rider_stmt = mysqli_prepare($conn, $rider_notif);
        mysqli_stmt_bind_param($rider_stmt, 'is', $rider_id, $rider_msg);
        mysqli_stmt_execute($rider_stmt);

        error_log("Rider $rider_id requested withdrawal of ₹$amount");

        echo json_encode([
            'success' => true,
            'message' => 'Withdrawal request submitted',
            'request_id' => $request_id
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to create request']);
    }
    exit();
}

// ========================
// 6. GET WITHDRAWAL REQUESTS (Admin)
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'withdrawal_requests') {
    if ($_SESSION['user_type'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        exit();
    }

    $status = $_GET['status'] ?? 'pending'; // pending, approved, processing, completed, rejected
    $page = (int)($_GET['page'] ?? 1);
    $limit = 20;
    $offset = ($page - 1) * $limit;

    $sql = "SELECT wr.*, u.full_name, u.phone
            FROM withdrawal_requests wr
            JOIN users u ON wr.rider_id = u.id
            WHERE wr.status = ?
            ORDER BY wr.requested_at DESC
            LIMIT ? OFFSET ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'sii', $status, $limit, $offset);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $requests = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $requests[] = $row;
    }

    // Get total
    $count_sql = "SELECT COUNT(*) as total FROM withdrawal_requests WHERE status = ?";
    $count_stmt = mysqli_prepare($conn, $count_sql);
    mysqli_stmt_bind_param($count_stmt, 's', $status);
    mysqli_stmt_execute($count_stmt);
    $count_row = mysqli_fetch_assoc(mysqli_stmt_get_result($count_stmt));

    echo json_encode([
        'success' => true,
        'data' => $requests,
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
// 7. PROCESS WITHDRAWAL (Admin)
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'process_withdrawal') {
    if ($_SESSION['user_type'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $request_id = (int)($input['request_id'] ?? 0);
    $action = $input['action'] ?? 'approve'; // approve, reject
    $notes = sanitize($input['notes'] ?? '');
    $admin_id = $_SESSION['user_id'];

    if ($request_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid request ID']);
        exit();
    }

    if (!in_array($action, ['approve', 'reject'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        exit();
    }

    // Get withdrawal request
    $get_sql = "SELECT * FROM withdrawal_requests WHERE id = ? AND status = 'pending'";
    $get_stmt = mysqli_prepare($conn, $get_sql);
    mysqli_stmt_bind_param($get_stmt, 'i', $request_id);
    mysqli_stmt_execute($get_stmt);
    $request = mysqli_fetch_assoc(mysqli_stmt_get_result($get_stmt));

    if (!$request) {
        echo json_encode(['success' => false, 'message' => 'Request not found']);
        exit();
    }

    if ($action === 'approve') {
        $new_status = 'processing';
    } else {
        $new_status = 'rejected';
    }

    // Update request
    $update_sql = "UPDATE withdrawal_requests SET 
                   status = ?,
                   processed_by = ?,
                   processed_at = NOW(),
                   rejection_reason = ?
                   WHERE id = ?";

    $update_stmt = mysqli_prepare($conn, $update_sql);
    $rejection_reason = ($action === 'reject') ? $notes : NULL;
    mysqli_stmt_bind_param($update_stmt, 'sisi', $new_status, $admin_id, $rejection_reason, $request_id);

    if (mysqli_stmt_execute($update_stmt)) {
        if ($action === 'approve') {
            // Deduct from wallet
            $wallet_update = "UPDATE rider_wallet SET 
                             balance = balance - ?,
                             total_withdrawn = total_withdrawn + ?
                             WHERE rider_id = ?";
            $wallet_stmt = mysqli_prepare($conn, $wallet_update);
            mysqli_stmt_bind_param($wallet_stmt, 'ddi', $request['amount'], $request['amount'], $request['rider_id']);
            mysqli_stmt_execute($wallet_stmt);

            // Log transaction
            $log_sql = "INSERT INTO wallet_transactions (rider_id, transaction_type, amount, reference_type, description, status)
                       VALUES (?, 'debit', ?, 'withdrawal', ?, 'pending')";
            $log_stmt = mysqli_prepare($conn, $log_sql);
            $desc = "Withdrawal request #$request_id approved";
            mysqli_stmt_bind_param($log_stmt, 'ids', $request['rider_id'], $request['amount'], $desc);
            mysqli_stmt_execute($log_stmt);

            $msg = "Your withdrawal of ₹" . number_format($request['amount'], 2) . " has been approved and is being processed.";
        } else {
            $msg = "Your withdrawal request of ₹" . number_format($request['amount'], 2) . " was rejected. Reason: $notes";
        }

        // Notify rider
        $notif_sql = "INSERT INTO rider_notifications (rider_id, title, message, notification_type)
                     VALUES (?, ?, ?, 'payment')";
        $title = ($action === 'approve') ? 'Withdrawal Approved' : 'Withdrawal Rejected';
        $notif_stmt = mysqli_prepare($conn, $notif_sql);
        mysqli_stmt_bind_param($notif_stmt, 'iss', $request['rider_id'], $title, $msg);
        mysqli_stmt_execute($notif_stmt);

        echo json_encode(['success' => true, 'message' => "Withdrawal " . $action . "ed"]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to process request']);
    }
    exit();
}

// ========================
// DEFAULT RESPONSE
// ========================
echo json_encode(['success' => false, 'message' => 'Invalid action']);
?>
