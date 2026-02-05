<?php
require_once __DIR__ . '/cors.php';
handle_cors();

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
        send_json(['success' => false, 'message' => 'Unauthorized']);
    }
    $whereClauses[] = "p.vendor_id = ?";
    $whereClauses[] = "p.is_active = 1";
    $params[] = $_SESSION['user_id'];
    $types .= 'i';
} else {
    $whereClauses[] = "p.is_verified = 1 AND p.is_active = 1";
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
if ($mine) {
    $sql = "SELECT 
            p.id,
            p.name,
            p.address,
            p.description,
            p.image_url,
            p.latitude,
            p.longitude,
            p.is_active,
            p.is_verified,
            p.hotel_type as hotel_type,
            p.contact_phone,
            p.contact_email,
            p.emergency_contact,
            p.check_in_time,
            p.check_out_time,
            p.cancellation_policy,
            p.house_rules,
            p.min_booking_hours,
            p.max_booking_hours,
            p.has_wifi,
            p.has_parking,
            p.has_ac,
            p.has_elevator,
            p.has_restaurant,
            p.has_gym,
            p.has_pool,
            p.has_laundry,
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
} else {
    $sql = "SELECT 
            p.id, 
            p.name, 
            p.address, 
            p.description, 
            p.image_url, 
            p.latitude, 
            p.longitude,
            p.is_active,
            $typeSql,
            p.has_wifi,
            p.has_parking,
            p.has_ac,
            p.has_elevator,
            p.has_restaurant,
            p.has_gym,
            p.has_pool,
            p.has_laundry,
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
}

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
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $baseUrl = "{$protocol}://{$host}/Rentify";
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

        // Final decision: if it's already an absolute online URL, we use it.
        // Otherwise, if it's a valid local file, we use it. 
        // If neither, we use the default.
        if (preg_match('/^https?:\/\//', $rawImage)) {
            $row['image_url'] = $rawImage;
        } elseif (!empty($rawImage) && file_exists($localPath)) {
            $row['image_url'] = $normalized;
        } else {
            $row['image_url'] = $defaultImage;
        }
        if (isset($row['is_active'])) $row['is_active'] = (int)$row['is_active'];
        if (isset($row['is_verified'])) $row['is_verified'] = (int)$row['is_verified'];
        $hotels[] = $row;
    }
} else {
    send_json(['success' => false, 'message' => 'Database query failed'], 500);
}

send_json(['success' => true, 'data' => $hotels]);
?>
