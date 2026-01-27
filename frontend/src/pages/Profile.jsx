import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, MapPin, LogOut, Shield, Award, Clock, CheckCircle, XCircle, ChevronRight, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../context/ModalContext';

const Profile = () => {
    const navigate = useNavigate();
    const { showSuccess, showError, showConfirm } = useModal();
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [profileRes, bookingsRes] = await Promise.all([
                fetch('/api/user/get_profile.php', { credentials: 'include' }),
                fetch('/api/bookings/list.php', { credentials: 'include' })
            ]);

            const profileData = await profileRes.json();
            const bookingsData = await bookingsRes.json();

            if (profileData.success) {
                setUser(profileData.data);
            } else {
                // If unauthorized, redirect to login
                if (profileRes.status === 401) navigate('/login');
            }

            if (bookingsData.success) {
                setBookings(bookingsData.data);
            }
        } catch (err) {
            console.error(err);
            showError('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        showConfirm(
            'Are you sure you want to log out?',
            async () => {
                try {
                    await fetch('/api/auth/logout.php', { credentials: 'include' });
                    localStorage.removeItem('user');
                    navigate('/'); // Redirect to home
                    showSuccess('Logged out successfully');
                } catch (e) {
                    showError('Logout failed');
                }
            },
            'Sign Out'
        );
    };

    const handleCancelBooking = async (id) => {
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

    if (loading) return (
        <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
        </div>
    );

    if (!user) return null;

    // Filter bookings
    const activeBookings = bookings.filter(b => ['active', 'confirmed', 'pending'].includes(b.booking_status));
    const completedBookings = bookings.filter(b => b.booking_status === 'completed');
    const cancelledBookings = bookings.filter(b => b.booking_status === 'cancelled');

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-indigo-100 text-indigo-700';
            case 'active': return 'bg-emerald-100 text-emerald-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'cancelled': return 'bg-red-50 text-red-500';
            case 'completed': return 'bg-gray-100 text-gray-500';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pt-28 pb-20 px-4 md:px-8">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: User Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2rem] p-8 shadow-aura-sm border border-gray-100 relative overflow-hidden"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary via-indigo-500 to-violet-600"></div>

                        <div className="relative pt-12 text-center">
                            <div className="w-24 h-24 mx-auto bg-white p-1 rounded-full shadow-lg mb-4">
                                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-3xl font-black text-gray-300">
                                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-secondary mb-1">{user.full_name}</h2>
                            <p className="text-gray-500 text-sm font-medium mb-6">{user.user_type === 'customer' ? 'Valued Guest' : user.user_type}</p>

                            <div className="space-y-4 text-left">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><Mail size={16} /></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email</p>
                                        <p className="text-sm font-bold text-gray-700 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center"><Phone size={16} /></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Phone</p>
                                        <p className="text-sm font-bold text-gray-700 truncate">{user.phone || 'Not set'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center"><Shield size={16} /></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Verification</p>
                                        <div className="flex items-center gap-1">
                                            <p className="text-sm font-bold text-gray-700">{user.is_verified ? 'Verified' : 'Unverified'}</p>
                                            {user.is_verified && <CheckCircle size={14} className="text-blue-500" fill="currentColor" />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Bookings */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2rem] p-2 shadow-sm border border-gray-100 flex p-1.5 gap-1">
                        {['active', 'completed', 'cancelled'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all capitalize ${activeTab === tab
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                                    }`}
                            >
                                {tab} ({
                                    tab === 'active' ? activeBookings.length :
                                        tab === 'completed' ? completedBookings.length :
                                            cancelledBookings.length
                                })
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {activeTab === 'active' && activeBookings.length === 0 && (
                            <EmptyState icon={<Calendar size={48} />} message="No active bookings" subAction={() => navigate('/hotels')} subActionText="Book a stay" />
                        )}
                        {activeTab === 'completed' && completedBookings.length === 0 && (
                            <EmptyState icon={<Award size={48} />} message="No completed stays yet" />
                        )}
                        {activeTab === 'cancelled' && cancelledBookings.length === 0 && (
                            <EmptyState icon={<XCircle size={48} />} message="No cancelled bookings" />
                        )}

                        {(activeTab === 'active' ? activeBookings : activeTab === 'completed' ? completedBookings : cancelledBookings).map(booking => (
                            <motion.div
                                key={booking.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden relative shrink-0">
                                        <img
                                            src={booking.image_url || '/assets/default_hotel.png'}
                                            alt="Hotel"
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => { e.target.src = '/assets/default_hotel.png'; }}
                                        />
                                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur rounded-lg px-2 py-1 text-white text-[10px] font-bold">
                                            #{booking.id}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-secondary truncate">{booking.hotel_name}</h3>
                                                <p className="text-gray-400 text-xs font-medium flex items-center gap-1">
                                                    <MapPin size={12} /> {booking.room_type_name}
                                                </p>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getStatusColor(booking.booking_status)}`}>
                                                {booking.booking_status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 my-4">
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Check In</p>
                                                <p className="text-sm font-bold text-gray-700 text-sm whitespace-nowrap">
                                                    {new Date(booking.check_in_time).toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total</p>
                                                <p className="text-sm font-bold text-primary">৳{booking.total_price}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            {(booking.booking_status === 'pending' || booking.booking_status === 'confirmed') && (
                                                <button
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            {booking.booking_status === 'active' && (
                                                <button
                                                    onClick={() => navigate('/dashboard')}
                                                    className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                                                >
                                                    <LayoutDashboard size={14} /> Go to Dashboard
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const EmptyState = ({ icon, message, subAction, subActionText }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-[2rem] border border-dashed border-gray-200">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
            {icon}
        </div>
        <p className="text-gray-400 font-medium mb-4">{message}</p>
        {subAction && (
            <button onClick={subAction} className="text-primary font-bold text-sm hover:underline">
                {subActionText}
            </button>
        )}
    </div>
);

export default Profile;
