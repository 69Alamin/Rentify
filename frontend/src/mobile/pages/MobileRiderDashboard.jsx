import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Phone, MapPin, Navigation, Check, Clock, Package,
    Power, Star, CreditCard, TrendingUp, ChevronLeft, ChevronRight,
    Truck, Loader, History, Settings, AlertCircle, X, Save, MessageCircle, Shield
} from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import EmbeddedNavigation from '../../components/EmbeddedNavigation.jsx';
import ChatModal from '../components/ChatModal.jsx';

const MobileRiderDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showSuccess, showError, showConfirm } = useModal();
    const [pendingRides, setPendingRides] = useState([]);
    const [myRides, setMyRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // Default to overview
    const [profile, setProfile] = useState(null);
    const [onlineStatus, setOnlineStatus] = useState('offline');
    const [stats, setStats] = useState({ daily: '0.00', weekly: '0.00', total: '0.00', trips: 0 });
    const [updating, setUpdating] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const locationRef = useRef(userLocation);
    const [showNavigation, setShowNavigation] = useState(false);
    const [chatTarget, setChatTarget] = useState(null); // { id, name, contextId, contextType }

    // Profile edit state
    const [editForm, setEditForm] = useState({
        full_name: '', phone: '', vehicle_model: '', number_plate: '',
        max_passengers: 4, luggage_support: false
    });

    useEffect(() => {
        locationRef.current = userLocation;
    }, [userLocation]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.type !== 'driver' && user.type !== 'rider') {
            navigate('/');
            return;
        }

        const trackLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setUserLocation(coords);

                    const activeRide = myRides.find(r => ['on_the_way', 'picked'].includes(r.status));
                    if (activeRide) {
                        try {
                            await fetch('/api/rides/send_location.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ride_id: activeRide.id, lat: coords.lat, lng: coords.lng }),
                                credentials: 'include'
                            });
                        } catch (err) { console.error('Error sending location:', err); }
                    }

                    await fetch('/api/rides/update_location.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(coords),
                        credentials: 'include'
                    });
                });
            }
        };

        trackLocation();
        const locInterval = setInterval(trackLocation, 5000);

        // Initial fetch
        fetchData();

        // Long Polling System
        let isMounted = true;

        const longPoll = async () => {
            if (!isMounted) return;

            // Decide what to poll based on state
            // If we have an active ride, poll THAT ride
            // If we are waiting, poll GLOBAL channel
            const active = myRides.find(r => ['assigned', 'on_the_way', 'picked'].includes(r.status));

            let url = '';
            let currentStatus = '';

            if (active) {
                url = `/api/updates/poll.php?type=ride&id=${active.id}&current_status=${active.status}`;
            } else {
                // Poll global channel for new requests
                // We use a timestamp tracking mechanism ideally, but here we just wait for ANY change in global state
                // For now, we pass a dummy status, and if the server has 'new_request_...', it returns it
                url = `/api/updates/poll.php?type=global&id=0&current_status=waiting`;
            }

            try {
                const res = await fetch(url, { credentials: 'include' });
                const data = await res.json();

                if (data.success && data.changed) {
                    // Something changed, refresh EVERYTHING
                    await fetchData(locationRef.current);
                }
            } catch (err) {
                // Timeout or error, just loop
                if (isMounted) await new Promise(r => setTimeout(r, 1000));
            }

            if (isMounted) longPoll();
        };

        // We still keep a slower interval as a safety net (e.g. 30s) now that Sync API is efficient
        const safetyInterval = setInterval(() => fetchData(locationRef.current), 30000); // Increased to 30s

        // Start polling
        longPoll();

        return () => {
            isMounted = false;
            clearInterval(locInterval);
            clearInterval(safetyInterval);
        };
    }, [navigate, myRides.length]); // Re-bind when rides change (to switch between global/ride polling)

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const category = params.get('category') || 'overview';
        setActiveTab(category);
    }, [location]);

    const fetchData = async (currentLoc = locationRef.current) => {
        try {
            const loc = currentLoc || locationRef.current;
            let syncUrl = `/api/rides/sync.php?t=${Date.now()}`;
            if (loc) syncUrl += `&lat=${loc.lat}&lng=${loc.lng}`;

            const res = await fetch(syncUrl, { credentials: 'include' });
            const data = await res.json();

            if (data.success) {
                // Profile
                if (data.profile) {
                    setProfile(data.profile);
                    setOnlineStatus(data.profile.online_status || 'offline');
                    setEditForm({
                        full_name: data.profile.full_name || '',
                        phone: data.profile.phone || '',
                        vehicle_model: data.profile.vehicle_model || '',
                        number_plate: data.profile.number_plate || '',
                        max_passengers: data.profile.max_passengers || 4,
                        luggage_support: data.profile.luggage_support == 1
                    });
                }

                // Stats
                if (data.stats) setStats(data.stats);

                // Rides
                if (data.rides) {
                    const rides = data.rides;
                    setPendingRides(rides.filter(r => r.status === 'requested'));
                    setMyRides(rides.filter(r => r.status !== 'requested'));
                }
            }
        } catch (err) {
            console.error('Error syncing rider data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (rideId) => {
        // Optimistic Update: Move from pending to active immediately
        const rideToAccept = pendingRides.find(r => r.id === rideId);
        if (rideToAccept) {
            setPendingRides(prev => prev.filter(r => r.id !== rideId));
            setMyRides(prev => [{ ...rideToAccept, status: 'assigned' }, ...prev]);
        }

        try {
            const res = await fetch('/api/rides/accept.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ride_id: rideId }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                // Success - refresh in background to confirm
                fetchData(locationRef.current);
            } else {
                // Revert if failed
                showError(data.message);
                fetchData(locationRef.current);
            }
        } catch (err) {
            showError('Error accepting ride');
            fetchData(locationRef.current);
        }
    };

    const toggleStatus = async () => {
        const nextStatus = onlineStatus === 'online' ? 'offline' : 'online';
        try {
            const res = await fetch('/api/user/update_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setOnlineStatus(data.status || nextStatus);
                setProfile(p => p ? { ...p, online_status: data.status || nextStatus } : p);
                fetchData();
            } else {
                showError(data.message || 'Failed to toggle status');
            }
        } catch (e) {
            showError('Failed to toggle status');
        }
    };

    const handleStatusUpdate = async (rideId, newStatus) => {
        try {
            const res = await fetch('/api/rides/status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ride_id: rideId, status: newStatus }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                fetchData();
            } else {
                showError(data.message);
            }
        } catch (err) {
            showError('Error updating ride status');
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const payload = {
                ...editForm,
                luggage_support: editForm.luggage_support ? 1 : 0
            };
            const res = await fetch('/api/user/update_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                showSuccess('Profile updated!');
                fetchData();
            } else {
                showError(data.message);
            }
        } catch (err) {
            showError('Update failed');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-navy flex flex-col items-center justify-center">
            <Loader className="animate-spin text-accent mb-4" size={32} />
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Loading Dashboard...</p>
        </div>
    );

    const activeRide = myRides.find(r => ['assigned', 'on_the_way', 'picked'].includes(r.status));

    return (
        <div className="min-h-screen bg-navy text-white pb-28">
            {/* Header - Hidden on overview tab */}
            {activeTab !== 'overview' && (
                <div className="bg-navy/95 backdrop-blur-xl px-6 pt-12 pb-6 border-b border-white/5 sticky top-0 z-20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-lg">
                                    {profile?.full_name?.charAt(0) || <User />}
                                </div>
                                <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-navy ${onlineStatus === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-white">Hey, {profile?.full_name?.split(' ')[0] || 'Rider'}!</h1>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${onlineStatus === 'online' ? 'text-green-400' : 'text-gray-500'}`}>
                                        {onlineStatus}
                                    </span>
                                    <span className="text-gray-600">•</span>
                                    <div className="flex items-center gap-1 text-yellow-400 text-[10px] font-black">
                                        <Star size={10} fill="currentColor" /> {profile?.rating_avg || '5.0'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={toggleStatus}
                            className={`px-4 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 transition-all ${onlineStatus === 'online' ? 'bg-white/10 text-white border border-white/10' : 'bg-green-500 text-white shadow-lg shadow-green-500/20'}`}
                        >
                            <Power size={14} /> {onlineStatus === 'online' ? 'Offline' : 'Go Live'}
                        </button>
                    </div>

                    {/* Stats Row */}
                    <div className="flex gap-3">
                        <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Today</p>
                            <p className="text-lg font-black text-accent">৳{stats.daily}</p>
                        </div>
                        <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Trips</p>
                            <p className="text-lg font-black text-white">{stats.trips}</p>
                        </div>
                        <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Weekly</p>
                            <p className="text-lg font-black text-indigo-400">৳{stats.weekly}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Trip HUD */}
            <AnimatePresence>
                {activeRide && (
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="mx-4 mt-4"
                    >
                        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><Navigation size={80} /></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <span className="bg-white/20 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full">Active Trip</span>
                                        <h2 className="text-xl font-black mt-2">{activeRide.customer_name}</h2>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black">৳{activeRide.estimated_fare}</p>
                                        <p className="text-[9px] text-white/60 uppercase tracking-widest">Fare</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                                        <MapPin size={16} className="text-green-300" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[9px] text-white/50 uppercase tracking-widest">Pickup</p>
                                            <p className="text-xs font-bold truncate">{activeRide.pickup_address || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                                        <Navigation size={16} className="text-red-300" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[9px] text-white/50 uppercase tracking-widest">Drop-off</p>
                                            <p className="text-xs font-bold truncate">{activeRide.destination_address || 'Hotel'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <a
                                        href={`tel:${activeRide.customer_phone || ''}`}
                                        className="flex-1 bg-white text-indigo-600 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2"
                                    >
                                        <Phone size={14} /> Call
                                    </a>
                                    <button
                                        onClick={() => setShowNavigation(true)}
                                        className="flex-1 bg-white/20 text-white py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 border border-white/20"
                                    >
                                        <Navigation size={14} /> Navigate
                                    </button>
                                    <button
                                        onClick={() => setChatTarget({
                                            id: activeRide.user_id,
                                            name: activeRide.customer_name,
                                            contextId: activeRide.id,
                                            contextType: 'ride'
                                        })}
                                        className="bg-accent text-navy p-3 rounded-xl shadow-lg shadow-accent/20 active:scale-95 transition-all"
                                    >
                                        <MessageCircle size={20} />
                                    </button>
                                </div>

                                <div className="mt-4">
                                    {activeRide.status === 'assigned' && (
                                        <button onClick={() => handleStatusUpdate(activeRide.id, 'on_the_way')} className="w-full bg-white text-indigo-600 py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg">
                                            <Truck size={18} /> Start Pickup <ChevronRight size={16} />
                                        </button>
                                    )}
                                    {activeRide.status === 'on_the_way' && (
                                        <button onClick={() => handleStatusUpdate(activeRide.id, 'picked')} className="w-full bg-white text-indigo-600 py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg">
                                            <User size={18} /> Client Onboard <ChevronRight size={16} />
                                        </button>
                                    )}
                                    {activeRide.status === 'picked' && (
                                        <button onClick={() => handleStatusUpdate(activeRide.id, 'completed')} className="w-full bg-green-500 text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg">
                                            <Check size={18} /> Complete Trip <ChevronRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Trip HUD removed sub-tabs block */}

            {/* Content Area */}
            <div className="p-4">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <RiderOverview
                        profile={profile}
                        onlineStatus={onlineStatus}
                        toggleStatus={toggleStatus}
                        stats={stats}
                        myRides={myRides}
                    />
                )}

                {/* Requests Tab */}
                {activeTab === 'requests' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <h2 className="text-sm font-black uppercase tracking-widest text-white/50">Available Rides</h2>
                            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-accent bg-accent/10 px-2 py-1 rounded-full">
                                <div className="w-1 h-1 bg-accent rounded-full animate-ping"></div>
                                Live Polling
                            </div>
                        </div>
                        {pendingRides.length === 0 ? (
                            <div className="bg-white/5 rounded-2xl p-10 text-center border border-white/5">
                                <Clock size={40} className="mx-auto mb-4 text-gray-600" />
                                <h3 className="font-black text-white mb-1">Waiting for Requests...</h3>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                                    {onlineStatus !== 'online' ? 'Go online to receive rides' : 'Nearby requests will appear here'}
                                </p>
                            </div>
                        ) : (
                            pendingRides.map(ride => (
                                <RideRequestCard key={ride.id} ride={ride} onAccept={handleAccept} />
                            ))
                        )}
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="space-y-3">
                        {myRides.length === 0 ? (
                            <div className="bg-white/5 rounded-2xl p-10 text-center border border-white/5">
                                <History size={40} className="mx-auto mb-4 text-gray-600" />
                                <h3 className="font-black text-white mb-1">No Trips Yet</h3>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Your completed trips will appear here</p>
                            </div>
                        ) : (
                            myRides.map(ride => (
                                <div key={ride.id} className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ride.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                            {ride.status === 'completed' ? <Check size={18} /> : <Clock size={18} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">Trip #{ride.id}</p>
                                            <p className="text-[9px] text-gray-500 uppercase tracking-widest">
                                                {ride.created_at ? new Date(ride.created_at).toLocaleDateString() : 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-lg text-accent">৳{ride.estimated_fare || 0}</p>
                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${ride.status === 'completed' ? 'text-green-400' : 'text-indigo-400'}`}>
                                            {ride.status?.replace('_', ' ')}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && profile && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-4 pt-6 pb-2">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-500/20">
                                {profile.full_name?.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white underline decoration-accent/50">{profile.full_name}</h2>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Vehicle Manager</p>
                            </div>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-5">
                                <ProfileInput label="Full Name" value={editForm.full_name} onChange={v => setEditForm(f => ({ ...f, full_name: v }))} icon={<User size={16} />} placeholder="Your full name" />
                                <ProfileInput label="Phone" value={editForm.phone} onChange={v => setEditForm(f => ({ ...f, phone: v }))} icon={<Phone size={16} />} />
                                <ProfileInput label="Vehicle" value={editForm.vehicle_model} onChange={v => setEditForm(f => ({ ...f, vehicle_model: v }))} icon={<Truck size={16} />} placeholder="e.g. Toyota Corolla" />
                                <ProfileInput label="Tag" value={editForm.number_plate} onChange={v => setEditForm(f => ({ ...f, number_plate: v }))} icon={<CreditCard size={16} />} placeholder="e.g. DHA-1234" />

                                <button
                                    type="button"
                                    onClick={() => navigate('/trust-center')}
                                    className="w-full flex items-center gap-4 p-4 bg-accent/10 rounded-xl border border-accent/20 hover:bg-accent/20 transition-all"
                                >
                                    <div className="p-2 bg-accent/20 rounded-lg text-accent"><Shield size={16} /></div>
                                    <div className="text-left flex-1">
                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Trust Center</p>
                                        <p className="text-sm font-bold text-accent">Verify Your Identity</p>
                                    </div>
                                    <ChevronRight size={16} className="text-accent" />
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={updating}
                                className="w-full aura-gradient-primary text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-aura-md hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
                            >
                                {updating ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                                Synchronize Updates
                            </button>
                        </form>
                    </motion.div>
                )}
            </div>

            {/* Embedded Navigation Overlay */}
            <AnimatePresence>
                {showNavigation && activeRide && (
                    <EmbeddedNavigation
                        pickupLat={activeRide.pickup_lat}
                        pickupLng={activeRide.pickup_lng}
                        dropoffLat={activeRide.destination_lat}
                        dropoffLng={activeRide.destination_lng}
                        navigationType={activeRide.status === 'picked' ? 'dropoff' : 'pickup'}
                        customerName={activeRide.customer_name}
                        onClose={() => setShowNavigation(false)}
                        isMobile={true}
                    />
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

// Rider Overview Component
const RiderOverview = ({ profile, onlineStatus, toggleStatus, stats, myRides }) => {
    const successRate = 98.4; // Mock for now or calculate if available
    const rating = profile?.rating_avg || '5.0';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Mission Control Header */}
            <div className="flex items-center justify-between pt-6 pb-2">
                <div>
                    <h2 className="text-2xl font-black text-white italic">Mission <span className="text-accent underline decoration-indigo-500/50">Control</span></h2>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Global Operations Manager</p>
                </div>
                <button
                    onClick={toggleStatus}
                    className={`px-4 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg ${onlineStatus === 'online' ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-white/5 text-gray-500 border border-white/10'}`}
                >
                    <Power size={14} /> {onlineStatus === 'online' ? 'Go Offline' : 'Go Live'}
                </button>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <TrendingUp size={100} />
                    </div>
                    <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-1">Today's Revenue</p>
                    <p className="text-3xl font-black text-white italic">৳{stats.daily}</p>
                    <div className="mt-4 flex items-center gap-1.5 text-[9px] font-black bg-white/20 w-fit px-2 py-1 rounded-full text-white uppercase tracking-tighter">
                        <Check size={8} /> +12% from yesterday
                    </div>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-lg flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Trips</p>
                        <p className="text-3xl font-black text-white italic">{stats.trips}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-indigo-400 bg-indigo-400/10 w-fit px-2 py-1 rounded-full uppercase tracking-tighter">
                        Trip Master
                    </div>
                </div>
            </div>

            {/* Performance Widgets */}
            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Performance</h3>
                    <div className="flex items-center gap-1 text-[10px] font-black text-accent">
                        <Star size={12} fill="currentColor" /> {rating}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-accent">
                            <Check size={24} />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between mb-1.5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Success Rate</p>
                                <p className="text-[10px] font-black text-white">{successRate}%</p>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-accent" style={{ width: `${successRate}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400">
                            <Clock size={24} />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between mb-1.5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Total Earnings</p>
                                <p className="text-[10px] font-black text-white">৳{stats.total}</p>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Recent History</h3>
                    <TrendingUp size={14} className="text-white/20" />
                </div>
                {myRides.slice(0, 3).map(ride => (
                    <div key={ride.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-500">
                                <History size={18} />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-white">Trip #{ride.id}</p>
                                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{ride.status}</p>
                            </div>
                        </div>
                        <p className="text-sm font-black text-accent">৳{ride.estimated_fare}</p>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

// Ride Request Card Component
const RideRequestCard = ({ ride, onAccept }) => {
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-2xl p-4 border border-white/5 relative overflow-hidden"
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">New</span>
                        <span className="bg-white/10 text-gray-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock size={8} /> {timeLeft}s
                        </span>
                    </div>
                    <h3 className="font-black text-white text-lg">{ride.customer_name}</h3>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        <MapPin size={10} /> {ride.distance_km ? `${ride.distance_km.toFixed(1)} km away` : 'Nearby'}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black text-accent">৳{ride.estimated_fare}</p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">Earnings</p>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                    <MapPin size={14} className="text-green-400 flex-shrink-0" />
                    <div className="min-w-0">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest">Pickup</p>
                        <p className="text-xs font-bold text-white truncate">{ride.pickup_address || 'N/A'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                    <Navigation size={14} className="text-red-400 flex-shrink-0" />
                    <div className="min-w-0">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest">Drop-off</p>
                        <p className="text-xs font-bold text-white truncate">{ride.destination_address}</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${ride.pickup_lat},${ride.pickup_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-white/10 text-gray-400 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-white/10"
                >
                    <Navigation size={12} /> Map
                </a>
                <button
                    onClick={() => onAccept(ride.id)}
                    className="flex-1 bg-green-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                >
                    <Check size={14} /> Accept
                </button>
            </div>
        </motion.div>
    );
};

// Profile Input Component
const ProfileInput = ({ label, value, onChange, icon, placeholder }) => (
    <div>
        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1.5 block">{label}</label>
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 font-bold text-white outline-none focus:border-accent transition-all placeholder:text-gray-600"
            />
        </div>
    </div>
);

export default MobileRiderDashboard;
