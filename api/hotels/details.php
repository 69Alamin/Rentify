<?php
require_once __DIR__ . '/../cors.php';
handle_cors();

require_once __DIR__ . '/../../db_conn.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$baseUrl = "{$protocol}://{$host}/Quickrent";
$defaultImage = $baseUrl . '/assets/default_hotel.png';

function normalize_image($raw, $id, $baseUrl, $defaultImage) {
    $normalized = $raw ?? '';

    if (preg_match('/^https?:\/\//', $raw)) {
        return $raw;
    }

    if (!preg_match('/^https?:\/\//', $normalized) && $normalized !== '') {
        $normalized = $baseUrl . '/' . ltrim($normalized, '/');
    }

    $localPath = __DIR__ . '/../' . ltrim(parse_url($normalized, PHP_URL_PATH) ?? '', '/');

    if (empty($raw) || !file_exists($localPath)) {
        return $defaultImage;
    }

    return $normalized;
}

if ($id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid ID']);
    exit();
}

// Fetch hotel
$sql = "SELECT * FROM hotels WHERE id = ? AND is_verified = 1 AND is_active = 1 LIMIT 1";
$result = db_query($sql, 'i', [$id]);

if (!$result || mysqli_num_rows($result) === 0) {
    echo json_encode(['success' => false, 'message' => 'Hotel not found']);
    exit();
}

$property = mysqli_fetch_assoc($result);

// Normalize property image
$property['image_url'] = normalize_image($property['image_url'] ?? '', $id, $baseUrl, $defaultImage);

// Fetch room types
$sql_rooms = "SELECT rt.*, 
       (SELECT COUNT(*) FROM rooms r 
        WHERE r.room_type_id = rt.id AND r.status = 'available') as available_count
FROM room_types rt
WHERE rt.hotel_id = ?
ORDER BY rt.base_price_per_hour ASC";

$rooms_result = db_query($sql_rooms, 'i', [$id]);
$rooms = [];

if ($rooms_result) {
    while ($r = mysqli_fetch_assoc($rooms_result)) {
        // Normalize room images; fall back to property-seeded image map, then default
        $r['image_url'] = normalize_image($r['image_url'] ?? '', $id, $baseUrl, $defaultImage);
        $rooms[] = $r;
    }
}

if (isset($property['is_active'])) $property['is_active'] = (int)$property['is_active'];

send_json([
    'success' => true, 
    'data' => [
        'hotel' => $property,
        'rooms' => $rooms
    ]
]);
?>
