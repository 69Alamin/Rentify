<?php
header('Content-Type: application/json');
// Allow all common dev ports
$allowed_origins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:5176',
    'http://127.0.0.1:5177',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../db_conn.php';

$mine = isset($_GET['mine']) && $_GET['mine'] == 'true';
$search = isset($_GET['search']) ? sanitize($_GET['search']) : '';
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;

$whereClauses = [];
$params = [];
$types = '';

if ($mine) {
    if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'vendor') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }
    $whereClauses[] = "p.vendor_id = ?";
    $params[] = $_SESSION['user_id'];
    $types .= 'i';
} else {
    $whereClauses[] = "p.is_verified = 1";
}

if ($search) {
    $whereClauses[] = "(p.name LIKE ? OR p.address LIKE ?)";
    $searchTerm = "%$search%";
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $types .= 'ss';
}

$whereSQL = '';
if (!empty($whereClauses)) {
    $whereSQL = "WHERE " . implode(' AND ', $whereClauses);
}

// Logic to derive property type from name for demo purposes if not in DB
$typeSql = "IFNULL(NULLIF(p.hotel_type, ''), CASE 
    WHEN p.name LIKE '%Airport%' THEN 'Airport Stay'
    WHEN p.name LIKE '%Medical%' OR p.name LIKE '%Clinic%' THEN 'Medical Stay'
    WHEN p.name LIKE '%Transit%' OR p.name LIKE '%Station%' THEN 'Transit Hub'
    WHEN p.name LIKE '%Rest%' OR p.name LIKE '%Quick%' THEN 'Quick Rest'
    WHEN p.name LIKE '%Business%' OR p.name LIKE '%Executive%' THEN 'Business'
    ELSE 'Hotel'
END) as hotel_type";


// Provide a synthetic property_type and derive a price_per_hour from room_types
$sql = "SELECT 
        p.id, 
        p.name, 
        p.address, 
        p.description, 
        p.image_url, 
        p.latitude, 
        p.longitude,
        $typeSql,
        MIN(rt.base_price_per_hour) AS price_per_hour,
        ROUND(AVG(pr.rating), 1) AS rating,
        COUNT(pr.id) as review_count
    FROM hotels p
    LEFT JOIN room_types rt ON p.id = rt.hotel_id
    LEFT JOIN hotel_reviews pr ON p.id = pr.hotel_id
    $whereSQL
    GROUP BY p.id
    ORDER BY p.id DESC
    LIMIT ?";

$params[] = $limit;
$types .= 'i';

$result = db_query($sql, $types, $params);

$hotels = [];
if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        // Build full image URL if needed, or just return path
        // For now, assuming image_url is relative or check existance
        // If image_url is empty, use a placeholder
        // Normalize image URL for frontend (serve from Apache, not Vite)
        $baseUrl = 'http://localhost/Rentify';
        $defaultImage = $baseUrl . '/assets/default_hotel.png';

        $rawImage = trim((string)$row['image_url']);
        $normalized = $rawImage;

        // Prefix relative paths with backend base
        if (!preg_match('/^https?:\/\//', $normalized)) {
            $normalized = $baseUrl . '/' . ltrim($normalized, '/');
        }

        // Fix localPath: do not double the base project folder if the URL contains it
        $urlPath = parse_url($normalized, PHP_URL_PATH) ?? '';
        // If project is in /Rentify/, ltrim it from the path to get relative file path
        $relativeToRoot = ltrim(str_replace('/Rentify/', '/', $urlPath), '/');
        $localPath = __DIR__ . '/../' . $relativeToRoot;

        // Map seeded images based on property id if the referenced file is missing
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

        if (empty($rawImage) || !file_exists($localPath)) {
            if (isset($seededMap[$row['id']])) {
                $mapped = $seededMap[$row['id']];
                $row['image_url'] = $baseUrl . '/' . $mapped;
            } else {
                $row['image_url'] = $defaultImage;
            }
        } else {
            $row['image_url'] = $normalized;
        }
        $hotels[] = $row;
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Database query failed']);
    exit();
}

echo json_encode(['success' => true, 'data' => $hotels]);
