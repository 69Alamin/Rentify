<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

session_start();
require_once __DIR__ . '/../../db_conn.php';

// strictly admin search
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$data = [
    'confidence_distribution' => [],
    'demand_patterns' => [],
    'cancellation_insights' => [],
    'low_confidence_reasons' => [],
    'rider_availability' => []
];

// 1. Confidence Distribution (Aggregated by Verification and Stock Status)
$sqlConfidence = "SELECT 
    CASE 
        WHEN (p.is_verified = 1 AND IFNULL(stock.room_count, 0) >= 2) THEN 'High (>=80%)'
        WHEN (p.is_verified = 1 OR IFNULL(stock.room_count, 0) >= 2) THEN 'Medium (50-79%)'
        ELSE 'Low (<50%)'
    END as confidence_tier,
    COUNT(*) as count
FROM bookings b
JOIN rooms r ON b.room_id = r.id
JOIN room_types rt ON r.room_type_id = rt.id
LEFT JOIN (
    SELECT rt2.id, COUNT(rooms2.id) as room_count
    FROM room_types rt2
    JOIN rooms rooms2 ON rt2.id = rooms2.room_type_id
    WHERE rooms2.status = 'available'
    GROUP BY rt2.id
) stock ON rt.id = stock.id
JOIN hotels p ON rt.hotel_id = p.id
GROUP BY confidence_tier";

$resConf = db_query($sqlConfidence);
if ($resConf) {
    while ($row = mysqli_fetch_assoc($resConf)) $data['confidence_distribution'][] = $row;
}

// 2. Demand Patterns (Hourly)
$sqlDemand = "SELECT HOUR(created_at) as hour, COUNT(*) as bookings_count 
              FROM bookings 
              WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
              GROUP BY HOUR(created_at)
              ORDER BY hour ASC";
$resDemand = db_query($sqlDemand);
if ($resDemand) {
    while ($row = mysqli_fetch_assoc($resDemand)) $data['demand_patterns'][] = $row;
}

// 3. Cancellation Insights
$sqlCancel = "SELECT 
    booking_status, 
    is_emergency,
    COUNT(*) as count
FROM bookings 
WHERE booking_status IN ('cancelled', 'completed')
GROUP BY booking_status, is_emergency";
$resCancel = db_query($sqlCancel);
if ($resCancel) {
    while ($row = mysqli_fetch_assoc($resCancel)) $data['cancellation_insights'][] = $row;
}

// 4. Low Confidence Reason Analysis (Rule-based detection)
// Identifying reasons from historical ride matching failures or lack of verified status
$sqlReasons = "SELECT 
    'Unverified Hotel' as reason, COUNT(*) as count 
    FROM bookings b 
    JOIN rooms r ON b.room_id = r.id 
    JOIN room_types rt ON r.room_type_id = rt.id 
    JOIN hotels p ON rt.hotel_id = p.id 
    WHERE p.is_verified = 0
UNION ALL
SELECT 
    'Limited Rider Availability' as reason, COUNT(*) as count 
    FROM journey_requests jr 
    WHERE jr.status = 'requested' AND created_at < DATE_SUB(NOW(), INTERVAL 10 MINUTE)";
$resReasons = db_query($sqlReasons);
if ($resReasons) {
    while ($row = mysqli_fetch_assoc($resReasons)) $data['low_confidence_reasons'][] = $row;
}

// 5. Rider Availability Insights
$sqlRiders = "SELECT 
    (SELECT COUNT(*) FROM users WHERE user_type = 'rider' AND online_status = 'online') as riders_online,
    (SELECT AVG(rating_avg) FROM users WHERE user_type = 'rider' AND online_status = 'online') as avg_rider_trust";
$resRiders = db_query($sqlRiders);
if ($resRiders) {
    $data['rider_availability'] = mysqli_fetch_assoc($resRiders);
}

echo json_encode(['success' => true, 'data' => $data]);
?>
