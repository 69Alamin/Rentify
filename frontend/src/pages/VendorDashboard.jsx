import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Plus, Calendar, Settings, MapPin, DollarSign, Image as ImageIcon, Loader, Users, CheckCircle, XCircle, AlertTriangle, Phone, Mail, Clock, Wifi, Car, Wind, Dumbbell, Waves, ShoppingBag, Home, TrendingUp, MessageCircle } from 'lucide-react';
import ChatModal from '../mobile/components/ChatModal.jsx';
import { motion } from 'framer-motion';
import { useModal } from '../context/ModalContext';

const VendorDashboard = () => {
    const navigate = useNavigate();
    const { showSuccess, showError, showConfirm } = useModal();
    const [activeTab, setActiveTab] = useState('bookings'); // Default to bookings - vendor's primary task
    const [hotels, setHotels] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [foodOrders, setFoodOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ total_earnings: 0, pending_payouts: 0 });
    const [estimateTimes, setEstimateTimes] = useState({}); // Track estimate time input for each order
    const [bookingFilter, setBookingFilter] = useState('all'); // 'all', 'pending', 'active', 'completed'
    const [chatTarget, setChatTarget] = useState(null); // { id, name, contextId, contextType }

    // Add Room Type Form State
    const [roomTypeData, setRoomTypeData] = useState({ hotel_id: '', name: '', price: '', capacity: '2' });
    // Add Physical Room Form State
    const [roomData, setRoomData] = useState({ room_type_id: '', room_number: '' });

    // Add Hotel Form State - Modernized with all new fields
    const [formData, setFormData] = useState({
        // Basic Info
        name: '',
        address: '',
        description: '',
        price_per_hour: '',
        hotel_type: 'hotel',
        latitude: '',
        longitude: '',
        // Contact Info
        contact_phone: '',
        contact_email: '',
        emergency_contact: '',
        // Policies
        check_in_time: '14:00',
        check_out_time: '12:00',
        cancellation_policy: '',
        house_rules: '',
        min_booking_hours: 1,
        max_booking_hours: 24,
        // Facilities
        has_wifi: true,
        has_parking: false,
        has_ac: true,
        has_elevator: false,
        has_restaurant: false,
        has_gym: false,
        has_pool: false,
        has_laundry: false
    });
    const [imageFile, setImageFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Hotel Statistics Modal State
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [hotelStats, setHotelStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [editingHotel, setEditingHotel] = useState(null); // State for editing

    const getImageUrl = (url) => {
        if (!url || url === 'assets/default_hotel.png' || url.includes('default_property')) return '/assets/default_hotel.png';
        if (typeof url === 'string' && url.startsWith('http')) return url;
        const cleanUrl = typeof url === 'string' ? (url.startsWith('/') ? url.substring(1) : url) : '';
        return `/${cleanUrl}`;
    };

    // Initial Data Fetch
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.type !== 'vendor') {
            navigate('/dashboard'); // Common user dashboard
            return;
        }
        fetchData();

        // Polling for real-time updates (Bookings & Food)
        const interval = setInterval(() => {
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
        }, 5000); // 5 seconds polling

        return () => clearInterval(interval);
    }, [navigate, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Hotels
            const propRes = await fetch('/api/hotels.php?mine=true', { credentials: 'include' });
            if (propRes.ok) {
                const propData = await propRes.json();
                if (propData.success && Array.isArray(propData.data)) {
                    setHotels(propData.data);
                }
            } else {
                const text = await propRes.text();
                console.error('API Error Response:', text);
            }

            // Fetch User
            const userRes = await fetch('/api/auth/me.php', { credentials: 'include' });
            const userData = await userRes.json();
            if (userData.authenticated) setUser(userData.user);

            // Fetch Bookings
            const bookRes = await fetch('/api/vendor/bookings.php', { credentials: 'include' });
            if (bookRes.ok) {
                const bookData = await bookRes.json();
                if (bookData.success && Array.isArray(bookData.data)) {
                    setBookings(bookData.data);
                    // Simple stats calc
                    const earnings = bookData.data
                        .filter(b => b && (b.booking_status === 'completed' || b.booking_status === 'active' || b.booking_status === 'confirmed'))
                        .reduce((sum, b) => sum + (parseFloat(b.total_price || 0) * 0.9), 0);
                    setStats(prev => ({ ...prev, total_earnings: earnings }));
                }
            }

            // Fetch Room Types
            const roomRes = await fetch('/api/vendor/manage_rooms.php', { credentials: 'include' });
            const roomData = await roomRes.json();
            if (roomData.success) setRoomTypes(roomData.data);

            // Fetch Food Orders
            const foodRes = await fetch('/api/food/order.php', { credentials: 'include' });
            const foodData = await foodRes.json();
            if (foodData.success) setFoodOrders(foodData.data);

        } catch (err) {
            console.error('FetchData Error:', err);
            setError('Failed to sync dashboard data. Check backend connectivity.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteHotel = (id) => {
        showConfirm(
            'Are you sure you want to delete this property? All associated rooms and data will be permanently removed.',
            async () => {
                try {
                    const res = await fetch('/api/hotels/delete.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id }),
                        credentials: 'include'
                    });
                    const result = await res.json();
                    if (result.success) {
                        showSuccess('Property deleted successfully');
                        fetchData();
                    } else {
                        showError(result.message || 'Failed to delete property');
                    }
                } catch (err) {
                    showError('Network error deleting property');
                }
            },
            'Confirm Property Deletion'
        );
    };

    const handleEditButtonClick = (hotel, e) => {
        e.stopPropagation(); // Don't trigger hotel stats
        setEditingHotel(hotel);
        setFormData({
            name: hotel.name || '',
            address: hotel.address || '',
            description: hotel.description || '',
            price_per_hour: hotel.price_per_hour || '',
            hotel_type: hotel.hotel_type || 'hotel',
            latitude: hotel.latitude || '',
            longitude: hotel.longitude || '',
            contact_phone: hotel.contact_phone || '',
            contact_email: hotel.contact_email || '',
            emergency_contact: hotel.emergency_contact || '',
            check_in_time: hotel.check_in_time || '14:00',
            check_out_time: hotel.check_out_time || '12:00',
            cancellation_policy: hotel.cancellation_policy || '',
            house_rules: hotel.house_rules || '',
            min_booking_hours: hotel.min_booking_hours || 1,
            max_booking_hours: hotel.max_booking_hours || 24,
            has_wifi: !!parseInt(hotel.has_wifi),
            has_parking: !!parseInt(hotel.has_parking),
            has_ac: !!parseInt(hotel.has_ac),
            has_elevator: !!parseInt(hotel.has_elevator),
            has_restaurant: !!parseInt(hotel.has_restaurant),
            has_gym: !!parseInt(hotel.has_gym),
            has_pool: !!parseInt(hotel.has_pool),
            has_laundry: !!parseInt(hotel.has_laundry)
        });
        setActiveTab('add'); // Switch to form tab
    };

    const handleUpdateHotel = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        data.append('id', editingHotel.id);

        Object.keys(formData).forEach(key => {
            if (key.startsWith('has_')) {
                data.append(key, formData[key] ? 1 : 0);
            } else {
                data.append(key, formData[key]);
            }
        });

        if (imageFile) data.append('image', imageFile);

        try {
            const res = await fetch('/api/hotels/update.php', {
                method: 'POST',
                body: data,
                credentials: 'include'
            });
            const result = await res.json();

            if (result.success) {
                showSuccess('Hotel updated successfully!');
                setEditingHotel(null);
                setActiveTab('hotels');
                resetForm();
                fetchData();
            } else {
                showError('Error: ' + result.message);
            }
        } catch (err) {
            showError('Network error updating hotel');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '', address: '', description: '', price_per_hour: '', hotel_type: 'hotel', latitude: '', longitude: '',
            contact_phone: '', contact_email: '', emergency_contact: '',
            check_in_time: '14:00', check_out_time: '12:00', cancellation_policy: '', house_rules: '',
            min_booking_hours: 1, max_booking_hours: 24,
            has_wifi: true, has_parking: false, has_ac: true, has_elevator: false,
            has_restaurant: false, has_gym: false, has_pool: false, has_laundry: false
        });
        setImageFile(null);
        setEditingHotel(null);
    };

    const handleAddRoomType = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/vendor/manage_rooms.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...roomTypeData, action: 'add_room_type' }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                showSuccess('Room category added!');
                setRoomTypeData({ hotel_id: '', name: '', price: '', capacity: '2' });
                fetchData();
            }
        } catch (err) { showError('Error adding room type'); }
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/vendor/manage_rooms.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...roomData, action: 'add_room' }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                showSuccess('Room added!');
                setRoomData({ room_type_id: '', room_number: '' });
                fetchData();
            }
        } catch (err) { showError('Error adding room'); }
    };

    const handleAddHotel = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();

        // Add all form data, converting booleans to integers for facilities
        Object.keys(formData).forEach(key => {
            if (key.startsWith('has_')) {
                // Convert boolean to 1 or 0
                data.append(key, formData[key] ? 1 : 0);
            } else {
                data.append(key, formData[key]);
            }
        });

        if (imageFile) data.append('image', imageFile);

        try {
            const res = await fetch('/api/hotels/create.php', {
                method: 'POST',
                body: data,
                credentials: 'include'
            });
            const result = await res.json();

            if (result.success) {
                showSuccess('Hotel added successfully!');
                setActiveTab('hotels');
                // Reset form with default values
                resetForm();
                fetchData();
            } else {
                showError('Error: ' + result.message);
            }
        } catch (err) {
            showError('Network error adding hotel');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBookingStatus = async (bookingId, newStatus, forceManual = false) => {
        console.log('handleBookingStatus called', { bookingId, newStatus, forceManual });

        try {
            const res = await fetch('/api/vendor/update_booking_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ booking_id: bookingId, status: newStatus, force_manual: forceManual }),
                credentials: 'include'
            });

            const data = await res.json();

            if (res.status === 409 && data.has_active_ride) {
                showConfirm(
                    'The guest has an active ride request. Would you like to cancel their ride and proceed with manual check-in?',
                    () => handleBookingStatus(bookingId, newStatus, true),
                    'Active Guest Ride'
                );
                return;
            }

            if (data.success) {
                showSuccess('Booking ' + newStatus + ' successfully!');
                fetchData();
            } else {
                showError('Error updating status: ' + (data.message || 'Unknown error'));
            }
        } catch (err) {
            showError('Network error updating booking status: ' + err.message);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        showConfirm(
            'Are you sure you want to cancel this booking? This action cannot be undone.',
            async () => {
                try {
                    const res = await fetch('/api/bookings/cancel.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ booking_id: bookingId }),
                        credentials: 'include'
                    });
                    const data = await res.json();
                    if (data.success) {
                        showSuccess('Booking cancelled successfully');
                        fetchData();
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

    const fetchHotelStats = async (hotelId) => {
        setStatsLoading(true);
        try {
            const res = await fetch(`/api/vendor/hotel_stats.php?hotel_id=${hotelId}`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setHotelStats(data.data);
            } else {
                showError('Error loading stats: ' + data.message);
            }
        } catch (err) {
            showError('Error loading hotel statistics');
        } finally {
            setStatsLoading(false);
        }
    };

    const handleHotelClick = (hotel) => {
        setSelectedHotel(hotel);
        fetchHotelStats(hotel.id);
    };

    const handleFoodStatus = async (orderId, newStatus, minutes = 0) => {
        try {
            const res = await fetch('/api/vendor/update_food_order.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderId, status: newStatus, minutes: minutes }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                fetchData();
            } else {
                showError('Error updating status: ' + data.message);
            }
        } catch (err) {
            showError('Network error updating food order status');
        }
    };

    if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center"><Loader className="animate-spin text-primary" size={30} /></div>;

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center gap-3 shadow-sm"
                    >
                        <AlertTriangle className="text-red-500" size={20} />
                        <div className="flex-grow">
                            <p className="text-red-800 font-bold text-sm">Action Required</p>
                            <p className="text-red-600 text-xs">{error}</p>
                        </div>
                        <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 font-bold text-xl px-2">×</button>
                    </motion.div>
                )}
                {/* Header */}
                <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter text-secondary">Vendor <span className="text-primary">Intelligence</span></h1>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2 px-1">Global Hotel Management Operations</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* Global Metrics Mini Cards */}
                        <motion.div
                            whileHover={{ y: -2 }}
                            className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex items-center gap-4 shadow-aura-sm"
                        >
                            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                                <DollarSign className="text-primary w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-gray-500 font-black text-xs uppercase tracking-widest leading-none mb-1">Wallet</div>
                                <div className="text-white font-black text-lg italic leading-none">৳{user?.balance?.toLocaleString() || '0'}</div>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -2 }}
                            className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex items-center gap-4 shadow-aura-sm"
                        >
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                <TrendingUp className="text-emerald-400 w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-gray-500 font-black text-xs uppercase tracking-widest leading-none mb-1">Net Earnings (90%)</div>
                                <div className="text-emerald-400 font-black text-lg italic leading-none">৳{(stats?.total_earnings || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                            </div>
                        </motion.div>

                        <button
                            onClick={() => setActiveTab('add')}
                            className="bg-primary text-white px-5 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary-hover flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                        >
                            <Plus size={16} /> List New
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200 mb-8 overflow-x-auto pb-1">
                    <button
                        onClick={() => setActiveTab('hotels')}
                        className={`px-4 py-2 font-bold flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'hotels' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Building size={18} /> My Hotels ({hotels.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`px-4 py-2 font-bold flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'bookings' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Calendar size={18} /> Bookings ({bookings.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('rooms')}
                        className={`px-4 py-2 font-bold flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'rooms' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Settings size={18} /> Manage Rooms
                    </button>
                    <button
                        onClick={() => setActiveTab('food')}
                        className={`px-4 py-2 font-bold flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'food' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Plus size={18} /> Food Orders ({foodOrders.length})
                    </button>
                    <button
                        onClick={() => { resetForm(); setActiveTab('add'); }}
                        className={`px-4 py-2 font-bold flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'add' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Plus size={18} /> {editingHotel ? 'Edit Hotel' : 'Add Hotel'}
                    </button>
                </div>

                {/* Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'hotels' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {hotels.length === 0 ? (
                                <div className="col-span-full bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                        <Building size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-secondary mb-2 whitespace-nowrap">No Hotels Listed Yet</h3>
                                    <p className="text-gray-400 mb-8 max-w-md mx-auto">You haven't added any hotels to your portfolio yet. Start by clicking the "Add Hotel" button.</p>
                                    <button
                                        onClick={() => setActiveTab('add')}
                                        className="px-8 py-3 aura-gradient-primary text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-aura-md"
                                    >
                                        List My First Hotel
                                    </button>
                                </div>
                            ) : hotels.map(p => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={p.id}
                                    onClick={() => handleHotelClick(p)}
                                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer"
                                >
                                    <div className="h-48 relative overflow-hidden">
                                        <img src={getImageUrl(p.image_url)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80'; }} />
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                                            {p.hotel_type}
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-lg font-bold text-secondary truncate pr-2">{p.name}</h3>
                                            <div className="flex gap-2">
                                                <button onClick={(e) => handleEditButtonClick(p, e)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Edit">
                                                    <Settings size={14} />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteHotel(p.id); }} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Delete">
                                                    <XCircle size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-gray-500 text-sm mb-3 truncate flex items-center gap-1"><MapPin size={14} />{p.address}</p>
                                        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                            <span className="text-primary font-bold">৳{p.price_per_hour}/hr</span>
                                            <span className={`text-xs px-2 py-1 rounded font-bold ${parseInt(p.is_active) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {parseInt(p.is_active) ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'bookings' && (
                        <>
                            {/* Booking Statistics */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => setBookingFilter('pending')}
                                    className={`group cursor-pointer transition-all hover:scale-105 active:scale-95 rounded-[2rem] p-8 border-2 shadow-aura-sm relative overflow-hidden ${bookingFilter === 'pending'
                                        ? 'bg-indigo-950/40 border-indigo-500/30'
                                        : 'bg-slate-900 border-white/5 hover:border-indigo-500/20'
                                        }`}
                                >
                                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors"></div>
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <div className="w-14 h-14 bg-indigo-500/20 rounded-[1.25rem] flex items-center justify-center shadow-inner">
                                            <Calendar className="text-indigo-400 w-7 h-7" />
                                        </div>
                                        <span className="text-white font-black text-3xl italic tracking-tighter">
                                            {bookings.filter(b => b.booking_status === 'pending').length}
                                        </span>
                                    </div>
                                    <div className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] relative z-10">Pending Approval</div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    onClick={() => setBookingFilter('confirmed')}
                                    className={`group cursor-pointer transition-all hover:scale-105 active:scale-95 rounded-[2rem] p-8 border-2 shadow-aura-sm relative overflow-hidden ${bookingFilter === 'confirmed'
                                        ? 'bg-emerald-50 border-emerald-200 ring-8 ring-emerald-400/10'
                                        : 'bg-white border-transparent hover:border-emerald-100'
                                        }`}
                                >
                                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <div className="w-14 h-14 bg-emerald-500/20 rounded-[1.25rem] flex items-center justify-center shadow-inner">
                                            <CheckCircle className="text-emerald-400 w-7 h-7" />
                                        </div>
                                        <span className="text-white font-black text-3xl italic tracking-tighter">
                                            {bookings.filter(b => b.booking_status === 'confirmed').length}
                                        </span>
                                    </div>
                                    <div className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] relative z-10">Confirmed Stay</div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    onClick={() => setBookingFilter('active')}
                                    className={`group cursor-pointer transition-all hover:scale-105 active:scale-95 rounded-[2rem] p-8 border-2 shadow-aura-sm relative overflow-hidden ${bookingFilter === 'active'
                                        ? 'bg-blue-950/40 border-blue-500/30'
                                        : 'bg-slate-900 border-white/5 hover:border-blue-500/20'
                                        }`}
                                >
                                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <div className="w-14 h-14 bg-blue-500/20 rounded-[1.25rem] flex items-center justify-center shadow-inner">
                                            <CheckCircle className="text-blue-400 w-7 h-7" />
                                        </div>
                                        <span className="text-white font-black text-3xl italic tracking-tighter">
                                            {bookings.filter(b => b.booking_status === 'active').length}
                                        </span>
                                    </div>
                                    <div className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] relative z-10">Active Stay</div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    onClick={() => setBookingFilter('completed')}
                                    className={`cursor-pointer transition-all hover:scale-105 active:scale-95 rounded-2xl p-6 border shadow-sm ${bookingFilter === 'completed'
                                        ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-300 ring-4 ring-green-200'
                                        : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
                                            <CheckCircle className="text-green-700 w-6 h-6" />
                                        </div>
                                        <span className="text-green-600 font-black text-2xl">
                                            {bookings.filter(b => b.booking_status === 'completed').length}
                                        </span>
                                    </div>
                                    <div className="text-green-800 font-bold text-sm uppercase tracking-wider">Complete</div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    onClick={() => setBookingFilter('all')}
                                    className={`group cursor-pointer transition-all hover:scale-105 active:scale-95 rounded-[2rem] p-8 border-2 shadow-aura-sm relative overflow-hidden ${bookingFilter === 'all'
                                        ? 'bg-violet-950/40 border-violet-500/30'
                                        : 'bg-slate-900 border-white/5 hover:border-violet-500/20'
                                        }`}
                                >
                                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-colors"></div>
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <div className="w-14 h-14 bg-violet-500/20 rounded-[1.25rem] flex items-center justify-center shadow-inner">
                                            <Building className="text-violet-400 w-7 h-7" />
                                        </div>
                                        <span className="text-white font-black text-3xl italic tracking-tighter">
                                            {bookings.length}
                                        </span>
                                    </div>
                                    <div className="text-gray-400 font-black text-xs uppercase tracking-[0.2em] relative z-10">Total Registry</div>
                                </motion.div>


                            </div>

                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="text-left p-6 text-xs font-black text-gray-500 uppercase tracking-widest leading-none">Hotel</th>
                                            <th className="text-left p-6 text-xs font-black text-gray-500 uppercase tracking-widest leading-none">Guest</th>
                                            <th className="text-left p-6 text-xs font-black text-gray-500 uppercase tracking-widest leading-none">Schedule</th>
                                            <th className="text-left p-6 text-xs font-black text-gray-500 uppercase tracking-widest leading-none">Status</th>
                                            <th className="text-right p-6 text-xs font-black text-gray-500 uppercase tracking-widest leading-none">Economics</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {bookings
                                            .filter(b => bookingFilter === 'all' || b.booking_status === bookingFilter)
                                            .map(b => (
                                                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="font-bold text-secondary text-sm">{b.hotel_name}</div>
                                                        <div className="text-xs text-gray-400">{b.room_type_name}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-medium text-gray-700 text-sm">{b.user_name}</div>
                                                        <div className="text-xs text-gray-400">{b.user_email}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-sm">{new Date(b.check_in_time).toLocaleDateString()}</div>
                                                        <div className="text-xs text-gray-400 text-sm mb-1">{b.total_hours} hr stay</div>
                                                        {parseInt(b.is_emergency) === 1 && (
                                                            <div className="flex items-center gap-1 text-xs bg-red-500 text-white px-2 py-0.5 rounded uppercase font-black tracking-wider w-fit animate-pulse">
                                                                <AlertTriangle size={10} /> Emergency
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className={`p-4 transition-all ${b.booking_status === 'pending' ? 'bg-orange-50/30' : ''}`}>
                                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${b.booking_status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                            b.booking_status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                                                                b.booking_status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {b.booking_status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex justify-end items-center gap-2">
                                                            <span className="font-bold text-primary text-sm mr-2">৳{b.total_price}</span>
                                                            {b.booking_status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleBookingStatus(b.id, 'confirmed')}
                                                                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all hover:scale-110 active:scale-90"
                                                                        title="Accept Booking"
                                                                    >
                                                                        <CheckCircle size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleCancelBooking(b.id)}
                                                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all hover:scale-110 active:scale-90"
                                                                        title="Reject Booking"
                                                                    >
                                                                        <XCircle size={16} />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {b.booking_status === 'confirmed' && (
                                                                <button
                                                                    onClick={() => handleBookingStatus(b.id, 'active')}
                                                                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-xs font-bold shadow-md shadow-blue-500/20"
                                                                >
                                                                    Check In
                                                                </button>
                                                            )}
                                                            {b.booking_status === 'active' && (
                                                                <button
                                                                    onClick={() => handleBookingStatus(b.id, 'completed')}
                                                                    className="px-3 py-1.5 bg-gray-800 text-white rounded-lg hover:bg-black transition-all text-xs font-bold"
                                                                >
                                                                    Check Out
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => setChatTarget({
                                                                    id: b.user_id,
                                                                    name: b.user_name,
                                                                    contextId: b.id,
                                                                    contextType: 'hotel'
                                                                })}
                                                                className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                                title="Message Guest"
                                                            >
                                                                <MessageCircle size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                                {bookings.length === 0 && <div className="p-8 text-center text-gray-400">No bookings found</div>}
                            </div>
                        </>
                    )}

                    {activeTab === 'rooms' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold text-secondary mb-6 italic underline decoration-primary decoration-2 underline-offset-4">1. Create Room Category</h3>
                                <form onSubmit={handleAddRoomType} className="space-y-4">
                                    <select
                                        required className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-primary"
                                        value={roomTypeData.hotel_id}
                                        onChange={e => setRoomTypeData({ ...roomTypeData, hotel_id: e.target.value })}
                                    >
                                        <option value="">Select Hotel</option>
                                        {hotels.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <input
                                        type="text" placeholder="Category (e.g. Deluxe Suite)" required
                                        className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-primary"
                                        value={roomTypeData.name}
                                        onChange={e => setRoomTypeData({ ...roomTypeData, name: e.target.value })}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="number" placeholder="Price /hr" required
                                            className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-primary"
                                            value={roomTypeData.price}
                                            onChange={e => setRoomTypeData({ ...roomTypeData, price: e.target.value })}
                                        />
                                        <input
                                            type="number" placeholder="Capacity" required
                                            className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-primary"
                                            value={roomTypeData.capacity}
                                            onChange={e => setRoomTypeData({ ...roomTypeData, capacity: e.target.value })}
                                        />
                                    </div>
                                    <button className="w-full bg-secondary text-white font-bold py-3 rounded-xl hover:bg-black transition-all">Create Category</button>
                                </form>
                            </div>

                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold text-secondary mb-6 italic underline decoration-primary decoration-2 underline-offset-4">2. Manage Room Numbers</h3>
                                <form onSubmit={handleAddRoom} className="space-y-4">
                                    <select
                                        required className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-primary"
                                        value={roomData.room_type_id}
                                        onChange={e => setRoomData({ ...roomData, room_type_id: e.target.value })}
                                    >
                                        <option value="">Select Category</option>
                                        {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.hotel_name} - {rt.name}</option>)}
                                    </select>
                                    <input
                                        type="text" placeholder="Room Number (e.g. 301, B2)" required
                                        className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-primary"
                                        value={roomData.room_number}
                                        onChange={e => setRoomData({ ...roomData, room_number: e.target.value })}
                                    />
                                    <button className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all">Add Room Unit</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'food' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order Info</th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Guest & Room</th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Items</th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="text-right p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {foodOrders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="p-4">
                                                <div className="font-bold text-sm text-secondary">#{order.id}</div>
                                                <div className="text-xs text-gray-400">{new Date(order.created_at).toLocaleTimeString()}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-sm text-gray-700">{order.user_name}</div>
                                                <div className="text-xs text-primary font-bold">{order.hotel_name}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-gray-600">
                                                    {(() => {
                                                        try {
                                                            const items = JSON.parse(order.items_json);
                                                            return Array.isArray(items) ? items.map(i => `${i.name} (x${i.quantity})`).join(', ') : 'Order Details';
                                                        } catch (e) { return 'Order Details'; }
                                                    })()}
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-primary">৳{order.total_amount}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    order.status === 'accepted' || order.status === 'cooking' ? 'bg-blue-100 text-blue-700' :
                                                        order.status === 'ready' ? 'bg-purple-100 text-purple-700' :
                                                            order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                                {(order.status === 'accepted' || order.status === 'cooking') && order.estimated_min > 0 && (
                                                    <div className="text-xs text-gray-500 mt-1">Est: {order.estimated_min} mins</div>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    {order.status === 'pending' && (
                                                        <>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="120"
                                                                placeholder="Mins"
                                                                value={estimateTimes[order.id] || ''}
                                                                onChange={(e) => setEstimateTimes({ ...estimateTimes, [order.id]: e.target.value })}
                                                                className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-center"
                                                                title="Estimated preparation time in minutes"
                                                            />
                                                            <button onClick={() => {
                                                                const minutes = parseInt(estimateTimes[order.id] || 20);
                                                                if (minutes > 0) {
                                                                    handleFoodStatus(order.id, 'accepted', minutes);
                                                                    setEstimateTimes({ ...estimateTimes, [order.id]: '' }); // Clear after accepting
                                                                }
                                                            }} className="bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors text-xs font-bold" title="Accept & Cook">
                                                                Accept
                                                            </button>
                                                            <button onClick={() => handleFoodStatus(order.id, 'cancelled')} className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition-colors" title="Reject">
                                                                <XCircle size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {(order.status === 'accepted' || order.status === 'cooking') && (
                                                        <button onClick={() => handleFoodStatus(order.id, 'ready')} className="bg-purple-500 text-white px-3 py-1.5 rounded-lg hover:bg-purple-600 transition-colors text-xs font-bold" title="Mark Ready">
                                                            Mark Ready
                                                        </button>
                                                    )}
                                                    {order.status === 'ready' && (
                                                        <button onClick={() => handleFoodStatus(order.id, 'delivered')} className="bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors text-xs font-bold" title="Delivered">
                                                            Complete
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setChatTarget({
                                                            id: order.user_id,
                                                            name: order.user_name,
                                                            contextId: order.id,
                                                            contextType: 'food'
                                                        })}
                                                        className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                        title="Message Guest"
                                                    >
                                                        <MessageCircle size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {foodOrders.length === 0 && <div className="p-12 text-center text-gray-400">No food orders yet</div>}
                        </div>
                    )}

                    {activeTab === 'add' && (
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 mb-6">
                                <h2 className="text-3xl font-black text-secondary mb-2 italic">{editingHotel ? 'Edit Property' : 'List a New Hotel'}</h2>
                                <p className="text-gray-500 text-sm mb-8">{editingHotel ? `Update details for ${editingHotel.name}` : 'Fill in the details to add your hotel to Rentify'}</p>

                                <form onSubmit={editingHotel ? handleUpdateHotel : handleAddHotel} className="space-y-8">
                                    {/* Basic Information Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                                <Home size={20} className="text-primary" />
                                            </div>
                                            <h3 className="text-lg font-bold text-secondary">Basic Information</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Hotel Name *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="e.g. Dhaka Luxury Suite"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Hotel Type *</label>
                                                <select
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none"
                                                    value={formData.hotel_type}
                                                    onChange={e => setFormData({ ...formData, hotel_type: e.target.value })}
                                                >
                                                    <option value="hotel">Hotel</option>
                                                    <option value="apartment">Apartment</option>
                                                    <option value="resort">Resort</option>
                                                    <option value="villa">Villa</option>
                                                    <option value="hostel">Hostel</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Hourly Rate (৳) *</label>
                                                <input
                                                    type="number"
                                                    required
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none"
                                                    value={formData.price_per_hour}
                                                    onChange={e => setFormData({ ...formData, price_per_hour: e.target.value })}
                                                    placeholder="500"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Address *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none"
                                                    value={formData.address}
                                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                    placeholder="Full street address"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Latitude</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none"
                                                    value={formData.latitude}
                                                    onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                                                    placeholder="e.g. 23.8103"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Longitude</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none"
                                                    value={formData.longitude}
                                                    onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                                                    placeholder="e.g. 90.4125"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                                <textarea
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none h-24 resize-none"
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                    placeholder="Describe your hotel..."
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Upload Image</label>
                                                <div className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                                    <input
                                                        type="file"
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        accept="image/*"
                                                        onChange={e => setImageFile(e.target.files[0])}
                                                    />
                                                    <div className="flex flex-col items-center gap-2 text-gray-500">
                                                        <ImageIcon size={32} />
                                                        {imageFile ? <span className="font-bold text-primary">{imageFile.name}</span> : <span>Click to upload main photo</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Information Section */}
                                    <div className="space-y-4 pt-6 border-t border-gray-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                                <Phone size={20} className="text-blue-600" />
                                            </div>
                                            <h3 className="text-lg font-bold text-secondary">Contact Information</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Contact Phone</label>
                                                <input
                                                    type="tel"
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none"
                                                    value={formData.contact_phone}
                                                    onChange={e => setFormData({ ...formData, contact_phone: e.target.value })}
                                                    placeholder="01700000000"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Contact Email</label>
                                                <input
                                                    type="email"
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none"
                                                    value={formData.contact_email}
                                                    onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                                                    placeholder="contact@hotel.com"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Emergency Contact</label>
                                                <input
                                                    type="tel"
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none"
                                                    value={formData.emergency_contact}
                                                    onChange={e => setFormData({ ...formData, emergency_contact: e.target.value })}
                                                    placeholder="24/7 hotline"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Policies Section */}
                                    <div className="space-y-4 pt-6 border-t border-gray-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                                                <Clock size={20} className="text-purple-600" />
                                            </div>
                                            <h3 className="text-lg font-bold text-secondary">Policies & Timings</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Check-in Time</label>
                                                <input
                                                    type="time"
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none"
                                                    value={formData.check_in_time}
                                                    onChange={e => setFormData({ ...formData, check_in_time: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Check-out Time</label>
                                                <input
                                                    type="time"
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none"
                                                    value={formData.check_out_time}
                                                    onChange={e => setFormData({ ...formData, check_out_time: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Min Booking Hours</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none"
                                                    value={formData.min_booking_hours}
                                                    onChange={e => setFormData({ ...formData, min_booking_hours: parseInt(e.target.value) })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Max Booking Hours</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none"
                                                    value={formData.max_booking_hours}
                                                    onChange={e => setFormData({ ...formData, max_booking_hours: parseInt(e.target.value) })}
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Cancellation Policy</label>
                                                <textarea
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none h-20 resize-none"
                                                    value={formData.cancellation_policy}
                                                    onChange={e => setFormData({ ...formData, cancellation_policy: e.target.value })}
                                                    placeholder="e.g. Free cancellation up to 24 hours before check-in"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">House Rules</label>
                                                <textarea
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary outline-none h-20 resize-none"
                                                    value={formData.house_rules}
                                                    onChange={e => setFormData({ ...formData, house_rules: e.target.value })}
                                                    placeholder="e.g. No smoking, No pets, Quiet hours 10 PM - 8 AM"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Facilities Section */}
                                    <div className="space-y-4 pt-6 border-t border-gray-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                                                <Settings size={20} className="text-green-600" />
                                            </div>
                                            <h3 className="text-lg font-bold text-secondary">Facilities & Amenities</h3>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { key: 'has_wifi', label: 'WiFi', icon: Wifi },
                                                { key: 'has_parking', label: 'Parking', icon: Car },
                                                { key: 'has_ac', label: 'Air Conditioning', icon: Wind },
                                                { key: 'has_elevator', label: 'Elevator', icon: Building },
                                                { key: 'has_restaurant', label: 'Restaurant', icon: ShoppingBag },
                                                { key: 'has_gym', label: 'Gym', icon: Dumbbell },
                                                { key: 'has_pool', label: 'Swimming Pool', icon: Waves },
                                                { key: 'has_laundry', label: 'Laundry', icon: Home }
                                            ].map(facility => {
                                                const Icon = facility.icon;
                                                return (
                                                    <button
                                                        key={facility.key}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, [facility.key]: !formData[facility.key] })}
                                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData[facility.key]
                                                            ? 'border-primary bg-primary/5 text-primary'
                                                            : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <Icon size={24} />
                                                        <span className="text-xs font-bold text-center">{facility.label}</span>
                                                        {formData[facility.key] && <CheckCircle size={16} className="text-primary" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        {editingHotel && (
                                            <button
                                                type="button"
                                                onClick={() => { resetForm(); setActiveTab('hotels'); }}
                                                className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 rounded-xl hover:bg-gray-200 transition-all"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className={`${editingHotel ? 'flex-[2]' : 'w-full'} bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2`}
                                        >
                                            {submitting ? <Loader className="animate-spin" /> : (editingHotel ? 'Save Changes' : 'Publish Hotel')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>


                {/* Statistics Modal */}
                {
                    selectedHotel && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedHotel(null)}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={e => e.stopPropagation()}
                                className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
                            >
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <h3 className="text-xl font-bold text-secondary">{selectedHotel.name} Statistics</h3>
                                    <button onClick={() => setSelectedHotel(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                        <XCircle size={24} className="text-gray-500" />
                                    </button>
                                </div>

                                <div className="p-6">
                                    {statsLoading ? (
                                        <div className="py-12 flex justify-center"><Loader className="animate-spin text-primary" size={40} /></div>
                                    ) : hotelStats ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                                                <div className="text-blue-500 font-bold text-xs uppercase mb-1">Total Bookings</div>
                                                <div className="text-2xl font-bold text-gray-800">{hotelStats.total_bookings}</div>
                                            </div>
                                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 hover:shadow-md transition-shadow">
                                                <div className="text-purple-500 font-bold text-xs uppercase mb-1">Total Revenue</div>
                                                <div className="text-2xl font-bold text-gray-800">৳{hotelStats.revenue}</div>
                                            </div>
                                            <div className="bg-green-50 p-4 rounded-xl border border-green-100 hover:shadow-md transition-shadow">
                                                <div className="text-green-500 font-bold text-xs uppercase mb-1">Available Rooms</div>
                                                <div className="text-2xl font-bold text-gray-800">{hotelStats.available_rooms} <span className="text-sm font-normal text-gray-500">/ {hotelStats.total_rooms}</span></div>
                                            </div>
                                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 hover:shadow-md transition-shadow">
                                                <div className="text-orange-500 font-bold text-xs uppercase mb-1">Occupancy</div>
                                                <div className="text-2xl font-bold text-gray-800">
                                                    {hotelStats.total_rooms > 0 ? Math.round((hotelStats.booked_rooms / hotelStats.total_rooms) * 100) : 0}%
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-red-500 py-4">Failed to load statistics</div>
                                    )}
                                </div>
                                <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t border-gray-100">
                                    Data is updated in real-time
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </div >

            <ChatModal
                isOpen={!!chatTarget}
                onClose={() => setChatTarget(null)}
                otherUserId={chatTarget?.id}
                otherUserName={chatTarget?.name}
                contextId={chatTarget?.contextId}
                contextType={chatTarget?.contextType}
            />
        </div >
    );
};

export default VendorDashboard;
