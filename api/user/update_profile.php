<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$user_id = $_SESSION['user_id'];

$full_name = sanitize($input['full_name'] ?? '');
$phone = sanitize($input['phone'] ?? '');
$vehicle_model = sanitize($input['vehicle_model'] ?? '');
$number_plate = sanitize($input['number_plate'] ?? '');
$max_passengers = (int)($input['max_passengers'] ?? 1);
$luggage_support = !empty($input['luggage_support']) ? 1 : 0;

if (!$full_name) {
    echo json_encode(['success' => false, 'message' => 'Full name is required']);
    exit();
}

$sql = "UPDATE users SET full_name = ?, phone = ?, vehicle_model = ?, number_plate = ?, max_passengers = ?, luggage_support = ? WHERE id = ?";
if (db_query($sql, 'ssssiii', [$full_name, $phone, $vehicle_model, $number_plate, $max_passengers, $luggage_support, $user_id])) {
    echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
}
?>
