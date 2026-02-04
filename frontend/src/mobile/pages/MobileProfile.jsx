import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    User, Mail, Phone, Calendar, LogOut, Shield, CheckCircle,
    ChevronRight, Loader, MapPin, LayoutDashboard, Clock,
    Truck, Package, TrendingUp, X, Star, ShieldCheck,
    Filter, Search, Navigation, AlertCircle, Plus, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../../context/ModalContext';

const MobileProfile = () => {
    const navigate = useNavigate();
    const { showSuccess, showError, showConfirm } = useModal();
    const [searchParams, setSearchParams] = useSearchParams();

    // Core State
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('stays'); // stays, rides, food, record

    // Ride state
    const [rideBooking, setRideBooking] = useState(null);
    const [rideDest, setRideDest] = useState('');
    const [destCoords, setDestCoords] = useState(null);
    const [vehicleType, setVehicleType] = useState('car');
    const [estimation, setEstimation] = useState(null);
    const [requestingRide, setRequestingRide] = useState(false);
    const [rides, setRides] = useState([]);
    const [selectedRide, setSelectedRide] = useState(null);

    // Food State
    const [foodBooking, setFoodBooking] = useState(null);
    const [activeOrders, setActiveOrders] = useState([]);
    const [menu, setMenu] = useState([]);
    const [cart, setCart] = useState({});
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Misc State
    const [timeline, setTimeline] = useState([]);
    const [pendingBooking, setPendingBooking] = useState(null);
    const [confirmingBooking, setConfirmingBooking] = useState(false);
    const [extendingId, setExtendingId] = useState(null);
    const [extendHours, setExtendHours] = useState(1);
    const [extendLoading, setExtendLoading] = useState(false);

    // Check-in/out success flashes
    const [showCheckInSuccess, setShowCheckInSuccess] = useState(false);
    const [showCheckOutSuccess, setShowCheckOutSuccess] = useState(false);

    const getImageUrl = (url) => {
        if (!url || url === 'assets/default_property.jpg') return '/assets/default_hotel.png';
        if (typeof url === 'string' && url.startsWith('http')) return url;
        const cleanUrl = typeof url === 'string' ? (url.startsWith('/') ? url.substring(1) : url) : '';
        return `/${cleanUrl}`;
    };

    const fetchData = async () => {
        try {
            const [meRes, bookingsRes, pendingRes, ordersRes, ridesRes, timelineRes] = await Promise.all([
                fetch('/api/auth/me.php', { credentials: 'include' }),
                fetch('/api/bookings/list.php', { credentials: 'include' }),
                fetch('/api/bookings/get_pending.php', { credentials: 'include' }),
                fetch('/api/food/order.php', { credentials: 'include' }),
                fetch('/api/rides/request.php', { credentials: 'include' }),
                fetch('/api/user/timeline.php', { credentials: 'include' })
            ]);

            const meData = await meRes.json();
            if (meData.authenticated) setUser(meData.user);
            else navigate('/mobile/login');

            const bookingsData = await bookingsRes.json();
            if (bookingsData.success) {
                const priority = { 'active': 0, 'confirmed': 1, 'pending': 2, 'completed': 3, 'cancelled': 4 };
                const sorted = [...bookingsData.data].sort((a, b) => (priority[a.booking_status] ?? 5) - (priority[b.booking_status] ?? 5));
                setBookings(sorted);
            }

            const pendingData = await pendingRes.json();
            if (pendingData.success) setPendingBooking(pendingData.data);

            const ordersData = await ordersRes.json();
            if (ordersData.success) setActiveOrders(ordersData.data);

            const ridesData = await ridesRes.json();
            if (ridesData.success) setRides(ridesData.data);

            const timelineData = await timelineRes.json();
            if (timelineData.success) setTimeline(timelineData.data);

        } catch (err) {
            console.error('MobileProfile fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout.php', { credentials: 'include' });
            localStorage.removeItem('user');
            navigate('/mobile/home');
        } catch (e) { }
    };

    const getRemainingTime = (checkoutTime) => {
        const diff = new Date(checkoutTime) - new Date();
        if (diff <= 0) return 'Expired';
        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${mins}m`;
    };

    const handleCheckIn = async (id) => {
        try {
            const res = await fetch('/api/bookings/check_in.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ booking_id: id }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setShowCheckInSuccess(true);
                setTimeout(() => setShowCheckInSuccess(false), 2000);
                fetchData();
            } else {
                showError(data.message || 'Check-in failed');
            }
        } catch (err) { showError('Check-in error'); }
    };

    const handleCheckOut = async (id) => {
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
                setTimeout(() => setShowCheckOutSuccess(false), 2000);
                fetchData();
            } else {
                showError(data.message || 'Check-out failed');
            }
        } catch (err) { showError('Check-out error'); }
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
                showSuccess('Stay extended!');
                setExtendingId(null);
                fetchData();
            } else {
                showError(data.message);
            }
        } catch (err) { showError('Extension failed'); }
        finally { setExtendLoading(false); }
    };

    if (loading && !user) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
            <Loader className="animate-spin text-primary" size={32} />
        </div>
    );

    const activeBookings = bookings.filter(b => ['active', 'confirmed', 'pending'].includes(b.booking_status));

    return (
        <div className="pb-24 bg-[#f8fafc] min-h-screen">
            {/* Minimal Header */}
            <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100 sticky top-0 z-[40]">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black italic tracking-tighter text-secondary">My Hub</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Member Status: Platinum</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleLogout} className="p-2 bg-red-50 text-red-500 rounded-xl">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-2 mt-6 overflow-x-auto scrollbar-hide no-scrollbar -mx-2 px-2">
                    {[
                        { id: 'stays', label: 'Stays', icon: <Calendar size={14} /> },
                        { id: 'rides', label: 'Rides', icon: <Truck size={14} /> },
                        { id: 'food', label: 'Food', icon: <Package size={14} /> },
                        { id: 'record', label: 'Profile', icon: <User size={14} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-secondary text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-6 py-6">
                <AnimatePresence mode="wait">
                    {/* Stays Tab */}
                    {activeTab === 'stays' && (
                        <motion.div
                            key="stays"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-6"
                        >
                            {/* Wallet Summary */}
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={80} /></div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Current Balance</p>
                                    <h3 className="text-3xl font-black italic tracking-tighter mb-4">৳{user?.balance?.toLocaleString() || '0'}</h3>
                                    <button className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">+ Top Up</button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Clock size={14} className="text-primary" /> Active Bookings
                                </h3>
                                <span className="text-[10px] font-black text-gray-400">{activeBookings.length} total</span>
                            </div>

                            {activeBookings.length === 0 ? (
                                <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem] p-12 text-center text-gray-300">
                                    <Calendar size={40} className="mx-auto mb-4 opacity-50" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No active stays</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {activeBookings.map(booking => {
                                        const remaining = (booking.booking_status === 'active' || booking.booking_status === 'confirmed')
                                            ? getRemainingTime(booking.check_out_time)
                                            : null;

                                        return (
                                            <div key={booking.id} className="bg-white rounded-[2rem] p-4 border border-gray-100 shadow-sm">
                                                <div className="flex gap-4 mb-4">
                                                    <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
                                                        <img src={getImageUrl(booking.image_url)} alt="Hotel" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="font-black text-sm text-secondary truncate pr-2 tracking-tight">{booking.hotel_name}</h4>
                                                            <span className="text-[8px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase font-black border border-indigo-100">
                                                                {booking.booking_status}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                            <MapPin size={10} className="text-primary" /> {booking.room_type_name}
                                                        </p>
                                                        {remaining && (
                                                            <div className="mt-2 text-[10px] font-black text-emerald-600 flex items-center gap-1">
                                                                <Clock size={10} /> {remaining} left
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Stay Actions */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    {booking.booking_status === 'confirmed' && (
                                                        <button
                                                            onClick={() => handleCheckIn(booking.id)}
                                                            className="bg-emerald-600 text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                                                        >
                                                            <CheckCircle size={14} /> Check In
                                                        </button>
                                                    )}
                                                    {booking.booking_status === 'active' && (
                                                        <button
                                                            onClick={() => handleCheckOut(booking.id)}
                                                            className="bg-red-500 text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-red-100"
                                                        >
                                                            <X size={14} /> Check Out
                                                        </button>
                                                    )}
                                                    {booking.booking_status === 'active' && (
                                                        <button
                                                            onClick={() => setExtendingId(extendingId === booking.id ? null : booking.id)}
                                                            className="bg-amber-100 text-amber-700 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-amber-200"
                                                        >
                                                            <Clock size={14} /> Extend
                                                        </button>
                                                    )}
                                                    {booking.booking_status === 'active' && (
                                                        <button
                                                            onClick={() => {
                                                                setRideBooking(booking);
                                                                setActiveTab('rides');
                                                            }}
                                                            className="bg-secondary text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                                                        >
                                                            <Truck size={14} /> Get Ride
                                                        </button>
                                                    )}
                                                </div>

                                                {extendingId === booking.id && (
                                                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-3">
                                                        <select
                                                            value={extendHours}
                                                            onChange={(e) => setExtendHours(parseInt(e.target.value))}
                                                            className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-black uppercase"
                                                        >
                                                            {[1, 2, 3, 4, 12, 24].map(h => <option key={h} value={h}>+{h}hr</option>)}
                                                        </select>
                                                        <button
                                                            onClick={() => handleExtend(booking.id)}
                                                            disabled={extendLoading}
                                                            className="bg-primary text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase disabled:opacity-50"
                                                        >
                                                            {extendLoading ? <Loader size={12} className="animate-spin" /> : 'Pay'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Rides Tab */}
                    {activeTab === 'rides' && (
                        <motion.div
                            key="rides"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-6"
                        >
                            <h3 className="text-xs font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                                <Truck size={14} className="text-primary" /> Active Rides
                            </h3>

                            {rides.filter(r => ['requested', 'assigned', 'on_the_way', 'picked'].includes(r.status)).length === 0 ? (
                                <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem] p-10 text-center text-gray-300">
                                    <Truck size={32} className="mx-auto mb-3 opacity-50" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No rides in progress</p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {rides.filter(r => ['requested', 'assigned', 'on_the_way', 'picked'].includes(r.status)).map(ride => (
                                        <div
                                            key={ride.id}
                                            onClick={() => setSelectedRide(ride)}
                                            className="bg-white rounded-3xl p-5 border border-primary/20 shadow-lg shadow-primary/5 flex items-center gap-4 animate-pulse-subtle"
                                        >
                                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                                <Navigation size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className="text-xs font-black text-secondary uppercase tracking-tight">Active Trip</h4>
                                                    <span className="text-[8px] bg-primary text-white px-2 py-0.5 rounded-full font-black uppercase">{ride.status}</span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-bold truncate">to {ride.destination_address}</p>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-300" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <h3 className="text-xs font-black text-secondary uppercase tracking-[0.2em] pt-4">Recent Trips</h3>
                            <div className="grid gap-3">
                                {rides.filter(r => !['requested', 'assigned', 'on_the_way', 'picked'].includes(r.status)).slice(0, 5).map(ride => (
                                    <div key={ride.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                            <CheckCircle size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="text-[10px] font-black text-secondary uppercase truncate pr-4">{ride.destination_address}</h4>
                                                <span className="text-[10px] font-black text-primary italic">৳{ride.estimated_fare || ride.fare}</span>
                                            </div>
                                            <p className="text-[8px] text-gray-300 font-bold uppercase tracking-widest">
                                                {new Date(ride.created_at).toLocaleDateString()} • {ride.vehicle_type}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Food Tab */}
                    {activeTab === 'food' && (
                        <motion.div
                            key="food"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-6"
                        >
                            <h3 className="text-xs font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                                <Package size={14} className="text-primary" /> Kitchen Status
                            </h3>

                            {activeOrders.length === 0 ? (
                                <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem] p-10 text-center text-gray-300">
                                    <Package size={32} className="mx-auto mb-3 opacity-50" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No active orders</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {activeOrders.map(order => (
                                        <div key={order.id} className="bg-white rounded-[2rem] p-5 border border-primary/20 shadow-lg relative overflow-hidden">
                                            <div className="absolute top-0 left-0 h-1 bg-primary/10 w-full">
                                                <div
                                                    className="h-full bg-primary transition-all duration-1000"
                                                    style={{ width: order.status === 'cooking' ? '60%' : order.status === 'ready' ? '100%' : '20%' }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="text-sm font-black text-secondary">Order #{order.id}</h4>
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">{order.status}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black italic text-secondary leading-none">৳{order.total_amount}</p>
                                                </div>
                                            </div>
                                            <div className="text-[11px] text-gray-500 font-bold bg-gray-50 p-3 rounded-xl border border-gray-100 truncate">
                                                {(() => {
                                                    try {
                                                        const items = JSON.parse(order.items_json);
                                                        return Array.isArray(items) ? items.map(i => i.name).join(', ') : 'Refresh to see items';
                                                    } catch (e) { return 'Items loading...'; }
                                                })()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === 'record' && (
                        <motion.div
                            key="record"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-8"
                        >
                            {/* Personal Badge */}
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-secondary to-dark p-1 rounded-full shadow-2xl mb-4">
                                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-3xl font-black text-secondary italic">
                                        {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black italic tracking-tighter text-secondary">{user?.full_name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <Shield size={14} className="text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Verified Identity</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner"><Mail size={20} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Email Node</p>
                                        <p className="text-xs font-bold text-secondary">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner"><Phone size={20} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Secure Line</p>
                                        <p className="text-xs font-bold text-secondary">{user?.phone || 'Not Connected'}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full bg-white border-2 border-gray-100 text-secondary py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-sm flex items-center justify-center gap-3 active:scale-95 transition-all"
                            >
                                <LayoutDashboard size={18} /> Exit to Desktop Mode
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Ride Request Success */}
            <AnimatePresence>
                {rideBooking && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
                        className="fixed inset-0 z-[100] bg-white p-8 flex flex-col pt-20"
                    >
                        <button onClick={() => setRideBooking(null)} className="absolute top-8 right-8 p-2 bg-gray-100 rounded-full"><X size={20} /></button>
                        <h2 className="text-3xl font-black italic tracking-tighter text-secondary mb-2">Request Carrier</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-8">From: {rideBooking.hotel_name}</p>

                        <div className="space-y-6 flex-1">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Destination</label>
                                <input
                                    type="text"
                                    placeholder="Enter drop location"
                                    className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold outline-none focus:border-primary"
                                    value={rideDest}
                                    onChange={(e) => setRideDest(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {['car', 'bike'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setVehicleType(type)}
                                        className={`p-6 rounded-[2rem] border-2 transition-all text-center ${vehicleType === type ? 'border-primary bg-primary/5' : 'border-gray-50 bg-gray-50'}`}
                                    >
                                        <Truck size={24} className={`mx-auto mb-2 ${vehicleType === type ? 'text-primary' : 'text-gray-300'}`} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">{type === 'car' ? 'Sedan' : 'Motorbike'}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            disabled={!rideDest || requestingRide}
                            onClick={async () => {
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
                                            vehicle_type: vehicleType,
                                            estimated_fare: vehicleType === 'bike' ? 120 : 250
                                        }),
                                        credentials: 'include'
                                    });
                                    const data = await res.json();
                                    if (data.success) {
                                        showSuccess('Ride Requested!');
                                        setRideBooking(null);
                                        setRideDest('');
                                        fetchData();
                                    }
                                } catch (e) { }
                                finally { setRequestingRide(false); }
                            }}
                            className="bg-secondary text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl disabled:opacity-50"
                        >
                            {requestingRide ? <Loader size={20} className="animate-spin mx-auto" /> : 'Launch Journey'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Selected Ride Tracker Modal */}
            <AnimatePresence>
                {selectedRide && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
                        className="fixed inset-0 z-[100] bg-white p-8 flex flex-col pt-20"
                    >
                        <button onClick={() => setSelectedRide(null)} className="absolute top-8 right-8 p-2 bg-gray-100 rounded-full"><X size={20} /></button>
                        <div className="text-center mb-8">
                            <div className="w-16 h-1 bg-gray-100 rounded-full mx-auto mb-6"></div>
                            <h2 className="text-2xl font-black italic tracking-tighter text-secondary uppercase">Trip Monitor</h2>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Status: {selectedRide.status.replace('_', ' ')}</p>
                        </div>

                        <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 mb-8">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-2xl">
                                    {selectedRide.driver_name?.charAt(0) || 'P'}
                                </div>
                                <div>
                                    <h4 className="font-black text-lg text-secondary">{selectedRide.driver_name || 'Pilot Search...'}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{selectedRide.vehicle_model || selectedRide.vehicle_type}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
                                    <span>Fare Total</span>
                                    <span>৳{selectedRide.estimated_fare || selectedRide.fare}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
                                    <span>Drop Point</span>
                                    <span className="truncate max-w-[150px]">{selectedRide.destination_address}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex items-center justify-center flex-col opacity-20">
                            <Navigation size={80} className="animate-pulse text-secondary mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Pinging Fleet Live</p>
                        </div>

                        <button
                            onClick={() => setSelectedRide(null)}
                            className="bg-secondary text-white py-5 rounded-[2rem] font-black uppercase tracking-widest"
                        >
                            Close View
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Check-in Flash Overlay */}
            <AnimatePresence>
                {showCheckInSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-emerald-600/95 flex flex-col items-center justify-center text-white p-10 text-center"
                    >
                        <CheckCircle size={80} className="mb-6" />
                        <h2 className="text-4xl font-black italic tracking-tighter mb-2">Authenticated!</h2>
                        <p className="text-white/70 font-bold uppercase text-[10px] tracking-[0.2em]">Session Initiated. Welcome back.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MobileProfile;
