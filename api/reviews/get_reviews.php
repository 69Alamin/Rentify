<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

require_once __DIR__ . '/../../db_conn.php';

$hotel_id = (int)($_GET['hotel_id'] ?? 0);

if (!$hotel_id) {
    echo json_encode(['success' => false, 'message' => 'Hotel ID required']);
    exit();
}

$sql = "SELECT pr.*, u.full_name as user_name 
        FROM hotel_reviews pr
        JOIN users u ON pr.user_id = u.id
        WHERE pr.hotel_id = ?
        ORDER BY pr.created_at DESC";

$res = db_query($sql, 'i', [$hotel_id]);
$reviews = [];
$total_rating = 0;
$count = 0;

while($row = mysqli_fetch_assoc($res)) {
    $reviews[] = $row;
    $total_rating += $row['rating'];
    $count++;
}

$avg_rating = $count > 0 ? round($total_rating / $count, 1) : 0;

echo json_encode([
    'success' => true,
    'data' => [
        'reviews' => $reviews,
        'average_rating' => $avg_rating,
        'review_count' => $count
    ]
]);
?>
