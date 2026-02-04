<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';
handle_cors();

session_start();
require_once __DIR__ . '/../../db_conn.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    send_json(['success' => false, 'message' => 'Invalid input']);
}

$email = sanitize($input['email'] ?? '');
$password = $input['password'] ?? '';

if (!$email || !$password) {
    send_json(['success' => false, 'message' => 'Please fill in all fields']);
}

$sql = "SELECT * FROM users WHERE email = ? LIMIT 1";
$result = db_query($sql, 's', [$email]);

if ($result && mysqli_num_rows($result) === 1) {
    $user = mysqli_fetch_assoc($result);
    // Use verify logic from original login.php
    if (password_verify($password, $user['password_hash'])) {
        // Check if account is blocked (if column exists)
        if (isset($user['is_blocked']) && $user['is_blocked']) {
            send_json(['success' => false, 'message' => 'Account blocked. Contact admin.']);
        }

        $old_session_id = session_id();
        session_regenerate_id(true);
        $new_session_id = session_id();

        // Transfer room locks to new session
        db_query("UPDATE rooms SET locked_by_session = ? WHERE locked_by_session = ?", 'ss', [$new_session_id, $old_session_id]);

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['full_name'] = $user['full_name'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['user_type'] = $user['user_type'];
        $_SESSION['admin_role'] = $user['admin_role'] ?? null;

        // Check for pending booking
        $has_pending_booking = false;
        if (isset($_SESSION['pending_booking']) && !empty($_SESSION['pending_booking'])) {
            $has_pending_booking = true;
        }

        send_json([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'name' => $user['full_name'],
                'email' => $user['email'],
                'type' => $user['user_type']
            ],
            'has_pending_booking' => $has_pending_booking
        ]);
    }
}

send_json(['success' => false, 'message' => 'Invalid email or password']);
?>
