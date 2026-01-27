<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

require_once __DIR__ . '/../../db_conn.php';
require_once __DIR__ . '/helpers/AuthMiddleware.php';

AuthMiddleware::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);
$type = $_GET['type'] ?? 'orders'; // 'orders' or 'menu'

if ($method === 'GET') {
    if ($type === 'menu') {
        $sql = "SELECT fi.*, p.name as hotel_name, u.full_name as vendor_name
                FROM food_items fi
                JOIN hotels p ON fi.hotel_id = p.id
                JOIN users u ON p.vendor_id = u.id
                ORDER BY fi.created_at DESC";
        $res = db_query($sql);
        $menu = [];
        while($row = mysqli_fetch_assoc($res)) {
            $row['is_available'] = (bool)$row['is_available'];
            $menu[] = $row;
        }
        echo json_encode(['success' => true, 'data' => $menu]);

    } else { // Orders
        $sql = "SELECT fo.*, u.full_name as customer_name, p.name as hotel_name
                FROM food_orders fo
                LEFT JOIN users u ON fo.user_id = u.id
                LEFT JOIN bookings b ON fo.booking_id = b.id
                LEFT JOIN rooms r ON b.room_id = r.id
                LEFT JOIN room_types rt ON r.room_type_id = rt.id
                LEFT JOIN hotels p ON rt.hotel_id = p.id
                ORDER BY fo.created_at DESC LIMIT 50";
        $res = db_query($sql);
        $orders = [];
        while($row = mysqli_fetch_assoc($res)) $orders[] = $row;
        echo json_encode(['success' => true, 'data' => $orders]);
    }

} elseif ($method === 'POST') {
    // Actions: update_order_status, add_item, update_item, toggle_item
    $action = $input['action'] ?? '';

    if ($action === 'update_order_status') {
        $order_id = (int)($input['order_id'] ?? 0);
        $status = sanitize($input['status'] ?? 'pending');
        db_query("UPDATE food_orders SET status = ? WHERE id = ?", 'si', [$status, $order_id]);
        
        // Notify Customer
        $order_res = db_query("SELECT user_id, total_amount FROM food_orders WHERE id = ?", 'i', [$order_id]);
        $order_info = mysqli_fetch_assoc($order_res);
        
        if ($order_info && $order_info['user_id']) {
            $uid = $order_info['user_id'];
            $title = "Food Order Update";
            $msg = "Your order #$order_id is now " . strtoupper($status);
            db_query("INSERT INTO notifications (user_id, title, message, type, reference_id, created_at, is_read) VALUES (?, ?, ?, 'food_status', ?, NOW(), 0)", 'issi', [$uid, $title, $msg, $order_id]);
        }

        echo json_encode(['success' => true, 'message' => 'Order status updated']);
    } elseif ($action === 'add_item') {
        $hotel_id = (int)$input['hotel_id'];
        $name = sanitize($input['name']);
        $price = (float)$input['price'];
        $desc = sanitize($input['description'] ?? '');
        $img = sanitize($input['image_url'] ?? '');
        
        $sql = "INSERT INTO food_items (hotel_id, name, description, price, image_url, is_available) VALUES (?, ?, ?, ?, ?, 1)";
        if (db_query($sql, 'issds', [$hotel_id, $name, $desc, $price, $img])) {
            echo json_encode(['success' => true, 'message' => 'Item added']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to add item']);
        }
    } elseif ($action === 'toggle_item') {
        $id = (int)$input['id'];
        $avail = (int)$input['is_available'];
        db_query("UPDATE food_items SET is_available = ? WHERE id = ?", 'ii', [$avail, $id]);
        echo json_encode(['success' => true, 'message' => 'Availability updated']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }

} elseif ($method === 'DELETE') {
    if ($type === 'menu') {
        $id = (int)$_GET['id'];
        db_query("DELETE FROM food_items WHERE id = ?", 'i', [$id]);
        echo json_encode(['success' => true, 'message' => 'Item deleted']);
    }
}
?>
