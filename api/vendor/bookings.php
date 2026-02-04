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

$sql = "SELECT b.*, u.full_name as user_name, u.email as user_email, p.name as hotel_name, rt.name as room_type_name
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN rooms r ON b.room_id = r.id
        JOIN room_types rt ON r.room_type_id = rt.id
        JOIN hotels p ON rt.hotel_id = p.id
        WHERE p.vendor_id = ?
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
