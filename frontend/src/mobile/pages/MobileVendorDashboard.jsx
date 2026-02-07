import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Building, Plus, Calendar, Settings, MapPin, DollarSign,
    Image as ImageIcon, Loader, Users, CheckCircle, XCircle,
    AlertTriangle, Phone, Mail, Clock, TrendingUp, ChevronRight,
    ShoppingBag, Star, User, Save, X, Trash2, LogOut, ChevronLeft,
    Wifi, Car, Wind, Dumbbell, Waves, Layers, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../../context/ModalContext';
import ChatModal from '../components/ChatModal.jsx';
import { MessageCircle } from 'lucide-react';

const MobileVendorDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showSuccess, showError, showConfirm } = useModal();
    const [activeTab, setActiveTab] = useState('bookings');
    const [hotels, setHotels] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [foodOrders, setFoodOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ total_earnings: 0, pending_payouts: 0 });
    const [bookingFilter, setBookingFilter] = useState('all');
    const [activeCategory, setActiveCategory] = useState('all');
    const [chatTarget, setChatTarget] = useState(null); // { id, name, contextId, contextType }

    // Property Management States
    const [showHotelForm, setShowHotelForm] = useState(false);
    const [showRoomForm, setShowRoomForm] = useState(false);
    const [selectedHotelForRoom, setSelectedHotelForRoom] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [hotelForm, setHotelForm] = useState({
        name: '', address: '', description: '', price_per_hour: '',
        hotel_type: 'hotel', contact_phone: '', contact_email: '',
        has_wifi: true, has_parking: false, has_ac: true
    });

    const [roomForm, setRoomForm] = useState({
        name: 'Standard Room', price: '', capacity: '2', room_number: ''
    });

    const getImageUrl = (url) => {
        if (!url || url === 'assets/default_hotel.png' || url.includes('default_property')) return '/assets/default_hotel.png';
        if (typeof url === 'string' && url.startsWith('http')) return url;
        const cleanUrl = typeof url === 'string' ? (url.startsWith('/') ? url.substring(1) : url) : '';
        return `/${cleanUrl}`;
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        const category = params.get('category') || 'all';

        setActiveCategory(category);

        if (tab) {
            setActiveTab(tab);
        } else {
            // Default tab based on category
            // Default tab based on category
            if (category === 'hotels') setActiveTab('hotels');
            else if (category === 'bookings') {
                setActiveTab('bookings');
                setBookingFilter('pending');
            }
            else if (category === 'food') setActiveTab('food');
            else if (category === 'profile') setActiveTab('profile');
            else if (category === 'all') setActiveTab('overview');
            else setActiveTab('bookings');
        }
    }, [location]);

    useEffect(() => {
        const userJson = localStorage.getItem('user');
        if (!userJson) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(userJson);
        if (user.type !== 'vendor') {
            navigate('/dashboard');
            return;
        }
        fetchData(true); // Initial fetch with loading state

        const interval = setInterval(() => {
            // Poll for New Content (Bookings & Food)
            const checkUpdates = async () => {
                try {
                    // Update Bookings
                    const bookRes = await fetch('/api/vendor/bookings.php', { credentials: 'include' });
                    const bookData = await bookRes.json();
                    if (bookData.success) {
                        setBookings(prev => {
                            const newPendings = bookData.data.filter(b => b.booking_status === 'pending');
                            const oldPendings = prev.filter(b => b.booking_status === 'pending');

                            if (newPendings.length > oldPendings.length) {
                                new Audio('/assets/sounds/notification.mp3').play().catch(e => console.log('Audio play failed', e));
                            }
                            return bookData.data;
                        });
                    }

                    // Update Food if needed
                    if (activeTab === 'food') {
                        const foodRes = await fetch('/api/food/order.php', { credentials: 'include' });
                        const foodData = await foodRes.json();
                        if (foodData.success) {
                            setFoodOrders(prev => {
                                if (foodData.data.length > prev.length) {
                                    new Audio('/assets/sounds/notification.mp3').play().catch(e => console.log('Audio play failed', e));
                                }
                                return foodData.data;
                            });
                        }
                    }
                } catch (e) { console.error('Real-time sync error', e); }
            };
            checkUpdates();
        }, 5000);

        return () => clearInterval(interval);
    }, [navigate]); // Removed activeTab

    const fetchData = async (isInitial = false) => {
        if (isInitial) setLoading(true);
        try {
            const [propRes, userRes, bookRes, foodRes] = await Promise.all([
                fetch('/api/hotels.php?mine=true', { credentials: 'include' }),
                fetch('/api/auth/me.php', { credentials: 'include' }),
                fetch('/api/vendor/bookings.php', { credentials: 'include' }),
                fetch('/api/food/order.php', { credentials: 'include' })
            ]);

            const [propData, userData, bookData, foodData] = await Promise.all([
                propRes.json(), userRes.json(), bookRes.json(), foodRes.json()
            ]);

            if (propData.success) setHotels(propData.data);
            if (userData.authenticated) setUser(userData.user);
            if (bookData.success) {
                setBookings(bookData.data);
                const earnings = bookData.data
                    .filter(b => ['completed', 'active', 'confirmed'].includes(b.booking_status))
                    .reduce((sum, b) => sum + (parseFloat(b.total_price || 0) * 0.9), 0);
                setStats(prev => ({ ...prev, total_earnings: earnings }));
            }
            if (foodData.success) setFoodOrders(foodData.data);

        } catch (err) {
            console.error('FetchData Error:', err);
            setError('Failed to sync dashboard data.');
        } finally {
            if (isInitial) setLoading(false);
        }
    };

    const handleBookingStatus = async (bookingId, newStatus) => {
        const action = newStatus === 'cancelled' ? 'cancel' : newStatus;
        showConfirm(`Are you sure you want to ${action} this booking?`, async () => {
            try {
                const res = await fetch('/api/vendor/update_booking_status.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ booking_id: bookingId, status: newStatus }),
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.success) {
                    showSuccess(`Booking ${newStatus} successfully!`);
                    fetchData();
                } else {
                    showError(data.message || 'Update failed');
                }
            } catch (err) {
                showError('Network error updating booking status');
            }
        });
    };

    const handleFoodStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch('/api/vendor/update_food_order.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderId, status: newStatus, minutes: 0 }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                fetchData();
            } else {
                showError(data.message || 'Update failed');
            }
        } catch (err) {
            showError('Network error updating food order');
        }
    };

    const handleAddHotel = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            Object.keys(hotelForm).forEach(key => {
                const value = typeof hotelForm[key] === 'boolean' ? (hotelForm[key] ? 1 : 0) : hotelForm[key];
                formData.append(key, value);
            });

            const res = await fetch('/api/hotels/create.php', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                showSuccess('Property listed successfully!');
                setShowHotelForm(false);
                fetchData();
            } else {
                showError(data.message || 'Listing failed');
            }
        } catch (err) {
            showError('Network error listing property');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // First add room type
            const rtRes = await fetch('/api/vendor/manage_rooms.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add_room_type',
                    hotel_id: selectedHotelForRoom.id,
                    name: roomForm.name,
                    price: roomForm.price || selectedHotelForRoom.price_per_hour,
                    capacity: roomForm.capacity
                }),
                credentials: 'include'
            });
            const rtData = await rtRes.json();

            if (rtData.success) {
                // Then add physical room
                const rRes = await fetch('/api/vendor/manage_rooms.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'add_room',
                        room_type_id: rtData.id,
                        room_number: roomForm.room_number || '101'
                    }),
                    credentials: 'include'
                });
                const rData = await rRes.json();
                if (rData.success) {
                    showSuccess('Room added successfully!');
                    setShowRoomForm(false);
                    fetchData();
                }
            }
        } catch (err) {
            showError('Network error adding room');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-navy flex flex-col items-center justify-center">
            <Loader className="animate-spin text-accent mb-4" size={32} />
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest text-center">Loading Vendor Intel...</p>
        </div>
    );

    const topHotel = hotels.reduce((prev, current) => {
        const prevBookings = bookings.filter(b => b.hotel_id === prev.id).length;
        const currentBookings = bookings.filter(b => b.hotel_id === current.id).length;
        return (currentBookings > prevBookings) ? current : prev;
    }, hotels[0] || null);

    const successRate = bookings.length > 0
        ? Math.round((bookings.filter(b => b.booking_status === 'active' || b.booking_status === 'completed').length / bookings.length) * 100)
        : 0;

    const totalRevenue = stats.total_earnings || 0;
    const monthlyTarget = 50000;
    const progressToTarget = Math.min(Math.round((totalRevenue / monthlyTarget) * 100), 100);

    return (
        <div className="min-h-screen bg-navy text-white pb-28 font-sans">
            {/* Content Tabs hidden on Dashboard (Overview), Booking, Hotels, Food, or Profile as they are now primary bottom-nav items */}
            <div className="hidden">
                <div className="flex gap-2 px-4 py-4 overflow-x-auto scrollbar-hide">
                    {[
                        { id: 'overview', label: 'Overview', icon: <Layers size={14} />, categories: ['all'] },
                        { id: 'bookings', label: 'Stays', icon: <Calendar size={14} />, count: bookings.filter(b => b.booking_status === 'pending').length, categories: ['all', 'hotels'] },
                        { id: 'hotels', label: 'Hotels', icon: <Building size={14} />, categories: ['all', 'hotels'] },
                        { id: 'food', label: 'Food', icon: <ShoppingBag size={14} />, count: foodOrders.filter(f => f.status === 'pending').length, categories: ['all', 'food'] },
                        { id: 'profile', label: 'Profile', icon: <User size={14} />, categories: ['all', 'profile'] },
                    ].filter(tab => tab.categories.includes(activeCategory)).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                navigate(`?category=${activeCategory}&tab=${tab.id}`, { replace: true });
                            }}
                            className={`flex-shrink-0 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-white text-navy shadow-lg shadow-white/10' : 'bg-white/5 text-gray-400 border border-white/5'}`}
                        >
                            {tab.icon} {tab.label}
                            {tab.count > 0 && (
                                <span className="bg-accent text-navy px-1.5 py-0.5 rounded-full text-[8px] animate-pulse">{tab.count}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Specialized Sub-Nav for Hotels Category REMOVED per user request - each is now a primary bottom nav item */}



            <div className="p-4">
                <AnimatePresence mode="wait">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Professional Alpha Header */}
                            <div className="bg-gradient-to-br from-indigo-900 via-navy to-navy border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full -mr-32 -mt-32" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Live Business Intelligence</span>
                                    </div>
                                    <div className="flex justify-between items-end mb-8">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Revenue</p>
                                            <h2 className="text-4xl font-black tracking-tighter">৳{totalRevenue.toLocaleString()}</h2>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Yield Index</p>
                                            <p className="text-xl font-black text-accent">{progressToTarget}%</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-500">
                                            <span>Monthly Target Progress</span>
                                            <span>৳{totalRevenue.toLocaleString()} / ৳{monthlyTarget.toLocaleString()}</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressToTarget}%` }}
                                                className="h-full bg-gradient-to-r from-indigo-500 to-accent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Performance HUD */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 backdrop-blur-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                                            <Star size={20} />
                                        </div>
                                        <span className="text-[8px] font-black bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-tighter italic">Top Tier</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-200 truncate">{topHotel?.name || 'Initializing...'}</p>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Prime Property</p>
                                </div>
                                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 backdrop-blur-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                                            <CheckCircle size={20} />
                                        </div>
                                        <span className="text-[8px] font-black bg-accent/20 text-accent px-2 py-0.5 rounded-full uppercase tracking-tighter italic">Velocity</span>
                                    </div>
                                    <p className="text-2xl font-black">{successRate}%</p>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Success Rate</p>
                                </div>
                            </div>

                            {/* Operational Status Grid */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                                    <p className="text-xl font-black text-orange-400">{bookings.filter(b => b.booking_status === 'pending').length}</p>
                                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter mt-1">Pending</p>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                                    <p className="text-xl font-black text-green-400">{bookings.filter(b => b.booking_status === 'active').length}</p>
                                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter mt-1">Active</p>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                                    <p className="text-xl font-black text-indigo-400">{foodOrders.filter(f => f.status === 'pending').length}</p>
                                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter mt-1">Kitchen</p>
                                </div>
                            </div>

                            {/* Dynamic Insights Feed */}
                            <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                        <TrendingUp size={14} className="text-accent" />
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-300">Strategy Insights</h3>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[11px] text-gray-400 leading-relaxed italic">
                                        "Portfolio optimization is <span className="text-accent font-bold underline underline-offset-4">stable</span>.
                                        {bookings.filter(b => b.booking_status === 'pending').length > 0
                                            ? ` Critical attention required for ${bookings.filter(b => b.booking_status === 'pending').length} pending stay(s) to maximize yield.`
                                            : " All operational metrics are currently within nominal parameters."
                                        }"
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setActiveTab('bookings')}
                                            className="flex-1 bg-white text-navy py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-white/5"
                                        >
                                            View Pipeline
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('hotels')}
                                            className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5 transition-all active:scale-95"
                                        >
                                            Audit Assets
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Bookings List */}
                    {activeTab === 'bookings' && (
                        <motion.div
                            key="bookings"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <div className="flex gap-2 mb-2 overflow-x-auto pb-1 scrollbar-hide">
                                {['all', 'pending', 'confirmed', 'active', 'completed'].map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setBookingFilter(filter)}
                                        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${bookingFilter === filter ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-500'}`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>

                            {bookings.filter(b => bookingFilter === 'all' || b.booking_status === bookingFilter).length === 0 ? (
                                <div className="bg-white/5 rounded-3xl p-12 text-center border border-white/5">
                                    <Calendar className="mx-auto mb-4 text-gray-600" size={40} />
                                    <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">No matching bookings</p>
                                </div>
                            ) : (
                                bookings
                                    .filter(b => bookingFilter === 'all' || b.booking_status === bookingFilter)
                                    .map(b => (
                                        <BookingCard key={b.id} booking={b} onStatus={handleBookingStatus} />
                                    ))
                            )}
                        </motion.div>
                    )}

                    {/* Hotels List */}
                    {activeTab === 'hotels' && (
                        <motion.div
                            key="hotels"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <button
                                onClick={() => setShowHotelForm(true)}
                                className="w-full bg-white/5 border border-dashed border-white/10 p-8 rounded-3xl text-center flex flex-col items-center justify-center gap-2 group active:scale-95 transition-all"
                            >
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Plus size={24} />
                                </div>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">List New Property</p>
                            </button>

                            <div className="grid grid-cols-1 gap-4">
                                {hotels.length === 0 ? (
                                    <div className="bg-white/5 rounded-3xl p-12 text-center border border-white/5">
                                        <Building className="mx-auto mb-4 text-gray-600" size={40} />
                                        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">No properties listed yet</p>
                                    </div>
                                ) : (
                                    hotels.map(h => (
                                        <HotelCard
                                            key={h.id}
                                            hotel={h}
                                            getImageUrl={getImageUrl}
                                            onAddRoom={() => {
                                                setSelectedHotelForRoom(h);
                                                setShowRoomForm(true);
                                            }}
                                        />
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Food Orders */}
                    {activeTab === 'food' && (
                        <motion.div
                            key="food"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            {foodOrders.length === 0 ? (
                                <div className="bg-white/5 rounded-3xl p-12 text-center border border-white/5">
                                    <ShoppingBag className="mx-auto mb-4 text-gray-600" size={40} />
                                    <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">No food orders yet</p>
                                </div>
                            ) : (
                                foodOrders.map(order => (
                                    <FoodOrderCard key={order.order_id} order={order} onStatus={handleFoodStatus} />
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === 'profile' && user && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {/* Vendor Header inside Profile */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-xl">
                                            {user?.full_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold text-white tracking-tight">{user?.full_name}</h1>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global Operations</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5 backdrop-blur-sm">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <DollarSign size={10} /> Balance
                                        </p>
                                        <p className="text-xl font-black text-accent">৳{user?.balance?.toLocaleString() || '0'}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5 backdrop-blur-sm">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <TrendingUp size={10} /> Earnings
                                        </p>
                                        <p className="text-xl font-black text-indigo-400">৳{(stats.total_earnings || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                                <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
                                    {[
                                        { id: 'profile', label: 'Settings', icon: <Settings size={14} />, categories: ['all', 'profile'] },
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white text-navy`}
                                        >
                                            {tab.icon} {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <ProfileItem icon={<Mail size={16} />} label="Email Address" value={user.email} />
                                    <ProfileItem icon={<Phone size={16} />} label="Phone Number" value={user.phone || 'Not set'} />
                                    <ProfileItem icon={<Building size={16} />} label="Business" value="Quickrent Partner" />

                                    <button
                                        onClick={() => navigate('/trust-center')}
                                        className="w-full flex items-center gap-4 p-4 bg-accent/10 rounded-2xl border border-accent/20 hover:bg-accent/20 transition-all"
                                    >
                                        <div className="p-2 bg-accent/20 rounded-xl text-accent flex items-center justify-center"><Shield size={16} /></div>
                                        <div className="text-left flex-1">
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Trust Center</p>
                                            <p className="text-sm font-bold text-accent">Verify Your Business</p>
                                        </div>
                                        <ChevronRight size={16} className="text-accent" />
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    showConfirm('Are you sure you want to log out?', () => {
                                        fetch('/api/auth/logout.php', { credentials: 'include' }).then(() => {
                                            localStorage.removeItem('user');
                                            navigate('/login');
                                        });
                                    });
                                }}
                                className="w-full bg-red-500/10 text-red-500 py-5 rounded-3xl border border-red-500/20 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:bg-red-500 active:text-white transition-all transform active:scale-95"
                            >
                                <LogOut size={16} /> Sign Out Account
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Hotel Form Modal */}
            <AnimatePresence>
                {showHotelForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-navy/90 backdrop-blur-xl p-4 overflow-y-auto"
                    >
                        <div className="max-w-md mx-auto pt-8 pb-12">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black">List Property</h3>
                                <button onClick={() => setShowHotelForm(false)} className="p-2 bg-white/5 rounded-full"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleAddHotel} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Name</label>
                                    <input required type="text" value={hotelForm.name} onChange={e => setHotelForm({ ...hotelForm, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="e.g. Grand Plaza Hotel" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Address</label>
                                    <input required type="text" value={hotelForm.address} onChange={e => setHotelForm({ ...hotelForm, address: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="Full address" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Price /Hr (৳)</label>
                                        <input required type="number" value={hotelForm.price_per_hour} onChange={e => setHotelForm({ ...hotelForm, price_per_hour: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Type</label>
                                        <select value={hotelForm.hotel_type} onChange={e => setHotelForm({ ...hotelForm, hotel_type: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-accent transition-colors">
                                            <option value="hotel">Hotel</option>
                                            <option value="apartment">Apartment</option>
                                            <option value="villa">Villa</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Facilities</label>
                                    <div className="flex gap-2">
                                        <FacilityToggle active={hotelForm.has_wifi} onClick={() => setHotelForm({ ...hotelForm, has_wifi: !hotelForm.has_wifi })} icon={<Wifi size={14} />} />
                                        <FacilityToggle active={hotelForm.has_ac} onClick={() => setHotelForm({ ...hotelForm, has_ac: !hotelForm.has_ac })} icon={<Wind size={14} />} />
                                        <FacilityToggle active={hotelForm.has_parking} onClick={() => setHotelForm({ ...hotelForm, has_parking: !hotelForm.has_parking })} icon={<Car size={14} />} />
                                    </div>
                                </div>

                                <button disabled={submitting} type="submit" className="w-full bg-accent text-navy py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-accent/10 active:scale-95 transition-all mt-4">
                                    {submitting ? 'Processing...' : 'Complete Listing'}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Room Form Modal */}
            <AnimatePresence>
                {showRoomForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-navy/90 backdrop-blur-xl p-4 flex items-center justify-center"
                    >
                        <div className="w-full max-w-md bg-navy rounded-3xl p-6 border border-white/5 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-black leading-tight">Add Room</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{selectedHotelForRoom?.name}</p>
                                </div>
                                <button onClick={() => setShowRoomForm(false)} className="p-2 bg-white/5 rounded-full"><X size={18} /></button>
                            </div>

                            <form onSubmit={handleAddRoom} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Room Number / Name</label>
                                    <input required type="text" value={roomForm.room_number} onChange={e => setRoomForm({ ...roomForm, room_number: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-accent transition-colors" placeholder="e.g. Suite 302" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Price (optional)</label>
                                        <input type="number" value={roomForm.price} onChange={e => setRoomForm({ ...roomForm, price: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-accent transition-colors" placeholder={selectedHotelForRoom?.price_per_hour} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Capacity</label>
                                        <input required type="number" value={roomForm.capacity} onChange={e => setRoomForm({ ...roomForm, capacity: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-accent transition-colors" />
                                    </div>
                                </div>

                                <button disabled={submitting} type="submit" className="w-full bg-indigo-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/10 active:scale-95 transition-all mt-2">
                                    {submitting ? 'Creating...' : 'Finalize Room'}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Modal Overlay */}
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

const FacilityToggle = ({ active, onClick, icon }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-accent text-navy' : 'bg-white/5 text-gray-500 border border-white/5'}`}
    >
        {icon}
    </button>
);

const ProfileItem = ({ icon, label, value }) => (
    <div className="flex items-center gap-4 p-4 bg-navy/40 rounded-2xl border border-white/5">
        <div className="p-2 bg-white/5 rounded-xl text-indigo-400 flex items-center justify-center">{icon}</div>
        <div>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-sm font-bold text-gray-200">{value}</p>
        </div>
    </div>
);

const BookingCard = ({ booking, onStatus }) => (
    <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
        <div className="flex justify-between items-start mb-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${booking.booking_status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                        booking.booking_status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                            booking.booking_status === 'active' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-gray-400'
                        }`}>
                        {booking.booking_status}
                    </span>
                    {parseInt(booking.is_emergency) === 1 && (
                        <span className="bg-red-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full animate-pulse">Emergency</span>
                    )}
                </div>
                <h3 className="font-bold text-white text-lg leading-tight">{booking.hotel_name}</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{booking.room_type_name}</p>
            </div>
            <div className="text-right">
                <p className="text-xl font-black text-accent">৳{booking.total_price}</p>
                <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold font-sans">{booking.total_hours} hrs</p>
            </div>
        </div>

        <div className="bg-navy/50 rounded-2xl p-4 space-y-3 mb-4 border border-white/5">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400"><User size={14} /></div>
                <div>
                    <p className="text-xs font-bold text-gray-200">{booking.user_name}</p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-none mt-0.5">{booking.user_email}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400"><Clock size={14} /></div>
                <div>
                    <p className="text-xs font-bold text-gray-200">{new Date(booking.check_in_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-none mt-0.5">Check-in Schedule</p>
                </div>
            </div>
        </div>

        <div className="flex gap-2">
            {booking.booking_status === 'pending' && (
                <>
                    <button onClick={() => onStatus(booking.id, 'confirmed')} className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:bg-green-600 transition-all active:scale-95 shadow-lg shadow-green-500/10">
                        <CheckCircle size={14} /> Accept Intel
                    </button>
                    <button onClick={() => onStatus(booking.id, 'cancelled')} className="px-5 bg-red-500/10 text-red-500 py-4 rounded-2xl border border-red-500/20 active:bg-red-500 flex items-center justify-center transition-all active:scale-95">
                        <X size={16} />
                    </button>
                </>
            )}
            {booking.booking_status !== 'pending' && booking.booking_status !== 'cancelled' && (
                <button
                    onClick={() => setChatTarget({
                        id: booking.user_id,
                        name: booking.user_name,
                        contextId: booking.id,
                        contextType: 'hotel'
                    })}
                    className="w-full bg-accent text-navy py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-accent/10"
                >
                    <MessageCircle size={14} /> Connect with Client
                </button>
            )}
        </div>
    </div>
);

const HotelCard = ({ hotel, getImageUrl, onAddRoom }) => (
    <div className="bg-white/5 rounded-3xl overflow-hidden border border-white/5 p-3 pr-4 active:bg-white/10 transition-colors">
        <div className="flex gap-4">
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                <img
                    src={getImageUrl(hotel.image_url)}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.src = '/assets/default_hotel.png'}
                />
            </div>
            <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-sm font-bold text-white truncate">{hotel.name}</h3>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-1 truncate">
                        <MapPin size={10} className="text-gray-600 flex-shrink-0" /> {hotel.address}
                    </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-accent font-black text-xs italic leading-none">৳{hotel.price_per_hour}/hr</span>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${parseInt(hotel.is_active) ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {parseInt(hotel.is_active) ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>
        </div>

        <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
            <button onClick={onAddRoom} className="flex-1 py-3 bg-white/5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                <Layers size={14} /> Add Room
            </button>
            <button className="px-4 py-3 bg-white/5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                <Settings size={14} />
            </button>
        </div>
    </div>
);

const FoodOrderCard = ({ order, onStatus }) => (
    <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
        <div className="flex justify-between items-start mb-4">
            <div>
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${order.status === 'pending' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                    {order.status}
                </span>
                <h3 className="font-bold text-white text-lg mt-2 leading-none">Order #{order.order_id}</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Room {order.room_number || 'N/A'}</p>
            </div>
            <div className="text-right">
                <p className="text-xl font-black text-accent">৳{order.total_price}</p>
                <div className="flex items-center gap-1 text-[9px] text-gray-600 justify-end uppercase tracking-widest font-bold font-sans">
                    <Clock size={8} /> {order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                </div>
            </div>
        </div>

        <div className="space-y-2 mb-4">
            <div className="bg-navy/50 rounded-2xl p-4 border border-white/5">
                <p className="text-xs font-bold text-gray-300">Food Menu Selection</p>
                <p className="text-[10px] text-gray-500 mt-1 italic leading-tight">Customer: {order.user_name || 'In-House Guest'}</p>
            </div>
        </div>

        {order.status === 'pending' && (
            <div className="flex gap-2">
                <button onClick={() => onStatus(order.order_id, 'preparing')} className="flex-1 bg-accent text-navy py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:bg-white transition-all active:scale-95 shadow-lg shadow-accent/10">
                    Prepare
                </button>
                <button
                    onClick={() => setChatTarget({
                        id: order.user_id,
                        name: order.user_name,
                        contextId: order.order_id,
                        contextType: 'food'
                    })}
                    className="px-5 bg-white/5 text-gray-400 py-4 rounded-2xl border border-white/5 active:bg-white/10 flex items-center justify-center transition-all active:scale-95"
                >
                    <MessageCircle size={18} />
                </button>
            </div>
        )}
        {order.status !== 'pending' && (
            <div className="flex gap-2">
                {order.status === 'preparing' && (
                    <button onClick={() => onStatus(order.order_id, 'delivered')} className="flex-1 bg-indigo-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:bg-indigo-600 transition-all active:scale-95">
                        Mark Delivered
                    </button>
                )}
                <button
                    onClick={() => setChatTarget({
                        id: order.user_id,
                        name: order.user_name,
                        contextId: order.order_id,
                        contextType: 'food'
                    })}
                    className="w-full bg-white/5 text-gray-400 py-4 rounded-2xl border border-white/5 active:bg-indigo-600 flex items-center justify-center transition-all active:scale-95 gap-2"
                >
                    <MessageCircle size={18} /> Message Guest
                </button>
            </div>
        )}
    </div>
);

export default MobileVendorDashboard;
