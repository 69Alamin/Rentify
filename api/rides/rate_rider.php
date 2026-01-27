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
$sql = "SELECT driver_id FROM journey_requests WHERE id = ? AND user_id = ? AND status = 'completed'";
$res = db_query($sql, 'ii', [$ride_id, $user_id]);
$ride = mysqli_fetch_assoc($res);

if (!$ride) {
    echo json_encode(['success' => false, 'message' => 'Ride not found, not completed, or unauthorized']);
    exit();
}

$driver_id = $ride['driver_id'];

// 2. Update the ride with the rating
$update_ride = "UPDATE journey_requests SET user_rating = ? WHERE id = ?";
if (db_query($update_ride, 'ii', [$rating, $ride_id])) {
    
    // 3. Re-calculate driver's average rating
    $calc_sql = "SELECT AVG(user_rating) as avg_r FROM journey_requests WHERE driver_id = ? AND user_rating IS NOT NULL";
    $calc_res = db_query($calc_sql, 'i', [$driver_id]);
    $new_avg = mysqli_fetch_assoc($calc_res)['avg_r'] ?? 5.0;

    db_query("UPDATE users SET rating_avg = ? WHERE id = ?", 'di', [$new_avg, $driver_id]);

    echo json_encode(['success' => true, 'message' => 'Rating submitted successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to submit rating']);
}
?>
