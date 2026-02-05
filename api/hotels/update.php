<?php
require_once __DIR__ . '/../cors.php';
handle_cors();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'vendor') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$id = (int)($_POST['id'] ?? 0);
if ($id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid property ID']);
    exit();
}

// Verify ownership
$check_sql = "SELECT id, image_url FROM hotels WHERE id = ? AND vendor_id = ?";
$result = db_query($check_sql, 'ii', [$id, $_SESSION['user_id']]);

if (!$result || mysqli_num_rows($result) === 0) {
    echo json_encode(['success' => false, 'message' => 'Property not found or unauthorized']);
    exit();
}
$existing_hotel = mysqli_fetch_assoc($result);

// Sanitize and prepare data
$name = sanitize($_POST['name'] ?? '');
$address = sanitize($_POST['address'] ?? '');
$description = sanitize($_POST['description'] ?? '');
$hotel_type = sanitize($_POST['hotel_type'] ?? 'hotel');
$price_per_hour = (float)($_POST['price_per_hour'] ?? 0);
$latitude = (float)($_POST['latitude'] ?? 0);
$longitude = (float)($_POST['longitude'] ?? 0);

$contact_phone = sanitize($_POST['contact_phone'] ?? null);
$contact_email = sanitize($_POST['contact_email'] ?? null);
$emergency_contact = sanitize($_POST['emergency_contact'] ?? null);

$check_in_time = sanitize($_POST['check_in_time'] ?? '14:00:00');
$check_out_time = sanitize($_POST['check_out_time'] ?? '12:00:00');
$cancellation_policy = sanitize($_POST['cancellation_policy'] ?? null);
$house_rules = sanitize($_POST['house_rules'] ?? null);
$min_booking_hours = (int)($_POST['min_booking_hours'] ?? 1);
$max_booking_hours = (int)($_POST['max_booking_hours'] ?? 24);

$has_wifi = isset($_POST['has_wifi']) ? (int)$_POST['has_wifi'] : 1;
$has_parking = isset($_POST['has_parking']) ? (int)$_POST['has_parking'] : 0;
$has_ac = isset($_POST['has_ac']) ? (int)$_POST['has_ac'] : 1;
$has_elevator = isset($_POST['has_elevator']) ? (int)$_POST['has_elevator'] : 0;
$has_restaurant = isset($_POST['has_restaurant']) ? (int)$_POST['has_restaurant'] : 0;
$has_gym = isset($_POST['has_gym']) ? (int)$_POST['has_gym'] : 0;
$has_pool = isset($_POST['has_pool']) ? (int)$_POST['has_pool'] : 0;
$has_laundry = isset($_POST['has_laundry']) ? (int)$_POST['has_laundry'] : 0;

if (!$name || !$address) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields']);
    exit();
}

// Handle Image Update
$image_url = $existing_hotel['image_url'];
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = '../../assets/uploads/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
    
    $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
    $filename = uniqid('prop_') . '.' . $ext;
    $targetPath = $uploadDir . $filename;
    
    if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
        $image_url = 'assets/uploads/' . $filename;
    }
}

$sql = "UPDATE hotels SET 
    name = ?, address = ?, description = ?, hotel_type = ?, image_url = ?,
    contact_phone = ?, contact_email = ?, emergency_contact = ?,
    check_in_time = ?, check_out_time = ?, cancellation_policy = ?, house_rules = ?,
    min_booking_hours = ?, max_booking_hours = ?,
    has_wifi = ?, has_parking = ?, has_ac = ?, has_elevator = ?, has_restaurant = ?, has_gym = ?, has_pool = ?, has_laundry = ?,
    latitude = ?, longitude = ?
    WHERE id = ? AND vendor_id = ?";

$params = [
    $name, $address, $description, $hotel_type, $image_url,
    $contact_phone, $contact_email, $emergency_contact,
    $check_in_time, $check_out_time, $cancellation_policy, $house_rules,
    $min_booking_hours, $max_booking_hours,
    $has_wifi, $has_parking, $has_ac, $has_elevator, $has_restaurant, $has_gym, $has_pool, $has_laundry,
    $latitude, $longitude,
    $id, $_SESSION['user_id']
];

$types = 'ssssssssssssiiiiiiiiiiddii';

$updated = db_query($sql, $types, $params);

// Fallback for older schemas that may not have newer columns
if (!$updated) {
    $fallback_sql = "UPDATE hotels SET 
        name = ?, address = ?, description = ?, hotel_type = ?, image_url = ?,
        latitude = ?, longitude = ?
        WHERE id = ? AND vendor_id = ?";
    $fallback_params = [$name, $address, $description, $hotel_type, $image_url, $latitude, $longitude, $id, $_SESSION['user_id']];
    $fallback_types = 'sssssddii';
    $updated = db_query($fallback_sql, $fallback_types, $fallback_params);
}

if ($updated) {
    // Also update the price in room_types (for the default room type)
    if ($price_per_hour > 0) {
        $rt_sql = "UPDATE room_types SET base_price_per_hour = ?, daily_rate = ? WHERE hotel_id = ?";
        $daily_rate = $price_per_hour * 24;
        db_query($rt_sql, 'ddi', [$price_per_hour, $daily_rate, $id]);
    }
    send_json(['success' => true, 'message' => 'Property updated successfully']);
} else {
    send_json(['success' => false, 'message' => 'Failed to update property']);
}
?>
