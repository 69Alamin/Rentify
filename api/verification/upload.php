<?php
header('Content-Type: application/json');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

require_once __DIR__ . '/../../db_conn.php';
require_login();

$user_id = $_SESSION['user_id'];
$user_type = $_SESSION['user_type'];

// All logged-in users can upload verification documents
if (!in_array($user_type, ['driver', 'rider', 'vendor', 'customer'])) {
    send_json(['success' => false, 'message' => 'Access denied'], 403);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['success' => false, 'message' => 'Invalid request method'], 405);
}

$document_type = sanitize($_POST['document_type'] ?? '');
$expiry_date = sanitize($_POST['expiry_date'] ?? null);

// Validate document type
$allowed_types = ['license', 'nid', 'trade_license'];
if (!in_array($document_type, $allowed_types)) {
    send_json(['success' => false, 'message' => 'Invalid document type'], 400);
}

// Check if file was uploaded
if (!isset($_FILES['document']) || $_FILES['document']['error'] !== UPLOAD_ERR_OK) {
    send_json(['success' => false, 'message' => 'No file uploaded or upload error'], 400);
}

$file = $_FILES['document'];
$allowed_extensions = ['jpg', 'jpeg', 'png', 'pdf'];
$file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($file_ext, $allowed_extensions)) {
    send_json(['success' => false, 'message' => 'Invalid file type. Only JPG, PNG, and PDF allowed'], 400);
}

// Check file size (max 5MB)
if ($file['size'] > 5 * 1024 * 1024) {
    send_json(['success' => false, 'message' => 'File too large. Maximum size is 5MB'], 400);
}

// Create upload directory if it doesn't exist
$upload_dir = __DIR__ . '/../../assets/rider_documents/';
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Generate unique filename
$filename = 'doc_' . $user_id . '_' . time() . '_' . uniqid() . '.' . $file_ext;
$file_path = $upload_dir . $filename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $file_path)) {
    send_json(['success' => false, 'message' => 'Failed to save file'], 500);
}

// Save to database
$file_url = '/Quickrent/assets/rider_documents/' . $filename;
$sql = "INSERT INTO rider_documents (rider_id, document_type, file_url, expiry_date, is_verified) 
        VALUES (?, ?, ?, ?, 0)";

$expiry = $expiry_date ? $expiry_date : null;
$result = db_query($sql, 'isss', [$user_id, $document_type, $file_url, $expiry]);

if ($result) {
    $document_id = mysqli_insert_id($GLOBALS['conn']);
    send_json([
        'success' => true, 
        'message' => 'Document uploaded successfully',
        'data' => [
            'id' => $document_id,
            'document_type' => $document_type,
            'file_url' => $file_url,
            'is_verified' => 0
        ]
    ]);
} else {
    // Delete uploaded file if database insert fails
    unlink($file_path);
    send_json(['success' => false, 'message' => 'Failed to save document to database'], 500);
}
?>
