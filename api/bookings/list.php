<?php
header('Content-Type: application/json');

// CORS: allow common dev ports
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:4173'
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: http://localhost:5173');
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$user_id = (int)$_SESSION['user_id'];
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$baseUrl = "{$protocol}://{$host}/Rentify";
$defaultImage = $baseUrl . '/assets/default_hotel.png';

function normalize_booking_image($raw, $hotel_id, $baseUrl, $defaultImage) {
    $normalized = $raw ?? '';

    if (preg_match('/^https?:\/\//', $raw)) {
        return $raw;
    }

    if (!preg_match('/^https?:\/\//', $normalized) && $normalized !== '') {
        $normalized = $baseUrl . '/' . ltrim($normalized, '/');
    }

    $localPath = __DIR__ . '/../../' . ltrim(parse_url($normalized, PHP_URL_PATH) ?? '', '/');

    if (empty($raw) || !file_exists($localPath)) {
        return $defaultImage;
    }

    return $normalized;
}

$sql = "SELECT b.id, b.check_in_time, b.check_out_time, b.total_hours, b.total_price, b.booking_status, b.created_at, b.room_id,
               r.room_number, 
               rt.name AS room_type_name, 
               p.id AS hotel_id, p.vendor_id,
               p.name AS hotel_name, p.image_url, p.latitude, p.longitude,
               (SELECT COUNT(*) FROM hotel_reviews WHERE booking_id = b.id) > 0 as reviewed
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.id
        LEFT JOIN room_types rt ON (r.room_type_id = rt.id OR (b.room_id IS NULL AND rt.id = (SELECT room_type_id FROM rooms WHERE id = b.room_id LIMIT 1)))
        LEFT JOIN hotels p ON rt.hotel_id = p.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC";
// Simplified JOIN approach:
// bookings usually have room_id (from create script). if room_id is valid, we get room details.
// if room_id is valid, room has room_type_id.
// room_type_id links to property.
// If bookings are missing, maybe user_id mismatch or data wipe?
// The original query was mostly fine, just formatting it to be safer.

// Note: The original generic query joined room_types via rooms. 
// If room_id is NULL (pending assignment?), we might need another join path via booking -> room_type (if we stored room_type_id in bookings, but we likely didn't based on create.php).
// Wait, create.php inserted `room_id` immediately. So the join ON b.room_id = r.id is correct.

$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 'i', $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$bookings = [];
while ($row = mysqli_fetch_assoc($result)) {
    // Determine active status helper
    $row['is_active'] = ($row['booking_status'] == 'confirmed' || $row['booking_status'] == 'active');
    
    // Normalize image URL with fallback
    $row['image_url'] = normalize_booking_image($row['image_url'] ?? '', $row['hotel_id'] ?? 0, $baseUrl, $defaultImage);
    
    $bookings[] = $row;
}

echo json_encode(['success' => true, 'data' => $bookings]);
?>
