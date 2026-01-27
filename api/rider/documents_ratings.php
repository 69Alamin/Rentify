<?php
/**
 * Rider Documents & Rating System API
 * Features: Upload documents, Ratings, Reviews, Admin verification
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
// 1. UPLOAD DOCUMENT
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'upload_document') {
    if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'driver') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    if (!isset($_FILES['document'])) {
        echo json_encode(['success' => false, 'message' => 'No file uploaded']);
        exit();
    }

    $document_type = sanitize($_POST['document_type'] ?? '');
    $expiry_date = sanitize($_POST['expiry_date'] ?? '');
    $file = $_FILES['document'];
    $rider_id = $_SESSION['user_id'];

    $allowed_types = ['license', 'nid', 'vehicle_papers', 'insurance', 'pollution'];
    if (!in_array($document_type, $allowed_types)) {
        echo json_encode(['success' => false, 'message' => 'Invalid document type']);
        exit();
    }

    $allowed_mimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!in_array($file['type'], $allowed_mimes)) {
        echo json_encode(['success' => false, 'message' => 'Invalid file type. Only PDF and images allowed']);
        exit();
    }

    if ($file['size'] > 5 * 1024 * 1024) { // 5MB
        echo json_encode(['success' => false, 'message' => 'File too large (max 5MB)']);
        exit();
    }

    $upload_dir = __DIR__ . '/../../assets/rider_documents/';
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0755, true);

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'doc_' . $rider_id . '_' . $document_type . '_' . time() . '.' . $ext;
    $filepath = $upload_dir . $filename;

    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        $file_url = '/Rentify/assets/rider_documents/' . $filename;

        // Save to database
        $sql = "INSERT INTO rider_documents (rider_id, document_type, file_url, expiry_date, is_verified)
                VALUES (?, ?, ?, ?, 0)
                ON DUPLICATE KEY UPDATE 
                file_url = ?, expiry_date = ?, is_verified = 0";

        $stmt = mysqli_prepare($conn, $sql);
        $expiry_date_null = empty($expiry_date) ? NULL : $expiry_date;
        mysqli_stmt_bind_param($stmt, 'issss', $rider_id, $document_type, $file_url, 
                              $expiry_date_null, $file_url, $expiry_date_null);

        if (mysqli_stmt_execute($stmt)) {
            // Notify admin
            $notif_sql = "INSERT INTO notifications (user_id, title, message, notification_type)
                         SELECT id, 'New Document Upload', ?, 'document_upload'
                         FROM users WHERE user_type = 'admin'";
            $msg = "Rider uploaded $document_type for verification";
            $notif_stmt = mysqli_prepare($conn, $notif_sql);
            mysqli_stmt_bind_param($notif_stmt, 's', $msg);
            mysqli_stmt_execute($notif_stmt);

            echo json_encode([
                'success' => true,
                'message' => 'Document uploaded successfully',
                'file_url' => $file_url
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to save document']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to upload file']);
    }
    exit();
}

// ========================
// 2. GET RIDER DOCUMENTS
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'get_documents') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $rider_id = $_GET['rider_id'] ?? $_SESSION['user_id'];

    if ($rider_id != $_SESSION['user_id'] && $_SESSION['user_type'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $sql = "SELECT * FROM rider_documents WHERE rider_id = ? ORDER BY created_at DESC";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'i', $rider_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $documents = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $documents[] = $row;
    }

    echo json_encode(['success' => true, 'data' => $documents]);
    exit();
}

// ========================
// 3. VERIFY DOCUMENT (Admin)
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'verify_document') {
    if ($_SESSION['user_type'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $document_id = (int)($input['document_id'] ?? 0);
    $is_verified = (int)($input['is_verified'] ?? 0);
    $notes = sanitize($input['notes'] ?? '');
    $admin_id = $_SESSION['user_id'];

    if ($document_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid document ID']);
        exit();
    }

    // Get document info
    $get_sql = "SELECT rider_id FROM rider_documents WHERE id = ?";
    $get_stmt = mysqli_prepare($conn, $get_sql);
    mysqli_stmt_bind_param($get_stmt, 'i', $document_id);
    mysqli_stmt_execute($get_stmt);
    $doc = mysqli_fetch_assoc(mysqli_stmt_get_result($get_stmt));

    if (!$doc) {
        echo json_encode(['success' => false, 'message' => 'Document not found']);
        exit();
    }

    $verified_at = ($is_verified) ? date('Y-m-d H:i:s') : NULL;

    $sql = "UPDATE rider_documents SET 
            is_verified = ?,
            verified_by = ?,
            verified_at = ?,
            verification_notes = ?
            WHERE id = ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'iissi', $is_verified, $admin_id, $verified_at, $notes, $document_id);

    if (mysqli_stmt_execute($stmt)) {
        // Notify rider
        $status_text = ($is_verified) ? 'approved' : 'rejected';
        $notif_sql = "INSERT INTO rider_notifications (rider_id, title, message, notification_type)
                     VALUES (?, ?, ?, 'system')";
        $title = 'Document ' . ucfirst($status_text);
        $message = "Your document has been $status_text. " . ($notes ? "Note: $notes" : "");
        $notif_stmt = mysqli_prepare($conn, $notif_sql);
        mysqli_stmt_bind_param($notif_stmt, 'iss', $doc['rider_id'], $title, $message);
        mysqli_stmt_execute($notif_stmt);

        echo json_encode(['success' => true, 'message' => "Document $status_text"]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update']);
    }
    exit();
}

// ========================
// 4. SUBMIT RATING (After ride completion)
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'submit_rating') {
    if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'customer') {
        echo json_encode(['success' => false, 'message' => 'Only customers can rate riders']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $ride_id = (int)($input['ride_id'] ?? 0);
    $rating = (int)($input['rating'] ?? 0);
    $review = sanitize($input['review'] ?? '');
    $categories = $input['categories'] ?? []; // behavior, safety, cleanliness, etc
    $user_id = $_SESSION['user_id'];

    if ($ride_id <= 0 || $rating < 1 || $rating > 5) {
        echo json_encode(['success' => false, 'message' => 'Invalid rating']);
        exit();
    }

    // Get ride details
    $ride_sql = "SELECT rider_id, user_id FROM ride_history WHERE id = ? AND status = 'completed'";
    $ride_stmt = mysqli_prepare($conn, $ride_sql);
    mysqli_stmt_bind_param($ride_stmt, 'i', $ride_id);
    mysqli_stmt_execute($ride_stmt);
    $ride = mysqli_fetch_assoc(mysqli_stmt_get_result($ride_stmt));

    if (!$ride) {
        echo json_encode(['success' => false, 'message' => 'Ride not found or not completed']);
        exit();
    }

    if ($ride['user_id'] != $user_id) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $categories_json = json_encode($categories);

    // Save rating
    $sql = "INSERT INTO rider_ratings (rider_id, user_id, ride_id, rating, review, categories)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            rating = ?, review = ?, categories = ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'iiiississ', $ride['rider_id'], $user_id, $ride_id, $rating, 
                          $review, $categories_json, $rating, $review, $categories_json);

    if (mysqli_stmt_execute($stmt)) {
        // Update ride history
        $update_ride_sql = "UPDATE ride_history SET rider_rating = ? WHERE id = ?";
        $update_stmt = mysqli_prepare($conn, $update_ride_sql);
        mysqli_stmt_bind_param($update_stmt, 'ii', $rating, $ride_id);
        mysqli_stmt_execute($update_stmt);

        // Update rider profile rating
        $update_profile_sql = "UPDATE rider_profiles SET rating = 
                              (SELECT AVG(rating) FROM rider_ratings WHERE rider_id = ?)
                              WHERE user_id = ?";
        $update_profile = mysqli_prepare($conn, $update_profile_sql);
        mysqli_stmt_bind_param($update_profile, 'ii', $ride['rider_id'], $ride['rider_id']);
        mysqli_stmt_execute($update_profile);

        // Notify rider
        $notif_sql = "INSERT INTO rider_notifications (rider_id, title, message, notification_type)
                     VALUES (?, ?, ?, 'review')";
        $title = 'New Rating: ' . $rating . ' Stars';
        $message = $review ?: "No comment provided";
        $notif_stmt = mysqli_prepare($conn, $notif_sql);
        mysqli_stmt_bind_param($notif_stmt, 'iss', $ride['rider_id'], $title, $message);
        mysqli_stmt_execute($notif_stmt);

        echo json_encode(['success' => true, 'message' => 'Rating submitted']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to submit rating']);
    }
    exit();
}

// ========================
// 5. GET RIDER RATINGS
// ========================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'get_ratings') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $rider_id = $_GET['rider_id'] ?? $_SESSION['user_id'];
    $page = (int)($_GET['page'] ?? 1);
    $limit = 10;
    $offset = ($page - 1) * $limit;

    if ($rider_id != $_SESSION['user_id'] && $_SESSION['user_type'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $sql = "SELECT rr.*, u.full_name FROM rider_ratings rr
            JOIN users u ON rr.user_id = u.id
            WHERE rr.rider_id = ?
            ORDER BY rr.created_at DESC
            LIMIT ? OFFSET ?";

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'iii', $rider_id, $limit, $offset);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $ratings = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $row['categories'] = json_decode($row['categories'], true);
        $ratings[] = $row;
    }

    // Get summary
    $summary_sql = "SELECT 
                   AVG(rating) as avg_rating,
                   COUNT(*) as total_ratings,
                   SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
                   SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
                   SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
                   SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
                   SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
                   FROM rider_ratings WHERE rider_id = ?";

    $summary_stmt = mysqli_prepare($conn, $summary_sql);
    mysqli_stmt_bind_param($summary_stmt, 'i', $rider_id);
    mysqli_stmt_execute($summary_stmt);
    $summary = mysqli_fetch_assoc(mysqli_stmt_get_result($summary_stmt));

    echo json_encode([
        'success' => true,
        'ratings' => $ratings,
        'summary' => $summary
    ]);
    exit();
}

// ========================
// DEFAULT RESPONSE
// ========================
echo json_encode(['success' => false, 'message' => 'Invalid action']);
?>
