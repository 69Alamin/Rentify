<?php
header('Content-Type: application/json');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

require_once __DIR__ . '/../../db_conn.php';
require_login();

$user_id = $_SESSION['user_id'];

// Fetch all verification documents for the user
$sql = "SELECT id, document_type, file_url, expiry_date, is_verified, 
               verification_notes, verified_at, created_at 
        FROM rider_documents 
        WHERE rider_id = ? 
        ORDER BY created_at DESC";

$result = db_query($sql, 'i', [$user_id]);

$documents = [];
while ($row = mysqli_fetch_assoc($result)) {
    $documents[] = [
        'id' => $row['id'],
        'document_type' => $row['document_type'],
        'file_url' => $row['file_url'],
        'expiry_date' => $row['expiry_date'],
        'is_verified' => (int)$row['is_verified'],
        'verification_notes' => $row['verification_notes'],
        'verified_at' => $row['verified_at'],
        'created_at' => $row['created_at'],
        'status' => (int)$row['is_verified'] === 1 ? 'verified' : 
                    ($row['verification_notes'] ? 'rejected' : 'pending')
    ];
}

send_json([
    'success' => true,
    'data' => $documents
]);
?>
