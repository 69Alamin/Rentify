<?php
header('Content-Type: application/json');
$allowed_origins = ['http://localhost:5173','http://localhost:5174','http://localhost:5175','http://localhost:5176','http://localhost:5177','http://127.0.0.1:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
header('Access-Control-Allow-Origin: ' . (in_array($origin, $allowed_origins, true) ? $origin : 'http://localhost:5173'));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$user_id = (int)$_SESSION['user_id'];
$timeline = [];

// 1. Fetch Stays (Bookings)
$sqlBookings = "SELECT b.id, b.check_in_time, b.check_out_time, b.booking_status, p.name as hotel_name, rt.name as room_type
                FROM bookings b
                LEFT JOIN rooms r ON b.room_id = r.id
                LEFT JOIN room_types rt ON r.room_type_id = rt.id
                LEFT JOIN hotels p ON rt.hotel_id = p.id
                WHERE b.user_id = ?
                ORDER BY b.created_at DESC";
$resBookings = db_query($sqlBookings, 'i', [$user_id]);
while ($b = mysqli_fetch_assoc($resBookings)) {
    // Check-in Event
    $timeline[] = [
        'type' => 'hotel',
        'title' => 'Stay at ' . $b['hotel_name'],
        'status' => $b['booking_status'],
        'time' => $b['check_in_time'],
        'details' => $b['room_type'] . " confirmed."
    ];
    
    // Synthetic Checkout Reminder
    if (in_array($b['booking_status'], ['active', 'confirmed', 'completed'])) {
        $timeline[] = [
            'type' => 'reminder',
            'title' => 'Checkout: ' . $b['hotel_name'],
            'status' => 'info',
            'time' => $b['check_out_time'],
            'details' => "Scheduled departure."
        ];
    }
}

// 2. Fetch Rides
$sqlRides = "SELECT id, pickup_latitude, pickup_longitude, destination_name, status, created_at, fare
             FROM journey_requests
             WHERE user_id = ?
             ORDER BY created_at DESC";
$resRides = db_query($sqlRides, 'i', [$user_id]);
while ($r = mysqli_fetch_assoc($resRides)) {
    $timeline[] = [
        'type' => 'ride',
        'title' => 'Ride to ' . ($r['destination_name'] ?: 'Destination'),
        'status' => $r['status'],
        'time' => $r['created_at'],
        'details' => "Fare: ৳" . $r['fare']
    ];
}

// 3. Fetch Food Orders
$sqlFood = "SELECT fo.id, fo.status, fo.created_at, fo.total_amount, p.name as hotel_name
            FROM food_orders fo
            JOIN bookings b ON fo.booking_id = b.id
            JOIN rooms r ON b.room_id = r.id
            JOIN room_types rt ON r.room_type_id = rt.id
            JOIN hotels p ON rt.hotel_id = p.id
            WHERE fo.user_id = ?
            ORDER BY fo.created_at DESC";
$resFood = db_query($sqlFood, 'i', [$user_id]);
while ($f = mysqli_fetch_assoc($resFood)) {
    $timeline[] = [
        'type' => 'food',
        'title' => 'Food Order #' . $f['id'],
        'status' => $f['status'],
        'time' => $f['created_at'],
        'details' => "Delivered at " . $f['hotel_name'] . " (৳" . $f['total_amount'] . ")"
    ];
}

// Sort by time descending
usort($timeline, function($a, $b) {
    return strtotime($b['time']) - strtotime($a['time']);
});

echo json_encode(['success' => true, 'data' => array_slice($timeline, 0, 20)]);
?>
