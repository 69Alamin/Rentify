<?php
require_once __DIR__ . '/../cors.php';
handle_cors();

session_start();

if (isset($_SESSION['user_id'])) {
    require_once __DIR__ . '/../../db_conn.php';
    $uid = $_SESSION['user_id'];

    $wallet_col = null;
    $col_res = db_query("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME IN ('wallet_balance','balance')");
    if ($col_res) {
        $cols = [];
        while ($c = mysqli_fetch_assoc($col_res)) { $cols[] = $c['COLUMN_NAME']; }
        if (in_array('wallet_balance', $cols, true)) $wallet_col = 'wallet_balance';
        elseif (in_array('balance', $cols, true)) $wallet_col = 'balance';
    }

    $balance = 0;
    if ($wallet_col) {
        $res = db_query("SELECT {$wallet_col} AS balance FROM users WHERE id = ?", 'i', [$uid]);
        $u = $res ? mysqli_fetch_assoc($res) : null;
        $balance = (float)($u['balance'] ?? 0);
    }

    send_json([
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'full_name' => $_SESSION['full_name'] ?? 'Vendor',
            'email' => $_SESSION['email'] ?? '',
            'type' => $_SESSION['user_type'],
            'profile_photo' => $_SESSION['profile_photo'] ?? null,
            'balance' => $balance
        ]
    ]);
} else {
    send_json(['authenticated' => false]);
}
?>
