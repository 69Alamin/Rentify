<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$ride_id = (int)($input['ride_id'] ?? 0);
$rating = (int)($input['rating'] ?? 0); // 1-5

if ($ride_id <= 0 || $rating < 1 || $rating > 5) {
    echo json_encode(['success' => false, 'message' => 'Invalid rating data']);
    exit();
}

$user_id = $_SESSION['user_id'];

// 1. Verify the ride belongs to the user and is completed
$sql = "SELECT rider_id FROM journey_requests WHERE id = ? AND user_id = ? AND status = 'completed'";
$res = db_query($sql, 'ii', [$ride_id, $user_id]);
$ride = mysqli_fetch_assoc($res);

if (!$ride) {
    echo json_encode(['success' => false, 'message' => 'Ride not found, not completed, or unauthorized']);
    exit();
}

$driver_id = $ride['rider_id'];
if (!$driver_id) {
    echo json_encode(['success' => false, 'message' => 'Driver not assigned for this ride']);
    exit();
}

// 2. Update the ride with the rating (keeps per-ride record)
$update_ride = "UPDATE journey_requests SET user_rating = ? WHERE id = ?";
if (!db_query($update_ride, 'ii', [$rating, $ride_id])) {
    echo json_encode(['success' => false, 'message' => 'Failed to submit rating']);
    exit();
}

// 3. Store normalized rating record
$check_sql = "SELECT id FROM rider_ratings WHERE ride_id = ? AND user_id = ? LIMIT 1";
$check_res = db_query($check_sql, 'ii', [$ride_id, $user_id]);
$existing = $check_res ? mysqli_fetch_assoc($check_res) : null;

if ($existing) {
    db_query("UPDATE rider_ratings SET rating = ?, created_at = NOW() WHERE id = ?", 'ii', [$rating, $existing['id']]);
} else {
    db_query("INSERT INTO rider_ratings (rider_id, user_id, ride_id, rating, created_at) VALUES (?, ?, ?, ?, NOW())", 'iiii', [$driver_id, $user_id, $ride_id, $rating]);
}

echo json_encode(['success' => true, 'message' => 'Rating submitted successfully']);
?>
