<?php
/**
 * Finalize Booking Helper
 * Checks for a pending booking in session and creates it for the authenticated user.
 */

function finalizeBooking($conn, $user_id) {
    if (!isset($_SESSION['pending_booking']) || empty($_SESSION['pending_booking'])) {
        return null;
    }

    $input = $_SESSION['pending_booking'];
    $booking_id = 0;

    // Extract Data
    $hotel_id = (int)($input['hotel_id'] ?? $input['property_id'] ?? 0);
    $room_type_id = (int)($input['room_type_id'] ?? 0);
    $check_in_date = $input['check_in_date'] ?? '';
    $booked_hours = (int)($input['booked_hours'] ?? 0);
    $guests = (int)($input['guests'] ?? 1);
    $vehicle_needed = !empty($input['vehicle_needed']);
    $vehicle_type = strtolower($input['vehicle_type'] ?? '');
    $pickup_lat = (float)($input['pickup_lat'] ?? 0);
    $pickup_lng = (float)($input['pickup_lng'] ?? 0);
    $guest_name = $input['guest_name'] ?? '';
    $guest_email = $input['guest_email'] ?? '';
    $guest_phone = $input['guest_phone'] ?? '';
    $is_emergency = !empty($input['is_emergency']) ? 1 : 0;

    if ($vehicle_type === 'bike') $vehicle_type = 'motorbike';


    // Fetch Room & Price Data
    $query = "SELECT rt.base_price_per_hour, rt.capacity, p.address as hotel_address, p.latitude as hotel_lat, p.longitude as hotel_lng, p.vendor_id, p.name as hotel_name 
              FROM room_types rt 
              JOIN hotels p ON rt.hotel_id = p.id
              WHERE rt.id = ? AND rt.hotel_id = ?";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, 'ii', $room_type_id, $hotel_id);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);

    if (!$res || mysqli_num_rows($res) === 0) {
        unset($_SESSION['pending_booking']);
        return ['success' => false, 'message' => 'Invalid room or hotel'];
    }
    $room_data = mysqli_fetch_assoc($res);

    // Pricing Calculation
    $room_price = $booked_hours * $room_data['base_price_per_hour'];
    $vehicle_price = 0;
    if ($vehicle_needed) {
        $vehicle_price = ($input['estimated_ride_fare'] ?? 0);
        if ($vehicle_price <= 0 && $pickup_lat && $pickup_lng && !empty($room_data['hotel_lat'])) {
            // Approx calc
            $dist = 5; // Default fallback km
            $vehicle_price = 100 + ($dist * 20); 
        }
        if ($vehicle_price <= 0) $vehicle_price = 150;
    }
    $total_price = $room_price + $vehicle_price;
    
    // Times
    $check_in_ts = strtotime($check_in_date);
    $check_out_ts = $check_in_ts + ($booked_hours * 3600);
    $check_in_time = date('Y-m-d H:i:s', $check_in_ts);
    $check_out_time = date('Y-m-d H:i:s', $check_out_ts);

    // Transaction
    mysqli_begin_transaction($conn);
    try {
        // Find Room
        $room_query = "SELECT id FROM rooms WHERE room_type_id = ? AND status = 'available' LIMIT 1 FOR UPDATE";
        $stmt_room = mysqli_prepare($conn, $room_query);
        mysqli_stmt_bind_param($stmt_room, 'i', $room_type_id);
        mysqli_stmt_execute($stmt_room);
        $room_res = mysqli_stmt_get_result($stmt_room);
        
        if (!$room_res || mysqli_num_rows($room_res) === 0) {
            throw new Exception('No rooms available for this booking');
        }
        $room = mysqli_fetch_assoc($room_res);
        $room_id = $room['id'];

        // Insert Booking
        $sql = "INSERT INTO bookings (user_id, guest_name, guest_email, guest_phone, room_id, check_in_time, check_out_time, total_hours, booked_hours, total_price, booking_status, payment_status, is_emergency, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, NOW())";
        
        $insert_stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($insert_stmt, 'isssissiddi', $user_id, $guest_name, $guest_email, $guest_phone, $room_id, $check_in_time, $check_out_time, $booked_hours, $booked_hours, $total_price, $is_emergency);
        
        if (!mysqli_stmt_execute($insert_stmt)) {
            throw new Exception('Failed to insert booking');
        }
        $booking_id = mysqli_insert_id($conn);

        // Update Room
        db_query("UPDATE rooms SET status = 'occupied', locked_at = NULL, locked_by_session = NULL WHERE id = ?", 'i', [$room_id]);

        // Notifications (Simplified)
        if ($room_data['vendor_id']) {
            $msg = "New booking for {$room_data['hotel_name']}.";
            db_query("INSERT INTO notifications (user_id, title, message, type, reference_id, created_at) VALUES (?, 'New Booking', ?, 'booking_new', ?, NOW())", 'isi', [$room_data['vendor_id'], $msg, $booking_id]);
        }

        // Ride Request
        if ($vehicle_needed) {
            $ride_sql = "INSERT INTO journey_requests (booking_id, user_id, pickup_address, pickup_latitude, pickup_longitude, dropoff_latitude, dropoff_longitude, destination_name, vehicle_type, distance, fare, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'requested', NOW())";
            $htlat = (float)$room_data['hotel_lat'];
            $htlng = (float)$room_data['hotel_lng'];
            $pklat = $pickup_lat ?: $htlat;
            $pklng = $pickup_lng ?: $htlng;
            $pickup_address = $room_data['hotel_address'] ?? 'Hotel Location';
            
            // Calculate distance using haversine formula
            $earth_radius = 6371;
            $dLat = deg2rad($htlat - $pklat);
            $dLon = deg2rad($htlng - $pklng);
            $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($pklat)) * cos(deg2rad($htlat)) * sin($dLon/2) * sin($dLon/2);
            $c = 2 * atan2(sqrt($a), sqrt(1-$a));
            $distance = $earth_radius * $c;
            
            // use db_query wrapper if consistent, otherwise prepare
            db_query($ride_sql, 'iisddddssdd', [$booking_id, $user_id, $pickup_address, $pklat, $pklng, $htlat, $htlng, $room_data['hotel_address'], $vehicle_type, $distance, $vehicle_price]);
        }

        mysqli_commit($conn);
        unset($_SESSION['pending_booking']);
        
        return ['success' => true, 'booking_id' => $booking_id];

    } catch (Exception $e) {
        mysqli_rollback($conn);
        return ['success' => false, 'message' => $e->getMessage()];
    }
}
?>
