<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

require_once __DIR__ . '/../../db_conn.php';
require_once __DIR__ . '/helpers/AuthMiddleware.php';

// Require Admin Access (Super Admin or Support Staff for viewing)
AuthMiddleware::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'GET') {
    // Search & Filter
    $search = isset($_GET['search']) ? sanitize($_GET['search']) : '';
    $role_filter = isset($_GET['role']) ? sanitize($_GET['role']) : '';
    $status_filter = isset($_GET['status']) ? sanitize($_GET['status']) : '';

    $where = ["1=1"];
    $params = [];
    $types = "";

    if ($search) {
        $where[] = "(full_name LIKE ? OR email LIKE ? OR phone LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= "sss";
    }

    if ($role_filter) {
        $where[] = "user_type = ?";
        $params[] = $role_filter;
        $types .= "s";
    }

    if ($status_filter) {
        if ($status_filter === 'blocked') {
            $where[] = "is_blocked = 1";
        } elseif ($status_filter === 'verified') {
            $where[] = "is_verified = 1";
        } elseif ($status_filter === 'active') {
            $where[] = "is_blocked = 0";
        }
    }

    $whereStr = implode(" AND ", $where);
    $query = "SELECT id, full_name, email, phone, user_type, is_verified, is_blocked, created_at, admin_role, wallet_balance as balance FROM users WHERE $whereStr ORDER BY created_at DESC";
    
    $result = db_query($query, $types, $params);
    $users = [];
    while($row = mysqli_fetch_assoc($result)) {
        // Cast types
        $row['is_verified'] = (bool)$row['is_verified'];
        $row['is_blocked'] = (bool)$row['is_blocked'];
        $users[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $users]);

} elseif ($method === 'POST') {
    // Actions: toggle_block, verify_user, reset_access
    // Removed role-based restrictions - all admins can modify users

    $action = $input['action'] ?? '';
    $user_id = (int)($input['user_id'] ?? 0);

    if (!$user_id) {
        echo json_encode(['success' => false, 'message' => 'Invalid User ID']);
        exit();
    }

    if ($action === 'toggle_block') {
        $blocked = (int)($input['blocked'] ?? 0);
        $res = db_query("UPDATE users SET is_blocked = ? WHERE id = ?", 'ii', [$blocked, $user_id]);
        echo json_encode(['success' => $res, 'message' => $res ? 'User block status updated' : 'Failed']);
    } elseif ($action === 'verify_user') {
        $verified = (int)($input['verified'] ?? 0);
        $res = db_query("UPDATE users SET is_verified = ? WHERE id = ?", 'ii', [$verified, $user_id]);
        echo json_encode(['success' => $res, 'message' => $res ? 'User verification updated' : 'Failed']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid Action']);
    }
}
?>
