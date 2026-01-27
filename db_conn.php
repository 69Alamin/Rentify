<?php
// require_once __DIR__ . '/config.php';

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'rentify_db');

$conn = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if (!$conn) {
    die('Connection failed: ' . mysqli_connect_error());
}
mysqli_set_charset($conn, 'utf8mb4');

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
        header('Location: /Rentify/auth/login.php');
        exit();
    }
}

function require_admin() {
    require_login();
    if (empty($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
        header('HTTP/1.1 403 Forbidden');
        echo 'Access denied.';
        exit();
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
        // mysqli_stmt_bind_param requires parameters to be passed by reference.
        // Build an array of references and use call_user_func_array for compatibility.
        $bind_params = [];
        $bind_params[] = $types;
        for ($i = 0; $i < count($params); $i++) {
            // create a variable variable to ensure reference
            $bind_name = 'bind_' . $i;
            $$bind_name = $params[$i];
            $bind_params[] = &$$bind_name;
        }
        call_user_func_array([$stmt, 'bind_param'], $bind_params);
    }
    
    if (!mysqli_stmt_execute($stmt)) {
        error_log("Execute failed: " . mysqli_stmt_error($stmt));
        mysqli_stmt_close($stmt);
        return false;
    }
    
    // Try to get a result set (for SELECT queries). For non-SELECT statements
    // mysqli_stmt_get_result will return false; in that case return true
    // to indicate successful execution (so INSERT/UPDATE/DELETE callers
    // that expect a truthy value don't treat it as failure).
    $result = mysqli_stmt_get_result($stmt);
    if ($result === false) {
        // No result set (likely an INSERT/UPDATE/DELETE).
        $GLOBALS['db_affected_rows'] = mysqli_stmt_affected_rows($stmt);
        mysqli_stmt_close($stmt);
        return true;
    }

    $GLOBALS['db_affected_rows'] = mysqli_num_rows($result);
    mysqli_stmt_close($stmt);
    return $result;
}