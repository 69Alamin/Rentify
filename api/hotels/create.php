<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'vendor') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

// Basic required fields
$name = sanitize($_POST['name'] ?? '');
$address = sanitize($_POST['address'] ?? '');
$description = sanitize($_POST['description'] ?? '');
$hotel_type = sanitize($_POST['hotel_type'] ?? 'hotel');
$price_per_hour = (float)($_POST['price_per_hour'] ?? 0);
$latitude = (float)($_POST['latitude'] ?? 0);
$longitude = (float)($_POST['longitude'] ?? 0);

// New contact fields (optional)
$contact_phone = sanitize($_POST['contact_phone'] ?? null);
$contact_email = sanitize($_POST['contact_email'] ?? null);
$emergency_contact = sanitize($_POST['emergency_contact'] ?? null);

// New policy fields (optional)
$check_in_time = sanitize($_POST['check_in_time'] ?? '14:00:00');
$check_out_time = sanitize($_POST['check_out_time'] ?? '12:00:00');
$cancellation_policy = sanitize($_POST['cancellation_policy'] ?? null);
$house_rules = sanitize($_POST['house_rules'] ?? null);
$min_booking_hours = (int)($_POST['min_booking_hours'] ?? 1);
$max_booking_hours = (int)($_POST['max_booking_hours'] ?? 24);

// New facility fields (optional, default to 0/1)
$has_wifi = isset($_POST['has_wifi']) ? (int)$_POST['has_wifi'] : 1;
$has_parking = isset($_POST['has_parking']) ? (int)$_POST['has_parking'] : 0;
$has_ac = isset($_POST['has_ac']) ? (int)$_POST['has_ac'] : 1;
$has_elevator = isset($_POST['has_elevator']) ? (int)$_POST['has_elevator'] : 0;
$has_restaurant = isset($_POST['has_restaurant']) ? (int)$_POST['has_restaurant'] : 0;
$has_gym = isset($_POST['has_gym']) ? (int)$_POST['has_gym'] : 0;
$has_pool = isset($_POST['has_pool']) ? (int)$_POST['has_pool'] : 0;
$has_laundry = isset($_POST['has_laundry']) ? (int)$_POST['has_laundry'] : 0;

if (!$name || !$address || $price_per_hour <= 0) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields']);
    exit();
}

// Handle Image Upload
$image_url = '';
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

// Insert Hotel with all new fields
$sql = "INSERT INTO hotels (
    vendor_id, name, address, description, hotel_type, image_url,
    contact_phone, contact_email, emergency_contact,
    check_in_time, check_out_time, cancellation_policy, house_rules,
    min_booking_hours, max_booking_hours,
    has_wifi, has_parking, has_ac, has_elevator, has_restaurant, has_gym, has_pool, has_laundry,
    is_verified, is_active, latitude, longitude, created_at
) VALUES (
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?,
    ?, ?, ?, ?,
    ?, ?,
    ?, ?, ?, ?, ?, ?, ?, ?,
    0, 1, ?, ?, NOW()
)";

$params = [
    $_SESSION['user_id'], $name, $address, $description, $hotel_type, $image_url,
    $contact_phone, $contact_email, $emergency_contact,
    $check_in_time, $check_out_time, $cancellation_policy, $house_rules,
    $min_booking_hours, $max_booking_hours,
    $has_wifi, $has_parking, $has_ac, $has_elevator, $has_restaurant, $has_gym, $has_pool, $has_laundry,
    $latitude, $longitude
];

$types = 'issssssssssssiiiiiiiiiiidd';

if (db_query($sql, $types, $params)) {
    $hotel_id = mysqli_insert_id($conn);
    
    // Create a default Room Type for this hotel
    $rt_sql = "INSERT INTO room_types (
        hotel_id, name, description, base_price_per_hour, capacity,
        daily_rate, emergency_rate_multiplier,
        has_private_bathroom, has_tv, is_available,
        created_at
    ) VALUES (?, 'Standard Room', 'Standard room for this hotel', ?, 2, ?, 1.50, 1, 1, 1, NOW())";
    
    $daily_rate = $price_per_hour * 24;
    db_query($rt_sql, 'idd', [$hotel_id, $price_per_hour, $daily_rate]);
    $rt_id = mysqli_insert_id($conn);
    
    // Add 5 physical rooms
    $r_sql = "INSERT INTO rooms (room_type_id, room_number, status) VALUES (?, ?, 'available')";
    for ($i = 1; $i <= 5; $i++) {
         db_query($r_sql, 'is', [$rt_id, '10' . $i]);
    }

    echo json_encode(['success' => true, 'message' => 'Hotel added successfully', 'hotel_id' => $hotel_id]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to add hotel: ' . mysqli_error($conn)]);
}
?>
