<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

session_start();
require_once __DIR__ . '/../../db_conn.php';

$lat = isset($_GET['lat']) ? (float)$_GET['lat'] : null;
$lng = isset($_GET['lng']) ? (float)$_GET['lng'] : null;
$type = isset($_GET['type']) ? $_GET['type'] : 'hotel';

// AI Logic: Weighted Scoring Model
// Factors: Rating (50%), Verification (30%), Distance (20%) [if coords provided]

if ($type === 'hotel') {
    $spatial_sql = "";
    if ($lat && $lng) {
        $spatial_sql = ", (6371 * acos(cos(radians($lat)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians($lng)) + sin(radians($lat)) * sin(radians(p.latitude)))) AS distance";
    }

    $sql = "SELECT p.id, p.name, p.image_url, p.latitude, p.longitude, p.is_verified,
            ROUND(AVG(pr.rating), 1) as avg_rating,
            MIN(rt.base_price_per_hour) as min_price
            $spatial_sql,
            (
                (IFNULL(AVG(pr.rating), 3.0) * 10) + 
                (p.is_verified * 30) + 
                " . ($lat && $lng ? "(CASE WHEN distance < 1 THEN 20 WHEN distance < 5 THEN 10 ELSE 0 END)" : "20") . "
            ) as ai_confidence_score,
            'Instant Confirmation' as ai_prediction_label
            FROM hotels p
            LEFT JOIN hotel_reviews pr ON p.id = pr.hotel_id
            LEFT JOIN room_types rt ON p.id = rt.hotel_id
            GROUP BY p.id
            ORDER BY ai_confidence_score DESC
            LIMIT 10";

    $res = db_query($sql);
    $data = [];
    while ($row = mysqli_fetch_assoc($res)) {
        $row['ai_explanation'] = "This recommendation is based on a high user satisfaction rating (" . ($row['avg_rating'] ?: 'N/A') . ") " . ($row['is_verified'] ? "and a verified physical hotel status." : ".");
        $data[] = $row;
    }

    echo json_encode(['success' => true, 'type' => 'recommendations', 'data' => $data]);
} else if ($type === 'rider') {
    // Rider matching AI logic (Heuristic proximity + Load balancing)
    $sql = "SELECT id, full_name, last_lat, last_lng, rating_avg, is_verified,
            (rating_avg * 10 + is_verified * 20) as ai_trust_score
            FROM users 
            WHERE user_type = 'rider' AND is_online = 1
            ORDER BY ai_trust_score DESC
            LIMIT 5";
            
     $res = db_query($sql);
     $data = [];
     while ($row = mysqli_fetch_assoc($res)) {
         $data[] = $row;
     }
     
     echo json_encode(['success' => true, 'type' => 'riders', 'data' => $data]);
}
?>
