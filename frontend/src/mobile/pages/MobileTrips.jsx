import React, { useState, useEffect } from "react";
import { Calendar, Utensils, Truck, Clock, MapPin, CheckCircle, XCircle, AlertCircle, ChevronRight, Loader, Package, User, Hash, DollarSign, Car, Navigation, ShieldCheck, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useModal } from "../../context/ModalContext";
import { useNavigate } from "react-router-dom";
import EmbeddedNavigation from "../../components/EmbeddedNavigation.jsx";
import ChatModal from "../components/ChatModal.jsx";

const MobileTrips = () => {
    const navigate = useNavigate();
    const { showConfirm, showSuccess, showError } = useModal();
    const [activeTab, setActiveTab] = useState('stays');
    const [bookings, setBookings] = useState([]);
    const [foodOrders, setFoodOrders] = useState([]);
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedRide, setSelectedRide] = useState(null);
    const [selectedFood, setSelectedFood] = useState(null);
    const [showNavigation, setShowNavigation] = useState(false);
    const [chatTarget, setChatTarget] = useState(null); // { id, name, contextId, contextType }

    // Food Ordering State
    const [foodBooking, setFoodBooking] = useState(null);
    const [menu, setMenu] = useState([]);
    const [cart, setCart] = useState({});
    const [menuLoading, setMenuLoading] = useState(false);
    const [showFoodSuccess, setShowFoodSuccess] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);

    const activeBooking = bookings.find(b => b.booking_status === 'active') || bookings.find(b => b.booking_status === 'confirmed');

    // Ride Request State
    const [rideBooking, setRideBooking] = useState(null);
    const [rideDest, setRideDest] = useState('');
    const [destCoords, setDestCoords] = useState(null);
    const [vehicleType, setVehicleType] = useState('car');
    const [estimation, setEstimation] = useState(null);
    const [requestingRide, setRequestingRide] = useState(false);
    const [showRideSuccess, setShowRideSuccess] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [staysRes, foodRes, ridesRes] = await Promise.all([
                fetch('/api/bookings/list.php', { credentials: 'include' }),
                fetch('/api/food/order.php', { credentials: 'include' }),
                fetch('/api/rides/request.php', { credentials: 'include' })
            ]);

            const staysData = await staysRes.json();
            const foodData = await foodRes.json();
            const ridesData = await ridesRes.json();

            if (staysData.success) setBookings(staysData.data);
            if (foodData.success) setFoodOrders(foodData.data);
            if (ridesData.success) {
                setRides(ridesData.data || []);
            } else {
                console.log('Rides API error:', ridesData.message);
                setRides([]);
            }

        } catch (error) {
            console.error("Error fetching trips data:", error);
            setRides([]);
        } finally {
            setLoading(false);
        }
    };

    // Polling for selected ride updates (including driver location)
    useEffect(() => {
        let interval;
        if (selectedRide && (selectedRide.status === 'assigned' || selectedRide.status === 'on_the_way' || selectedRide.status === 'picked')) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch('/api/rides/request.php', { credentials: 'include' });
                    const data = await res.json();
                    if (data.success) {
                        const latest = data.data.find(r => r.id === selectedRide.id);
                        if (latest) setSelectedRide(latest);
                    }
                } catch (e) { }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [selectedRide?.id, selectedRide?.status]);

    const handleCancelInfo = (e, booking) => {
        e.stopPropagation();
        showConfirm(
            "Are you sure you want to cancel this booking?",
            async () => {
                try {
                    const res = await fetch('/api/bookings/cancel.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ booking_id: booking.id }),
                        credentials: 'include'
                    });
                    const data = await res.json();
                    if (data.success) {
                        showSuccess("Booking cancelled");
                        fetchAllData();
                        setSelectedBooking(null);
                    } else {
                        showError(data.message || "Failed to cancel");
                    }
                } catch (err) {
                    showError("Network error");
                }
            },
            "Cancel Booking"
        );
    };

    const handleCheckIn = async () => {
        if (!selectedBooking) return;
        showConfirm("Proceed to Check-in?", async () => {
            try {
                const res = await fetch('/api/bookings/check_in.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ booking_id: selectedBooking.id }),
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.success) {
                    showSuccess("Checked In Successfully!");
                    fetchAllData();
                    setSelectedBooking(null);
                } else {
                    showError(data.message || "Check-in failed");
                }
            } catch (err) {
                showError("Network error");
            }
        });
    };

    const handleCheckOut = async () => {
        if (!selectedBooking) return;
        showConfirm("Proceed to Check-out?", async () => {
            try {
                const res = await fetch('/api/bookings/check_out.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ booking_id: selectedBooking.id }),
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.success) {
                    showSuccess("Checked Out Successfully!");
                    fetchAllData();
                    setSelectedBooking(null);
                } else {
                    showError(data.message || "Check-out failed");
                }
            } catch (err) {
                showError("Network error");
            }
        });
    };

    const handleStartOrdering = async (booking) => {
        setMenuLoading(true);
        try {
            const res = await fetch(`/api/food/menu.php?hotel_id=${booking.hotel_id}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setMenu(data.data);
                setFoodBooking(booking);
                setCart({});
            } else {
                showError(data.message || "Failed to load menu");
            }
        } catch (err) {
            showError("Network error");
        } finally {
            setMenuLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!foodBooking) return;
        setPlacingOrder(true);
        try {
            const items = menu
                .filter(item => cart[item.id])
                .map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: cart[item.id],
                    price: item.price
                }));
            const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

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
                fetchAllData();
            } else {
                showError(data.message || "Failed to place order");
            }
        } catch (err) {
            showError("Network error");
        } finally {
            setPlacingOrder(false);
        }
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

    const fetchEstimation = async (overrideType = null) => {
        const typeToUse = overrideType || vehicleType;
        if (!rideDest || !rideBooking) return;
        try {
            const coords = await geocodeAddress(rideDest);
            if (!coords) return;
            setDestCoords(coords);

            const res = await fetch('/api/rides/estimate.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pickup_lat: rideBooking.latitude,
                    pickup_lng: rideBooking.longitude,
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
        } catch (err) { }
    };

    useEffect(() => {
        if (rideBooking && rideDest) {
            const timer = setTimeout(() => fetchEstimation(), 500);
            return () => clearTimeout(timer);
        }
    }, [rideDest, vehicleType, rideBooking]);

    const handleRequestRide = async () => {
        setRequestingRide(true);
        try {
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
                fetchAllData();
            } else {
                showError(data.message || "Ride request failed");
            }
        } catch (err) {
            showError("Network error");
        } finally {
            setRequestingRide(false);
        }
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
                    fetchAllData();
                    setSelectedRide(null);
                } else {
                    showError(data.message || "Failed to cancel ride");
                }
            } catch (err) {
                showError("Network error cancelling ride");
            }
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            confirmed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            active: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
            completed: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
            requested: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
            accepted: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            preparing: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
            ready: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            delivered: 'bg-green-500/20 text-green-300 border-green-500/30'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 relative ${activeTab === id ? 'text-accent font-bold' : 'text-gray-400 font-medium'
                }`}
        >
            <Icon size={20} className={activeTab === id ? 'stroke-[2.5px]' : 'stroke-2'} />
            <span className="text-[10px] uppercase tracking-wide">{label}</span>
            {activeTab === id && (
                <motion.div
                    layoutId="activeTabTrips"
                    className="absolute bottom-0 w-1/2 h-0.5 bg-accent rounded-t-full"
                />
            )}
        </button>
    );



    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] bg-navy">
                <Loader className="animate-spin text-accent" size={24} />
            </div>
        );
    }

    return (
        <div className="bg-navy min-h-screen pb-24 text-white font-sans">
            {/* Header */}
            <div className="bg-navy/95 backdrop-blur-xl px-6 pt-12 pb-4 border-b border-white/5 sticky top-0 z-10">
                <h1 className="text-2xl font-black text-white">My Trips</h1>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                    Manage your journey
                </p>

                {/* Tabs */}
                <div className="flex mt-6 border-b border-white/5">
                    <TabButton id="stays" label="Stays" icon={Calendar} />
                    <TabButton id="food" label="Food" icon={Utensils} />
                    <TabButton id="rides" label="Rides" icon={Truck} />
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                <AnimatePresence mode="wait">
                    {activeTab === 'stays' && (
                        <motion.div
                            key="stays"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {bookings.length === 0 ? (
                                <EmptyState icon={Calendar} message="No existing bookings" />
                            ) : bookings.map(booking => (
                                <motion.div
                                    key={booking.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedBooking(booking)}
                                    className="bg-navy-light p-4 rounded-3xl border border-white/5 cursor-pointer active:bg-white/5"
                                >
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 rounded-2xl bg-navy overflow-hidden flex-shrink-0 border border-white/5">
                                            <img
                                                src={booking.image_url || '/assets/default_hotel.png'}
                                                className="w-full h-full object-cover"
                                                onError={(e) => e.target.src = '/assets/default_hotel.png'}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-white truncate pr-2">{booking.hotel_name}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusColor(booking.booking_status)}`}>
                                                    {booking.booking_status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 font-bold mt-0.5">{booking.room_type_name}</p>

                                            <div className="flex items-center gap-3 mt-3">
                                                <div className="bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                                                    <p className="text-[8px] text-gray-400 font-bold uppercase">Check In</p>
                                                    <p className="text-xs font-bold text-gray-200">
                                                        {new Date(booking.check_in_date).getDate()} {new Date(booking.check_in_date).toLocaleString('default', { month: 'short' })}
                                                    </p>
                                                </div>
                                                <div className="bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                                                    <p className="text-[8px] text-gray-400 font-bold uppercase">Total</p>
                                                    <p className="text-xs font-bold text-accent">৳{booking.total_price}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'food' && (
                        <motion.div
                            key="food"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {/* Active Booking Food Section */}
                            {activeBooking && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-accent/10 rounded-[2rem] p-6 border border-accent/20 mb-6 relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                                        <Utensils size={80} />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                            <p className="text-[10px] font-black text-accent uppercase tracking-widest">Active Stay Found</p>
                                        </div>
                                        <h3 className="text-xl font-black text-white italic tracking-tight mb-4 pr-12">
                                            Order Room Service from {activeBooking.hotel_name}
                                        </h3>
                                        <button
                                            onClick={() => handleStartOrdering(activeBooking)}
                                            disabled={menuLoading}
                                            className="w-full py-4 bg-accent text-navy rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-accent/20 hover:scale-[1.02] flex items-center justify-center gap-2 transition-all"
                                        >
                                            {menuLoading ? <Loader size={16} className="animate-spin" /> : <><Package size={16} /> Start Ordering</>}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            <div className="flex items-center gap-2 mb-2">
                                <Clock size={16} className="text-gray-500" />
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Past Orders</h4>
                            </div>

                            {foodOrders.length === 0 ? (
                                <EmptyState icon={Utensils} message="No past food orders" />
                            ) : foodOrders.map(order => (
                                <div 
                                    key={order.id} 
                                    onClick={() => setSelectedFood(order)}
                                    className="bg-navy-light p-5 rounded-3xl border border-white/5 cursor-pointer hover:border-accent/50 transition-all"
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-white/5 rounded-full">
                                                <Utensils size={12} className="text-gray-400" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-500">Order #{order.id}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-white text-lg mb-1">{order.hotel_name}</h3>
                                    <div className="flex items-center justify-between mt-4 bg-navy p-3 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <Package size={14} className="text-gray-400" />
                                            <span className="text-xs font-bold text-gray-300">
                                                {JSON.parse(order.items_json || '[]').length} Items
                                            </span>
                                        </div>
                                        <span className="font-black text-accent text-sm">
                                            ৳{order.total_amount || order.total || (
                                                Array.isArray(order.items) 
                                                    ? order.items.reduce((sum, item) => sum + (item.subtotal || 0), 0)
                                                    : JSON.parse(order.items_json || '[]').reduce((sum, item) => sum + (item.subtotal || 0), 0)
                                            )}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setChatTarget({
                                            id: order.vendor_id,
                                            name: order.hotel_name,
                                            contextId: order.id,
                                            contextType: 'food'
                                        })}
                                        className="w-full mt-3 bg-white/5 py-3 rounded-2xl border border-white/5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 active:bg-white/10"
                                    >
                                        <MessageCircle size={14} /> Message Vendor
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'rides' && (
                        <motion.div
                            key="rides"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {/* Active Booking Ride Section */}
                            {activeBooking && (
                                <div className="grid grid-cols-1 gap-4 mb-2">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-blue-500/10 rounded-[2rem] p-6 border border-blue-500/20 relative overflow-hidden group"
                                    >
                                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                                            <Car size={80} />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Guest Exclusive</p>
                                            </div>
                                            <h3 className="text-xl font-black text-white italic tracking-tight mb-4 pr-12">
                                                Need a ride from {activeBooking.hotel_name}?
                                            </h3>
                                            <button
                                                onClick={() => setRideBooking(activeBooking)}
                                                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] flex items-center justify-center gap-2 transition-all"
                                            >
                                                <Car size={16} /> Request Carrier
                                            </button>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="bg-green-500/10 rounded-[2rem] p-6 border border-green-500/20 relative overflow-hidden group"
                                    >
                                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                                            <MapPin size={80} />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Alternative Path</p>
                                            </div>
                                            <h3 className="text-xl font-black text-white italic tracking-tight mb-4 pr-12">
                                                Explore with Alternative Journey
                                            </h3>
                                            <button
                                                onClick={() => navigate('/journey')}
                                                className="w-full py-4 bg-emerald-500 text-navy rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 hover:scale-[1.02] flex items-center justify-center gap-2 transition-all"
                                            >
                                                <Navigation size={16} /> Launch Navigator
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}

                            <div className="flex items-center gap-2 mb-2">
                                <Clock size={16} className="text-gray-500" />
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ride History</h4>
                            </div>

                            {rides.length === 0 ? (
                                <EmptyState icon={Truck} message="No ride requests" />
                            ) : rides.map(ride => (
                                <div key={ride.id} onClick={() => setSelectedRide(ride)} className="bg-navy-light p-5 rounded-3xl border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusColor(ride.status)}`}>
                                                {ride.status}
                                            </span>
                                            <p className="text-xs text-gray-400 font-bold mt-2">{new Date(ride.created_at).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-black text-accent text-lg">৳{ride.estimated_fare}</span>
                                            <span className="text-[9px] font-bold text-gray-500 uppercase">{ride.vehicle_type}</span>
                                        </div>
                                    </div>

                                    <div className="relative pl-4 space-y-4 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10 before:content-['']">
                                        <div className="relative">
                                            <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-navy-light"></div>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase">Pickup</p>
                                            <p className="text-xs font-bold text-white truncate">{ride.pickup_address}</p>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-navy-light"></div>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase">Dropoff</p>
                                            <p className="text-xs font-bold text-white truncate">{ride.destination_address || ride.destination_name || 'Destination'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Booking Details Sheet */}
            <AnimatePresence>
                {selectedBooking && (
                    <>
                        {/* Backdrop - High Z-Index to cover everything */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
                            onClick={() => setSelectedBooking(null)}
                        />
                        {/* Sheet - Highest Z-Index */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 bg-navy-light rounded-t-[2.5rem] z-[70] overflow-hidden max-h-[90vh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10"
                        >
                            <div className="relative h-72">
                                <img
                                    src={selectedBooking.image_url || '/assets/default_hotel.png'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => e.target.src = '/assets/default_hotel.png'}
                                />
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors border border-white/10"
                                >
                                    <XCircle size={28} />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy via-navy/80 to-transparent p-8 pt-32 text-white">
                                    <div className="flex justify-between items-end mb-2">
                                        <h2 className="text-3xl font-black leading-tight flex-1 mr-4">{selectedBooking.hotel_name}</h2>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(selectedBooking.booking_status)}`}>
                                            {selectedBooking.booking_status}
                                        </span>
                                    </div>
                                    <p className="text-white/80 font-medium text-base flex items-center gap-2">
                                        <MapPin size={16} className="text-primary" /> {selectedBooking.room_type_name}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Date Cards */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-navy p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
                                                <Calendar size={14} />
                                            </div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Check In</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-lg leading-tight">{new Date(selectedBooking.check_in_date).getDate()}</p>
                                            <p className="text-xs font-bold text-gray-400 uppercase">{new Date(selectedBooking.check_in_date).toLocaleString('default', { month: 'short' })}</p>
                                            <p className="text-xs font-bold text-accent mt-1">{selectedBooking.check_in_time}</p>
                                        </div>
                                    </div>
                                    <div className="bg-navy p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-orange-500/10 text-orange-400 rounded-lg">
                                                <Calendar size={14} />
                                            </div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Check Out</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-lg leading-tight">{new Date(selectedBooking.check_out_date).getDate()}</p>
                                            <p className="text-xs font-bold text-gray-400 uppercase">{new Date(selectedBooking.check_out_date).toLocaleString('default', { month: 'short' })}</p>
                                            <p className="text-xs font-bold text-accent mt-1">{selectedBooking.check_out_time}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Detail List */}
                                <div className="bg-navy rounded-3xl p-6 border border-white/5 space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/5 rounded-xl text-gray-400">
                                                <Hash size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-500">Booking ID</p>
                                                <p className="font-bold text-white">#{selectedBooking.id}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/5 rounded-xl text-gray-400">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-500">Guests</p>
                                                <p className="font-bold text-white">2 Adults</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                                                <DollarSign size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-500">Total Amount</p>
                                                <p className="font-black text-xl text-accent">৳{selectedBooking.total_price}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions - Added Padding Bottom Safe */}
                                <div className="space-y-3 pt-4 pb-12">
                                    {selectedBooking.booking_status === 'confirmed' && (
                                        <button
                                            onClick={handleCheckIn}
                                            className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={20} /> Check In Now
                                        </button>
                                    )}
                                    {selectedBooking.booking_status === 'active' && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setActiveTab('food');
                                                    setSelectedBooking(null);
                                                    handleStartOrdering(selectedBooking);
                                                }}
                                                className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                            >
                                                <Utensils size={20} /> Order Food
                                            </button>
                                            <button
                                                onClick={handleCheckOut}
                                                className="w-full py-4 bg-white/10 text-white rounded-xl font-bold text-lg border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                <XCircle size={20} /> Check Out
                                            </button>
                                        </>
                                    )}
                                    {(selectedBooking.booking_status === 'pending' || selectedBooking.booking_status === 'confirmed') && (
                                        <button
                                            onClick={(e) => handleCancelInfo(e, selectedBooking)}
                                            className="w-full py-4 bg-red-500/10 text-red-400 rounded-xl font-bold text-lg border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={20} /> Cancel Booking
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setChatTarget({
                                            id: selectedBooking.vendor_id,
                                            name: selectedBooking.hotel_name,
                                            contextId: selectedBooking.id,
                                            contextType: 'hotel'
                                        })}
                                        className="w-full py-4 bg-accent text-navy rounded-xl font-bold text-lg shadow-lg shadow-accent/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                                    >
                                        <MessageCircle size={20} /> Message Vendor
                                    </button>
                                    <button
                                        onClick={() => navigate(`/hotels/${selectedBooking.hotel_id}`)}
                                        className="w-full py-4 bg-white text-navy rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl"
                                    >
                                        Book Again
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Food Order Details Sheet */}
            <AnimatePresence>
                {selectedFood && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
                            onClick={() => setSelectedFood(null)}
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 bg-navy-light rounded-t-[2.5rem] z-[70] overflow-hidden max-h-[85vh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10"
                        >
                            <div className="p-6 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(selectedFood.status)}`}>
                                            {selectedFood.status}
                                        </span>
                                        <h2 className="text-2xl font-black text-white mt-3">Order Details</h2>
                                    </div>
                                    <button
                                        onClick={() => setSelectedFood(null)}
                                        className="p-2 bg-white/5 rounded-full text-gray-400 hover:bg-white/10"
                                    >
                                        <XCircle size={24} />
                                    </button>
                                </div>

                                {/* Order Header */}
                                <div className="bg-navy p-4 rounded-2xl border border-white/10 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-400">Order ID</span>
                                        <span className="font-black text-white">#{selectedFood.id}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-400">Restaurant</span>
                                        <span className="font-bold text-white">{selectedFood.hotel_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-400">Total Amount</span>
                                        <span className="font-black text-accent text-lg">
                                            ৳{selectedFood.total_amount || (
                                                Array.isArray(selectedFood.items) 
                                                    ? selectedFood.items.reduce((sum, item) => sum + (item.subtotal || 0), 0)
                                                    : JSON.parse(selectedFood.items_json || '[]').reduce((sum, item) => sum + (item.subtotal || 0), 0)
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-black text-white">Order Items</h3>
                                    {(Array.isArray(selectedFood.items) 
                                        ? selectedFood.items 
                                        : JSON.parse(selectedFood.items_json || '[]')
                                    ).map((item, idx) => (
                                        <div key={idx} className="bg-navy p-3 rounded-xl border border-white/5 flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-bold text-white">{item.item_name || item.name}</p>
                                                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                            </div>
                                            <span className="font-black text-accent">৳{item.subtotal || (item.quantity * item.price_at_order)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Message Button */}
                                <button
                                    onClick={() => {
                                        setChatTarget({
                                            id: selectedFood.vendor_id,
                                            name: selectedFood.hotel_name,
                                            contextId: selectedFood.id,
                                            contextType: 'food'
                                        });
                                        setSelectedFood(null);
                                    }}
                                    className="w-full bg-gradient-to-r from-accent to-accent/80 py-4 rounded-2xl font-black text-white uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:from-accent/90 hover:to-accent/70 transition-all"
                                >
                                    <MessageCircle size={16} /> Message Vendor
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Ride Details Sheet */}
            <AnimatePresence>
                {selectedRide && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
                            onClick={() => setSelectedRide(null)}
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 bg-navy-light rounded-t-[2.5rem] z-[70] overflow-hidden max-h-[85vh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10"
                        >
                            <div className="p-6 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(selectedRide.status)}`}>
                                            {selectedRide.status}
                                        </span>
                                        <h2 className="text-2xl font-black text-white mt-3">Ride Details</h2>
                                    </div>
                                    <button
                                        onClick={() => setSelectedRide(null)}
                                        className="p-2 bg-white/5 rounded-full text-gray-400 hover:bg-white/10"
                                    >
                                        <XCircle size={24} />
                                    </button>
                                </div>

                                {/* Route Details */}
                                <div className="bg-navy rounded-2xl p-5 border border-white/5">
                                    <div className="relative pl-6 space-y-6">
                                        <div className="absolute left-[7px] top-3 bottom-3 w-[2px] bg-gradient-to-b from-blue-500 to-accent"></div>
                                        <div className="relative">
                                            <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-navy"></div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pickup Location</p>
                                            <p className="font-bold text-white mt-1">{selectedRide.pickup_address}</p>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-accent ring-4 ring-navy"></div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Destination</p>
                                            <p className="font-bold text-white mt-1">{selectedRide.destination_address || selectedRide.destination_name || 'Destination'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Ride Info Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-navy p-4 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Car size={16} className="text-blue-400" />
                                            <p className="text-[10px] font-black text-gray-500 uppercase">Vehicle</p>
                                        </div>
                                        <p className="font-bold text-white capitalize">{selectedRide.vehicle_type}</p>
                                    </div>
                                    <div className="bg-navy p-4 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin size={16} className="text-purple-400" />
                                            <p className="text-[10px] font-black text-gray-500 uppercase">Distance</p>
                                        </div>
                                        <p className="font-bold text-white">{selectedRide.distance_km || 'N/A'} km</p>
                                    </div>
                                    <div className="bg-navy p-4 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock size={16} className="text-orange-400" />
                                            <p className="text-[10px] font-black text-gray-500 uppercase">Requested</p>
                                        </div>
                                        <p className="font-bold text-white text-sm">{new Date(selectedRide.created_at).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-navy p-4 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <DollarSign size={16} className="text-emerald-400" />
                                            <p className="text-[10px] font-black text-gray-500 uppercase">Fare</p>
                                        </div>
                                        <p className="font-black text-accent text-xl">৳{selectedRide.estimated_fare}</p>
                                    </div>
                                </div>

                                {/* Driver Info (if assigned) */}
                                {selectedRide.driver_name && (
                                    <div className="bg-navy rounded-2xl p-5 border border-white/5">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Driver</p>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white font-bold">
                                                {selectedRide.driver_name?.charAt(0) || 'D'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-white">{selectedRide.driver_name}</p>
                                                <p className="text-xs text-gray-400">{selectedRide.driver_phone || 'Contact via app'}</p>
                                            </div>
                                            <button
                                                onClick={() => setChatTarget({
                                                    id: selectedRide.rider_id,
                                                    name: selectedRide.driver_name,
                                                    contextId: selectedRide.id,
                                                    contextType: 'ride'
                                                })}
                                                className="p-3 bg-white/5 text-accent rounded-xl border border-white/5 active:bg-accent active:text-navy transition-all"
                                            >
                                                <MessageCircle size={20} />
                                            </button>
                                            {(selectedRide.status === 'assigned' || selectedRide.status === 'on_the_way' || selectedRide.status === 'picked') && (
                                                <button
                                                    onClick={() => setShowNavigation(true)}
                                                    className="px-4 py-2 bg-accent text-navy rounded-lg font-black text-[10px] uppercase tracking-wider"
                                                >
                                                    Track
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedRide.status === 'requested' && (
                                    <div className="pt-2">
                                        <button
                                            onClick={() => handleCancelRide(selectedRide.id)}
                                            className="w-full py-4 bg-red-500/10 text-red-500 rounded-xl font-black uppercase tracking-widest border border-red-500/20 active:bg-red-500 active:text-white transition-all"
                                        >
                                            Cancel Ride Request
                                        </button>
                                    </div>
                                )}

                                <div className="pb-8">
                                    <button
                                        onClick={() => setSelectedRide(null)}
                                        className="w-full py-4 bg-white text-navy rounded-xl font-black uppercase tracking-widest"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Ride Request Sheet */}
            <AnimatePresence>
                {rideBooking && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 z-[120] backdrop-blur-sm"
                            onClick={() => { setRideBooking(null); setRideDest(''); setEstimation(null); }}
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 bg-navy rounded-t-[2.5rem] z-[130] flex flex-col max-h-[85vh] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10"
                        >
                            <div className="p-8 pb-4 border-b border-white/5 flex items-start justify-between bg-navy-light sticky top-0 rounded-t-[2.5rem] z-10">
                                <div>
                                    <h2 className="text-2xl font-black text-white mb-1 italic tracking-tight">Request Carrier</h2>
                                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">From {rideBooking.hotel_name}</p>
                                </div>
                                <button
                                    onClick={() => { setRideBooking(null); setRideDest(''); setEstimation(null); }}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <XCircle size={24} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-32">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-3 block tracking-widest px-2">Where to?</label>
                                    <div className="relative group">
                                        <Navigation className="absolute left-5 top-1/2 -translate-y-1/2 text-accent group-focus-within:rotate-45 transition-transform" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Enter destination"
                                            className="w-full bg-navy-light border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-6 outline-none focus:border-accent transition-all font-bold text-white text-base"
                                            value={rideDest}
                                            onChange={(e) => setRideDest(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-3 block tracking-widest px-2">Vehicle Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'bike', label: 'Bike', icon: <Truck size={18} /> },
                                            { id: 'car', label: 'Car', icon: <Car size={18} /> }
                                        ].map(v => (
                                            <button
                                                key={v.id}
                                                onClick={() => {
                                                    setVehicleType(v.id);
                                                    fetchEstimation(v.id);
                                                }}
                                                className={`p-4 rounded-2xl border transition-all text-left flex items-center gap-3 ${vehicleType === v.id ? 'border-accent bg-accent/10 shadow-lg' : 'border-white/5 bg-navy-light hover:border-white/10'}`}
                                            >
                                                <div className={vehicleType === v.id ? 'text-accent' : 'text-gray-500'}>{v.icon}</div>
                                                <span className={`font-black uppercase text-[10px] tracking-widest ${vehicleType === v.id ? 'text-white' : 'text-gray-500'}`}>{v.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {estimation && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-accent/10 rounded-3xl p-6 border border-accent/20"
                                    >
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[9px] font-black text-accent uppercase tracking-[0.2em] mb-1">Estimated Fare</p>
                                                <p className="text-3xl font-black text-white italic">৳{estimation.estimated_fare}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Distance</p>
                                                <p className="text-sm font-bold text-gray-300">{estimation.distance_km} km</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-navy via-navy to-transparent pt-12 border-t border-white/5">
                                <button
                                    onClick={handleRequestRide}
                                    disabled={requestingRide || !rideDest}
                                    className="w-full bg-accent text-navy py-5 rounded-2xl font-black text-sm shadow-2xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50"
                                >
                                    {requestingRide ? <Loader size={18} className="animate-spin" /> : <><ShieldCheck size={20} /> Request Ride</>}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Ride Success Modal */}
            <AnimatePresence>
                {showRideSuccess && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setShowRideSuccess(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-navy-light rounded-[2.5rem] w-full max-sm:max-w-xs p-8 text-center relative z-10 border border-white/10 shadow-2xl"
                        >
                            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="text-primary w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-white italic tracking-tight mb-2">Request Sent!</h2>
                            <p className="text-gray-400 font-medium text-xs leading-relaxed mb-8 px-4">
                                A driver is being assigned to your location. You can track the status in the Rides tab.
                            </p>
                            <button
                                onClick={() => { setShowRideSuccess(false); setActiveTab('rides'); }}
                                className="w-full bg-primary text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                            >
                                Track Now
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Food Menu Sheet */}
            <AnimatePresence>
                {foodBooking && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 z-[100] backdrop-blur-sm"
                            onClick={() => { setFoodBooking(null); setCart({}); }}
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 bg-navy rounded-t-[2.5rem] z-[110] flex flex-col max-h-[90vh] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10"
                        >
                            <div className="p-8 pb-4 border-b border-white/5 flex items-start justify-between bg-navy-light sticky top-0 rounded-t-[2.5rem]">
                                <div>
                                    <h2 className="text-2xl font-black text-white mb-1 italic tracking-tight">Room Service</h2>
                                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{foodBooking.hotel_name}</p>
                                </div>
                                <button
                                    onClick={() => { setFoodBooking(null); setCart({}); }}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <XCircle size={24} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 pb-32">
                                {menu.map(item => {
                                    const quantity = cart[item.id] || 0;
                                    return (
                                        <div key={item.id} className="bg-navy-light rounded-3xl p-4 border border-white/5 hover:border-accent/30 transition-all flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl">
                                                🍽️
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-white text-base truncate">{item.name}</h3>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">{item.category}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-lg font-black text-accent">৳{item.price}</span>
                                                    {quantity === 0 ? (
                                                        <button
                                                            onClick={() => setCart({ ...cart, [item.id]: 1 })}
                                                            className="px-6 py-2 bg-accent text-navy rounded-xl font-black text-[10px] uppercase tracking-wider hover:scale-105 active:scale-95 transition-all"
                                                        >
                                                            ADD
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center gap-4 bg-navy px-3 py-1.5 rounded-xl border border-white/10">
                                                            <button
                                                                onClick={() => {
                                                                    const newCart = { ...cart };
                                                                    if (quantity > 1) newCart[item.id] = quantity - 1;
                                                                    else delete newCart[item.id];
                                                                    setCart(newCart);
                                                                }}
                                                                className="text-gray-400 font-black text-lg hover:text-white"
                                                            >
                                                                −
                                                            </button>
                                                            <span className="font-black text-white min-w-[20px] text-center">{quantity}</span>
                                                            <button
                                                                onClick={() => setCart({ ...cart, [item.id]: quantity + 1 })}
                                                                className="text-accent font-black text-lg hover:text-accent/80"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {Object.keys(cart).length > 0 && (
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-navy via-navy to-transparent pt-12 border-t border-white/5">
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={placingOrder}
                                        className="w-full bg-accent text-navy py-5 rounded-2xl font-black text-sm shadow-2xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-between px-8"
                                    >
                                        <div className="text-left">
                                            <p className="text-[8px] uppercase tracking-[0.2em] opacity-60">Total Amount</p>
                                            <p className="text-lg leading-none mt-1 font-black">
                                                ৳{menu.reduce((total, item) => total + (cart[item.id] || 0) * item.price, 0)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {placingOrder ? <Loader size={18} className="animate-spin" /> : <><Package size={20} /> <span className="uppercase tracking-[0.1em]">Place Order</span></>}
                                        </div>
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Order Success Popup */}
            <AnimatePresence>
                {showFoodSuccess && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setShowFoodSuccess(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-navy-light rounded-[2.5rem] w-full max-w-sm p-8 text-center relative z-10 border border-white/10 shadow-2xl"
                        >
                            <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="text-accent w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-white italic tracking-tight mb-2">Order Placed!</h2>
                            <p className="text-gray-400 font-medium text-xs leading-relaxed mb-8 px-4">
                                Your room service from {activeBooking?.hotel_name} is being prepared. Enjoy your meal!
                            </p>
                            <button
                                onClick={() => setShowFoodSuccess(false)}
                                className="w-full bg-accent text-navy py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-accent/20 transition-all hover:scale-105 active:scale-95"
                            >
                                Awesome
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Navigation Backdrop */}
            <AnimatePresence>
                {showNavigation && selectedRide && (
                    <EmbeddedNavigation
                        pickupLat={selectedRide.pickup_lat}
                        pickupLng={selectedRide.pickup_lng}
                        dropoffLat={selectedRide.destination_lat}
                        dropoffLng={selectedRide.destination_lng}
                        navigationType={selectedRide.status === 'picked' ? 'dropoff' : 'pickup'}
                        customerName={selectedRide.driver_name}
                        onClose={() => setShowNavigation(false)}
                        isMobile={true}
                        remoteOrigin={selectedRide.driver_lat && selectedRide.driver_lng ? [parseFloat(selectedRide.driver_lat), parseFloat(selectedRide.driver_lng)] : null}
                        isCustomerView={true}
                    />
                )}
            </AnimatePresence>

            {/* Chat Modal Layer */}
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

const EmptyState = ({ icon: Icon, message }) => (
    <div className="flex flex-col items-center justify-center py-20 bg-navy-light rounded-3xl border border-dashed border-white/10">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-500">
            <Icon size={32} />
        </div>
        <p className="text-gray-400 font-bold text-sm">{message}</p>
    </div>
);

export default MobileTrips;
