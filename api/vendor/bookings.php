<?php
require_once __DIR__ . '/../cors.php';
handle_cors();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'vendor') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$vendor_id = $_SESSION['user_id'];

$sql = "SELECT b.*, b.user_name, b.user_email, b.hotel_name, b.room_type_name
    FROM bookings_detailed b
    WHERE b.vendor_id = ?
    ORDER BY b.is_emergency DESC, b.created_at DESC";

$result = db_query($sql, 'i', [$vendor_id]);
$bookings = [];

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $bookings[] = $row;
    }
}

send_json(['success' => true, 'data' => $bookings]);
?>
