<?php
require_once __DIR__ . '/../cors.php';
handle_cors();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'vendor') {
    send_json(['success' => false, 'message' => 'Unauthorized']);
}

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

if ($action === 'add_room_type') {
    $hotel_id = (int)($input['hotel_id'] ?? 0);
    $name = sanitize($input['name'] ?? '');
    $price = (float)($input['price'] ?? 0);
    $capacity = (int)($input['capacity'] ?? 2);
    
    $sql = "INSERT INTO room_types (hotel_id, name, base_price_per_hour, capacity, created_at) VALUES (?, ?, ?, ?, NOW())";
    if (db_query($sql, 'isdi', [$hotel_id, $name, $price, $capacity])) {
        send_json(['success' => true, 'message' => 'Room category added']);
    } else {
        send_json(['success' => false, 'message' => 'Failed to add category']);
    }
} elseif ($action === 'add_room') {
    $type_id = (int)($input['room_type_id'] ?? 0);
    $room_no = sanitize($input['room_number'] ?? '');
    
    $sql = "INSERT INTO rooms (room_type_id, room_number, status) VALUES (?, ?, 'available')";
    if (db_query($sql, 'is', [$type_id, $room_no])) {
        send_json(['success' => true, 'message' => 'Physical room added']);
    } else {
        send_json(['success' => false, 'message' => 'Failed to add room']);
    }
} else {
    // Fetch room types for vendor's properties
    $res = db_query("SELECT rt.*, p.name as hotel_name 
                     FROM room_types rt 
                     JOIN hotels p ON rt.hotel_id = p.id 
                     WHERE p.vendor_id = ?", 'i', [$_SESSION['user_id']]);
    $types = [];
    while($row = mysqli_fetch_assoc($res)) $types[] = $row;
    send_json(['success' => true, 'data' => $types]);
}
?>
