<?php
require_once __DIR__ . '/db_conn.php';

$queries = [
    "ALTER TABLE chat_messages ADD INDEX idx_context (context_type, context_id)",
    "ALTER TABLE chat_messages ADD INDEX idx_created_at (created_at)"
];

foreach ($queries as $sql) {
    if (mysqli_query($conn, $sql)) {
        echo "Successfully executed: $sql\n";
    } else {
        echo "Error executing $sql: " . mysqli_error($conn) . "\n";
    }
}
?>
