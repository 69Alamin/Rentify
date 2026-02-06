import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Truck, MapPin, Calendar, User, Check, Navigation, Loader,
    Package, AlertCircle, TrendingUp, Clock, ShieldCheck,
    ChevronRight, Phone, Power, History, Star, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../context/ModalContext';
import EmbeddedNavigation from '../components/EmbeddedNavigation.jsx';

const DriverDashboard = () => {
    const navigate = useNavigate();
    const { showSuccess, showError, showConfirm } = useModal();
    const [pendingRides, setPendingRides] = useState([]);
    const [myRides, setMyRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('available');
    const [profile, setProfile] = useState(null);
    const [onlineStatus, setOnlineStatus] = useState('offline');
    const [stats, setStats] = useState({ daily: '0.00', weekly: '0.00', total: '0.00', trips: 0 });
    const [updating, setUpdating] = useState(false);
    const [location, setLocation] = useState(null);
    const [showNavigation, setShowNavigation] = useState(false);
    const [navigating, setNavigating] = useState(false);
    const [navigationType, setNavigationType] = useState(null); // 'pickup' or 'hotel'
    const locationRef = React.useRef(location);

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

                    // If on the way to pickup or to hotel, send location to customer
                    const activeRide = myRides.find(r => ['on_the_way', 'picked'].includes(r.status));
                    if (activeRide) {
                        try {
                            await fetch('/api/rides/send_location.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    ride_id: activeRide.id,
                                    lat: coords.lat,
                                    lng: coords.lng
                                }),
                                credentials: 'include'
                            });
                        } catch (err) {
                            console.error('Error sending location:', err);
                        }
                    }

                    // Update server with location
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
        const dataInterval = setInterval(() => fetchData(locationRef.current), 10000);

        return () => {
            clearInterval(locInterval);
            clearInterval(dataInterval);
        };
    }, [navigate]);

    const fetchData = async (currentLoc = location) => {
        try {
            // 1. Fetch Profile
            const pRes = await fetch('/api/user/get_profile.php', { credentials: 'include' });
            const pData = await pRes.json();
            if (pData.success) {
                setProfile(pData.data);
                setOnlineStatus(pData.data.online_status || 'offline');
            }

            // 2. Fetch Earnings Stats
            const sRes = await fetch('/api/user/earnings.php', { credentials: 'include' });
            const sData = await sRes.json();
            if (sData.success) setStats(sData.data);

            // 3. Fetch Rides
            let url = '/api/rides/request.php';
            // Use the passed location (from ref) or state location (if called directly)
            const loc = currentLoc || locationRef.current;
            if (loc) {
                url += `?lat=${loc.lat}&lng=${loc.lng}`;
            }

            const res = await fetch(url, { credentials: 'include' });
            const data = await res.json();

            if (data.success) {
                const rides = data.data;
                // Immediately start navigation to pickup
                setNavigationType('pickup');
                setShowNavigation(true);
                setPendingRides(rides.filter(r => r.status === 'requested'));
                setMyRides(rides.filter(r => r.status !== 'requested'));
            }
        } catch (err) {
            console.error('Error loading driver data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (rideId) => {
        try {
            const res = await fetch('/api/rides/accept.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ride_id: rideId }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                fetchData();
            } else {
                showError(data.message);
            }
        } catch (err) {
            showError('Error accepting ride');
        }
    };

    const toggleStatus = async () => {
        const currentStatus = onlineStatus || profile?.online_status || 'offline';
        const nextStatus = currentStatus === 'online' ? 'offline' : 'online';
        try {
            const res = await fetch('/api/user/update_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus || 'online' }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                const updatedStatus = data.status || nextStatus || 'online';
                setOnlineStatus(updatedStatus);
                // Optimistically update UI then refresh
                setProfile((p) => p ? { ...p, online_status: updatedStatus } : p);
                fetchData();
            } else {
                console.error('update_status failed', data);
                showError(data.message || 'Failed to toggle status');
            }
        } catch (e) {
            console.error('update_status error', e);
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
                // If picked up, switch navigation to hotel
                if (newStatus === 'picked') {
                    setNavigationType('hotel');
                    setShowNavigation(true);
                }
                // If completed, hide navigation
                if (newStatus === 'completed') {
                    setShowNavigation(false);
                    setNavigationType(null);
                }
                fetchData();
            } else {
                showError(data.message);
            }
        } catch (err) {
            showError('Error updating ride status');
        }
    };

    const openNavigation = (lat, lng, label = 'Destination') => {
        // Navigate to map explorer with destination coordinates
        navigate(`/map?lat=${lat}&lng=${lng}&label=${encodeURIComponent(label)}`);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        const fd = new FormData(e.target);
        const payload = Object.fromEntries(fd);
        payload.luggage_support = fd.get('luggage_support') === 'on' ? 1 : 0;

        try {
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
            // Show navigation map when needed
            if (showNavigation && activeRide) {
                const targetLat = navigationType === 'pickup' ? activeRide.pickup_lat : activeRide.destination_lat;
                const targetLng = navigationType === 'pickup' ? activeRide.pickup_lng : activeRide.destination_lng;
                const label = navigationType === 'pickup' ? 'Pickup Location' : activeRide.destination_address || 'Hotel';

                return (
                    <iframe
                        src={`/map?lat=${targetLat}&lng=${targetLng}&label=${encodeURIComponent(label)}`}
                        style={{ width: '100vw', height: '100vh', border: 'none' }}
                        title="Navigation"
                    />
                );
            }

            showError('Update failed');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-gray-50">
            <Loader className="animate-spin text-primary mb-4" size={40} />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Initializing Terminal...</p>
        </div>
    );

    const activeRide = myRides.find(r => ['assigned', 'on_the_way', 'picked'].includes(r.status));

    return (
        <div className="bg-[#f8fafc] min-h-screen pt-24 pb-20 px-4 md:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Modern Hero Stats Section */}
                <div className="relative mb-6 overflow-hidden rounded-2xl bg-secondary p-1">
                    <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Truck size={160} /></div>
                    <div className="bg-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 border border-gray-100 shadow-lg">

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-indigo-500/20">
                                    {profile?.full_name?.charAt(0) || <User />}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${onlineStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'} shadow-md`}></div>
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-secondary tracking-tight">{profile?.full_name?.split(' ')[0]}'s Dashboard</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-50 rounded-full border border-gray-100">
                                        <div className={`w-1.5 h-1.5 rounded-full ${onlineStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{onlineStatus}</span>
                                    </div>
                                    <span className="text-gray-300">|</span>
                                    <div className="flex items-center gap-1 text-yellow-500 text-[10px] font-black">
                                        <Star size={12} fill="currentColor" /> {profile?.rating_avg || '5.0'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-6 md:gap-8 bg-gray-50/50 p-4 md:p-6 rounded-2xl border border-gray-100/50 w-full md:w-auto">
                            <div className="text-center md:text-left">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 text-center md:text-left">Earnings</p>
                                <p className="text-2xl font-black text-secondary italic leading-none">৳{stats.daily}</p>
                            </div>
                            <div className="w-px bg-gray-200 hidden md:block"></div>
                            <div className="text-center md:text-left">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 text-center md:text-left">Total Trips</p>
                                <p className="text-2xl font-black text-primary italic leading-none">{stats.trips}</p>
                            </div>
                            <button
                                onClick={toggleStatus}
                                className={`px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg ${onlineStatus === 'online' ? 'bg-secondary text-white hover:bg-black' : 'bg-green-500 text-white hover:scale-105 active:scale-95'}`}
                            >
                                <Power size={12} /> {onlineStatus === 'online' ? 'Go Offline' : 'Go Online'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Active Trip HUD */}
                <AnimatePresence>
                    {activeRide && (
                        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6">
                            <div className="bg-secondary rounded-2xl p-6 shadow-xl relative overflow-hidden text-white flex flex-col lg:flex-row items-center justify-between gap-8 border-2 border-indigo-500/20">
                                <div className="absolute top-0 right-0 p-6 opacity-5"><Navigation size={120} /></div>
                                <div className="text-center md:text-left relative z-10 flex-1">
                                    <div className="bg-primary text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full w-fit mb-4">Active Trip</div>
                                    <h2 className="text-2xl font-black mb-2 tracking-tighter">{activeRide.customer_name}</h2>

                                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                        <Badge icon={<User size={12} />} text={`${activeRide.passengers || 1} Passengers`} />
                                        {activeRide.luggage_needed === 1 && <Badge icon={<Package size={12} />} text="Luggage Support" />}
                                        <Badge icon={<CreditCard size={12} />} text={`৳${activeRide.estimated_fare}`} color="text-green-400" />
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                                        <button
                                            onClick={() => setNavigating(!navigating)}
                                            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black transition-all border ${navigating ? 'bg-accent text-navy border-accent' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}
                                        >
                                            <Navigation size={14} className={navigating ? 'animate-pulse' : ''} /> {navigating ? 'HIDE LIVE MAP' : 'VIEW LIVE MAP'}
                                        </button>
                                        <a
                                            href={`tel:${activeRide.customer_phone || '000'}`}
                                            className="bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all border border-white/10 lg:hidden"
                                        >
                                            <Phone size={14} /> Call Client
                                        </a>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 relative z-10 w-full md:w-64">
                                    <a href={`tel:${activeRide.customer_phone || '000'}`} className="bg-white text-secondary px-6 py-3.5 rounded-xl font-black text-center flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 transition-transform text-sm">
                                        <Phone size={18} /> CALL CLIENT
                                    </a>

                                    <div className="space-y-2">
                                        {activeRide?.status === 'assigned' && (
                                            <StatusButton onClick={() => {
                                                setNavigationType('pickup');
                                                setShowNavigation(true);
                                                handleStatusUpdate(activeRide.id, 'on_the_way');
                                            }} label="START PICKUP" color="bg-primary" />
                                        )}
                                        {activeRide?.status === 'on_the_way' && (
                                            <StatusButton onClick={() => handleStatusUpdate(activeRide.id, 'picked')} label="CLIENT ONBOARD" color="bg-indigo-600" />
                                        )}
                                        {(activeRide?.status === 'picked') && (
                                            <StatusButton onClick={() => handleStatusUpdate(activeRide.id, 'TRIP COMPLETE')} label="TRIP COMPLETE" color="bg-green-600" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {activeRide && navigating && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mb-6 overflow-hidden"
                        >
                            <EmbeddedNavigation
                                pickupLat={activeRide.pickup_lat}
                                pickupLng={activeRide.pickup_lng}
                                dropoffLat={activeRide.destination_lat}
                                dropoffLng={activeRide.destination_lng}
                                navigationType={['picked'].includes(activeRide.status) ? 'dropoff' : 'pickup'}
                                customerName={activeRide.customer_name}
                                onClose={() => setNavigating(false)}
                                isMobile={false}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Dashboard Tabs */}
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 mb-6 w-fit">
                    {[
                        { id: 'available', label: 'New Requests', count: pendingRides.length },
                        { id: 'my-rides', label: 'Trip History', icon: <History size={14} /> },
                        { id: 'profile', label: 'Profile', icon: <ShieldCheck size={14} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-secondary text-white shadow-md' : 'text-gray-400 hover:text-secondary'}`}
                        >
                            {tab.icon}
                            {tab.label} {tab.count !== undefined && <span className="ml-1 bg-primary text-white px-2 py-0.5 rounded-full text-[8px]">{tab.count}</span>}
                        </button>
                    ))}
                </div>

                {/* Main View Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {activeTab === 'available' && (
                        pendingRides.length === 0 ? (
                            <div className="col-span-full py-24 text-center bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent"></div>
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                    <Clock className="text-gray-300 w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-black text-secondary mb-1 uppercase italic tracking-tighter relative">Searching for Requests...</h3>
                                <p className="text-gray-400 font-bold text-[9px] tracking-widest uppercase relative">
                                    {onlineStatus !== 'online' ? 'Go online to receive new trip requests' : 'Waiting for new requests from the network'}
                                </p>
                            </div>
                        ) : (
                            pendingRides.map(ride => (
                                <RideRequestCard key={ride.id} ride={ride} onAccept={handleAccept} />
                            ))
                        )
                    )}


                    {activeTab === 'my-rides' && (
                        <div className="col-span-full space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatsCard label="Daily Payouts" value={`৳${stats.daily}`} color="bg-indigo-600" icon={<CreditCard size={20} />} />
                                <StatsCard label="Weekly Range" value={`৳${stats.weekly}`} color="bg-slate-800" icon={<TrendingUp size={20} />} />
                                <StatsCard label="Trust Score" value={`${profile?.rating_avg || '5.0'}★`} color="bg-emerald-500" icon={<Star size={20} />} />
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                    <h4 className="font-black text-secondary uppercase tracking-[0.2em] text-[9px]">Trip History</h4>
                                    <span className="text-gray-400 font-bold text-[10px] uppercase italic">{stats.trips} Trips Completed</span>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {myRides.length === 0 ? <div className="p-12 text-center text-gray-300 italic font-bold">No history available yet.</div> :
                                        myRides.map(ride => (
                                            <div key={ride.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 ${ride?.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                        {ride?.status === 'completed' ? <Check size={20} /> : <Clock size={20} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-secondary text-base">Trip #{ride?.id || 0}</p>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">{ride?.created_at ? new Date(ride.created_at).toLocaleDateString() : 'Unknown'} • {ride?.destination_address?.split(',')?.[0]?.trim() || 'Hotel'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-xl text-secondary italic">৳{ride?.estimated_fare || 0}</p>
                                                    <p className={`text-[9px] font-black uppercase tracking-widest ${ride?.status === 'completed' ? 'text-emerald-500' : 'text-indigo-500'}`}>{ride?.status?.replace('_', ' ') || 'UNKNOWN'}</p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && profile && (
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-gray-100 rounded-2xl p-8 col-span-full shadow-sm relative overflow-hidden">
                            <div className="flex flex-col md:flex-row items-center gap-6 mb-8 relative z-10">
                                <div className="relative group">
                                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center text-3xl font-black text-white shadow-xl relative">
                                        {profile.full_name?.charAt(0)}
                                    </div>
                                    {profile.is_verified == 1 && (
                                        <div className="absolute -top-3 -right-3 bg-blue-500 text-white p-2 rounded-full border-4 border-white shadow-xl animate-bounce">
                                            <ShieldCheck size={20} />
                                        </div>
                                    )}
                                </div>
                                <div className="text-center md:text-left">
                                    <h3 className="text-xl font-black text-secondary flex items-center justify-center md:justify-start gap-2">
                                        {profile.full_name}
                                        {profile.is_verified == 1 && <span className="text-[9px] bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-100 uppercase tracking-widest">Verified</span>}
                                    </h3>
                                    <p className="text-gray-400 font-bold text-[10px] italic mt-1 uppercase tracking-widest">Fleet ID: RNT-{profile.id.toString().padStart(4, '0')}</p>
                                </div>
                            </div>

                            <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                                <ProfileInput label="Carrier Full Name" name="full_name" defaultValue={profile.full_name} icon={<User size={18} />} />
                                <ProfileInput label="Service Phone" name="phone" defaultValue={profile.phone} icon={<Phone size={18} />} />
                                <ProfileInput label="Vehicle Class/Model" name="vehicle_model" defaultValue={profile.vehicle_model} placeholder="e.g. Toyota X Corolla" icon={<Truck size={18} />} />
                                <ProfileInput label="Registry Plate" name="number_plate" defaultValue={profile.number_plate} placeholder="e.g. DHA-KHA-1234" icon={<ShieldCheck size={18} />} />

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-gray-50 p-6 rounded-[1.5rem] border border-gray-100">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Max Load Capacity</p>
                                            <p className="text-sm font-bold text-secondary">Pax Support</p>
                                        </div>
                                        <select name="max_passengers" defaultValue={profile.max_passengers} className="bg-white border border-gray-200 rounded-xl px-6 py-3 font-black text-primary outline-none shadow-sm focus:border-primary transition-all">
                                            {[1, 2, 3, 4, 7, 10].map(n => <option key={n} value={n}>{n} Passengers</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between bg-gray-50 p-6 rounded-[1.5rem] border border-gray-100 px-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm text-primary"><Package size={20} /></div>
                                        <div>
                                            <p className="text-[11px] font-black text-secondary uppercase tracking-[0.1em]">Luggage Support</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Cargo bay available</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="luggage_support" defaultChecked={profile.luggage_support == 1} className="sr-only peer" />
                                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>

                                <div className="md:col-span-2 pt-6">
                                    <button disabled={updating} className="w-full bg-secondary text-white font-black px-10 py-4 rounded-xl hover:bg-black shadow-lg shadow-black/10 transition-all flex items-center justify-center gap-2 text-base">
                                        {updating ? <Loader className="animate-spin" size={20} /> : <Check size={20} />} UPDATE PROFILE
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

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
            className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 opacity-[0.03] group-hover:scale-105 transition-transform">
                <Truck size={180} />
            </div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full">New Trip</div>
                        <div className="bg-gray-50 text-gray-500 text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full flex items-center gap-1 border border-gray-100">
                            <Clock size={10} /> {timeLeft}s
                        </div>
                    </div>
                    <h3 className="text-xl font-black text-secondary tracking-tight">{ride.customer_name}</h3>
                    <p className="text-gray-400 font-bold text-xs mt-1 flex items-center gap-1.5">
                        <Truck size={14} className="text-primary" /> {ride.distance_km ? `${ride.distance_km.toFixed(1)} km away` : 'Nearby'}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black text-indigo-600 italic leading-none">৳{ride.estimated_fare}</div>
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Earnings</div>
                </div>
            </div>

            <div className="space-y-3 mb-6 relative z-10">
                <LocationCard icon={<MapPin size={16} className="text-indigo-600" />} label="Pickup" address={ride.pickup_address || "Hotel Area"} />
                <LocationCard icon={<Navigation size={16} className="text-slate-600" />} label="Destination" address={ride.destination_address} />
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
                <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${ride.pickup_lat},${ride.pickup_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gray-50 text-gray-400 hover:text-secondary hover:bg-gray-100 py-3 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all"
                >
                    <Navigation size={12} /> Map View
                </a>
                <button
                    onClick={() => onAccept(ride.id)}
                    className="w-full bg-emerald-600 text-white font-black py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest"
                >
                    <Check size={16} /> Accept
                </button>
            </div>
        </motion.div>
    );
};

// UI Components
const DriverStat = ({ icon, label, value }) => (
    <div className="flex items-center gap-4">
        <div className="text-primary group-hover:scale-110 transition-transform">{icon}</div>
        <div>
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1">{label}</div>
            <div className="text-sm font-black text-secondary italic leading-none">{value}</div>
        </div>
    </div>
);

const StatsCard = ({ label, value, color, icon }) => (
    <div className={`${color} p-6 rounded-2xl shadow-lg text-white relative overflow-hidden group hover:-translate-y-0.5 transition-transform`}>
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-105 transition-transform">{icon}</div>
        <div className="text-[9px] font-black uppercase tracking-[0.3em] opacity-80 mb-1 relative z-10">{label}</div>
        <div className="text-2xl font-black italic tracking-tighter relative z-10">{value}</div>
    </div>
);

const Badge = ({ icon, text, light, color = "text-white" }) => (
    <div className={`flex items-center gap-2 ${light ? 'bg-gray-50 border border-gray-100 text-gray-500' : 'bg-white/10 border border-white/10 text-white'} px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap`}>
        <span className={light ? 'text-primary' : color}>{icon}</span>
        <span>{text}</span>
    </div>
);

const LocationCard = ({ icon, label, address }) => (
    <div className="flex items-center gap-5 bg-gray-50 p-6 rounded-2xl border border-gray-100 group hover:border-primary/30 transition-all">
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:rotate-12 transition-transform">{icon}</div>
        <div className="flex-1 min-w-0">
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">{label}</div>
            <div className="text-xs font-bold text-secondary line-clamp-1 italic">{address}</div>
        </div>
    </div>
);

const StatusButton = ({ onClick, label, color }) => (
    <button onClick={onClick} className={`w-full ${color} text-white px-8 py-5 rounded-2xl font-black shadow-xl hover:-translate-y-1 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3`}>
        {label} <ChevronRight size={18} />
    </button>
);

const ProfileInput = ({ label, icon, ...props }) => (
    <div className="space-y-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary">{icon}</div>
            <input {...props} className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-7 py-5 font-bold text-secondary focus:bg-white focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none transition-all shadow-sm" />
        </div>
    </div>
);

export default DriverDashboard;
