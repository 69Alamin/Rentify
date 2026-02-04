<?php
require_once __DIR__ . '/../cors.php';
handle_cors();

session_start();
require_once __DIR__ . '/../../db_conn.php';

$hotel_id = (int)($_GET['hotel_id'] ?? 0);

$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$baseUrl = "{$protocol}://{$host}/Rentify";
$defaultImage = $baseUrl . '/assets/food/default_food.svg';
function normalize_image($row, $baseUrl, $defaultImage) {
    $raw = $row['image_url'] ?? '';
    $normalized = $raw ?? '';

    if (preg_match('/^https?:\/\//', $raw)) {
        return ['url' => $raw, 'fallback' => $defaultImage];
    }

    // Check for file existence in the correct assets directory
    $relativeAssetPath = str_replace([$baseUrl, '/Rentify'], '', $normalized);
    $localPath = __DIR__ . '/../../' . ltrim($relativeAssetPath, '/');

    if (empty($raw) || !file_exists($localPath) || is_dir($localPath)) {
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
    $imgData = normalize_image($row, $baseUrl, $defaultImage);
    $row['image_url'] = $imgData['url'];
    $row['image_fallback'] = $imgData['fallback'];
    $items[] = $row;
}

send_json(['success' => true, 'data' => $items]);
?>
