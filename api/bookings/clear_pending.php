<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

if (isset($_SESSION['pending_booking'])) {
    unset($_SESSION['pending_booking']);
    echo json_encode(['success' => true, 'message' => 'Pending booking cleared']);
} else {
    echo json_encode(['success' => true, 'message' => 'No pending booking to clear']);
}
?>
