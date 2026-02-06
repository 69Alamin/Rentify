import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Phone, MapPin, Navigation, Check, Clock, Package,
    Power, Star, CreditCard, TrendingUp, ChevronLeft, ChevronRight,
    Truck, Loader, History, Settings, AlertCircle, X, Save
} from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import EmbeddedNavigation from '../../components/EmbeddedNavigation.jsx';

const MobileRiderDashboard = () => {
    const navigate = useNavigate();
    const { showSuccess, showError, showConfirm } = useModal();
    const [pendingRides, setPendingRides] = useState([]);
    const [myRides, setMyRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('requests');
    const [profile, setProfile] = useState(null);
    const [onlineStatus, setOnlineStatus] = useState('offline');
    const [stats, setStats] = useState({ daily: '0.00', weekly: '0.00', total: '0.00', trips: 0 });
    const [updating, setUpdating] = useState(false);
    const [location, setLocation] = useState(null);
    const locationRef = useRef(location);
    const [showNavigation, setShowNavigation] = useState(false);

    // Profile edit state
    const [editForm, setEditForm] = useState({
        full_name: '', phone: '', vehicle_model: '', number_plate: '',
        max_passengers: 4, luggage_support: false
    });

    useEffect(() => {
        locationRef.current = location;
    }, [location]);

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
                    setLocation(coords);

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

        // We still keep a slow interval as a safety net (e.g. 5s) in case polling hangs or misses
        const safetyInterval = setInterval(() => fetchData(locationRef.current), 5000);

        // Start polling
        longPoll();

        return () => {
            isMounted = false;
            clearInterval(locInterval);
            clearInterval(safetyInterval);
        };
    }, [navigate, myRides.length]); // Re-bind when rides change (to switch between global/ride polling)

    const fetchData = async (currentLoc = location) => {
        try {
            const pRes = await fetch('/api/user/get_profile.php', { credentials: 'include' });
            const pData = await pRes.json();
            if (pData.success) {
                setProfile(pData.data);
                setOnlineStatus(pData.data.online_status || 'offline');
                setEditForm({
                    full_name: pData.data.full_name || '',
                    phone: pData.data.phone || '',
                    vehicle_model: pData.data.vehicle_model || '',
                    number_plate: pData.data.number_plate || '',
                    max_passengers: pData.data.max_passengers || 4,
                    luggage_support: pData.data.luggage_support == 1
                });
            }

            const sRes = await fetch('/api/user/earnings.php', { credentials: 'include' });
            const sData = await sRes.json();
            if (sData.success) setStats(sData.data);

            let url = `/api/rides/request.php?t=${Date.now()}`;
            const loc = currentLoc || locationRef.current;
            if (loc) url += `&lat=${loc.lat}&lng=${loc.lng}`;

            const res = await fetch(url, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                const rides = data.data;
                setPendingRides(rides.filter(r => r.status === 'requested'));
                setMyRides(rides.filter(r => r.status !== 'requested'));
            }
        } catch (err) {
            console.error('Error loading rider data:', err);
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
            {/* Header */}
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

            {/* Tabs */}
            <div className="flex gap-2 px-4 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    { id: 'requests', label: 'Requests', count: pendingRides.length, icon: <Truck size={14} /> },
                    { id: 'history', label: 'History', icon: <History size={14} /> },
                    { id: 'profile', label: 'Profile', icon: <Settings size={14} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-white text-navy' : 'bg-white/5 text-gray-400 border border-white/5'}`}
                    >
                        {tab.icon} {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className="bg-accent text-navy px-1.5 py-0.5 rounded-full text-[8px]">{tab.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="p-4">
                {/* Requests Tab */}
                {activeTab === 'requests' && (
                    <div className="space-y-4">
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
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-4">
                            <ProfileInput label="Full Name" value={editForm.full_name} onChange={v => setEditForm(f => ({ ...f, full_name: v }))} icon={<User size={16} />} />
                            <ProfileInput label="Phone Number" value={editForm.phone} onChange={v => setEditForm(f => ({ ...f, phone: v }))} icon={<Phone size={16} />} />
                            <ProfileInput label="Vehicle Model" value={editForm.vehicle_model} onChange={v => setEditForm(f => ({ ...f, vehicle_model: v }))} icon={<Truck size={16} />} placeholder="e.g. Toyota Corolla" />
                            <ProfileInput label="Number Plate" value={editForm.number_plate} onChange={v => setEditForm(f => ({ ...f, number_plate: v }))} icon={<CreditCard size={16} />} placeholder="e.g. DHA-1234" />
                        </div>

                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-white text-sm">Max Passengers</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Capacity</p>
                                </div>
                                <select
                                    value={editForm.max_passengers}
                                    onChange={e => setEditForm(f => ({ ...f, max_passengers: parseInt(e.target.value) }))}
                                    className="bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 font-bold text-white outline-none"
                                >
                                    {[1, 2, 3, 4, 7, 10].map(n => <option key={n} value={n} className="text-navy">{n} Pax</option>)}
                                </select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-xl"><Package size={16} className="text-accent" /></div>
                                    <div>
                                        <p className="font-bold text-white text-sm">Luggage Support</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Cargo bay</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditForm(f => ({ ...f, luggage_support: !f.luggage_support }))}
                                    className={`w-12 h-6 rounded-full transition-all relative ${editForm.luggage_support ? 'bg-accent' : 'bg-white/20'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editForm.luggage_support ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={updating}
                            className="w-full bg-accent text-navy py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2"
                        >
                            {updating ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                            Save Changes
                        </button>
                    </form>
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
        </div>
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
