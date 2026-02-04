<?php
// Function to handle CORS for API endpoints
function handle_cors() {
    $allowed_origins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:5177',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:5175',
        'http://127.0.0.1:5176',
        'http://127.0.0.1:5177',
    ];

    // Suppress echoed errors in APIs to prevent corrupted JSON
    ini_set('display_errors', 0);
    error_reporting(E_ALL & ~E_NOTICE);

    // Start output buffering to catch any accidental output/warnings
    ob_start();

    // Suppress echoed errors in APIs to prevent corrupted JSON
    ini_set('display_errors', 0);
    error_reporting(E_ALL & ~E_NOTICE);

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, $allowed_origins)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    } elseif ($origin === '') {
        // Same-origin or no Origin header; allow the primary dev origin
        header('Access-Control-Allow-Origin: http://localhost:5173');
    } else {
        // Default fallback
        header('Access-Control-Allow-Origin: http://localhost:5173');
    }

    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Content-Type: application/json; charset=utf-8');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        ob_end_clean();
        exit();
    }
}

// Global Response Helper
function send_json($data, $status_code = 200) {
    // Clear any accidental output (warnings, spaces)
    if (ob_get_length()) ob_clean();
    
    http_response_code($status_code);
    echo json_encode($data);
    exit();
}

// Global API Error Handler
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    if (!(error_reporting() & $errno)) return;
    error_log("API Error: [$errno] $errstr in $errfile on line $errline");
    // Don't output anything to keep JSON clean
});

set_exception_handler(function($e) {
    error_log("API Exception: " . $e->getMessage());
    send_json(['success' => false, 'message' => 'Internal Server Error'], 500);
});
?>
