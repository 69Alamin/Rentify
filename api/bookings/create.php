require_once __DIR__ . '/../cors.php';
handle_cors();

session_start();
require_once __DIR__ . '/../../db_conn.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    send_json(['success' => false, 'message' => 'Invalid input']);
}

$user_id = $_SESSION['user_id'] ?? null;

if (!$user_id) {
    $_SESSION['pending_booking'] = $input;
    send_json(['success' => false, 'require_login' => true, 'message' => 'Please login to complete your booking.']);
}

// Enforce Customer-Only Booking (RBAC)
if (isset($_SESSION['user_type']) && $_SESSION['user_type'] !== 'customer') {
    send_json(['success' => false, 'message' => 'Only customers can make bookings. Please log in with a customer account.'], 403);
}

$guest_name = $input['guest_name'] ?? $_SESSION['name'] ?? null;
$guest_email = $input['guest_email'] ?? $_SESSION['email'] ?? null;
$guest_phone = $input['guest_phone'] ?? null;

$hotel_id = (int)($input['hotel_id'] ?? 0);
$room_type_id = (int)($input['room_type_id'] ?? 0);
$check_in_date = $input['check_in_date'] ?? '';
$booked_hours = (int)($input['booked_hours'] ?? 0);
$guests = (int)($input['guests'] ?? 1);
$vehicle_needed = !empty($input['vehicle_needed']);
$vehicle_type = strtolower($input['vehicle_type'] ?? '');
$pickup_lat = (float)($input['pickup_lat'] ?? 0);
$pickup_lng = (float)($input['pickup_lng'] ?? 0);
$estimated_ride_fare = (float)($input['estimated_ride_fare'] ?? 0);

// normalize alias
if ($vehicle_type === 'motorbike') {
    $vehicle_type = 'bike';
}

if ($hotel_id <= 0 || $room_type_id <= 0 || empty($check_in_date) || $booked_hours <= 0) {
    send_json(['success' => false, 'message' => 'Missing required fields']);
}

// 1. Fetch Price/Capacity and Hotel Info
$query = "SELECT rt.base_price_per_hour, rt.capacity, p.address as hotel_address, p.latitude as hotel_lat, p.longitude as hotel_lng 
          FROM room_types rt 
          JOIN hotels p ON rt.hotel_id = p.id
          WHERE rt.id = ? AND rt.hotel_id = ?";
$result = db_query($query, 'ii', [$room_type_id, $hotel_id]);
if (!$result || mysqli_num_rows($result) === 0) {
    send_json(['success' => false, 'message' => 'Invalid room type or hotel association']);
}
$room_data = mysqli_fetch_assoc($result);

if ($guests > $room_data['capacity']) {
    send_json(['success' => false, 'message' => 'Guests exceed room capacity']);
}

// Calculate Price
$room_price = $booked_hours * $room_data['base_price_per_hour'];
$vehicle_price = 0;
if ($vehicle_needed) {
    $vehicle_price = ($estimated_ride_fare > 0) ? $estimated_ride_fare : 0;

    // If frontend didn't send a fare but we have coords, compute server-side
    if ($vehicle_price <= 0 && $pickup_lat && $pickup_lng && !empty($room_data['hotel_lat']) && !empty($room_data['hotel_lng'])) {
        $destLat = (float)$room_data['hotel_lat'];
        $destLng = (float)$room_data['hotel_lng'];

        $earth_radius = 6371;
        $dLat = deg2rad($destLat - $pickup_lat);
        $dLon = deg2rad($destLng - $pickup_lng);
        $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($pickup_lat)) * cos(deg2rad($destLat)) * sin($dLon/2) * sin($dLon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        $distance = $earth_radius * $c;

        $base_fare = ($vehicle_type === 'bike') ? 50 : 100;
        $rate_per_km = ($vehicle_type === 'bike') ? 15 : 40;
        $vehicle_price = $base_fare + ($distance * $rate_per_km);
    }

    // Final fallback if still zero
    if ($vehicle_price <= 0) {
        $vehicle_price = ($vehicle_type === 'car') ? 200 : 100;
    }
}
$total_price = $room_price + $vehicle_price;

// Times
$check_in_ts = strtotime($check_in_date);
$check_out_ts = $check_in_ts + ($booked_hours * 3600);
$check_in_time = date('Y-m-d H:i:s', $check_in_ts);
$check_out_time = date('Y-m-d H:i:s', $check_out_ts);

mysqli_begin_transaction($conn);

try {
    // Find available/locked room
    $session_id = session_id();
    $room_query = "SELECT id FROM rooms 
                  WHERE room_type_id = ? 
                  AND (
                      (status = 'available' AND (locked_at IS NULL OR locked_at < DATE_SUB(NOW(), INTERVAL 10 MINUTE)))
                      OR (locked_by_session = ?)
                  )
                  LIMIT 1 FOR UPDATE";
    $stmt_room = mysqli_prepare($conn, $room_query);
    mysqli_stmt_bind_param($stmt_room, 'is', $room_type_id, $session_id);
    mysqli_stmt_execute($stmt_room);
    $room_res = mysqli_stmt_get_result($stmt_room);
    
    if (!$room_res || mysqli_num_rows($room_res) === 0) {
        throw new Exception('Rooms are currently occupied or locked by other users');
    }
    
    $room = mysqli_fetch_assoc($room_res);
    $room_id = $room['id'];
    mysqli_stmt_close($stmt_room);

    // 0. Check User Balance
    require_once __DIR__ . '/../helpers/TransactionHelper.php';
    $user_res = db_query("SELECT wallet_balance FROM users WHERE id = ?", 'i', [$user_id]);
    $user_wallet = mysqli_fetch_assoc($user_res);
    if ($user_wallet['wallet_balance'] < $total_price) {
        throw new Exception('Insufficient wallet balance. Total required: ৳' . $total_price);
    }

    // Fetch Vendor ID for transaction
    $vendor_res = db_query("SELECT vendor_id, name FROM hotels WHERE id = ?", 'i', [$hotel_id]);
    $vendor_info = mysqli_fetch_assoc($vendor_res);

    // Insert Booking
    $is_emergency = !empty($input['is_emergency']) ? 1 : 0;
    $sql = "INSERT INTO bookings (user_id, guest_name, guest_email, guest_phone, room_id, check_in_time, check_out_time, total_hours, booked_hours, total_price, booking_status, payment_status, is_emergency, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'completed', ?, NOW())";
    
    if (!db_query($sql, 'isssissiidi', [$user_id, $guest_name, $guest_email, $guest_phone, $room_id, $check_in_time, $check_out_time, $booked_hours, $booked_hours, $total_price, $is_emergency])) {
         throw new Exception('Failed to insert booking');
    }
    $booking_id = mysqli_insert_id($conn);

    // 2. Process Financial Transaction
    if (!TransactionHelper::processBookingPayment($conn, $user_id, $vendor_info['vendor_id'], $booking_id, $total_price)) {
        throw new Exception('Payment processing failed. Please check your balance.');
    }
    
    // Update Room Status and clear locks
    db_query("UPDATE rooms SET status = 'occupied', locked_at = NULL, locked_by_session = NULL WHERE id = ?", 'i', [$room_id]);


    // Notify Vendor (Hotel Owner)
    if ($vendor_info && $vendor_info['vendor_id']) {
        $v_id = $vendor_info['vendor_id'];
        $prop_name = $vendor_info['name'];
        $title = "New Booking Request";
        $msg = "New booking for $prop_name (Room $room_id). Status: Pending.";
        
        $notif_sql = "INSERT INTO notifications (user_id, title, message, type, reference_id, created_at, is_read) VALUES (?, ?, ?, 'booking_new', ?, NOW(), 0)";
        db_query($notif_sql, 'issi', [$v_id, $title, $msg, $booking_id]);
    }

    // Handle Ride
    if ($vehicle_needed) {
        $passengers = (int)($input['passengers'] ?? 1);
        $luggage_needed = !empty($input['luggage_needed']) ? 1 : 0;

        // Align with journey_requests schema (pickup_latitude/longitude, dropoff_latitude/longitude, destination_name, vehicle_type, fare)
        $ride_sql = "INSERT INTO journey_requests (booking_id, user_id, pickup_latitude, pickup_longitude, dropoff_latitude, dropoff_longitude, destination_name, vehicle_type, fare, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'requested', NOW())";

        $ht_address = $room_data['hotel_address'] ?? 'Hotel Location';
        $htlat = (float)($room_data['hotel_lat'] ?? 0);
        $htlng = (float)($room_data['hotel_lng'] ?? 0);

        // If user denied geolocation, fall back to hotel coords to avoid hard failure
        $pklat = (float)($input['pickup_lat'] ?? 0);
        $pklng = (float)($input['pickup_lng'] ?? 0);
        if (!$pklat || !$pklng) {
            $pklat = $htlat;
            $pklng = $htlng;
        }
        
        if (!db_query($ride_sql, 'iidddsssd', [$booking_id, $_SESSION['user_id'], $pklat, $pklng, $htlat, $htlng, $ht_address, $vehicle_type, $vehicle_price])) {
            throw new Exception('Failed to create ride request');
        }
    }

    mysqli_commit($conn);
    send_json(['success' => true, 'booking_id' => $booking_id]);

} catch (Exception $e) {
    mysqli_rollback($conn);
    send_json(['success' => false, 'message' => $e->getMessage()]);
}
?>
