/**
 * Rider API Service
 * Handles all API calls to backend rider endpoints
 */

const API_BASE = '/api/rider';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API call failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ============= PROFILE ENDPOINTS =============

export const riderApi = {
  // Profile Management
  getProfile: () => apiCall('profile.php?action=get_profile'),

  saveProfile: (profileData) => apiCall('profile.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'save_profile', ...profileData }),
  }),

  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append('action', 'upload_photo');
    formData.append('photo', file);

    return fetch(`${API_BASE}/profile.php`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    }).then(res => res.json());
  },

  getAllRiders: () => apiCall('profile.php?action=get_all_riders'),

  approveRider: (riderId, status) => apiCall('profile.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'approve_rider', rider_id: riderId, status }),
  }),

  toggleRiderStatus: (riderId, isActive) => apiCall('profile.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'toggle_rider_status', rider_id: riderId, is_active: isActive }),
  }),

  getStats: () => apiCall('profile.php?action=get_stats'),

  // Availability Management
  toggleOnline: (isOnline, latitude, longitude) => apiCall('availability.php', {
    method: 'POST',
    body: JSON.stringify({
      action: 'toggle_online',
      is_online: isOnline ? 1 : 0,
      latitude,
      longitude,
    }),
  }),

  getAvailabilityStatus: () => apiCall('availability.php?action=get_status'),

  setWorkingHours: (startTime, endTime) => apiCall('availability.php', {
    method: 'POST',
    body: JSON.stringify({
      action: 'set_working_hours',
      start_time: startTime,
      end_time: endTime,
    }),
  }),

  updateLocation: (latitude, longitude, accuracy = null, speed = null) => apiCall('availability.php', {
    method: 'POST',
    body: JSON.stringify({
      action: 'update_location',
      latitude,
      longitude,
      accuracy,
      speed,
    }),
  }),

  getNearbyRiders: (latitude, longitude, radius = 5) => apiCall('availability.php', {
    method: 'POST',
    body: JSON.stringify({
      action: 'get_nearby',
      latitude,
      longitude,
      radius,
    }),
  }),

  getOnlineRiders: () => apiCall('availability.php?action=get_online_riders'),

  // Ride Request Management
  sendRideRequest: (customerId, pickupLat, pickupLng, dropoffLat, dropoffLng, vehicleType, rideType) =>
    apiCall('request.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'send_ride_request',
        customer_id: customerId,
        pickup_latitude: pickupLat,
        pickup_longitude: pickupLng,
        dropoff_latitude: dropoffLat,
        dropoff_longitude: dropoffLng,
        vehicle_type: vehicleType,
        ride_type: rideType,
      }),
    }),

  acceptRide: (rideId) => apiCall('request.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'accept_ride', ride_id: rideId }),
  }),

  rejectRide: (rideId, reason) => apiCall('request.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'reject_ride', ride_id: rideId, reason }),
  }),

  getPendingRides: () => apiCall('request.php?action=get_pending_rides'),

  getActiveRides: () => apiCall('request.php?action=get_active_rides'),

  // Ride Status Management
  updateRideStatus: (rideId, status) => apiCall('status.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'update_status', ride_id: rideId, status }),
  }),

  getRideStatus: (rideId) => apiCall(`status.php?action=get_status&ride_id=${rideId}`),

  cancelRide: (rideId, reason) => apiCall('status.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'cancel_ride', ride_id: rideId, reason }),
  }),

  getRideHistory: (page = 1, limit = 20) =>
    apiCall(`status.php?action=get_history&page=${page}&limit=${limit}`),

  // Earnings & Wallet
  getWalletBalance: () => apiCall('earnings.php?action=wallet_balance'),

  getEarningsSummary: (period = 'daily') =>
    apiCall(`earnings.php?action=earnings_summary&period=${period}`),

  getEarningsDetails: (page = 1, limit = 20) =>
    apiCall(`earnings.php?action=earnings_details&page=${page}&limit=${limit}`),

  getTransactionHistory: (page = 1, limit = 20) =>
    apiCall(`earnings.php?action=transaction_history&page=${page}&limit=${limit}`),

  requestWithdrawal: (amount, bankName, accountNumber, ifscCode) =>
    apiCall('earnings.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'request_withdrawal',
        amount,
        bank_name: bankName,
        account_number: accountNumber,
        ifsc_code: ifscCode,
      }),
    }),

  getWithdrawalRequests: () => apiCall('earnings.php?action=withdrawal_requests'),

  processWithdrawal: (withdrawalId, status, notes = '') =>
    apiCall('earnings.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'process_withdrawal',
        withdrawal_id: withdrawalId,
        status,
        notes,
      }),
    }),

  // Notifications
  getNotifications: (page = 1, limit = 10) =>
    apiCall(`notifications.php?action=get_notifications&page=${page}&limit=${limit}`),

  markAsRead: (notificationIds = null) =>
    apiCall('notifications.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'mark_as_read',
        notification_ids: notificationIds,
      }),
    }),

  deleteNotification: (notificationId) =>
    apiCall('notifications.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'delete_notification',
        notification_id: notificationId,
      }),
    }),

  getUnreadCount: () => apiCall('notifications.php?action=unread_count'),

  // Documents & Ratings
  uploadDocument: (file, documentType, expiryDate) => {
    const formData = new FormData();
    formData.append('action', 'upload_document');
    formData.append('document', file);
    formData.append('document_type', documentType);
    formData.append('expiry_date', expiryDate);

    return fetch(`${API_BASE}/documents_ratings.php`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    }).then(res => res.json());
  },

  getDocuments: () => apiCall('documents_ratings.php?action=get_documents'),

  verifyDocument: (documentId, status, notes = '') =>
    apiCall('documents_ratings.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'verify_document',
        document_id: documentId,
        status,
        notes,
      }),
    }),

  submitRating: (rideId, rating, category, review = '') =>
    apiCall('documents_ratings.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'submit_rating',
        ride_id: rideId,
        rating,
        category,
        review,
      }),
    }),

  getRatings: (page = 1, limit = 10) =>
    apiCall(`documents_ratings.php?action=get_ratings&page=${page}&limit=${limit}`),
};

export default riderApi;
