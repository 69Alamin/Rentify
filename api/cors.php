<?php
// Centralized CORS Handling for Rentify API
// Aggressive permissive mode for debugging

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Always reflect the origin if present
if ($origin) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Debug logging (optional, remove in production)
// file_put_contents(__DIR__ . '/cors_debug.log', "Origin: $origin\n", FILE_APPEND);

// Handle preflight requests immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
// End of CORS handling
