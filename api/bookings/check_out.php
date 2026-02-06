<?php
header('Content-Type: application/json');
// Allow common dev ports
$allowed_origins = ['http://localhost:5173','http://localhost:5174','http://localhost:5175','http://localhost:5176','http://localhost:5177','http://127.0.0.1:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header('Access-Control-Allow-Origin: ' . (in_array($origin, $allowed_origins, true) ? $origin : 'http://localhost:5173'));
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$booking_id = (int)($input['booking_id'] ?? 0);
$user_id = $_SESSION['user_id'];

if (!$booking_id) {
    echo json_encode(['success' => false, 'message' => 'Booking ID required']);
    exit();
}

// Verify booking belongs to user and is active
$sql = "SELECT id, booking_status FROM bookings 
        WHERE id = ? AND user_id = ? AND booking_status = 'active'";
$result = db_query($sql, 'ii', [$booking_id, $user_id]);

if (!$result || mysqli_num_rows($result) === 0) {
    echo json_encode(['success' => false, 'message' => 'Booking not found or not active']);
    exit();
}

// Update booking status to completed
$updateSql = "UPDATE bookings SET booking_status = 'completed' WHERE id = ?";
if (db_query($updateSql, 'i', [$booking_id])) {
    // Release the room directly
    $getRoomSql = "SELECT room_id FROM bookings WHERE id = ?";
    $roomRes = db_query($getRoomSql, 'i', [$booking_id]);
    $roomData = mysqli_fetch_assoc($roomRes);
    if ($roomData && $roomData['room_id']) {
        db_query("UPDATE rooms SET status = 'available' WHERE id = ?", 'i', [$roomData['room_id']]);
    }

    // NEW: Cancel all uncompleted food orders for this booking
    // Statuses that should be cancelled: 'requested', 'accepted', 'preparing', 'ready'
    // Statuses that stay as is: 'delivered', 'cancelled'
    $cancelFoodSql = "UPDATE food_orders 
                      SET status = 'cancelled' 
                      WHERE booking_id = ? 
                      AND status NOT IN ('delivered', 'cancelled')";
    db_query($cancelFoodSql, 'i', [$booking_id]);

    echo json_encode([
        'success' => true,
        'message' => 'Checked out successfully! Any uncompleted food orders have been cancelled.',
        'booking_id' => $booking_id
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Check-out failed']);
}
?>
