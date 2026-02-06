<?php
// Disable Caching for Cloudflare/Browsers
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? '*'));
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

require_once __DIR__ . '/../../db_conn.php';

$type = $_GET['type'] ?? '';
$id = (int)($_GET['id'] ?? 0);
$current_status = $_GET['current_status'] ?? '';

if (!$type) { // ID can be 0 for global
    echo json_encode(['success' => false, 'message' => 'Missing Type']);
    exit();
}

// Timeout after 5 seconds to avoid Cloudflare buffering/timeouts
$timeout = 5; 
$start = time();

// Function to get current status
function get_status($conn, $type, $id) {
    if ($type === 'global') {
        // Global channel check (any NEW requests)
        // We look for any record with type='global'
        $sql = "SELECT status FROM realtime_status WHERE entity_type = 'global'";
        $res = mysqli_query($conn, $sql);
        if ($row = mysqli_fetch_assoc($res)) {
            return $row['status'];
        }
        return null;
    }

    // Check the realtime table
    $sql = "SELECT status FROM realtime_status WHERE entity_type = ? AND entity_id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, 'si', $type, $id);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    if ($row = mysqli_fetch_assoc($res)) {
        return $row['status'];
    }
    
    // Fallback: If not in realtime table yet, check actual table (initial sync)
    if ($type === 'ride') {
        $sql = "SELECT status FROM journey_requests WHERE id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, 'i', $id);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
        if ($row = mysqli_fetch_assoc($res)) {
            // Self-heal
            $s = $row['status'];
            return $s;
        }
    }
    
    return null;
}

// Long Polling Loop
while (time() - $start < $timeout) {
    $new_status = get_status($conn, $type, $id);
    
    // If status exists and is different from what client has, return it
    if ($new_status !== null && $new_status !== $current_status) {
        // Log success
        file_put_contents(__DIR__ . '/debug_poll.log', "  -> CHANGED to $new_status\n", FILE_APPEND);
        
        echo json_encode(['success' => true, 'changed' => true, 'status' => $new_status]);
        exit();
    }
    
    // Wait 0.5s
    usleep(500000);
    clearstatcache();
}

// Timeout reached
echo json_encode(['success' => true, 'changed' => false, 'status' => $current_status]);
?>
