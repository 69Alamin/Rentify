<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../db_conn.php';
require_once __DIR__ . '/helpers/AuthMiddleware.php';
require_once __DIR__ . '/../helpers/TransactionHelper.php';

AuthMiddleware::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $user_id = isset($input['user_id']) ? (int)$input['user_id'] : null;
    $amount = isset($input['amount']) ? (float)$input['amount'] : null;
    $type = isset($input['type']) ? $input['type'] : 'deposit'; // Matches TransactionHelper types

    if (!$user_id || !$amount || $amount <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid user or amount']);
        exit();
    }

    // Check if user exists
    $user_check = mysqli_query($conn, "SELECT id, full_name, wallet_balance FROM users WHERE id = $user_id");
    if (mysqli_num_rows($user_check) === 0) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit();
    }
    $user = mysqli_fetch_assoc($user_check);

    $description = "Admin manual adjustment: credited ৳$amount";
    
    // Use TransactionHelper for atomic update and logging
    if (TransactionHelper::log($conn, $user_id, $amount, 'deposit', null, $description)) {
        // Return new balance
        $new_bal_res = mysqli_query($conn, "SELECT wallet_balance FROM users WHERE id = $user_id");
        $new_bal = mysqli_fetch_assoc($new_bal_res)['wallet_balance'];

        echo json_encode([
            'success' => true, 
            'message' => "Successfully credited ৳$amount to {$user['full_name']}. New Balance: ৳$new_bal",
            'new_balance' => $new_bal
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to process transaction.']);
    }

} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
