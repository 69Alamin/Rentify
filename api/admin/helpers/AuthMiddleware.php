<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

class AuthMiddleware {
    public static function isAuthenticated() {
        return isset($_SESSION['user_id']);
    }

    public static function isAdmin() {
        return isset($_SESSION['user_id']) && isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'admin';
    }

    public static function hasRole($roles = []) {
        if (!self::isAdmin()) return false;
        
        // If no specific roles required, just being admin is enough (or check for base access)
        if (empty($roles)) return true;

        if (is_string($roles)) $roles = [$roles];

        // Super admin has access to everything
        if (isset($_SESSION['admin_role']) && $_SESSION['admin_role'] === 'super_admin') return true;

        return isset($_SESSION['admin_role']) && in_array($_SESSION['admin_role'], $roles);
    }

    public static function requireAuth() {
        if (!self::isAuthenticated()) {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit();
        }
    }

    public static function requireAdmin($allowedRoles = []) {
        if (!self::isAdmin()) {
            echo json_encode(['success' => false, 'message' => 'Unauthorized: Admin access required']);
            exit();
        }
        // Removed role-based restrictions - all admins have full access
    }
}
?>
