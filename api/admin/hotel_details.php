<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

require_once __DIR__ . '/../../db_conn.php';
require_once __DIR__ . '/helpers/AuthMiddleware.php';

AuthMiddleware::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $hotel_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if (!$hotel_id) {
        echo json_encode(['success' => false, 'message' => 'Hotel ID required']);
        exit();
    }
    
    // 1. Get hotel basic info
    $sql_hotel = "SELECT p.*, u.full_name as owner_name, u.email as owner_email, u.phone as owner_phone
                  FROM hotels_with_amenities p
                  LEFT JOIN users u ON p.vendor_id = u.id
                  WHERE p.id = ?";
    $res = db_query($sql_hotel, 'i', [$hotel_id]);
    $hotel = mysqli_fetch_assoc($res);
    
    if (!$hotel) {
        echo json_encode(['success' => false, 'message' => 'Hotel not found']);
        exit();
    }
    
    $hotel['is_active'] = (bool)$hotel['is_active'];
    $hotel['is_verified'] = (bool)$hotel['is_verified'];
    if (!empty($hotel['amenities_list'])) {
        $hotel['amenities'] = array_map('trim', explode(',', $hotel['amenities_list']));
    } else {
        $hotel['amenities'] = [];
    }
    unset($hotel['amenities_list']);
    
    // 2. Get room types for this hotel
    $sql_room_types = "SELECT rt.*, 
                              (SELECT COUNT(*) FROM rooms r WHERE r.room_type_id = rt.id) as room_count,
                              (SELECT COUNT(*) FROM rooms r WHERE r.room_type_id = rt.id AND r.status = 'available') as available_count
                       FROM room_types rt
                       WHERE rt.hotel_id = ?
                       ORDER BY rt.name";
    $res_types = db_query($sql_room_types, 'i', [$hotel_id]);
    $room_types = [];
    while ($row = mysqli_fetch_assoc($res_types)) {
        $room_types[] = $row;
    }
    
    // 3. Get all rooms for this hotel
    $sql_rooms = "SELECT r.*, rt.name as room_type_name, rt.base_price_per_hour
                  FROM rooms r
                  JOIN room_types rt ON r.room_type_id = rt.id
                  WHERE rt.hotel_id = ?
                  ORDER BY rt.name, r.room_number";
    $res_rooms = db_query($sql_rooms, 'i', [$hotel_id]);
    $rooms = [];
    while ($row = mysqli_fetch_assoc($res_rooms)) {
        $rooms[] = $row;
    }
    
    // 4. Get recent bookings for this hotel (last 20)
    $sql_bookings = "SELECT b.*, u.full_name as user_name, u.email as user_email,
                            r.room_number, rt.name as room_type_name
                     FROM bookings b
                     JOIN users u ON b.user_id = u.id
                     JOIN rooms r ON b.room_id = r.id
                     JOIN room_types rt ON r.room_type_id = rt.id
                     WHERE rt.hotel_id = ?
                     ORDER BY b.created_at DESC
                     LIMIT 20";
    $res_bookings = db_query($sql_bookings, 'i', [$hotel_id]);
    $bookings = [];
    while ($row = mysqli_fetch_assoc($res_bookings)) {
        $bookings[] = $row;
    }
    
    // 5. Calculate statistics
    $now = date('Y-m-d H:i:s');
    
    // Total bookings
    $sql_total = "SELECT COUNT(*) as total FROM bookings b
                  JOIN rooms r ON b.room_id = r.id
                  JOIN room_types rt ON r.room_type_id = rt.id
                  WHERE rt.hotel_id = ?";
    $total_bookings = mysqli_fetch_assoc(db_query($sql_total, 'i', [$hotel_id]))['total'];
    
    // Active bookings
    $sql_active = "SELECT COUNT(*) as total FROM bookings b
                   JOIN rooms r ON b.room_id = r.id
                   JOIN room_types rt ON r.room_type_id = rt.id
                   WHERE rt.hotel_id = ?
                   AND b.booking_status IN ('confirmed', 'active')
                   AND b.check_out_time > ?";
    $active_bookings = mysqli_fetch_assoc(db_query($sql_active, 'is', [$hotel_id, $now]))['total'];
    
    // Total revenue
    $sql_revenue = "SELECT COALESCE(SUM(b.total_price), 0) as total FROM bookings b
                    JOIN rooms r ON b.room_id = r.id
                    JOIN room_types rt ON r.room_type_id = rt.id
                    WHERE rt.hotel_id = ?
                    AND b.booking_status IN ('completed', 'confirmed', 'active')";
    $total_revenue = mysqli_fetch_assoc(db_query($sql_revenue, 'i', [$hotel_id]))['total'];
    
    // Total rooms
    $total_rooms = count($rooms);
    $available_rooms = count(array_filter($rooms, fn($r) => $r['status'] === 'available'));
    
    $stats = [
        'total_bookings' => (int)$total_bookings,
        'active_bookings' => (int)$active_bookings,
        'total_revenue' => (float)$total_revenue,
        'total_rooms' => $total_rooms,
        'available_rooms' => $available_rooms,
        'booked_rooms' => $total_rooms - $available_rooms
    ];
    
    echo json_encode([
        'success' => true,
        'data' => [
            'hotel' => $hotel,
            'room_types' => $room_types,
            'rooms' => $rooms,
            'bookings' => $bookings,
            'stats' => $stats
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
