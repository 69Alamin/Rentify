<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

$input = json_decode(file_get_contents('php://input'), true);

// Define password validation constants if not defined
if (!defined('MIN_PASSWORD_LENGTH')) define('MIN_PASSWORD_LENGTH', 6);
if (!defined('REQUIRE_UPPERCASE')) define('REQUIRE_UPPERCASE', false);
if (!defined('REQUIRE_LOWERCASE')) define('REQUIRE_LOWERCASE', false);
if (!defined('REQUIRE_NUMBERS')) define('REQUIRE_NUMBERS', false);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit();
}

// Password validation from register.php
function api_validate_password($password) {
    if (strlen($password) < MIN_PASSWORD_LENGTH) {
        return 'Password must be at least ' . MIN_PASSWORD_LENGTH . ' characters long';
    }
    if (REQUIRE_UPPERCASE && !preg_match('/[A-Z]/', $password)) {
        return 'Password must contain at least one uppercase letter';
    }
    if (REQUIRE_LOWERCASE && !preg_match('/[a-z]/', $password)) {
        return 'Password must contain at least one lowercase letter';
    }
    if (REQUIRE_NUMBERS && !preg_match('/[0-9]/', $password)) {
        return 'Password must contain at least one number';
    }
    return '';
}

$full_name = sanitize($input['full_name'] ?? '');
$email = sanitize($input['email'] ?? '');
$password = $input['password'] ?? '';
$user_type = $input['user_type'] ?? 'customer';

if (!$full_name || !$email || !$password) {
    echo json_encode(['success' => false, 'message' => 'Please fill in required fields']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit();
}

$pass_err = api_validate_password($password);
if ($pass_err) {
    echo json_encode(['success' => false, 'message' => $pass_err]);
    exit();
}

if (!in_array($user_type, ['customer','vendor','driver'], true)) {
    echo json_encode(['success' => false, 'message' => 'Invalid user type']);
    exit();
}

$check_sql = "SELECT id FROM users WHERE email = ? LIMIT 1";
$check = db_query($check_sql, 's', [$email]);
if ($check && mysqli_num_rows($check) > 0) {
     echo json_encode(['success' => false, 'message' => 'Email already registered']);
     exit();
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$sql = "INSERT INTO users (full_name, email, password_hash, user_type, wallet_balance) VALUES (?, ?, ?, ?, 5000)";

if (db_query($sql, 'ssss', [$full_name, $email, $hash, $user_type])) {
     $new_user_id = mysqli_insert_id($conn);
     
     // Auto Login
     $old_session_id = session_id();
     session_regenerate_id(true);
     $new_session_id = session_id();
     
     // Transfer room locks to new session
     db_query("UPDATE rooms SET locked_by_session = ? WHERE locked_by_session = ?", 'ss', [$new_session_id, $old_session_id]);

     $_SESSION['user_id'] = $new_user_id;
     $_SESSION['name'] = $full_name;
     $_SESSION['email'] = $email;
     $_SESSION['user_type'] = $user_type;

     // Check for pending booking
     $has_pending_booking = false;
     if (isset($_SESSION['pending_booking']) && !empty($_SESSION['pending_booking'])) {
         $has_pending_booking = true;
     }

     echo json_encode(['success' => true, 'message' => 'Registration successful! Welcome bonus of ৳5000 added.', 'has_pending_booking' => $has_pending_booking]);
} else {
     echo json_encode(['success' => false, 'message' => 'Registration failed']);
}
?>
