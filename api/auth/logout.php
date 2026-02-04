<?php
require_once __DIR__ . '/../cors.php';
handle_cors();
header('Content-Type: application/json');

session_start();

// Unset all session variables
$_SESSION = array();

// If it's desired to kill the session, also delete the session cookie.
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Finally, destroy the session.
session_destroy();

send_json(['success' => true, 'message' => 'Logged out successfully']);
?>
