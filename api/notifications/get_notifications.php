<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$user_id = (int)$_SESSION['user_id'];
$only_unread = isset($_GET['unread']) && $_GET['unread'] === 'true';

// Build query to get both user-specific AND global (user_id IS NULL) notifications
$sql = "SELECT * FROM notifications WHERE (user_id = $user_id OR user_id IS NULL)";
if ($only_unread) {
    $sql .= " AND is_read = 0";
}
$sql .= " ORDER BY created_at DESC LIMIT 50";

$result = mysqli_query($conn, $sql);
$notifications = [];

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        // Normalize the notification data
        $row['is_global'] = ($row['user_id'] === null || $row['user_id'] === '');
        
        // Ensure type field exists (use notification_type as fallback)
        if (empty($row['type']) && !empty($row['notification_type'])) {
            $row['type'] = $row['notification_type'];
        }
        if (empty($row['type'])) {
            $row['type'] = 'info';
        }
        
        $notifications[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $notifications]);
} else {
    echo json_encode(['success' => false, 'message' => 'Query error: ' . mysqli_error($conn), 'data' => []]);
}
?>
