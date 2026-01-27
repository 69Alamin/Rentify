<?php
header('Content-Type: application/json');
// Allow any localhost port for development
$allowed_origins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://127.0.0.1:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS, GET');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();
require_once __DIR__ . '/../../db_conn.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit();
}

$email = sanitize($input['email'] ?? '');
$password = $input['password'] ?? '';

if (!$email || !$password) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all fields']);
    exit();
}

$sql = "SELECT * FROM users WHERE email = ? LIMIT 1";
$result = db_query($sql, 's', [$email]);

if ($result && mysqli_num_rows($result) === 1) {
    $user = mysqli_fetch_assoc($result);
    // Use verify logic from original login.php
    if (password_verify($password, $user['password_hash'])) {
        // Check if account is blocked (if column exists)
        if (isset($user['is_blocked']) && $user['is_blocked']) {
            echo json_encode(['success' => false, 'message' => 'Account blocked. Contact admin.']);
            exit();
        }

        $old_session_id = session_id();
        session_regenerate_id(true);
        $new_session_id = session_id();

        // Transfer room locks to new session
        db_query("UPDATE rooms SET locked_by_session = ? WHERE locked_by_session = ?", 'ss', [$new_session_id, $old_session_id]);

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['name'] = $user['full_name'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['user_type'] = $user['user_type'];
        $_SESSION['admin_role'] = $user['admin_role'] ?? null;

        // Check for pending booking
        $has_pending_booking = false;
        if (isset($_SESSION['pending_booking']) && !empty($_SESSION['pending_booking'])) {
            $has_pending_booking = true;
        }

        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'name' => $user['full_name'],
                'email' => $user['email'],
                'type' => $user['user_type']
            ],
            'has_pending_booking' => $has_pending_booking
        ]);
        exit();
    }
}

echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
?>
