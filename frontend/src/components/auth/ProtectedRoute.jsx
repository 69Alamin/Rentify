import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const location = useLocation();

    // 1. Get User from LocalStorage
    let user = null;
    try {
        const stored = localStorage.getItem('user');
        if (stored) user = JSON.parse(stored);
    } catch (e) {
        console.error("Auth Error", e);
    }

    // 2. Check Authentication
    if (!user) {
        // Not logged in -> Redirect to Login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Check Role Authorization
    if (allowedRoles.length > 0) {
        // Normalize roles (e.g. 'rider' matches 'driver' permissions if needed)
        const userRole = (user.type || '').toLowerCase();

        if (!allowedRoles.includes(userRole)) {
            // Logged in but unauthorized role

            // Redirect based on their actual role to avoid "access denied" loops
            if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
            if (userRole === 'vendor') return <Navigate to="/vendor/dashboard" replace />;
            if (userRole === 'driver') return <Navigate to="/driver/dashboard" replace />;
            if (userRole === 'customer') return <Navigate to="/dashboard" replace />;

            return <Navigate to="/" replace />;
        }
    }

    // 4. Authorized -> Render Child Routes
    return <Outlet />;
};

export default ProtectedRoute;
