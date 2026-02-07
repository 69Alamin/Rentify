<?php
/**
 * Rider Profile Management API
 * Features: Create/Update profile, Vehicle info, Document upload, Admin approval
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

// ========================
// 1. GET RIDER PROFILE
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'get_profile') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $rider_id = $_GET['rider_id'] ?? $_SESSION['user_id'];
    
    // If requesting other rider's profile, check permissions
    if ($rider_id != $_SESSION['user_id'] && $_SESSION['user_type'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $sql = "SELECT rp.*, u.full_name, u.email, u.phone 
            FROM rider_profiles rp
            JOIN users u ON rp.user_id = u.id
            WHERE rp.user_id = ?";
    
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'i', $rider_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($row = mysqli_fetch_assoc($result)) {
        echo json_encode(['success' => true, 'data' => $row]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Profile not found']);
    }
    exit();
}

// ========================
// 2. CREATE/UPDATE RIDER PROFILE
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'save_profile') {
    if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'driver') {
        echo json_encode(['success' => false, 'message' => 'Only drivers can update profiles']);
        exit();
    }

    $rider_id = $_SESSION['user_id'];
    $vehicle_type = sanitize($_POST['vehicle_type'] ?? '');
    $vehicle_number = sanitize($_POST['vehicle_number'] ?? '');
    $license_number = sanitize($_POST['license_number'] ?? '');
    $license_expiry = sanitize($_POST['license_expiry'] ?? '');
    $bank_account = sanitize($_POST['bank_account'] ?? '');
    $bank_ifsc = sanitize($_POST['bank_ifsc'] ?? '');
    $emergency_contact_name = sanitize($_POST['emergency_contact_name'] ?? '');
    $emergency_contact_phone = sanitize($_POST['emergency_contact_phone'] ?? '');

    // Validate required fields
    if (empty($vehicle_type) || empty($vehicle_number) || empty($license_number)) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit();
    }

    // Validate vehicle type
    if (!in_array($vehicle_type, ['bike', 'car', 'auto'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid vehicle type']);
        exit();
    }

    // Check if profile exists
    $check_sql = "SELECT id FROM rider_profiles WHERE user_id = ?";
    $check_stmt = mysqli_prepare($conn, $check_sql);
    mysqli_stmt_bind_param($check_stmt, 'i', $rider_id);
    mysqli_stmt_execute($check_stmt);
    $profile_exists = mysqli_num_rows(mysqli_stmt_get_result($check_stmt)) > 0;

    if ($profile_exists) {
        // UPDATE
        $sql = "UPDATE rider_profiles SET 
                vehicle_type = ?, vehicle_number = ?, license_number = ?, 
                license_expiry = ?, bank_account = ?, bank_ifsc = ?,
                emergency_contact_name = ?, emergency_contact_phone = ?
                WHERE user_id = ?";
        
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, 'ssssssssi', $vehicle_type, $vehicle_number, 
                              $license_number, $license_expiry, $bank_account, $bank_ifsc,
                              $emergency_contact_name, $emergency_contact_phone, $rider_id);
    } else {
        // INSERT
        $sql = "INSERT INTO rider_profiles (user_id, vehicle_type, vehicle_number, 
                license_number, license_expiry, bank_account, bank_ifsc,
                emergency_contact_name, emergency_contact_phone)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, 'issssssss', $rider_id, $vehicle_type, $vehicle_number, 
                              $license_number, $license_expiry, $bank_account, $bank_ifsc,
                              $emergency_contact_name, $emergency_contact_phone);
    }

    if (mysqli_stmt_execute($stmt)) {
        // Also update users table rider_type
        $update_user = "UPDATE users SET rider_type = ? WHERE id = ?";
        $user_stmt = mysqli_prepare($conn, $update_user);
        mysqli_stmt_bind_param($user_stmt, 'si', $vehicle_type, $rider_id);
        mysqli_stmt_execute($user_stmt);
        mysqli_stmt_close($user_stmt);

        // Log activity
        error_log("Rider $rider_id profile updated: $vehicle_type");

        echo json_encode(['success' => true, 'message' => 'Profile saved successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to save profile: ' . mysqli_error($conn)]);
    }
    exit();
}

// ========================
// 3. UPLOAD PROFILE PHOTO
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'upload_photo') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    if (!isset($_FILES['photo'])) {
        echo json_encode(['success' => false, 'message' => 'No file uploaded']);
        exit();
    }

    $file = $_FILES['photo'];
    $allowed_types = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (!in_array($file['type'], $allowed_types)) {
        echo json_encode(['success' => false, 'message' => 'Invalid file type']);
        exit();
    }

    if ($file['size'] > 2 * 1024 * 1024) { // 2MB
        echo json_encode(['success' => false, 'message' => 'File too large']);
        exit();
    }

    $upload_dir = __DIR__ . '/../../assets/rider_photos/';
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0755, true);

    $filename = 'rider_' . $_SESSION['user_id'] . '_' . time() . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
    $filepath = $upload_dir . $filename;

    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        $photo_url = '/Quickrent/assets/rider_photos/' . $filename;
        
        $sql = "UPDATE rider_profiles SET profile_photo_url = ? WHERE user_id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, 'si', $photo_url, $_SESSION['user_id']);
        
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode(['success' => true, 'message' => 'Photo uploaded', 'url' => $photo_url]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to upload file']);
    }
    exit();
}

// ========================
// 4. GET ALL RIDERS (Admin)
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'get_all_riders') {
    if ($_SESSION['user_type'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        exit();
    }

    $filter = $_GET['filter'] ?? 'all'; // all, approved, pending, active, inactive
    $sort = $_GET['sort'] ?? 'created_at'; // created_at, rating, earnings
    $page = (int)($_GET['page'] ?? 1);
    $limit = 20;
    $offset = ($page - 1) * $limit;

    $where = "1=1";
    if ($filter === 'approved') $where = "is_approved = TRUE";
    elseif ($filter === 'pending') $where = "is_approved = FALSE";
    elseif ($filter === 'active') $where = "is_active = TRUE";
    elseif ($filter === 'inactive') $where = "is_active = FALSE";

    $order = "rp.created_at DESC";
    if ($sort === 'rating') $order = "rp.rating DESC";
    elseif ($sort === 'earnings') $order = "rp.total_earnings DESC";

    $sql = "SELECT rp.*, u.full_name, u.email, u.phone, u.created_at as user_created_at
            FROM rider_profiles rp
            JOIN users u ON rp.user_id = u.id
            WHERE $where
            ORDER BY $order
            LIMIT ? OFFSET ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'ii', $limit, $offset);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $riders = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $riders[] = $row;
    }

    // Get total count
    $count_sql = "SELECT COUNT(*) as total FROM rider_profiles rp 
                  JOIN users u ON rp.user_id = u.id WHERE $where";
    $count_result = mysqli_query($conn, $count_sql);
    $count = mysqli_fetch_assoc($count_result)['total'];

    echo json_encode([
        'success' => true,
        'data' => $riders,
        'pagination' => [
            'total' => $count,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($count / $limit)
        ]
    ]);
    exit();
}

// ========================
// 5. ADMIN: APPROVE/REJECT RIDER
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'approve_rider') {
    if ($_SESSION['user_type'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $rider_id = (int)($input['rider_id'] ?? 0);
    $status = $input['status'] ?? 'approved'; // approved or rejected

    if ($rider_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid rider ID']);
        exit();
    }

    if (!in_array($status, ['approved', 'rejected'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid status']);
        exit();
    }

    $is_approved = ($status === 'approved') ? 1 : 0;
    $approval_date = ($is_approved) ? date('Y-m-d H:i:s') : NULL;

    $sql = "UPDATE rider_profiles SET is_approved = ?, approval_date = ? WHERE user_id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'isi', $is_approved, $approval_date, $rider_id);

    if (mysqli_stmt_execute($stmt)) {
        // Send notification
        $msg = ($is_approved) ? 'Your rider profile has been approved!' : 'Your rider profile was rejected.';
        $sql = "INSERT INTO rider_notifications (rider_id, title, message, notification_type) 
                VALUES (?, ?, ?, 'system')";
        $notif_stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($notif_stmt, 'iss', $rider_id, $status, $msg);
        mysqli_stmt_execute($notif_stmt);

        echo json_encode(['success' => true, 'message' => 'Rider ' . $status]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Update failed']);
    }
    exit();
}

// ========================
// 6. ADMIN: SUSPEND/ACTIVATE RIDER
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'toggle_rider_status') {
    if ($_SESSION['user_type'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $rider_id = (int)($input['rider_id'] ?? 0);
    $is_active = (int)($input['is_active'] ?? 0);

    if ($rider_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid rider ID']);
        exit();
    }

    $sql = "UPDATE rider_profiles SET is_active = ? WHERE user_id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'ii', $is_active, $rider_id);

    if (mysqli_stmt_execute($stmt)) {
        $msg = ($is_active) ? 'Your account has been activated.' : 'Your account has been suspended.';
        $type = ($is_active) ? 'system' : 'warning';
        
        $sql = "INSERT INTO rider_notifications (rider_id, title, message, notification_type) 
                VALUES (?, ?, ?, ?)";
        $notif_stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($notif_stmt, 'isss', $rider_id, $type, $msg, $type);
        mysqli_stmt_execute($notif_stmt);

        echo json_encode(['success' => true, 'message' => 'Status updated']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Update failed']);
    }
    exit();
}

// ========================
// 7. GET RIDER STATS
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'get_stats') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $rider_id = $_GET['rider_id'] ?? $_SESSION['user_id'];
    
    $sql = "SELECT 
            rp.total_rides,
            rp.total_earnings,
            rp.rating,
            (SELECT COUNT(*) FROM ride_history WHERE rider_id = ? AND status = 'completed') as completed_rides,
            (SELECT COUNT(*) FROM ride_history WHERE rider_id = ? AND status = 'cancelled') as cancelled_rides,
            (SELECT AVG(rating) FROM rider_ratings WHERE rider_id = ?) as avg_rating,
            (SELECT COUNT(*) FROM rider_ratings WHERE rider_id = ?) as total_ratings
            FROM rider_profiles rp
            WHERE rp.user_id = ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'iiiii', $rider_id, $rider_id, $rider_id, $rider_id, $rider_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    if ($row = mysqli_fetch_assoc($result)) {
        echo json_encode(['success' => true, 'data' => $row]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Stats not found']);
    }
    exit();
}

// ========================
// DEFAULT RESPONSE
// ========================
echo json_encode(['success' => false, 'message' => 'Invalid action']);
?>
