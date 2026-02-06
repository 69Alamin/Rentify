<?php
require_once __DIR__ . '/../../db_conn.php';

echo "Checking journey_requests table...\n";
$sql = "SELECT * FROM journey_requests ORDER BY created_at DESC LIMIT 5";
$res = db_query($sql);
if ($res) {
    echo "Found " . mysqli_num_rows($res) . " requests.\n";
    while ($row = mysqli_fetch_assoc($res)) {
        print_r($row);
    }
} else {
    echo "Query failed: " . mysqli_error($conn) . "\n";
}

echo "\nChecking table structure...\n";
$sql = "DESCRIBE journey_requests";
$res = db_query($sql);
while ($row = mysqli_fetch_assoc($res)) {
    echo $row['Field'] . " - " . $row['Type'] . "\n";
}
?>
