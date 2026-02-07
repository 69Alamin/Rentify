<?php
// require_once __DIR__ . '/config.php';

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'quickrent_db');

$conn = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if (!$conn) {
    die('Connection failed: ' . mysqli_connect_error());
}
mysqli_set_charset($conn, 'utf8mb4');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Common helpers
function sanitize($data) {
    global $conn;
    return mysqli_real_escape_string($conn, trim($data));
}

function is_logged_in() {
    return isset($_SESSION['user_id']);
}

function require_login() {
    if (!is_logged_in()) {
        if (function_exists('send_json')) {
            send_json(['success' => false, 'message' => 'Please login to continue', 'require_login' => true], 401);
        } else {
            header('Location: /Quickrent/auth/login.php');
            exit();
        }
    }
}

function require_admin() {
    require_login();
    if (empty($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
        if (function_exists('send_json')) {
            send_json(['success' => false, 'message' => 'Access denied: Admin only'], 403);
        } else {
            header('HTTP/1.1 403 Forbidden');
            echo 'Access denied.';
            exit();
        }
    }
}

// CSRF Token functions
function generate_csrf_token() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verify_csrf_token($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// Safe query wrapper using prepared statements
function db_query($query, $types = '', $params = []) {
    global $conn;
    
    try {
        if (empty($params)) {
            $result = mysqli_query($conn, $query);
            if (!$result) {
                error_log("Query failed: " . mysqli_error($conn));
                return false;
            }
            $GLOBALS['db_affected_rows'] = mysqli_affected_rows($conn);
            return $result;
        }
        
        $stmt = mysqli_prepare($conn, $query);
        if (!$stmt) {
            error_log("Prepare failed: " . mysqli_error($conn));
            return false;
        }
        
        if (!empty($types) && !empty($params)) {
            $bind_params = [$types];
            foreach ($params as $key => $value) {
                $bind_params[] = &$params[$key];
            }
            call_user_func_array([$stmt, 'bind_param'], $bind_params);
        }
        
        if (!mysqli_stmt_execute($stmt)) {
            error_log("Execute failed: " . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }
        
        $result = mysqli_stmt_get_result($stmt);
        if ($result === false) {
            $GLOBALS['db_affected_rows'] = mysqli_stmt_affected_rows($stmt);
            mysqli_stmt_close($stmt);
            return true;
        }

        $GLOBALS['db_affected_rows'] = mysqli_num_rows($result);
        mysqli_stmt_close($stmt);
        return $result;
    } catch (Throwable $e) {
        error_log("Database Error: " . $e->getMessage());
    }
}

function update_realtime_status($type, $id, $status) {
    global $conn;

    $sql = "INSERT INTO realtime_status (entity_type, entity_id, status) VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = NOW(6)";
    // We update updated_at explicitly to ensure it changes even if status matches (though usually status changes)
    // Actually ON UPDATE CURRENT_TIMESTAMP only updates if row changes.
    // So if we just refresh status, we need to force updated_at
    
    // Better:
    $sql = "INSERT INTO realtime_status (entity_type, entity_id, status) VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = NOW(6)";
            
    db_query($sql, 'siss', [$type, $id, $status, $status]);
}