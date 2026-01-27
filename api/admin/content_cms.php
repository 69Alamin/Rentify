<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

require_once __DIR__ . '/../../db_conn.php';
require_once __DIR__ . '/helpers/AuthMiddleware.php';

AuthMiddleware::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $res = db_query("SELECT * FROM cms_content");
    $content = [];
    while($row = mysqli_fetch_assoc($res)) {
        $content[$row['content_key']] = $row['content_value'];
    }
    echo json_encode(['success' => true, 'data' => $content]);

} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $key = sanitize($input['key'] ?? '');
    $value = $input['value'] ?? ''; // Allow HTML/Rich text, sanitize carefully if public facing

    // Basic sanitization or trust admin input
    $value = mysqli_real_escape_string($conn, $value);

    if ($key) {
        $sql = "INSERT INTO cms_content (content_key, content_value) VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE content_value = VALUES(content_value)";
        if (db_query($sql, 'ss', [$key, $value])) {
            echo json_encode(['success' => true, 'message' => 'Content saved']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to save']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Key required']);
    }
}
?>
