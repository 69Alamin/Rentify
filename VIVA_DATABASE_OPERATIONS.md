# Database Operations - Viva Questions & Answers

## Question 1: Hotel Booking CRUD Operations & Visibility

**Question:** 
When a customer creates a booking in the Rentify system, explain the complete CRUD cycle and how the booking visibility changes for different stakeholders. Specifically:
- How is the booking created (CREATE)?
- Who can view it (READ)?
- How can the booking be updated (UPDATE)?
- When should it be deleted (DELETE)?

**Answer:**
**CREATE:** When a customer creates a booking via `POST /api/bookings/create`:
- New record is inserted into `bookings` table with status 'pending'
- Room availability is updated in `rooms` table
- Entry is logged in transaction history

**READ (Visibility):**
- **Customer:** Can view their own booking via user ID
- **Vendor:** Can view bookings for their property (via hotel_id)
- **Admin:** Can view all bookings with full details
- Query: `SELECT * FROM bookings WHERE user_id = ? AND booking_id = ?`

**UPDATE:** Booking details can be modified:
- Room extension: Updates `check_out` date (via `PUT /api/bookings/extend`)
- Check-in/Check-out: Updates `check_in_status`, `is_checked_in` fields
- Booking cancellation: Updates `status` to 'cancelled' (via `DELETE /api/bookings/cancel`)
- Only customers and admins can update (authorization check needed)

**DELETE:** Soft delete approach:
- Record not physically deleted but marked as 'cancelled'
- Keeps audit trail intact
- Data remains in database for financial/legal records

---

## Question 2: Food Order Status Updates & Stakeholder Visibility

**Question:**
A vendor creates a food order for a guest. Explain how the order moves through different statuses and what database operations occur at each stage. Who can see what information at each stage?

**Answer:**
**Database Schema:**
```
food_orders table:
- order_id (PK)
- user_id (FK)
- hotel_id (FK)
- status (pending → preparing → ready → delivered → completed)
- created_at, updated_at
- items (JSON or separate table)
```

**Status Flow & Visibility:**

1. **PENDING (CREATE)** - `POST /api/food/order`
   - Order inserted with `status = 'pending'`
   - Visible to: Guest (customer), Vendor, Admin
   - Guest sees: Order confirmation, estimated time
   - Vendor sees: Order details, preparation queue
   - DB Query: `INSERT INTO food_orders VALUES (...)`

2. **PREPARING (UPDATE)** - Vendor updates status
   - `UPDATE food_orders SET status = 'preparing' WHERE order_id = ?`
   - Visible to: Guest receives notification
   - Guest sees: Real-time status update ("Your food is being prepared")
   - DB Query triggers notification entry in `notifications` table

3. **READY (UPDATE)**
   - `UPDATE food_orders SET status = 'ready' WHERE order_id = ?`
   - Visible to: Guest receives alert for pickup
   - Guest notification: "Your order is ready for pickup"
   - All stakeholders can see it in their respective dashboards

4. **DELIVERED/COMPLETED (UPDATE)**
   - `UPDATE food_orders SET status = 'completed', updated_at = NOW()`
   - Transaction completed, revenue recorded
   - Visible in: Vendor earnings, Admin analytics

**Key Database Operations:**
- **READ:** `SELECT * FROM food_orders WHERE user_id = ? ORDER BY created_at DESC`
- **UPDATE:** Status transitions logged with timestamps
- **Audit Trail:** Every status change recorded with `updated_at` timestamp
- **Authorization Check:** Vendors can only update orders for their hotel

---

## Question 3: Ride Request - Real-Time Visibility & Data Consistency

**Question:**
When a customer requests a ride, explain the database operations that occur, how the ride becomes visible to available riders, and what happens when a rider accepts. Address data consistency concerns.

**Answer:**
**Scenario:** Customer requests a ride from Hotel A to Airport

**Database Operations:**

1. **CREATE Ride Request**
```sql
INSERT INTO rides (user_id, pickup_location, dropoff_location, status, created_at)
VALUES (123, 'Hotel A', 'Airport', 'pending', NOW())
-- Returns ride_id = 456
```
- Status: 'pending'
- Visible only to: Requester (customer), Admin
- Timestamp recorded for tracking

2. **FETCH Available Riders (READ)**
```sql
SELECT r.* FROM riders r
WHERE r.is_available = 1
AND r.current_location NEAR pickup_location (radius: 5km)
AND r.status = 'active'
```
- Database returns list of eligible riders
- Each rider's app pings for new rides
- Real-time filtering based on availability

3. **Rider Accepts (UPDATE with Transaction)**
```sql
START TRANSACTION;
UPDATE rides SET status = 'accepted', rider_id = 789, accepted_at = NOW() WHERE ride_id = 456;
UPDATE riders SET is_available = 0 WHERE rider_id = 789;
INSERT INTO transactions (ride_id, amount, status) VALUES (456, 250, 'pending');
COMMIT;
```
- **Critical:** This must be atomic (all-or-nothing)
- If any step fails, entire transaction rolls back
- Prevents double-booking (two riders accepting same ride)
- Rider becomes unavailable immediately

4. **Visibility After Acceptance**
- **Customer sees:** Rider name, vehicle, live location tracking
- **Rider sees:** Customer location, pickup details, destination
- **Admin sees:** All ride details with real-time updates
- Database fetches updated every 10-30 seconds

**Data Consistency Concerns Addressed:**
- **Race condition prevention:** TRANSACTION LOCK prevents duplicate acceptances
- **Stale data handling:** Timestamps validated, outdated records ignored
- **Audit trail:** All state changes logged with timestamps

---

## Question 4: Review Visibility & Moderation System

**Question:**
When a guest posts a review for a hotel, explain the database operations, review visibility to different stakeholders, and how an admin can moderate or hide inappropriate reviews. What's the impact on the hotel's ratings?

**Answer:**
**Database Schema:**
```
reviews table:
- review_id (PK)
- hotel_id (FK)
- user_id (FK)
- rating (1-5)
- comment (text)
- status (pending → approved → rejected → hidden)
- created_at, updated_at
- is_approved (boolean)
```

**Complete Flow:**

1. **CREATE Review** - `POST /api/reviews/add_review`
```sql
INSERT INTO reviews (hotel_id, user_id, rating, comment, status, is_approved)
VALUES (50, 123, 4, 'Great hotel!', 'pending', 0)
```
- Status: 'pending' (awaiting moderation)
- **Visibility:** Hidden from public (not approved yet)
- Only visible to: Hotel vendor, Admin
- Customer can see their own review

2. **READ - Public Visibility (Before Approval)**
```sql
-- Public users cannot see pending reviews
SELECT * FROM reviews WHERE hotel_id = 50 AND is_approved = 1 AND status = 'approved'
```
- Review not visible on hotel listing page yet
- Comment does not count toward average rating yet

3. **ADMIN MODERATION - UPDATE Status** - `PUT /api/admin/reviews/{id}/approve`
```sql
UPDATE reviews 
SET status = 'approved', is_approved = 1, updated_at = NOW() 
WHERE review_id = ?
```
- Admin checks for inappropriate content
- If approved → `is_approved = 1`
- If rejected → Status = 'rejected', visible only to vendor/admin

4. **READ - After Approval (Public Visibility)**
```sql
SELECT * FROM reviews WHERE hotel_id = 50 AND is_approved = 1 ORDER BY created_at DESC
```
- Review now appears on hotel detail page
- Counted in rating calculation
- Visible to: All users (public), customers, vendor, admin

5. **Rating Recalculation (READ + AGGREGATE)**
```sql
SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
FROM reviews
WHERE hotel_id = 50 AND is_approved = 1
```
- Average rating updated
- Hotel listing updated with new star rating
- Visible in search results immediately

6. **HIDE Inappropriate Review - UPDATE**
```sql
UPDATE reviews SET status = 'hidden' WHERE review_id = ?
```
- Review hidden from public but record remains
- Preserves audit trail
- Hotel rating recalculated (excluded from average)

**Stakeholder Visibility Matrix:**
| Entity | Pending | Approved | Rejected | Hidden |
|--------|---------|----------|----------|--------|
| Public Users | ❌ | ✅ | ❌ | ❌ |
| Review Author | ✅ | ✅ | ✅ | ✅ |
| Vendor | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ |

**Impact on Hotel Ratings:**
- Only `is_approved = 1` reviews count
- Hidden reviews excluded from average calculation
- Rating updates in real-time
- Incentivizes vendors to manage reputation

---

## Question 5: Multi-Table Transaction - Booking with Payment & Notification

**Question:**
When a customer completes a hotel booking with payment, multiple tables are involved: bookings, transactions, rooms, and notifications. Explain the complete database operations ensuring data integrity and how all stakeholders are notified about the transaction.

**Answer:**
**Database Tables Involved:**
- `bookings` - Booking records
- `transactions` - Payment records
- `rooms` - Room inventory
- `notifications` - System alerts
- `users` - Customer data

**Complete Transaction Flow:**

**1. BOOKING CREATION & PAYMENT (Atomic Transaction)**
```sql
START TRANSACTION;

-- Step 1: Create booking record
INSERT INTO bookings (user_id, hotel_id, room_id, check_in, check_out, status)
VALUES (123, 50, 201, '2026-02-01', '2026-02-03', 'pending');
SET @booking_id = LAST_INSERT_ID();

-- Step 2: Calculate amount & insert transaction
INSERT INTO transactions 
(booking_id, user_id, vendor_id, amount, status, transaction_type, created_at)
VALUES (@booking_id, 123, 50, 5000, 'pending', 'booking_payment', NOW());
SET @transaction_id = LAST_INSERT_ID();

-- Step 3: Update room availability
UPDATE rooms 
SET is_available = 0, booked_until = '2026-02-03'
WHERE room_id = 201;

-- Step 4: Update booking status to confirmed
UPDATE bookings 
SET status = 'confirmed'
WHERE booking_id = @booking_id;

-- Step 5: Create notification for customer
INSERT INTO notifications (user_id, type, message, entity_type, entity_id, created_at)
VALUES (123, 'booking_confirmed', 'Your booking is confirmed!', 'booking', @booking_id, NOW());

-- Step 6: Create notification for vendor
INSERT INTO notifications (user_id, type, message, entity_type, entity_id, created_at)
VALUES (50, 'new_booking', 'New booking received', 'booking', @booking_id, NOW());

-- Step 7: Create notification for admin
INSERT INTO notifications (user_id, type, message, entity_type, entity_id, created_at)
VALUES (1, 'booking_transaction', 'New transaction processed', 'transaction', @transaction_id, NOW());

COMMIT;
```

**Data Integrity Safeguards:**

| Operation | Risk | Solution |
|-----------|------|----------|
| Double booking same room | Two bookings for same room/dates | `UNIQUE(room_id, check_in, check_out)` constraint |
| Payment without room reservation | Orphaned transaction | Transaction LOCK until commit |
| Incomplete update | Partial state | TRANSACTION (all-or-nothing) |
| Failed notification | Stakeholder not informed | Queue-based retry mechanism |

**2. READ - Stakeholder Visibility After Completion**

**Customer View:**
```sql
SELECT b.*, r.room_number, h.hotel_name, t.amount, t.status
FROM bookings b
JOIN rooms r ON b.room_id = r.id
JOIN hotels h ON b.hotel_id = h.id
JOIN transactions t ON b.booking_id = t.booking_id
WHERE b.user_id = 123 AND b.booking_id = @booking_id
```
- Sees: Booking confirmation, room details, payment status
- Notification: "Booking confirmed - Booking ID: XYZ"

**Vendor View:**
```sql
SELECT b.*, u.name as guest_name, r.room_number, t.amount
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN rooms r ON b.room_id = r.id
JOIN transactions t ON b.booking_id = t.booking_id
WHERE b.hotel_id = 50 AND b.booking_id = @booking_id
```
- Sees: Guest details, room allocation, payment received
- Notification: "New booking from Guest Name - Check-in: 2026-02-01"

**Admin View:**
```sql
SELECT b.*, u.name, h.hotel_name, r.room_number, t.amount, t.status, t.transaction_id
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN hotels h ON b.hotel_id = h.id
JOIN rooms r ON b.room_id = r.id
JOIN transactions t ON b.booking_id = t.booking_id
WHERE b.booking_id = @booking_id
```
- Sees: Complete transaction audit trail
- Can track: Payment, commission, platform revenue

**3. Room Availability UPDATE**
- Before booking: Room shows as available
- After confirmation: Marked unavailable for booked dates
- Query for availability check:
```sql
SELECT * FROM rooms 
WHERE hotel_id = 50 
AND is_available = 1
AND room_id NOT IN (
    SELECT room_id FROM bookings 
    WHERE hotel_id = 50
    AND status IN ('confirmed', 'checked_in')
    AND check_in <= '2026-02-03'
    AND check_out >= '2026-02-01'
)
```

**4. Notification Status Tracking**
```sql
-- Customer receives notifications
SELECT * FROM notifications 
WHERE user_id = 123 
AND entity_type = 'booking' 
AND entity_id = @booking_id
ORDER BY created_at DESC;

-- Mark as read
UPDATE notifications 
SET is_read = 1 
WHERE id IN (SELECT id FROM notifications WHERE user_id = 123 AND booking_id = @booking_id)
```

**5. Transaction Reversal (if needed - ROLLBACK)**
```sql
-- If payment fails or customer cancels within grace period
START TRANSACTION;

UPDATE bookings SET status = 'cancelled' WHERE booking_id = @booking_id;
UPDATE transactions SET status = 'refunded' WHERE booking_id = @booking_id;
UPDATE rooms SET is_available = 1 WHERE room_id = 201;
INSERT INTO notifications (user_id, type, message) 
VALUES (123, 'booking_cancelled', 'Your booking has been cancelled. Refund initiated.');

COMMIT;
```

**Key Takeaways:**
- ✅ All operations in one TRANSACTION (Atomic)
- ✅ Room availability checked and locked immediately
- ✅ Multiple stakeholders notified simultaneously
- ✅ Complete audit trail maintained
- ✅ Rollback capability for error handling
- ✅ Visibility controlled by role-based access

---

## Summary Table: Database Operations

| Operation | Tables Affected | Visibility Control | Transaction Type |
|-----------|-----------------|-------------------|------------------|
| Hotel Booking | bookings, rooms, transactions | Role-based | WRITE (INSERT/UPDATE) |
| Food Order | food_orders, notifications | Status-based | WRITE (INSERT/UPDATE) |
| Ride Request | rides, riders, transactions | Real-time sync | WRITE (UPDATE) + LOCK |
| Review Posting | reviews, hotel_ratings | Approval-based | WRITE (INSERT/UPDATE) |
| Complete Booking | bookings, transactions, rooms, notifications | Multi-stakeholder | TRANSACTION (Multiple) |

---

**Interview Tips:**
- Emphasize **data integrity** and **ACID properties**
- Discuss **role-based access control** (visibility)
- Mention **transaction handling** and **race conditions**
- Explain **audit trails** for compliance
- Talk about **notifications** as part of database design
- Always consider **edge cases** and **error scenarios**
