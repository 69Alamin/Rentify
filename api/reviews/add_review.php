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

$user_id = (int)$_SESSION['user_id'];
$input = json_decode(file_get_contents('php://input'), true);

$booking_id = (int)($input['booking_id'] ?? 0);
$rating = (int)($input['rating'] ?? 0);
$comment = sanitize($input['comment'] ?? '');

if (!$booking_id || $rating < 1 || $rating > 5) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit();
}

// 1. Verify booking ownership and status
$sql = "SELECT b.id, b.booking_status, rt.hotel_id 
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        JOIN room_types rt ON r.room_type_id = rt.id
        WHERE b.id = ? AND b.user_id = ?";

$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 'ii', $booking_id, $user_id);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);
$booking = mysqli_fetch_assoc($res);

if (!$booking) {
    echo json_encode(['success' => false, 'message' => 'Booking not found']);
    exit();
}

if ($booking['booking_status'] !== 'completed') {
    echo json_encode(['success' => false, 'message' => 'Can only review completed bookings']);
    exit();
}

$hotel_id = $booking['hotel_id'];

// 2. Check if already reviewed
$check_sql = "SELECT id FROM hotel_reviews WHERE booking_id = ?";
$check_res = db_query($check_sql, 'i', [$booking_id]);
if (mysqli_num_rows($check_res) > 0) {
    echo json_encode(['success' => false, 'message' => 'Already reviewed']);
    exit();
}

// 3. Insert review
$insert_sql = "INSERT INTO hotel_reviews (hotel_id, user_id, booking_id, rating, comment) VALUES (?, ?, ?, ?, ?)";
if (db_query($insert_sql, 'iiiis', [$hotel_id, $user_id, $booking_id, $rating, $comment])) {
    echo json_encode(['success' => true, 'message' => 'Review submitted!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to submit review']);
}
?>
