<?php
require_once __DIR__ . '/../cors.php';
handle_cors();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'vendor') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$id = (int)($data['id'] ?? 0);

if ($id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid property ID']);
    exit();
}

// Verify ownership
$check_sql = "SELECT id FROM hotels WHERE id = ? AND vendor_id = ?";
$result = db_query($check_sql, 'ii', [$id, $_SESSION['user_id']]);

if (!$result || mysqli_num_rows($result) === 0) {
    echo json_encode(['success' => false, 'message' => 'Property not found or unauthorized']);
    exit();
}

// Optional: Check for active/future bookings
$booking_sql = "SELECT b.id FROM bookings b 
                JOIN rooms r ON b.room_id = r.id 
                JOIN room_types rt ON r.room_type_id = rt.id 
                WHERE rt.hotel_id = ? AND b.booking_status IN ('pending', 'confirmed', 'active')";
$booking_result = db_query($booking_sql, 'i', [$id]);

if (mysqli_num_rows($booking_result) > 0) {
    echo json_encode(['success' => false, 'message' => 'Cannot delete property with active or pending bookings.']);
    exit();
}

// Begin deletion (Manual cascade to avoid FK constraint failures)
// 1) Remove food orders tied to bookings for this hotel
$delete_food_orders = "DELETE fo FROM food_orders fo
    JOIN bookings b ON fo.booking_id = b.id
    JOIN rooms r ON b.room_id = r.id
    JOIN room_types rt ON r.room_type_id = rt.id
    WHERE rt.hotel_id = ?";
db_query($delete_food_orders, 'i', [$id]);

// 2) Remove bookings for this hotel
$delete_bookings = "DELETE b FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    JOIN room_types rt ON r.room_type_id = rt.id
    WHERE rt.hotel_id = ?";
db_query($delete_bookings, 'i', [$id]);

// 3) Remove rooms and room types
db_query("DELETE FROM rooms WHERE room_type_id IN (SELECT id FROM room_types WHERE hotel_id = ?)", 'i', [$id]);
db_query("DELETE FROM room_types WHERE hotel_id = ?", 'i', [$id]);

// 4) Delete the hotel record; if it fails, fallback to soft-delete
$delete_sql = "DELETE FROM hotels WHERE id = ?";
if (db_query($delete_sql, 'i', [$id])) {
    send_json(['success' => true, 'message' => 'Property deleted successfully']);
} else {
    // Fallback: archive if hard delete is blocked by constraints
    $archive_sql = "UPDATE hotels SET is_active = 0 WHERE id = ?";
    if (db_query($archive_sql, 'i', [$id])) {
        send_json(['success' => true, 'message' => 'Property archived successfully']);
    } else {
        send_json(['success' => false, 'message' => 'Failed to delete property']);
    }
}
?>
