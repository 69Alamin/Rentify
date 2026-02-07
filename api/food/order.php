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
        $sql = "SELECT fo.*, o.items_json, u.full_name as customer_name, b.hotel_name, b.check_in_time, b.vendor_id
                FROM food_orders_detailed fo
                JOIN food_orders o ON fo.id = o.id
                JOIN users u ON fo.user_id = u.id
                JOIN bookings_detailed b ON fo.booking_id = b.id
                ORDER BY fo.created_at DESC";
        $res = db_query($sql);
    } elseif ($user_type === 'vendor') {
        $sql = "SELECT fo.*, o.items_json, u.full_name as customer_name, b.hotel_name, b.check_in_time, b.vendor_id
                FROM food_orders_detailed fo
                JOIN food_orders o ON fo.id = o.id
                JOIN users u ON fo.user_id = u.id
                JOIN bookings_detailed b ON fo.booking_id = b.id
                WHERE b.vendor_id = ?
                ORDER BY fo.created_at DESC";
        $res = db_query($sql, 'i', [$user_id]);
    } else {
        $sql = "SELECT fo.*, o.items_json, b.hotel_name, b.vendor_id
                FROM food_orders_detailed fo
                JOIN food_orders o ON fo.id = o.id
                JOIN bookings_detailed b ON fo.booking_id = b.id
                WHERE fo.user_id = ?
                ORDER BY fo.created_at DESC";
        $res = db_query($sql, 'i', [$user_id]);
    }

    $orders = [];
    while($row = mysqli_fetch_assoc($res)) $orders[] = $row;

    $orderIds = array_map(static function ($row) { return (int)$row['id']; }, $orders);
    $itemsByOrder = [];

    if (!empty($orderIds)) {
        $placeholders = implode(',', array_fill(0, count($orderIds), '?'));
        $types = str_repeat('i', count($orderIds));
        $sql_items = "SELECT order_id, menu_item_id, item_name, quantity, price_at_order, subtotal
                      FROM food_order_items
                      WHERE order_id IN ($placeholders)
                      ORDER BY id ASC";
        $items_res = db_query($sql_items, $types, $orderIds);
        if ($items_res) {
            while ($item = mysqli_fetch_assoc($items_res)) {
                $oid = (int)$item['order_id'];
                if (!isset($itemsByOrder[$oid])) {
                    $itemsByOrder[$oid] = [];
                }
                $itemsByOrder[$oid][] = $item;
            }
        }
    }

    foreach ($orders as &$order) {
        $oid = (int)$order['id'];
        $items = $itemsByOrder[$oid] ?? [];
        if (!empty($items)) {
            $order['items'] = $items;
            $order['items_json'] = json_encode($items);
        } elseif (!empty($order['items_json'])) {
            $decoded = json_decode($order['items_json'], true);
            $order['items'] = is_array($decoded) ? $decoded : [];
        } else {
            $order['items'] = [];
        }
    }
    unset($order);
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

    $user_id = $_SESSION['user_id'];

    mysqli_begin_transaction($conn);

    $sql = "INSERT INTO food_orders (booking_id, user_id, items_json, total_amount, status, delivery_time, created_at) 
            VALUES (?, ?, NULL, ?, 'pending', ?, NOW())";
    
    if (db_query($sql, 'iids', [$booking_id, $user_id, $total, $delivery_time])) {
        $order_id = mysqli_insert_id($conn);
        $item_total = 0.0;
        $item_sql = "INSERT INTO food_order_items (order_id, menu_item_id, item_name, quantity, price_at_order, subtotal)
                     VALUES (?, ?, ?, ?, ?, ?)";

        foreach ($items as $item) {
            $menu_id = isset($item['id']) ? (int)$item['id'] : null;
            $name = sanitize($item['name'] ?? '');
            $qty = isset($item['quantity']) ? (int)$item['quantity'] : 1;
            $price = isset($item['price']) ? (float)$item['price'] : 0.0;
            $subtotal = $qty * $price;
            $item_total += $subtotal;

            if ($name === '' || $qty <= 0) {
                mysqli_rollback($conn);
                send_json(['success' => false, 'message' => 'Invalid order item']);
            }

            if (!db_query($item_sql, 'iisidd', [$order_id, $menu_id, $name, $qty, $price, $subtotal])) {
                mysqli_rollback($conn);
                send_json(['success' => false, 'message' => 'Failed to save order items']);
            }
        }

        if ($total <= 0 && $item_total > 0) {
            db_query("UPDATE food_orders SET total_amount = ? WHERE id = ?", 'di', [$item_total, $order_id]);
            $total = $item_total;
        }

        mysqli_commit($conn);
        
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
        mysqli_rollback($conn);
        send_json(['success' => false, 'message' => 'Failed to place order']);
    }
}
?>
