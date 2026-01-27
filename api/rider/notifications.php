<?php
/**
 * Rider Notifications API
 * Features: Get notifications, Mark as read, Send notifications
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
// 1. GET NOTIFICATIONS
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'get_notifications') {
    if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'driver') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $rider_id = $_SESSION['user_id'];
    $filter = $_GET['filter'] ?? 'unread'; // unread, all
    $page = (int)($_GET['page'] ?? 1);
    $limit = 20;
    $offset = ($page - 1) * $limit;

    $where = "rider_id = ?";
    if ($filter === 'unread') {
        $where .= " AND is_read = 0";
    }

    $sql = "SELECT * FROM rider_notifications
            WHERE $where
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'iii', $rider_id, $limit, $offset);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $notifications = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $notifications[] = $row;
    }

    // Get count
    $count_sql = "SELECT COUNT(*) as total FROM rider_notifications WHERE $where";
    $count_stmt = mysqli_prepare($conn, $count_sql);
    mysqli_stmt_bind_param($count_stmt, 'i', $rider_id);
    mysqli_stmt_execute($count_stmt);
    $count_row = mysqli_fetch_assoc(mysqli_stmt_get_result($count_stmt));

    // Get unread count
    $unread_sql = "SELECT COUNT(*) as unread FROM rider_notifications WHERE rider_id = ? AND is_read = 0";
    $unread_stmt = mysqli_prepare($conn, $unread_sql);
    mysqli_stmt_bind_param($unread_stmt, 'i', $rider_id);
    mysqli_stmt_execute($unread_stmt);
    $unread_row = mysqli_fetch_assoc(mysqli_stmt_get_result($unread_stmt));

    echo json_encode([
        'success' => true,
        'data' => $notifications,
        'unread_count' => $unread_row['unread'],
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
// 2. MARK AS READ
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'mark_as_read') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $notification_id = (int)($input['notification_id'] ?? 0);
    $mark_all = (int)($input['mark_all'] ?? 0);
    $rider_id = $_SESSION['user_id'];

    if ($mark_all) {
        // Mark all as read
        $sql = "UPDATE rider_notifications SET is_read = 1, read_at = NOW() 
                WHERE rider_id = ? AND is_read = 0";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, 'i', $rider_id);
    } else {
        // Mark specific notification
        if ($notification_id <= 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid notification ID']);
            exit();
        }

        $sql = "UPDATE rider_notifications SET is_read = 1, read_at = NOW() 
                WHERE id = ? AND rider_id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, 'ii', $notification_id, $rider_id);
    }

    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(['success' => true, 'message' => 'Marked as read']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update']);
    }
    exit();
}

// ========================
// 3. DELETE NOTIFICATION
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'delete_notification') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $notification_id = (int)($input['notification_id'] ?? 0);
    $rider_id = $_SESSION['user_id'];

    if ($notification_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid notification ID']);
        exit();
    }

    $sql = "DELETE FROM rider_notifications WHERE id = ? AND rider_id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'ii', $notification_id, $rider_id);

    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(['success' => true, 'message' => 'Notification deleted']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete']);
    }
    exit();
}

// ========================
// 4. GET UNREAD COUNT
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'unread_count') {
    if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'driver') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $rider_id = $_SESSION['user_id'];

    $sql = "SELECT COUNT(*) as unread FROM rider_notifications 
            WHERE rider_id = ? AND is_read = 0";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'i', $rider_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);

    echo json_encode(['success' => true, 'unread_count' => $row['unread']]);
    exit();
}

// ========================
// DEFAULT RESPONSE
// ========================
echo json_encode(['success' => false, 'message' => 'Invalid action']);
?>
