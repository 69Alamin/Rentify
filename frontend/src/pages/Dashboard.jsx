import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, Loader, AlertCircle, Plus, Truck, Navigation, CheckCircle, Package, Send, X, Zap, Star, ShieldCheck, Phone, TrendingUp, User, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PendingBookingCard from '../components/PendingBookingCard.jsx';
import EmbeddedNavigation from '../components/EmbeddedNavigation.jsx';
import ChatModal from '../mobile/components/ChatModal.jsx';
import { useModal } from '../context/ModalContext';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const Dashboard = () => {
    const navigate = useNavigate();
    const { showSuccess, showError, showConfirm } = useModal();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    // Ride state
    const [rideBooking, setRideBooking] = useState(null);
    const [rideDest, setRideDest] = useState('');
    const [destCoords, setDestCoords] = useState(null); // { lat, lng }
    const [vehicleType, setVehicleType] = useState('car');
    const [estimation, setEstimation] = useState(null);
    const [requestingRide, setRequestingRide] = useState(false);
    const [showRideSuccess, setShowRideSuccess] = useState(false);

    // Extension state
    const [extendingId, setExtendingId] = useState(null);
    const [extendHours, setExtendHours] = useState(1);
    const [extendLoading, setExtendLoading] = useState(false);

    // Check-in state
    const [checkingInId, setCheckingInId] = useState(null);
    const [showCheckInSuccess, setShowCheckInSuccess] = useState(false);

    // Check-out state
    const [checkingOutId, setCheckingOutId] = useState(null);
    const [showCheckOutSuccess, setShowCheckOutSuccess] = useState(false);
    const [checkOutConfirmBooking, setCheckOutConfirmBooking] = useState(null);

    // Food state
    const [foodBooking, setFoodBooking] = useState(null);
    const [activeOrders, setActiveOrders] = useState([]);
    const [menu, setMenu] = useState([]);
    const [cart, setCart] = useState({});
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [rides, setRides] = useState([]);
    const [timeline, setTimeline] = useState([]);

    // Modal state
    const [searchParams, setSearchParams] = useSearchParams();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showFoodSuccess, setShowFoodSuccess] = useState(false);
    const [ratingRide, setRatingRide] = useState(null);
    const [starRating, setStarRating] = useState(5);
    const [submittingRating, setSubmittingRating] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedRide, setSelectedRide] = useState(null);
    const [showRideMap, setShowRideMap] = useState(false);
    const [chatTarget, setChatTarget] = useState(null); // { id, name, contextId, contextType }

    // Hotel Review state
    const [reviewBooking, setReviewBooking] = useState(null);
    const [hotelRating, setHotelRating] = useState(5);
    const [hotelComment, setHotelComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    // Pending Booking Confirmation
    const [confirmingBooking, setConfirmingBooking] = useState(false);

    const isBrowser = typeof window !== 'undefined';

    // Leaflet default icon fix
    const defaultIcon = new L.Icon({
        iconUrl: icon,
        shadowUrl: iconShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = defaultIcon;

    const getImageUrl = (url) => {
        if (!url || url === 'assets/default_property.jpg') return '/assets/default_hotel.png';
        if (typeof url === 'string' && url.startsWith('http')) return url;
        const cleanUrl = typeof url === 'string' ? (url.startsWith('/') ? url.substring(1) : url) : '';
        return `/${cleanUrl}`;
    };

    useEffect(() => {
        if (rideBooking && rideDest) {
            const timer = setTimeout(() => fetchEstimation(), 500);
            return () => clearTimeout(timer);
        }
    }, [rideDest, vehicleType, rideBooking]);

    useEffect(() => {
        if (searchParams.get('booking') === 'success') {
            setShowSuccessModal(true);
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('booking');
            setSearchParams(newParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const fetchBookings = async () => {
        try {
            // Fetch User for Balance update
            const userRes = await fetch('/api/auth/me.php', { credentials: 'include' });
            const userData = await userRes.json();
            if (userData.authenticated) setUser(userData.user);

            const res = await fetch('/api/bookings/list.php', { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                // Sort bookings: active first, then confirmed, then others
                const priority = { 'active': 0, 'confirmed': 1, 'pending': 2, 'completed': 3, 'cancelled': 4 };
                const sorted = [...data.data].sort((a, b) => {
                    const aPriority = priority[a.booking_status] ?? 5;
                    const bPriority = priority[b.booking_status] ?? 5;
                    return aPriority - bPriority;
                });
                setBookings(sorted);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        const interval = setInterval(fetchBookings, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/food/order.php', { credentials: 'include' });
                const data = await res.json();
                if (data.success) {
                    setActiveOrders(prev => {
                        const newOrders = data.data.filter(o => ['pending', 'accepted', 'cooking', 'ready'].includes(o.status));
                        if (prev.length > 0) {
                            newOrders.forEach(no => {
                                const old = prev.find(po => po.id === no.id);
                                if (old && old.status !== no.status) {
                                    if (no.status === 'accepted') new Audio('/assets/sounds/cooking.mp3').play().catch(() => { });
                                    if (no.status === 'ready') new Audio('/assets/sounds/bell.mp3').play().catch(() => { });
                                }
                            });
                        }
                        return newOrders;
                    });
                }
            } catch (err) { }
        };
        fetchOrders();
        const fetchRides = async () => {
            try {
                const res = await fetch('/api/rides/request.php', { credentials: 'include' });
                const data = await res.json();
                if (data.success) {
                    setRides(data.data || []);
                } else {
                    console.log('Rides API error:', data.message);
                    setRides([]);
                }
            } catch (err) {
                console.error('Error fetching rides:', err);
                setRides([]);
            }
        };
        fetchRides();
        const interval = setInterval(fetchRides, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchTimeline = async () => {
        try {
            const res = await fetch('/api/user/timeline.php', { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setTimeline(data.data);
            }
        } catch (err) { }
    };

    useEffect(() => {
        fetchTimeline();
        const interval = setInterval(fetchTimeline, 15000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedRide) {
            const latest = rides.find(r => r.id === selectedRide.id);
            if (latest) setSelectedRide(latest);
        }
    }, [rides]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'completed': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const getGuidance = (status) => {
        switch (status) {
            case 'pending': return 'Waiting for host confirmation...';
            case 'confirmed': return 'Confirmed! Ready for check-in.';
            case 'active': return 'Checked-in. Enjoy your stay!';
            case 'completed': return 'Stay completed. Hope to see you again!';
            case 'cancelled': return 'This booking was cancelled.';
            default: return '';
        }
    };

    const getRideStatusColor = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'requested': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'accepted':
            case 'on_the_way':
            case 'picked': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getDistanceKm = (lat1, lng1, lat2, lng2) => {
        if (![lat1, lng1, lat2, lng2].every((v) => typeof v === 'number' && !Number.isNaN(v) && v !== 0)) return null;
        const toRad = (v) => (v * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const getRemainingTime = (checkoutTime) => {
        const diff = new Date(checkoutTime) - new Date();
        if (diff <= 0) return 'Expired';
        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${mins}m`;
    };

    const handleExtend = async (id) => {
        setExtendLoading(true);
        try {
            const res = await fetch('/api/bookings/extend.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ booking_id: id, hours: extendHours }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                showSuccess('Stay extended successfully!');
                setExtendingId(null);
                fetchBookings();
            } else {
                showError(data.message);
            }
        } catch (err) {
            showError('Extension failed');
        } finally {
            setExtendLoading(false);
        }
    };

    const handleCheckIn = async (id, forceManual = false) => {
        setCheckingInId(id);
        try {
            const res = await fetch('/api/bookings/check_in.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ booking_id: id, force_manual: forceManual }),
                credentials: 'include'
            });
            const data = await res.json();

            if (res.status === 409 && data.has_active_ride) {
                showConfirm(
                    'You have an active ride request for this booking. Would you like to cancel the ride and proceed with manual check-in?',
                    () => handleCheckIn(id, true),
                    'Active Ride Found'
                );
                return;
            }

            if (data.success) {
                setShowCheckInSuccess(true);
                setTimeout(() => {
                    setShowCheckInSuccess(false);
                    fetchBookings();
                }, 2000);
            } else {
                showError(data.message || 'Check-in failed');
            }
        } catch (err) {
            showError('Check-in error');
        } finally {
            setCheckingInId(null);
        }
    };

    const handleCheckOut = async (id) => {
        setCheckingOutId(id);
        try {
            const res = await fetch('/api/bookings/check_out.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ booking_id: id }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setShowCheckOutSuccess(true);
                setTimeout(() => {
                    setShowCheckOutSuccess(false);
                    fetchBookings();
                }, 2000);
            } else {
                showError(data.message || 'Check-out failed');
            }
        } catch (err) {
            showError('Check-out error');
        } finally {
            setCheckingOutId(null);
        }
    };

    const handleCancel = (id) => {
        showConfirm(
            'Are you sure you want to cancel this booking? This action cannot be undone.',
            async () => {
                try {
                    const res = await fetch('/api/bookings/cancel.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ booking_id: id }),
                        credentials: 'include'
                    });
                    const data = await res.json();
                    if (data.success) {
                        showSuccess('Booking cancelled successfully');
                        fetchBookings();
                    } else {
                        showError(data.message || 'Cancellation failed');
                    }
                } catch (err) {
                    showError('Cancellation failed');
                }
            },
            'Confirm Cancellation'
        );
    };

    const geocodeAddress = async (address) => {
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
            const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            }
        } catch (e) { }
        return null;
    };

    const handleEstimateFare = (type) => {
        setVehicleType(type);
        setTimeout(() => fetchEstimation(type), 0);
    };

    const fetchEstimation = async (overrideType = null) => {
        const typeToUse = overrideType || vehicleType;
        if (!rideDest || !rideBooking) return;
        try {
            // Checked-in guest is at the hotel
            const hotelLat = rideBooking.latitude;
            const hotelLng = rideBooking.longitude;

            // Geocode the destination entered by user
            const coords = await geocodeAddress(rideDest);
            if (!coords) return;

            setDestCoords(coords);

            const res = await fetch('/api/rides/estimate.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pickup_lat: hotelLat,
                    pickup_lng: hotelLng,
                    dest_lat: coords.lat,
                    dest_lng: coords.lng,
                    vehicle_type: typeToUse
                }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setEstimation(data.data);
            }
        } catch (err) {
            // Silent error for background estimation
        }
    };

    const handleRequestRide = async () => {
        setRequestingRide(true);
        try {
            // Get user's current location
            const userPosition = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            const userLat = userPosition.coords.latitude;
            const userLng = userPosition.coords.longitude;

            const res = await fetch('/api/rides/request.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    booking_id: rideBooking.id,
                    pickup_address: rideBooking.hotel_name,
                    pickup_lat: rideBooking.latitude,
                    pickup_lng: rideBooking.longitude,
                    destination_address: rideDest,
                    dest_lat: destCoords?.lat || rideBooking.latitude,
                    dest_lng: destCoords?.lng || rideBooking.longitude,
                    vehicle_type: vehicleType,
                    distance_km: estimation?.distance_km || 0,
                    estimated_fare: estimation?.estimated_fare || 0
                }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setRideBooking(null);
                setRideDest('');
                setEstimation(null);
                setShowRideSuccess(true);
            }
        } catch (err) {
            showError('Please enable location access to request a ride');
        }
        finally { setRequestingRide(false); }
    };

    const handleCancelRide = async (rideId) => {
        showConfirm("Are you sure you want to cancel this ride request?", async () => {
            try {
                const res = await fetch('/api/rides/status.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ride_id: rideId, status: 'cancelled' }),
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.success) {
                    showSuccess("Ride request cancelled");
                    setSelectedRide(null);
                    fetchBookings(); // Refresh rides list
                } else {
                    showError(data.message || "Failed to cancel ride");
                }
            } catch (err) {
                showError("Network error cancelling ride");
            }
        });
    };

    const handleRateRider = async () => {
        setSubmittingRating(true);
        try {
            const res = await fetch('/api/rides/rate_rider.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ride_id: ratingRide.id, rating: starRating }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                showSuccess('Thank you for your feedback!');
                setRatingRide(null);
                fetchBookings();
            }
        } catch (e) { }
        finally { setSubmittingRating(false); }
    };

    const handleReviewHotel = async () => {
        if (!reviewBooking) return;
        setSubmittingReview(true);
        try {
            const res = await fetch('/api/reviews/add_review.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    booking_id: reviewBooking.id,
                    rating: hotelRating,
                    comment: hotelComment
                }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                showSuccess('Thank you for your review!');
                setReviewBooking(null);
                setHotelRating(5);
                setHotelComment('');
                fetchBookings();
            } else {
                showError(data.message);
            }
        } catch (e) {
            showError('Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };



    return (
        <div className="bg-[#f8fafc] min-h-screen pt-28 pb-20 px-6 font-sans">
            <div className="container mx-auto max-w-7xl">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-2xl font-black text-secondary tracking-tight">My Profile & Trips</h1>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Manage your stays and services</p>
                    </div>
                    <button onClick={() => navigate('/hotels')} className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                        <Plus size={18} /> Book New Stay
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                    {/* Main Content Area: Bookings */}
                    <div className="lg:col-span-2 order-2 lg:order-1">
                        <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
                            <Calendar size={20} /> My Bookings
                        </h2>

                        {/* Pending Booking Confirmation Card */}
                        <PendingBookingCard onSuccess={() => fetchBookings()} />

                        {loading ? (
                            <div className="bg-white rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center border border-gray-100">
                                <Loader size={32} className="animate-spin text-primary mb-4" />
                                <p className="text-gray-500 font-medium">Fetching your bookings...</p>
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <Calendar size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">No bookings yet</h3>
                                <p className="text-gray-500 mb-6">You haven't made any bookings. Start exploring our hotels!</p>
                                <button onClick={() => navigate('/hotels')} className="text-primary font-bold hover:underline">
                                    Browse Hotels
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {bookings.map(booking => {
                                    const remaining = (booking.booking_status === 'active' || booking.booking_status === 'confirmed')
                                        ? getRemainingTime(booking.check_out_time)
                                        : null;

                                    return (
                                        <div
                                            key={booking.id}
                                            onClick={() => setSelectedBooking(booking)}
                                            className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/20 cursor-pointer flex flex-col sm:flex-row gap-6 overflow-hidden"
                                        >
                                            <div className="w-full sm:w-40 h-28 rounded-xl overflow-hidden flex-shrink-0 relative shadow-sm">
                                                <img
                                                    src={getImageUrl(booking.image_url)}
                                                    alt={booking.hotel_name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => {
                                                        console.error(`Failed to load image for ${booking.hotel_name}:`, booking.image_url);
                                                        e.target.src = '/assets/default_hotel.png';
                                                    }}
                                                />
                                                {remaining && (
                                                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                        ⏱ {remaining}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-grow relative z-10">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-lg font-black text-secondary tracking-tight">{booking.hotel_name}</h3>
                                                        <p className="text-xs text-gray-400 flex items-center gap-1.5 font-bold uppercase tracking-wider mt-0.5">
                                                            <MapPin size={12} className="text-primary" /> {booking.room_type_name}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-widest border transition-colors ${getStatusColor(booking.booking_status)}`}>
                                                        {booking.booking_status}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-bold text-gray-500 mb-4 opacity-80">{getGuidance(booking.booking_status)}</p>

                                                <div className="flex justify-between items-end mt-4">
                                                    <div className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Paid</div>
                                                        <div className="font-black text-secondary text-base italic">৳{booking.total_price}</div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {booking.booking_status === 'confirmed' && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleCheckIn(booking.id);
                                                                }}
                                                                disabled={checkingInId === booking.id}
                                                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-700 hover:text-white transition-all shadow-sm disabled:opacity-50"
                                                                title="Check In"
                                                            >
                                                                {checkingInId === booking.id ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                                            </button>
                                                        )}
                                                        {(booking.booking_status === 'pending' || booking.booking_status === 'confirmed') && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleCancel(booking.id);
                                                                }}
                                                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-700 hover:text-white transition-all shadow-sm"
                                                                title="Cancel Booking"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        )}
                                                        {booking.booking_status === 'active' && (
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    const res = await fetch(`/api/food/menu.php?hotel_id=${booking.hotel_id}`, { credentials: 'include' });
                                                                    const data = await res.json();
                                                                    if (data.success) {
                                                                        setMenu(data.data);
                                                                        setFoodBooking(booking);
                                                                    }
                                                                }}
                                                                className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm"
                                                                title="Room Service"
                                                            >
                                                                <Package size={16} />
                                                            </button>
                                                        )}
                                                        {booking.booking_status === 'active' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); navigate('/journey'); }}
                                                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-700 hover:text-white transition-all shadow-sm"
                                                                title="Alternative Journey"
                                                            >
                                                                <Navigation size={16} />
                                                            </button>
                                                        )}
                                                        {booking.booking_status === 'active' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setRideBooking(booking); }}
                                                                className="p-2 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary hover:text-white transition-all shadow-sm"
                                                                title="Request Ride"
                                                            >
                                                                <Truck size={16} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setChatTarget({
                                                                    id: booking.vendor_id,
                                                                    name: booking.hotel_name,
                                                                    contextId: booking.id,
                                                                    contextType: 'hotel'
                                                                });
                                                            }}
                                                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                            title="Message Vendor"
                                                        >
                                                            <MessageCircle size={16} />
                                                        </button>
                                                        {booking.booking_status === 'active' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setExtendingId(extendingId === booking.id ? null : booking.id); }}
                                                                className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                                                                title="Extend Stay"
                                                            >
                                                                <Clock size={16} />
                                                            </button>
                                                        )}
                                                        {booking.booking_status === 'active' && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setCheckOutConfirmBooking(booking);
                                                                }}
                                                                disabled={checkingOutId === booking.id}
                                                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-700 hover:text-white transition-all shadow-sm disabled:opacity-50"
                                                                title="Check Out"
                                                            >
                                                                {checkingOutId === booking.id ? <Loader size={16} className="animate-spin" /> : <X size={16} />}
                                                            </button>
                                                        )}
                                                        {booking.booking_status === 'completed' && !booking.reviewed && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setReviewBooking(booking);
                                                                }}
                                                                className="px-3 py-1 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-all text-xs font-black flex items-center gap-1 shadow-sm"
                                                            >
                                                                <Star size={12} fill="currentColor" /> RATE STAY
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Extend Form */}
                                                {extendingId === booking.id && (
                                                    <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex-grow">
                                                                <label className="text-xs font-black text-gray-400 uppercase mb-1 block">Add Hours</label>
                                                                <select
                                                                    value={extendHours}
                                                                    onChange={(e) => setExtendHours(parseInt(e.target.value))}
                                                                    className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-xs font-bold"
                                                                >
                                                                    {[1, 2, 3, 4, 5, 24].map(h => (
                                                                        <option key={h} value={h}>+{h} hr</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <button
                                                                onClick={() => handleExtend(booking.id)}
                                                                disabled={extendLoading}
                                                                className="mt-5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-primary-hover shadow-sm"
                                                            >
                                                                {extendLoading ? <Loader size={12} className="animate-spin" /> : 'Pay'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}


                    </div>

                    {/* Sidebar Area: Orders & Quick Stats */}
                    <div className="lg:col-span-1 space-y-8 order-1 lg:order-2">
                        {/* Wallet Card */}
                        <div className="bg-secondary rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl -mr-16 -mt-16"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                                        <TrendingUp size={20} />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-[0.2em] bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/5">Account Balance</span>
                                </div>
                                <div className="text-xs font-bold opacity-60 mb-1 uppercase tracking-widest">Available Credit</div>
                                <div className="text-3xl font-black tracking-tight mb-4 italic">
                                    ৳{user?.balance?.toLocaleString() || '0'}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="bg-white text-secondary py-2 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-white/90 transition-all">Add Funds</button>
                                    <button className="bg-white/10 hover:bg-white/20 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all border border-white/5">History</button>
                                </div>
                            </div>
                        </div>

                        {/* My Rides (History) */}
                        <div>
                            <h2 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                                <Truck size={18} className="text-primary" /> Recent Rides
                            </h2>
                            {rides.length === 0 ? (
                                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                                        <Truck size={24} />
                                    </div>
                                    <p className="text-sm text-gray-500">No rides yet</p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {rides.slice(0, 5).map(ride => (
                                        <div
                                            key={ride.id}
                                            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
                                            onClick={() => setSelectedRide(ride)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${getRideStatusColor(ride.status)}`}>
                                                        {String(ride.status || '').replace('_', ' ')}
                                                    </div>
                                                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${(ride.booking_id && ride.booking_id > 0) ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-purple-100 text-purple-700 border border-purple-200'}`}>
                                                        {(ride.booking_id && ride.booking_id > 0) ? 'Booking' : 'Journey'}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Fare</div>
                                                    <div className="font-black text-primary italic text-sm">৳{ride.estimated_fare || ride.fare || 0}</div>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-600 flex justify-between items-center">
                                                <div>
                                                    <div className="font-bold text-secondary">{ride.pickup_address || 'Hotel'}</div>
                                                    <div className="text-xs text-gray-400">to {ride.destination_address || ride.destination_name || 'Destination'}</div>
                                                </div>
                                                <div className="text-right text-xs text-gray-400">
                                                    {ride.created_at ? new Date(ride.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>



                        {/* Active Food Orders Tracker */}
                        <div>
                            <h2 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                                <Clock size={18} className="text-primary" /> Active Orders
                            </h2>

                            {activeOrders.length === 0 ? (
                                <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                                        <Package size={24} />
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium tracking-tight">No active orders</p>
                                    <p className="text-xs text-gray-300 mt-1">Order food from your active booking</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {activeOrders.map(order => (
                                        <div
                                            key={order.id}
                                            onClick={() => setSelectedOrder(order)}
                                            className="glass-card rounded-[2rem] p-6 shadow-aura-sm relative overflow-hidden group hover:border-primary/50 transition-all cursor-pointer hover:shadow-aura-md"
                                        >
                                            {/* Progress Bar Background */}
                                            <div className="absolute top-0 left-0 h-1 bg-gray-50 w-full">
                                                <div
                                                    className="h-full bg-primary transition-all duration-1000 ease-out"
                                                    style={{ width: order.status === 'pending' ? '10%' : order.status === 'accepted' ? '30%' : order.status === 'cooking' ? '60%' : order.status === 'ready' ? '90%' : '100%' }}
                                                ></div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xl flex-shrink-0 animate-pulse">
                                                    {order.status === 'cooking' ? '🔥' : order.status === 'ready' ? '🔔' : '🍽️'}
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <h3 className="font-bold text-secondary text-sm">Order #{order.id}</h3>
                                                        <span className="font-black text-primary text-xs tracking-tight">৳{order.total_amount}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">
                                                        {order?.status === 'accepted' || order?.status === 'cooking'
                                                            ? `Cooking (eta: ${order?.estimated_min || 15}m)`
                                                            : order?.status || 'PENDING'}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 truncate">
                                                        {(() => {
                                                            try {
                                                                const items = JSON.parse(order.items_json);
                                                                return Array.isArray(items) ? items.map(i => `${i.name}`).join(', ') : 'Items';
                                                            } catch (e) {
                                                                return 'Items';
                                                            }
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Journey Timeline (Unified Activity) */}
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
                                <TrendingUp size={20} className="text-primary" /> Journey Timeline
                            </h2>
                            {timeline.length === 0 ? (
                                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 italic text-gray-400 text-sm">
                                    Your journey history will appear here
                                </div>
                            ) : (
                                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                                    <div className="absolute left-[2.75rem] top-10 bottom-10 w-0.5 bg-gray-100 z-0"></div>
                                    <div className="space-y-8 relative z-10">
                                        {timeline.map((event, idx) => (
                                            <div key={idx} className="flex gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${event.type === 'hotel' ? 'bg-indigo-600 text-white' :
                                                    event.type === 'ride' ? 'bg-emerald-600 text-white' :
                                                        event.type === 'food' ? 'bg-violet-600 text-white' :
                                                            'bg-slate-700 text-white'
                                                    }`}>
                                                    {event.type === 'hotel' ? <Calendar size={18} /> :
                                                        event.type === 'ride' ? <Truck size={18} /> :
                                                            event.type === 'food' ? <Package size={18} /> :
                                                                <Clock size={18} />}
                                                </div>
                                                <div className="min-w-0 flex-grow">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <h4 className="font-bold text-secondary text-xs truncate">{event.title}</h4>
                                                        <span className="text-xs font-black text-gray-300 uppercase whitespace-nowrap">
                                                            {new Date(event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{event.details}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${event.status === 'completed' || event.status === 'picked' ? 'bg-green-100 text-green-700' :
                                                            event.status === 'pending' || event.status === 'requested' || event.status === 'confirmed' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-gray-100 text-gray-500'
                                                            }`}>
                                                            {event.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Additional Stats/Info Card */}
                        <div className="bg-gradient-to-br from-secondary to-dark rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-secondary/30">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Zap size={80} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black mb-1 italic tracking-tighter">Premium Guest</h3>
                                <p className="text-white/40 text-xs font-bold tracking-[0.2em] mb-6">Platinum Member Status</p>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl backdrop-blur-sm">
                                        <span className="text-xs text-white/60">Loyalty Points</span>
                                        <span className="font-bold text-primary">2,450</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl backdrop-blur-sm">
                                        <span className="text-xs text-white/60">Total Hours</span>
                                        <span className="font-bold text-white">48h</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ride Modal Redesign (Passenger) */}
            {rideBooking && (
                <div className="fixed inset-0 z-[100] bg-secondary/80 backdrop-blur-xl flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, y: 40, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 40, opacity: 0 }}
                        className="bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden relative border border-white/5"
                    >
                        {/* Header */}
                        <div className="p-10 border-b border-gray-100 flex items-start justify-between relative z-10">
                            <div>
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">Quick Carrier</span>
                                <h2 className="text-4xl font-black text-white italic tracking-tighter">Your Journey</h2>
                                <p className="text-gray-400 font-bold ml-1 flex items-center gap-2 mt-1">
                                    <MapPin size={12} className="text-primary" /> {rideBooking.hotel_name}
                                </p>
                            </div>
                            <button onClick={() => setRideBooking(null)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
                                <X size={28} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Request Body */}
                        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-3 block tracking-widest">Drop Location</label>
                                    <div className="relative group">
                                        <Navigation className="absolute left-5 top-1/2 -translate-y-1/2 text-primary group-focus-within:rotate-45 transition-transform" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Where are you heading?"
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] py-5 pl-14 pr-6 outline-none focus:border-primary focus:bg-white transition-all font-bold text-secondary text-lg"
                                            value={rideDest}
                                            onChange={(e) => setRideDest(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-3 block tracking-widest">Vehicle Preference</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { id: 'bike', label: 'Fast Bike', icon: <Truck size={20} />, sub: 'Quick & Solo' },
                                            { id: 'car', label: 'Premium Car', icon: <Truck size={18} />, sub: 'Safe & Family' }
                                        ].map(v => (
                                            <button
                                                key={v.id}
                                                onClick={() => {
                                                    setVehicleType(v.id);
                                                    handleEstimateFare(v.id);
                                                }}
                                                className={`p-6 rounded-[2rem] border-4 transition-all text-left relative overflow-hidden group ${vehicleType === v.id ? 'border-primary bg-primary/5 shadow-xl' : 'border-gray-50 bg-gray-50 hover:border-gray-100'}`}
                                            >
                                                <div className={`mb-3 ${vehicleType === v.id ? 'text-primary' : 'text-gray-400 group-hover:text-secondary'}`}>{v.icon}</div>
                                                <p className={`font-black uppercase text-xs tracking-widest ${vehicleType === v.id ? 'text-secondary' : 'text-gray-500'}`}>{v.label}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">{v.sub}</p>
                                                {vehicleType === v.id && <div className="absolute top-4 right-4 text-primary"><CheckCircle size={20} /></div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Fare Transparency Breakdown */}
                                <AnimatePresence>
                                    {estimation && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="bg-secondary rounded-[2.5rem] p-8 text-white relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-8 opacity-10"><TrendingUp size={80} /></div>
                                            <div className="space-y-4 relative z-10">
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
                                                    <span>Base Fare</span>
                                                    <span>৳{vehicleType === 'bike' ? 50 : 100}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
                                                    <span>Distance ({estimation.distance_km}km)</span>
                                                    <span>৳{(estimation.estimated_fare - (vehicleType === 'bike' ? 50 : 100)).toFixed(0)}</span>
                                                </div>
                                                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">Total Estimated</p>
                                                        <p className="text-4xl font-black italic">৳{estimation.estimated_fare}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-black opacity-40 uppercase tracking-widest mb-1">Approx ETA</p>
                                                        <p className="text-sm font-bold">~12 Mins</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={handleRequestRide}
                                disabled={requestingRide || !rideDest}
                                className="w-full bg-primary text-white py-6 rounded-[2rem] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 text-lg uppercase tracking-widest disabled:opacity-50 disabled:scale-100"
                            >
                                {requestingRide ? <Loader className="animate-spin" /> : <><ShieldCheck size={24} /> Launch Application</>}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* In-Journey Status Tracking Modal */}
            {selectedRide && (
                <div className="fixed inset-0 z-[100] bg-secondary/80 backdrop-blur-xl flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden"
                    >
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-secondary uppercase italic">Trip Monitor</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Ref #{selectedRide.id.toString().padStart(6, '0')}</p>
                            </div>
                            <button onClick={() => setSelectedRide(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X size={24} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="p-10 space-y-10">
                            {/* Visual Status Progress Bar */}
                            <div className="relative">
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2"></div>
                                <div
                                    className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 transition-all duration-1000"
                                    style={{
                                        width:
                                            selectedRide.status === 'requested' ? '0%' :
                                                selectedRide.status === 'assigned' ? '25%' :
                                                    selectedRide.status === 'on_the_way' ? '50%' :
                                                        selectedRide.status === 'picked' ? '75%' : '100%'
                                    }}
                                ></div>
                                <div className="flex justify-between relative z-10">
                                    {[
                                        { s: 'requested', icon: <Navigation size={14} />, label: 'Searching' },
                                        { s: 'assigned', icon: <User size={14} />, label: 'Assigned' },
                                        { s: 'on_the_way', icon: <Truck size={14} />, label: 'Arriving' },
                                        { s: 'picked', icon: <MapPin size={14} />, label: 'In Transit' },
                                        { s: 'completed', icon: <CheckCircle size={14} />, label: 'Done' }
                                    ].map((step, idx) => {
                                        const statuses = ['requested', 'assigned', 'on_the_way', 'picked', 'completed'];
                                        const currentIdx = statuses.indexOf(selectedRide.status);
                                        const isActive = statuses.indexOf(step.s) <= currentIdx;

                                        return (
                                            <div key={idx} className="flex flex-col items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all shadow-lg ${isActive ? 'bg-primary scale-110' : 'bg-gray-200'}`}>
                                                    {step.icon}
                                                </div>
                                                <span className={`text-[8px] font-black uppercase tracking-widest mt-3 ${isActive ? 'text-secondary' : 'text-gray-300'}`}>{step.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Rider Detail HUD */}
                            {selectedRide.rider_id ? (
                                <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary font-black text-3xl border border-primary/20">
                                            {selectedRide.driver_name?.charAt(0) || 'H'}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-secondary leading-none">{selectedRide.driver_name || 'Pilot Initialized'}</h4>
                                            <p className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-tight">{selectedRide.vehicle_model || (selectedRide.vehicle_type === 'bike' ? 'High-Speed Bike' : 'Premium Sedan')}</p>
                                            <div className="flex items-center gap-1.5 mt-2 text-yellow-500">
                                                <Star size={14} fill="currentColor" />
                                                <span className="text-xs font-black">{selectedRide.driver_rating || '5.0'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <a href={`tel:${selectedRide.driver_phone}`} className="p-5 bg-white text-secondary rounded-2xl shadow-sm border border-gray-100 hover:scale-105 transition-all">
                                            <Phone size={24} />
                                        </a>
                                        <button
                                            onClick={() => {
                                                if (selectedRide.driver_lat && selectedRide.driver_lng) {
                                                    setShowRideMap(true);
                                                } else {
                                                    showError('Wait for rider to share location...');
                                                }
                                            }}
                                            className="px-6 py-5 bg-secondary text-white rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center gap-3 group"
                                            title="Track Rider Location"
                                        >
                                            <div className="relative">
                                                <MapPin size={24} />
                                                {(selectedRide.driver_lat && selectedRide.driver_lng) && (
                                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-secondary animate-pulse"></span>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Live Track</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 text-center">
                                    <div className="animate-bounce mb-4"><Loader size={40} className="mx-auto text-primary" /></div>
                                    <h4 className="text-xl font-black text-secondary italic uppercase tracking-tighter">Pinging Fleet Network</h4>
                                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1 px-4">Detecting authorized riders in your immediate sector...</p>
                                </div>
                            )}

                            {/* Trip Summary */}
                            <div className="grid grid-cols-2 gap-6 pb-2">
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Final Payout</p>
                                    <p className="text-2xl font-black text-primary italic leading-none">৳{selectedRide.estimated_fare || selectedRide.fare}</p>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Vehicle Class</p>
                                    <p className="text-2xl font-black text-secondary italic leading-none uppercase tracking-tighter">{selectedRide.vehicle_type}</p>
                                </div>
                            </div>

                            {selectedRide.status === 'requested' && (
                                <div className="mt-4">
                                    <button
                                        onClick={() => handleCancelRide(selectedRide.id)}
                                        className="w-full py-5 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                    >
                                        Cancel Ride Request
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Food Modal */}
            {foodBooking && (
                <div className="fixed inset-0 z-50 bg-secondary/80 backdrop-blur-md flex items-center justify-center p-6">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="p-8 pb-6 border-b border-gray-100 flex items-start justify-between sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-3xl font-black text-secondary mb-2 italic">Room Service</h2>
                                <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em]">{foodBooking.hotel_name}</p>
                            </div>
                            <button onClick={() => { setFoodBooking(null); setCart({}); }} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X size={24} className="text-gray-400 hover:text-secondary" />
                            </button>
                        </div>

                        {/* Menu Items */}
                        <div className="flex-1 overflow-y-auto px-8 py-6">
                            <div className="space-y-4">
                                {menu.map(item => {
                                    const quantity = cart[item.id] || 0;
                                    return (
                                        <div key={item.id} className="bg-gray-50 rounded-[1.5rem] p-5 border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all">
                                            <div className="flex gap-5">
                                                {/* Food Icon */}
                                                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                                                    <span className="text-4xl">🍽️</span>
                                                </div>

                                                {/* Food Details */}
                                                <div className="flex-1">
                                                    <h3 className="font-black text-secondary mb-1">{item.name}</h3>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">{item.category}</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xl font-black text-primary">৳{item.price}</span>

                                                        {/* Add/Remove Controls */}
                                                        {quantity === 0 ? (
                                                            <button
                                                                onClick={() => setCart({ ...cart, [item.id]: 1 })}
                                                                className="px-5 py-2 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-hover transition-all shadow-sm"
                                                            >
                                                                ADD
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center gap-3 bg-white rounded-xl p-1.5 shadow-sm border border-primary/20">
                                                                <button
                                                                    onClick={() => {
                                                                        const newCart = { ...cart };
                                                                        if (quantity > 1) {
                                                                            newCart[item.id] = quantity - 1;
                                                                        } else {
                                                                            delete newCart[item.id];
                                                                        }
                                                                        setCart(newCart);
                                                                    }}
                                                                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-black text-secondary transition-colors"
                                                                >
                                                                    −
                                                                </button>
                                                                <span className="w-10 text-center font-black text-primary">{quantity}</span>
                                                                <button
                                                                    onClick={() => setCart({ ...cart, [item.id]: quantity + 1 })}
                                                                    className="w-8 h-8 rounded-lg bg-primary hover:bg-primary-hover flex items-center justify-center font-black text-white transition-colors"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Cart Summary & Checkout */}
                        {Object.keys(cart).length > 0 && (
                            <div className="border-t border-gray-200 bg-gradient-to-b from-white to-gray-50 p-6 sticky bottom-0">
                                <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Items</div>
                                            <div className="font-black text-secondary">
                                                {Object.values(cart).reduce((a, b) => a + b, 0)} Items
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Amount</div>
                                            <div className="font-black text-primary text-xl">
                                                ৳{menu.reduce((total, item) => total + (cart[item.id] || 0) * item.price, 0)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={async () => {
                                        const items = menu
                                            .filter(item => cart[item.id])
                                            .map(item => ({
                                                id: item.id,
                                                name: item.name,
                                                quantity: cart[item.id],
                                                price: item.price
                                            }));
                                        const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

                                        const res = await fetch('/api/food/order.php', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                booking_id: foodBooking.id,
                                                items,
                                                total
                                            }),
                                            credentials: 'include'
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                            setFoodBooking(null);
                                            setCart({});
                                            setShowFoodSuccess(true);
                                        } else {
                                            showError(data.message || 'Failed to place order');
                                        }
                                    }}
                                    className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-3"
                                >
                                    <Package size={20} />
                                    PLACE ORDER
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Food Order Success Modal */}
            <AnimatePresence>
                {showFoodSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-secondary/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] w-full max-w-md p-10 relative shadow-2xl overflow-hidden text-center"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>
                            <button
                                onClick={() => setShowFoodSuccess(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-secondary p-2 rounded-full hover:bg-gray-100 transition-all"
                            >
                                <X size={24} />
                            </button>

                            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="text-primary w-12 h-12" />
                            </div>

                            <h2 className="text-3xl font-black text-secondary mb-3 tracking-tight italic">Order Placed!</h2>
                            <p className="text-gray-500 font-medium px-4 leading-relaxed mb-8">
                                Your delicious food is being prepared. Track the status in your dashboard.
                            </p>

                            <button
                                onClick={() => setShowFoodSuccess(false)}
                                className="w-full bg-primary text-white py-5 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                            >
                                AWESOME!
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ride Request Success Modal */}
            <AnimatePresence>
                {showRideSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-secondary/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] w-full max-w-md p-10 relative shadow-2xl overflow-hidden text-center"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>
                            <button
                                onClick={() => setShowRideSuccess(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-secondary p-2 rounded-full hover:bg-gray-100 transition-all"
                            >
                                <X size={24} />
                            </button>

                            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="text-primary w-12 h-12" />
                            </div>

                            <h2 className="text-3xl font-black text-secondary mb-3 tracking-tight italic">Ride Requested!</h2>
                            <p className="text-gray-500 font-medium px-4 leading-relaxed mb-8">
                                A nearby carrier is being assigned. You can track status in your dashboard.
                            </p>

                            <button
                                onClick={() => setShowRideSuccess(false)}
                                className="w-full bg-primary text-white py-5 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                            >
                                GOT IT
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-secondary/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] w-full max-w-md p-10 relative shadow-2xl overflow-hidden text-center"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500"></div>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-secondary p-2 rounded-full hover:bg-gray-100 transition-all"
                            >
                                <X size={24} />
                            </button>

                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="text-green-500 w-12 h-12" />
                            </div>

                            <h2 className="text-3xl font-black text-secondary mb-3 tracking-tight italic">Booking Confirmed!</h2>
                            <p className="text-gray-500 font-medium px-4 leading-relaxed mb-8">
                                Your hourly stay has been successfully reserved. You can manage everything from here.
                            </p>

                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full bg-secondary text-white py-5 rounded-2xl font-black shadow-xl shadow-secondary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                            >
                                GREAT!
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Check-in Success Modal */}
            <AnimatePresence>
                {showCheckInSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-secondary/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] w-full max-w-md p-10 relative shadow-2xl overflow-hidden text-center"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-blue-500"></div>

                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="text-green-500 w-12 h-12" />
                            </div>

                            <h2 className="text-3xl font-black text-secondary mb-3 tracking-tight italic">Checked In!</h2>
                            <p className="text-gray-500 font-medium px-4 leading-relaxed mb-8">
                                Welcome! Your room is ready. You can now order food and request rides.
                            </p>

                            <button
                                onClick={() => setShowCheckInSuccess(false)}
                                className="w-full bg-green-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-green-600/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                            >
                                ENJOY!
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Check-out Confirmation Modal */}
            <AnimatePresence>
                {checkOutConfirmBooking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-400 to-orange-500"></div>

                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                                <AlertCircle className="text-red-500 w-10 h-10" />
                            </div>

                            <h2 className="text-2xl font-black text-secondary mb-2 text-center">Ready to Check Out?</h2>
                            <p className="text-gray-600 text-center mb-2 font-medium">
                                {checkOutConfirmBooking.hotel_name}
                            </p>
                            <p className="text-gray-400 text-sm text-center mb-6">
                                This action will complete your booking and finalize all charges.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setCheckOutConfirmBooking(null)}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        handleCheckOut(checkOutConfirmBooking.id);
                                        setCheckOutConfirmBooking(null);
                                    }}
                                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3.5 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30"
                                >
                                    Check Out
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Check-out Success Modal */}
            <AnimatePresence>
                {showCheckOutSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-secondary/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] w-full max-w-md p-10 relative shadow-2xl overflow-hidden text-center"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 to-pink-500"></div>

                            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="text-purple-600 w-12 h-12" />
                            </div>

                            <h2 className="text-3xl font-black text-secondary mb-3 tracking-tight italic">Checked Out!</h2>
                            <p className="text-gray-500 font-medium px-4 leading-relaxed mb-8">
                                Thank you for staying with us! We hope to see you again soon.
                            </p>

                            <button
                                onClick={() => setShowCheckOutSuccess(false)}
                                className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-purple-600/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                            >
                                THANKS!
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] bg-secondary/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] w-full max-w-md p-10 relative shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-secondary p-2 rounded-full hover:bg-gray-100 transition-all"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-2xl font-black text-secondary mb-1 italic">Order Summary</h2>
                            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-8">Order ID: #{selectedOrder.id}</p>

                            <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2">
                                {(() => {
                                    try {
                                        const items = JSON.parse(selectedOrder.items_json);
                                        return Array.isArray(items) ? items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary font-black text-xs shadow-sm">
                                                        {item.quantity}x
                                                    </div>
                                                    <span className="font-bold text-secondary text-sm">{item.name}</span>
                                                </div>
                                                <span className="font-black text-primary text-sm">৳{item.price * item.quantity}</span>
                                            </div>
                                        )) : null;
                                    } catch (e) { return null; }
                                })()}
                            </div>

                            <div className="border-t border-gray-100 pt-6 mb-8">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Status</span>
                                    <span className="font-black text-secondary text-xs uppercase tracking-widest">{selectedOrder.status}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Grand Total</span>
                                    <span className="font-black text-primary text-2xl tracking-tight">৳{selectedOrder.total_amount}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-full bg-secondary text-white py-5 rounded-2xl font-black shadow-xl shadow-secondary/20 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-[0.2em]"
                            >
                                CLOSE
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Rating Modal */}
            <AnimatePresence>
                {ratingRide && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] bg-secondary/80 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-[3rem] w-full max-w-sm p-10 relative shadow-2xl overflow-hidden text-center">
                            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
                            <button onClick={() => setRatingRide(null)} className="absolute top-6 right-6 text-gray-400"><X size={24} /></button>

                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary">
                                <Star size={40} fill="currentColor" />
                            </div>

                            <h2 className="text-2xl font-black text-secondary mb-2 italic">How was your trip?</h2>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-8">Trip with {ratingRide.driver_name}</p>

                            <div className="flex justify-center gap-3 mb-10">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => setStarRating(star)}
                                        className={`transition-all ${star <= starRating ? 'text-orange-500 scale-125' : 'text-gray-200 hover:text-orange-200'}`}
                                    >
                                        <Star size={32} fill={star <= starRating ? "currentColor" : "none"} strokeWidth={3} />
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleRateRider}
                                disabled={submittingRating}
                                className="w-full bg-secondary text-white py-5 rounded-2xl font-black shadow-xl hover:scale-105 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3"
                            >
                                {submittingRating ? <Loader className="animate-spin" size={18} /> : 'Submit Feedback'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Booking Details Modal */}
            <AnimatePresence>
                {selectedBooking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] bg-secondary/80 backdrop-blur-md flex items-center justify-center p-6"
                        onClick={() => setSelectedBooking(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-xl p-6 relative shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all"
                            >
                                <X size={20} />
                            </button>

                            {/* Header */}
                            <div className="mb-4">
                                <h2 className="text-2xl font-black text-secondary mb-1">{selectedBooking.hotel_name}</h2>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin size={16} className="text-primary" />
                                    <span className="font-semibold text-sm">{selectedBooking.room_type_name}</span>
                                </div>
                            </div>

                            {/* Hotel Image */}
                            <div className="w-full h-32 rounded-2xl overflow-hidden mb-4 border border-gray-200">
                                <img
                                    src={getImageUrl(selectedBooking.image_url)}
                                    alt={selectedBooking.hotel_name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = '/assets/default_hotel.png'; }}
                                />
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {/* Check-in */}
                                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                    <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Check-in</div>
                                    <div className="font-bold text-secondary text-base">
                                        {new Date(selectedBooking.check_in_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        {new Date(selectedBooking.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                {/* Check-out */}
                                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                                    <div className="text-xs font-black text-orange-600 uppercase tracking-widest mb-2">Check-out</div>
                                    <div className="font-bold text-secondary text-base">
                                        {new Date(selectedBooking.check_out_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        {new Date(selectedBooking.check_out_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                {/* Duration */}
                                <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                                    <div className="text-xs font-black text-green-600 uppercase tracking-widest mb-2">Duration</div>
                                    <div className="font-bold text-secondary text-base">{selectedBooking.total_hours} Hours</div>
                                    <div className="text-xs text-gray-600">{selectedBooking.booked_hours} hours booked</div>
                                </div>

                                {/* Total Price */}
                                <div className="bg-primary/10 p-4 rounded-2xl border border-primary/30">
                                    <div className="text-xs font-black text-primary uppercase tracking-widest mb-2">Total Price</div>
                                    <div className="font-black text-primary text-xl">৳{selectedBooking.total_price}</div>
                                </div>
                            </div>

                            {/* Status Section */}
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Booking Status</div>
                                        <div className="font-bold text-secondary text-base capitalize">{selectedBooking.booking_status}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Payment Status</div>
                                        <div className="font-bold text-secondary text-base capitalize">{selectedBooking.payment_status}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Booking ID & Date */}
                            <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
                                <div className="mb-1">Booking ID: <span className="font-mono font-bold text-gray-700">#{selectedBooking.id}</span></div>
                                <div>Booked on: {new Date(selectedBooking.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ride Details Modal */}
            <AnimatePresence>
                {selectedRide && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-6 relative overflow-hidden border border-gray-100"
                        >
                            <button
                                onClick={() => setSelectedRide(null)}
                                className="absolute top-4 right-4 w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border ${getRideStatusColor(selectedRide.status)}`}>
                                    {String(selectedRide.status || '').replace('_', ' ')}
                                </div>
                                <div className="text-xs text-gray-400">{selectedRide.created_at ? new Date(selectedRide.created_at).toLocaleString() : ''}</div>
                                <button
                                    onClick={() => setShowRideMap(true)}
                                    className="ml-auto px-3 py-1 text-xs font-black uppercase tracking-widest text-primary border border-primary/30 rounded-full hover:bg-primary/10"
                                >
                                    View on map
                                </button>
                            </div>

                            <div className="mb-4">
                                <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">From</div>
                                <div className="font-bold text-secondary text-sm">{selectedRide.pickup_address || 'Pickup location'}</div>
                                <div className="text-[11px] text-gray-500">Lat: {Number(selectedRide.pickup_latitude ?? selectedRide.pickup_lat ?? 0).toFixed(4)}, Lng: {Number(selectedRide.pickup_longitude ?? selectedRide.pickup_lng ?? 0).toFixed(4)}</div>
                            </div>

                            <div className="mb-4">
                                <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">To</div>
                                <div className="font-bold text-secondary text-sm">{selectedRide.destination_name || selectedRide.destination_address || 'Destination'}</div>
                                <div className="text-[11px] text-gray-500">Lat: {Number(selectedRide.dropoff_latitude ?? selectedRide.destination_lat ?? 0).toFixed(4)}, Lng: {Number(selectedRide.dropoff_longitude ?? selectedRide.destination_lng ?? 0).toFixed(4)}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                                    <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">Fare</div>
                                    <div className="font-black text-primary text-lg">৳{selectedRide.fare || selectedRide.estimated_fare || 0}</div>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                                    <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">Distance</div>
                                    <div className="font-bold text-secondary text-base">{Number(selectedRide.distance ?? selectedRide.distance_km ?? 0).toFixed(2)} km</div>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                                    <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">ETA</div>
                                    {(() => {
                                        const driverLat = Number(selectedRide.driver_lat ?? selectedRide.rider_lat ?? 0);
                                        const driverLng = Number(selectedRide.driver_lng ?? selectedRide.rider_lng ?? 0);
                                        const pickupLat = Number(selectedRide.pickup_latitude ?? selectedRide.pickup_lat ?? 0);
                                        const pickupLng = Number(selectedRide.pickup_longitude ?? selectedRide.pickup_lng ?? 0);
                                        const km = getDistanceKm(driverLat, driverLng, pickupLat, pickupLng);
                                        if (km === null || km === 0) return <div className="text-xs text-gray-500">Waiting for driver</div>;
                                        const minutes = Math.max(2, Math.round((km / 25) * 60));
                                        return <div className="font-bold text-secondary text-base">~{minutes} min</div>;
                                    })()}
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                                    <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">Vehicle</div>
                                    <div className="font-bold text-secondary text-base capitalize">{selectedRide.vehicle_type || 'car'}</div>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                                    <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">Request ID</div>
                                    <div className="font-mono text-sm font-bold text-gray-700">#{selectedRide.id}</div>
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-white border border-blue-100 flex items-center justify-center text-blue-500">
                                    <Truck size={18} />
                                </div>
                                <div>
                                    <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Driver</div>
                                    <div className="font-bold text-secondary text-sm">{selectedRide.driver_name || 'Not assigned yet'}</div>
                                    <div className="text-[11px] text-gray-500">{selectedRide.driver_phone || 'Waiting for assignment'}</div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ride Map Modal (Unified Navigation) */}
            <AnimatePresence>
                {isBrowser && selectedRide && showRideMap && (
                    <div className="fixed inset-0 z-[150] bg-secondary/90 backdrop-blur-xl flex items-center justify-center p-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="bg-white w-full max-w-6xl h-[80vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/20"
                        >
                            {/* Left Side: Map */}
                            <div className="flex-1 relative bg-navy overflow-hidden">
                                <EmbeddedNavigation
                                    pickupLat={selectedRide.pickup_latitude ?? selectedRide.pickup_lat}
                                    pickupLng={selectedRide.pickup_longitude ?? selectedRide.pickup_lng}
                                    dropoffLat={selectedRide.dropoff_latitude ?? selectedRide.destination_lat}
                                    dropoffLng={selectedRide.dropoff_longitude ?? selectedRide.destination_lng}
                                    navigationType={selectedRide.status === 'picked' ? 'dropoff' : 'pickup'}
                                    customerName={selectedRide.driver_name}
                                    onClose={() => setShowRideMap(false)}
                                    isMobile={false}
                                    remoteOrigin={selectedRide.driver_lat && selectedRide.driver_lng ? [parseFloat(selectedRide.driver_lat), parseFloat(selectedRide.driver_lng)] : null}
                                    isCustomerView={true}
                                    hideUI={true} // Cleaner integration
                                />
                                {/* Overlay for map controls if needed on mobile */}
                                <button
                                    onClick={() => setShowRideMap(false)}
                                    className="absolute top-6 left-6 z-[1000] w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-secondary shadow-xl border border-gray-100 md:hidden"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Right Side: Telemetry & Info */}
                            <div className="md:w-[400px] bg-slate-50 border-l border-gray-100 flex flex-col overflow-hidden">
                                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
                                    <div>
                                        <h3 className="text-xl font-black text-secondary italic tracking-tighter uppercase">Live Telemetry</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Connection</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowRideMap(false)}
                                        className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-secondary hover:bg-gray-100 transition-all hidden md:flex"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                                    {/* Status Card */}
                                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                                <Navigation size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Phase</p>
                                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${getRideStatusColor(selectedRide.status)}`}>
                                                    {selectedRide.status?.replace('_', ' ')}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estimated Fare</span>
                                                <span className="text-lg font-black text-primary">৳{selectedRide.estimated_fare || selectedRide.fare}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vehicle Class</span>
                                                <span className="text-xs font-black text-secondary uppercase italic">{selectedRide.vehicle_type}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Driver Profile */}
                                    <div className="bg-secondary rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                            <Truck size={60} />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center font-black text-2xl border border-white/10 uppercase">
                                                    {selectedRide.driver_name?.charAt(0) || 'D'}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-lg italic leading-tight">{selectedRide.driver_name || 'Pilot'}</h4>
                                                    <div className="flex items-center gap-1.5 mt-1 text-accent">
                                                        <Star size={12} fill="currentColor" />
                                                        <span className="text-xs font-black">{selectedRide.driver_rating || '5.0'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <a
                                                href={`tel:${selectedRide.driver_phone}`}
                                                className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5"
                                            >
                                                <Phone size={14} /> Contact Pilot
                                            </a>
                                        </div>
                                    </div>

                                    {/* Trip Detail Timeline */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                <MapPin size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pickup</p>
                                                <p className="text-xs font-bold text-secondary truncate">{selectedRide.pickup_address || 'Current Location'}</p>
                                            </div>
                                        </div>
                                        <div className="ml-4 h-8 border-l-2 border-dashed border-gray-200"></div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <MapPin size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Destination</p>
                                                <p className="text-xs font-bold text-secondary truncate">{selectedRide.destination_address || selectedRide.destination_name}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 bg-white border-t border-gray-100">
                                    <button
                                        onClick={() => setShowRideMap(false)}
                                        className="w-full py-4 bg-secondary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all italic"
                                    >
                                        Minimize Tracker
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Property Review Modal */}
            <AnimatePresence>
                {reviewBooking && (
                    <div className="fixed inset-0 z-[140] bg-secondary/80 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-yellow-500">
                                    <Star size={32} fill="currentColor" />
                                </div>
                                <h2 className="text-2xl font-black text-secondary italic">Rate Your Stay</h2>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{reviewBooking.hotel_name}</p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => setHotelRating(star)}
                                            className={`transition-all ${star <= hotelRating ? 'text-yellow-400 scale-110' : 'text-gray-200'}`}
                                        >
                                            <Star size={32} fill={star <= hotelRating ? "currentColor" : "none"} />
                                        </button>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Your Experience</label>
                                    <textarea
                                        value={hotelComment}
                                        onChange={(e) => setHotelComment(e.target.value)}
                                        placeholder="Tell us about the room, service, and location..."
                                        className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary outline-none h-32 resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setReviewBooking(null)}
                                        className="flex-1 py-4 text-gray-400 font-bold hover:text-secondary transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleReviewHotel}
                                        disabled={submittingReview}
                                        className="flex-2 px-8 py-4 bg-primary text-white rounded-2xl font-black italic shadow-lg shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50"
                                    >
                                        {submittingReview ? <Loader className="animate-spin" size={20} /> : 'SUBMIT REVIEW'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ChatModal
                isOpen={!!chatTarget}
                onClose={() => setChatTarget(null)}
                otherUserId={chatTarget?.id}
                otherUserName={chatTarget?.name}
                contextId={chatTarget?.contextId}
                contextType={chatTarget?.contextType}
            />
        </div>
    );
};

export default Dashboard;
