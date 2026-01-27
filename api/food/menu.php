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

$hotel_id = (int)($_GET['hotel_id'] ?? 0);

$baseUrl = 'http://localhost/Rentify';
$defaultImage = $baseUrl . '/assets/food/default_food.svg';
$seededImages = [
    'assets/food/burger.svg',
    'assets/food/pizza.svg',
    'assets/food/dessert.svg',
    'assets/food/coffee.svg',
];

// Authentic local Bangladeshi food photos with high-quality fallbacks
$namedImages = [
    'biryani' => [
        'primary' => 'assets/food/biryani.png',
        'fallback' => 'assets/food/biryani.svg'
    ],
    'butter chicken' => [
        'primary' => 'assets/food/butter_chicken.png',
        'fallback' => 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&q=80'
    ],
    'tandoori chicken' => [
        'primary' => 'assets/food/tandoori_chicken.png',
        'fallback' => 'https://images.unsplash.com/photo-1628294895950-983382782248?w=600&q=80'
    ],
    'dal fry' => [
        'primary' => 'assets/food/dal_fry.png',
        'fallback' => 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80'
    ],
    'naan bread' => [
        'primary' => 'assets/food/naan_bread.png',
        'fallback' => 'https://images.unsplash.com/photo-1601050648497-3f9ecefe6024?w=600&q=80'
    ],
    'tea/coffee' => [
        'primary' => 'assets/food/tea.png',
        'fallback' => 'assets/food/tea_coffee.svg'
    ],
    'breakfast combo' => [
        'primary' => 'assets/food/breakfast.png',
        'fallback' => 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80'
    ],
    'fresh juice' => [
        'primary' => 'assets/food/fresh_juice.png',
        'fallback' => 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80'
    ],
];

function normalize_image($row, $baseUrl, $defaultImage, $seededImages, $namedImages, $index) {
    $raw = $row['image_url'] ?? '';
    $name = strtolower(trim($row['name'] ?? ''));
    $normalized = $raw ?? '';

    // Check for file existence in the correct assets directory
    // Stripping potential base prefixes to get a clean relative path
    $relativeAssetPath = str_replace([$baseUrl, '/Rentify'], '', $normalized);
    $localPath = __DIR__ . '/../../' . ltrim($relativeAssetPath, '/');

    if (empty($raw) || !file_exists($localPath) || is_dir($localPath)) {
        if ($name !== '' && isset($namedImages[$name])) {
            $entry = $namedImages[$name];
            
            // Check if our generated high-quality photo exists locally
            $primaryLocalPath = __DIR__ . '/../../' . ltrim($entry['primary'], '/');
            if (file_exists($primaryLocalPath) && !is_dir($primaryLocalPath)) {
                return [
                    'url' => $baseUrl . '/' . ltrim($entry['primary'], '/'),
                    'fallback' => $entry['fallback']
                ];
            }
            
            // Otherwise use the fallback (Unsplash or SVG)
            return [
                'url' => $entry['fallback'],
                'fallback' => $defaultImage
            ];
        }
        if (!empty($seededImages)) {
            $seeded = $seededImages[$index % count($seededImages)];
            return [
                'url' => $baseUrl . '/' . ltrim($seeded, '/'),
                'fallback' => $defaultImage
            ];
        }
        return ['url' => $defaultImage, 'fallback' => $defaultImage];
    }

    // If file exists, ensure we return a full URL
    $finalUrl = $normalized;
    if (!filter_var($finalUrl, FILTER_VALIDATE_URL)) {
        $finalUrl = $baseUrl . '/' . ltrim($relativeAssetPath, '/');
    }

    return ['url' => $finalUrl, 'fallback' => $defaultImage];
}

if ($hotel_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid hotel ID']);
    exit();
}

$sql = "SELECT * FROM food_items WHERE hotel_id = ? AND is_available = 1";
$res = db_query($sql, 'i', [$hotel_id]);

$items = [];
while($row = mysqli_fetch_assoc($res)) {
    $index = count($items);
    $imgData = normalize_image($row, $baseUrl, $defaultImage, $seededImages, $namedImages, $index);
    $row['image_url'] = $imgData['url'];
    $row['image_fallback'] = $imgData['fallback'];
    $items[] = $row;
}

echo json_encode(['success' => true, 'data' => $items]);
?>
