<?php
// Script to migrate Rentify DB to Quickrent DB
// Usage: Run via CLI or Browser

define('DB_HOST', '127.0.0.1');
define('DB_USER', 'root');
define('DB_PASS', '');
define('OLD_DB', 'rentify_db');
define('NEW_DB', 'quickrent_db');

$conn = mysqli_connect(DB_HOST, DB_USER, DB_PASS);
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

echo "Connected to MySQL server.\n";

// 1. Create New Database
$sql = "CREATE DATABASE IF NOT EXISTS " . NEW_DB . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
if (mysqli_query($conn, $sql)) {
    echo "Database " . NEW_DB . " created or already exists.\n";
} else {
    die("Error creating database: " . mysqli_error($conn));
}

// 2. Export Old Database
// We will use mysqldump logic or just loop tables if mysqldump is not available. 
// However, mysqldump is safer.
$dumpFile = __DIR__ . '/temp_dump.sql';
$cmd = "mysqldump -u " . DB_USER . " " . OLD_DB . " > \"$dumpFile\"";
if (DB_PASS) {
    $cmd = "mysqldump -u " . DB_USER . " -p" . DB_PASS . " " . OLD_DB . " > \"$dumpFile\"";
}

echo "Exporting " . OLD_DB . "...\n";
exec($cmd, $output, $returnVar);

if ($returnVar !== 0) {
    echo "mysqldump failed. Trying PHP based copy (slower).\n";
    // Fallback: This is complex to implement fully specifically for renamed DB in one go.
    // Let's assume user has mysqldump or we instruct them.
    // Actually, XAMPP likely has mysqldump in path or we need to find it.
    
    // Try absolute path if basic failed
    $xamppPaths = ['c:\\xampp\\mysql\\bin\\mysqldump.exe', 'd:\\xampp\\mysql\\bin\\mysqldump.exe'];
    $mysqldump = 'mysqldump';
    foreach($xamppPaths as $path) {
        if (file_exists($path)) {
            $mysqldump = '"' . $path . '"';
            break;
        }
    }
    
    $cmd = "$mysqldump -u " . DB_USER . " --result-file=\"$dumpFile\" " . OLD_DB;
    exec($cmd, $output, $returnVar2);
    
    if ($returnVar2 !== 0) {
        die("Export failed. Please rename database manually or ensure mysqldump is in PATH.\n");
    }
}

echo "Export successful.\n";

// 3. Import to New Database
echo "Importing to " . NEW_DB . "...\n";
$mysql = 'mysql';
$xamppPathsMysql = ['c:\\xampp\\mysql\\bin\\mysql.exe', 'd:\\xampp\\mysql\\bin\\mysql.exe'];
foreach($xamppPathsMysql as $path) {
    if (file_exists($path)) {
        $mysql = '"' . $path . '"';
        break;
    }
}

$cmdImport = "$mysql -u " . DB_USER . " " . NEW_DB . " < \"$dumpFile\"";
exec($cmdImport, $outputImports, $returnVarImport);

if ($returnVarImport !== 0) {
    die("Import failed.\n");
}

echo "Migration successful!\n";

// 4. Update internal references if any in DB content (Optional, usually config is enough)
// We might want to update image paths in DB if they are absolute.
// But we saw paths are often relative or constructed in PHP.
// Only `file_url` in rider_documents seemed to have /Rentify/.

$connNew = mysqli_connect(DB_HOST, DB_USER, DB_PASS, NEW_DB);
echo "Updating internal paths in " . NEW_DB . "...\n";

// Update rider_documents
$updateSql = "UPDATE rider_documents SET file_url = REPLACE(file_url, '/Rentify/', '/Quickrent/')";
mysqli_query($connNew, $updateSql);

// Update rider_profiles (photo_url)
$updateSql2 = "UPDATE rider_profiles SET profile_photo_url = REPLACE(profile_photo_url, '/Rentify/', '/Quickrent/')";
mysqli_query($connNew, $updateSql2);

// Update hotels (image_url) - if they are stored as /Rentify/...
$updateSql3 = "UPDATE hotels SET image_url = REPLACE(image_url, '/Rentify/', '/Quickrent/')";
mysqli_query($connNew, $updateSql3);

echo "Paths updated.\n";

// Clean up
@unlink($dumpFile);

echo "Done.";
?>
