<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

require_once __DIR__ . '/../../db_conn.php';
require_once __DIR__ . '/helpers/AuthMiddleware.php';

AuthMiddleware::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];

// Ensure notifications table exists and user_id allows NULL
$tableCheck = mysqli_query($conn, "SHOW TABLES LIKE 'notifications'");
if (mysqli_num_rows($tableCheck) == 0) {
    $createSql = "CREATE TABLE notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    mysqli_query($conn, $createSql);
} else {
    // Fix: Ensure user_id column allows NULL (for global notifications)
    mysqli_query($conn, "ALTER TABLE notifications MODIFY user_id INT NULL");
}

if ($method === 'GET') {
    // List sent notifications
    $res = mysqli_query($conn, "SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50");
    if (!$res) {
        echo json_encode(['success' => false, 'message' => 'Query error: ' . mysqli_error($conn)]);
        exit();
    }
    $notifs = [];
    while($row = mysqli_fetch_assoc($res)) $notifs[] = $row;
    echo json_encode(['success' => true, 'data' => $notifs]);

} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
        exit();
    }
    
    $title = isset($input['title']) ? trim($input['title']) : '';
    $message = isset($input['message']) ? trim($input['message']) : '';
    $type = isset($input['type']) ? trim($input['type']) : 'info';
    $user_id = !empty($input['user_id']) ? (int)$input['user_id'] : null;

    if (empty($title) || empty($message)) {
        echo json_encode(['success' => false, 'message' => 'Title and Message required']);
        exit();
    }

    // Validate type
    $validTypes = ['info', 'warning', 'success', 'error'];
    if (!in_array($type, $validTypes)) {
        $type = 'info';
    }

    $title = mysqli_real_escape_string($conn, $title);
    $message = mysqli_real_escape_string($conn, $message);
    $type = mysqli_real_escape_string($conn, $type);
    
    if ($user_id) {
        // Single user notification
        $sql = "INSERT INTO notifications (user_id, title, message, type, created_at, is_read) VALUES ($user_id, '$title', '$message', '$type', NOW(), 0)";
        if (mysqli_query($conn, $sql)) {
            echo json_encode(['success' => true, 'message' => 'Notification sent to user']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to send: ' . mysqli_error($conn)]);
        }
    } else {
        // Blast to TARGETED users
        $target_group = isset($input['target_group']) ? trim($input['target_group']) : 'all';
        
        $sql = "SELECT id FROM users";
        
        // Add WHERE clause if sending to a specific group
        if ($target_group !== 'all') {
            $check_group = mysqli_real_escape_string($conn, $target_group);
            $sql .= " WHERE type = '$check_group'";
        }
        
        $users_res = mysqli_query($conn, $sql);
        
        if (!$users_res) {
            echo json_encode(['success' => false, 'message' => 'Failed to fetch users']);
            exit();
        }

        $count = 0;
        $values = [];
        while ($u = mysqli_fetch_assoc($users_res)) {
            $uid = $u['id'];
            // Prepare value string for batch insert
            $values[] = "($uid, '$title', '$message', '$type', NOW(), 0)";
            $count++;
            
            // Batch insert every 50 users to keep query size manageable
            if (count($values) >= 50) {
                $batch_sql = "INSERT INTO notifications (user_id, title, message, type, created_at, is_read) VALUES " . implode(',', $values);
                mysqli_query($conn, $batch_sql);
                $values = [];
            }
        }
        
        // Insert remaining
        if (count($values) > 0) {
            $batch_sql = "INSERT INTO notifications (user_id, title, message, type, created_at, is_read) VALUES " . implode(',', $values);
            mysqli_query($conn, $batch_sql);
        }

        echo json_encode(['success' => true, 'message' => "Blast sent to $count users ($target_group)"]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
