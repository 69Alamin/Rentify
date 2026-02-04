<?php
require_once __DIR__ . '/../cors.php';
handle_cors();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id'])) {
    send_json(['success' => false, 'message' => 'Unauthorized'], 401);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // List orders for user or vendor
    $user_id = $_SESSION['user_id'];
    $user_type = $_SESSION['user_type'];
    
    if ($user_type === 'admin') {
        $sql = "SELECT fo.*, u.full_name as customer_name, p.name as hotel_name, b.check_in_time 
                FROM food_orders fo 
                JOIN users u ON fo.user_id = u.id 
                JOIN bookings b ON fo.booking_id = b.id
                JOIN rooms r ON b.room_id = r.id
                JOIN room_types rt ON r.room_type_id = rt.id
                JOIN hotels p ON rt.hotel_id = p.id
                ORDER BY fo.created_at DESC";
        $res = db_query($sql);
    } elseif ($user_type === 'vendor') {
        $sql = "SELECT fo.*, u.full_name as customer_name, p.name as hotel_name, b.check_in_time 
                FROM food_orders fo 
                JOIN users u ON fo.user_id = u.id 
                JOIN bookings b ON fo.booking_id = b.id
                JOIN rooms r ON b.room_id = r.id
                JOIN room_types rt ON r.room_type_id = rt.id
                JOIN hotels p ON rt.hotel_id = p.id
                WHERE p.vendor_id = ?
                ORDER BY fo.created_at DESC";
        $res = db_query($sql, 'i', [$user_id]);
    } else {
        $sql = "SELECT fo.*, p.name as hotel_name 
                FROM food_orders fo 
                JOIN bookings b ON fo.booking_id = b.id
                JOIN rooms r ON b.room_id = r.id
                JOIN room_types rt ON r.room_type_id = rt.id
                JOIN hotels p ON rt.hotel_id = p.id
                WHERE fo.user_id = ?
                ORDER BY fo.created_at DESC";
        $res = db_query($sql, 'i', [$user_id]);
    }

    $orders = [];
    while($row = mysqli_fetch_assoc($res)) $orders[] = $row;
    send_json(['success' => true, 'data' => $orders]);
}

// Handle Order Placement
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $booking_id = (int)($input['booking_id'] ?? 0);
    $items = $input['items'] ?? []; // Array of {id, name, quantity, price}
    $total = (float)($input['total'] ?? 0);
    $delivery_time = $input['delivery_time'] ?? date('Y-m-d H:i:s', strtotime('+30 minutes'));

    if ($booking_id <= 0 || empty($items)) {
        send_json(['success' => false, 'message' => 'Invalid order data']);
    }

    $items_json = json_encode($items);
    $user_id = $_SESSION['user_id'];

    $sql = "INSERT INTO food_orders (booking_id, user_id, items_json, total_amount, status, delivery_time, created_at) 
            VALUES (?, ?, ?, ?, 'pending', ?, NOW())";
    
    if (db_query($sql, 'iisds', [$booking_id, $user_id, $items_json, $total, $delivery_time])) {
        $order_id = mysqli_insert_id($conn);
        
        // Notify Vendor
        $vendor_sql = "SELECT p.vendor_id, p.name 
                       FROM bookings b
                       JOIN rooms r ON b.room_id = r.id
                       JOIN room_types rt ON r.room_type_id = rt.id
                       JOIN hotels p ON rt.hotel_id = p.id
                       WHERE b.id = ?";
        $v_res = db_query($vendor_sql, 'i', [$booking_id]);
        $v_info = mysqli_fetch_assoc($v_res);

        if ($v_info && $v_info['vendor_id']) {
            $vid = $v_info['vendor_id'];
            $title = "New Food Order #$order_id";
            $msg = "Order of ৳$total for {$v_info['name']}. Please prepare.";
            db_query("INSERT INTO notifications (user_id, title, message, type, reference_id, created_at, is_read) VALUES (?, ?, ?, 'food_order', ?, NOW(), 0)", 'issi', [$vid, $title, $msg, $order_id]);
        }

        send_json(['success' => true, 'message' => 'Order placed successfully']);
    } else {
        send_json(['success' => false, 'message' => 'Failed to place order']);
    }
}
?>
