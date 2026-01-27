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

require_once __DIR__ . '/../../db_conn.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

$baseUrl = 'http://localhost/Rentify';
$defaultImage = $baseUrl . '/assets/default_hotel.png';

// Seeded property images for demo data
$seededMap = [
    1 => 'assets/hotels/shihab_palace.png',
    2 => 'assets/hotels/room_suite_royal.png',
    3 => 'assets/hotels/room_executive.png',
    4 => 'assets/hotels/room_suite_royal.png',
    5 => 'assets/hotels/room_executive.png',
    6 => 'assets/hotels/room_suite_royal.png',
    7 => 'assets/hotels/shihab_palace.png',
    8 => 'assets/hotels/room_executive.png',
    9 => 'assets/hotels/room_suite_royal.png',
    10 => 'assets/hotels/room_executive.png',
    11 => 'assets/hotels/shihab_palace.png',
    12 => 'assets/hotels/room_suite_royal.png',
    13 => 'assets/hotels/room_executive.png',
    14 => 'assets/hotels/room_suite_royal.png',
    15 => 'assets/hotels/room_executive.png',
    16 => 'assets/hotels/shihab_palace.png',
    17 => 'assets/hotels/room_suite_royal.png',
    18 => 'assets/hotels/room_executive.png',
    19 => 'assets/hotels/shihab_palace.png',
    20 => 'assets/hotels/room_executive.png',
];

function normalize_image($raw, $id, $seededMap, $baseUrl, $defaultImage) {
    $normalized = $raw ?? '';

    if (!preg_match('/^https?:\/\//', $normalized) && $normalized !== '') {
        $normalized = $baseUrl . '/' . ltrim($normalized, '/');
    }

    $localPath = __DIR__ . '/../' . ltrim(parse_url($normalized, PHP_URL_PATH) ?? '', '/');

    if (empty($raw) || !file_exists($localPath)) {
        if (isset($seededMap[$id])) {
            return $baseUrl . '/' . ltrim($seededMap[$id], '/');
        }
        return $defaultImage;
    }

    return $normalized;
}

if ($id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid ID']);
    exit();
}

// Fetch hotel
$sql = "SELECT * FROM hotels WHERE id = ? AND is_verified = 1 LIMIT 1";
$result = db_query($sql, 'i', [$id]);

if (!$result || mysqli_num_rows($result) === 0) {
    echo json_encode(['success' => false, 'message' => 'Hotel not found']);
    exit();
}

$property = mysqli_fetch_assoc($result);

// Normalize property image
$property['image_url'] = normalize_image($property['image_url'] ?? '', $id, $seededMap, $baseUrl, $defaultImage);

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
        $r['image_url'] = normalize_image($r['image_url'] ?? '', $id, $seededMap, $baseUrl, $defaultImage);
        $rooms[] = $r;
    }
}

echo json_encode([
    'success' => true, 
    'data' => [
        'hotel' => $property,
        'rooms' => $rooms
    ]
]);
?>
