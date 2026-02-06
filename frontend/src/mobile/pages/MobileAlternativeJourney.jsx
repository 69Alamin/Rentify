import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader, AlertCircle, CheckCircle, Search, ChevronLeft, ChevronRight, Car, Bike, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MobileAlternativeJourney = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [pickupLocation, setPickupLocation] = useState('');
    const [pickupCoords, setPickupCoords] = useState(null);
    const [pickupSearch, setPickupSearch] = useState('');
    const [destinationLocation, setDestinationLocation] = useState('');
    const [destinationCoords, setDestinationCoords] = useState(null);
    const [destinationSearch, setDestinationSearch] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState('bike');
    const [loading, setLoading] = useState(false);
    const [activeRide, setActiveRide] = useState(null); // New state for polling
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [distance, setDistance] = useState(null);
    const [estimatedFare, setEstimatedFare] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        getCurrentLocation();

        // Start Long Polling
        let isMounted = true;
        let retryCount = 0;

        const pollStatus = async () => {
            if (!isMounted) return;

            // If we don't have an active ride, we fallback to short polling to find one
            if (!activeRide) {
                await checkActiveRide();
                if (isMounted) setTimeout(pollStatus, 2000);
                return;
            }

            try {
                // Long poll
                const url = `/api/updates/poll.php?type=ride&id=${activeRide.id}&current_status=${activeRide.status}`;
                const res = await fetch(url, { credentials: 'include' });
                const data = await res.json();

                if (data.success && data.changed) {
                    console.log('Status Changed:', data.status);

                    // Update Status
                    setActiveRide(prev => ({ ...prev, status: data.status }));

                    // Force Step 4 if status progresses
                    if (['assigned', 'on_the_way', 'picked_up'].includes(data.status)) {
                        setStep(4);
                    }

                    // Just in case, fetch fresh details to get driver info if just assigned
                    if (data.status === 'assigned' && !activeRide.driver_id) {
                        checkActiveRide();
                    }
                }
                retryCount = 0;
            } catch (err) {
                console.error("Poll error", err);
                retryCount++;
                // Backoff slightly on errors
                if (isMounted) await new Promise(r => setTimeout(r, 1000 * Math.min(retryCount, 5)));
            }

            if (isMounted) pollStatus(); // Recursive call immediately
        };

        // Initial kick
        pollStatus();

        return () => { isMounted = false; };
    }, [activeRide?.id, activeRide?.status]); // Critical: Restart loop if ID or Status changes (to update poll URL)

    const checkActiveRide = async () => {
        try {
            const res = await fetch(`/api/rides/request.php?t=${Date.now()}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success && data.data && data.data.length > 0) {
                const ride = data.data[0];
                // Only update if something changed to avoid loop
                if (activeRide?.status !== ride.status || !activeRide || (ride.status === 'assigned' && !activeRide.driver_name)) {
                    setActiveRide(ride);
                    if ((ride.status === 'assigned' || ride.status === 'on_the_way' || ride.status === 'picked_up') && step !== 4) {
                        setStep(4);
                    }
                }
            }
        } catch (err) { }
    };

    const getCurrentLocation = async () => {
        setLoading(true);
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            const { latitude, longitude } = position.coords;
            setPickupCoords({ lat: latitude, lng: longitude });
            const address = await reverseGeocode(latitude, longitude);
            setPickupLocation(address);
        } catch (err) { }
        finally { setLoading(false); }
    };

    const reverseGeocode = async (lat, lng) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, { headers: { 'Accept': 'application/json' } });
            const data = await res.json();
            return data.address?.road || data.address?.city || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        } catch { return `${lat.toFixed(4)}, ${lng.toFixed(4)}`; }
    };

    const geocodeAddress = async (address, type) => {
        if (address.length < 2) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`, { headers: { 'Accept': 'application/json' } });
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                if (type === 'pickup') {
                    setPickupCoords(result);
                    setPickupLocation(data[0].display_name || address);
                    setPickupSearch('');
                } else {
                    setDestinationCoords(result);
                    setDestinationLocation(data[0].display_name || address);
                    setDestinationSearch('');
                }
            } else { setError('Location not found'); }
        } catch (err) { setError('Search failed'); }
        finally { setLoading(false); }
    };

    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const calculateFare = (dist, vehicle) => {
        const basePrice = vehicle === 'car' ? 100 : 50;
        const perKm = vehicle === 'car' ? 40 : 15;
        return Math.round(basePrice + (dist * perKm));
    };

    const handleProceed = () => {
        if (step === 1 && pickupCoords) setStep(2);
        else if (step === 2 && destinationCoords) {
            const dist = calculateDistance(pickupCoords.lat, pickupCoords.lng, destinationCoords.lat, destinationCoords.lng);
            setDistance(dist.toFixed(2));
            setEstimatedFare(calculateFare(dist, selectedVehicle));
            setStep(3);
        }
    };

    const handleRequest = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/rides/request.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    booking_id: 0,
                    pickup_address: pickupLocation,
                    pickup_lat: pickupCoords.lat,
                    pickup_lng: pickupCoords.lng,
                    destination_address: destinationLocation,
                    dest_lat: destinationCoords.lat,
                    dest_lng: destinationCoords.lng,
                    vehicle_type: selectedVehicle,
                    distance_km: parseFloat(distance),
                    estimated_fare: estimatedFare
                }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setShowSuccess(true);
                setTimeout(() => {
                    navigate('/history?tab=rides');
                }, 2000);
            } else { setError(data.message || 'Request failed'); }
        } catch (err) { setError('Network error'); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="min-h-screen bg-navy text-white pb-24">
            {/* Header */}
            <div className="bg-navy/95 backdrop-blur-xl px-6 pt-12 pb-4 border-b border-white/5 sticky top-0 z-10 flex items-center gap-3">
                <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <h1 className="text-xl font-black text-white">Alternative Journey</h1>
            </div>

            <div className="p-4">
                {/* Progress */}
                <div className="flex justify-between px-8 mb-8 relative">
                    <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-white/10 -z-10" />
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${s <= step ? 'bg-accent text-navy scale-110' : 'bg-navy-light text-gray-500 border border-white/10'}`}>
                            {s}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-2xl font-black text-white px-2">Where are you?</h2>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    value={pickupSearch}
                                    onChange={e => setPickupSearch(e.target.value)}
                                    placeholder="Search pickup..."
                                    className="w-full bg-navy-light border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white font-bold outline-none focus:border-accent"
                                    onKeyPress={e => e.key === 'Enter' && geocodeAddress(pickupSearch, 'pickup')}
                                />
                                {pickupSearch && <button onClick={() => geocodeAddress(pickupSearch, 'pickup')} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-accent rounded-lg text-navy"><ChevronRight size={16} /></button>}
                            </div>

                            {pickupCoords && (
                                <div className="bg-navy-light p-4 rounded-2xl border border-white/5 flex gap-4 items-center">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><MapPin size={20} /></div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Pickup Location</p>
                                        <p className="font-bold text-white text-sm">{pickupLocation}</p>
                                    </div>
                                </div>
                            )}

                            <button onClick={getCurrentLocation} className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-bold flex items-center justify-center gap-2 text-sm hover:bg-white/10">
                                {loading ? <Loader className="animate-spin" size={16} /> : <><MapPin size={16} /> Use My Location</>}
                            </button>

                            <button onClick={handleProceed} disabled={!pickupCoords} className="w-full py-4 bg-accent text-navy rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-accent/20 disabled:opacity-50 disabled:shadow-none">
                                Set Pickup
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-2xl font-black text-white px-2">Where to?</h2>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    value={destinationSearch}
                                    onChange={e => setDestinationSearch(e.target.value)}
                                    placeholder="Search destination..."
                                    className="w-full bg-navy-light border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white font-bold outline-none focus:border-accent"
                                    onKeyPress={e => e.key === 'Enter' && geocodeAddress(destinationSearch, 'dest')}
                                />
                                {destinationSearch && <button onClick={() => geocodeAddress(destinationSearch, 'dest')} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-accent rounded-lg text-navy"><ChevronRight size={16} /></button>}
                            </div>

                            {destinationCoords && (
                                <div className="bg-navy-light p-4 rounded-2xl border border-white/5 flex gap-4 items-center">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400"><Navigation size={20} /></div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Destination</p>
                                        <p className="font-bold text-white text-sm">{destinationLocation}</p>
                                    </div>
                                </div>
                            )}

                            <button onClick={handleProceed} disabled={!destinationCoords} className="w-full py-4 bg-accent text-navy rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-accent/20 disabled:opacity-50 disabled:shadow-none">
                                Find Riders
                            </button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-2xl font-black text-white px-2">Confirm Request</h2>

                            <div className="bg-navy-light rounded-2xl p-6 border border-white/5 space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <div className="w-0.5 h-10 bg-white/10" />
                                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                                    </div>
                                    <div className="flex-1 space-y-8">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">From</p>
                                            <p className="font-bold text-white text-sm line-clamp-1">{pickupLocation}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">To</p>
                                            <p className="font-bold text-white text-sm line-clamp-1">{destinationLocation}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Distance</p>
                                        <p className="font-bold text-white">{distance} km</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Est. Fare</p>
                                        <p className="font-black text-accent text-xl">৳{estimatedFare}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-3 px-2">Select Vehicle</p>
                                <div className="flex gap-3">
                                    {['bike', 'car'].map(v => (
                                        <button
                                            key={v}
                                            onClick={() => { setSelectedVehicle(v); setEstimatedFare(calculateFare(parseFloat(distance), v)); }}
                                            className={`flex-1 py-4 rounded-xl font-bold flex flex-col items-center border transition-all ${selectedVehicle === v ? 'bg-accent text-navy border-accent' : 'bg-navy-light text-gray-400 border-white/5'}`}
                                        >
                                            {v === 'bike' ? <Bike size={24} className="mb-1" /> : <Car size={24} className="mb-1" />}
                                            <span className="uppercase text-xs">{v}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button onClick={handleRequest} disabled={submitting} className="w-full py-4 bg-white text-navy rounded-xl font-black text-sm uppercase tracking-widest shadow-lg disabled:opacity-50">
                                {submitting ? <Loader className="animate-spin mx-auto" size={20} /> : 'Confirm Request'}
                            </button>
                        </motion.div>
                    )}

                    {step === 4 && activeRide && (
                        <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10"><Car size={120} /></div>

                                <div className="relative z-10 text-center">
                                    <div className="w-20 h-20 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center text-indigo-600 shadow-lg">
                                        <User size={40} />
                                    </div>
                                    <h2 className="text-2xl font-black text-white">{activeRide.driver_name || 'Driver'}</h2>
                                    <p className="text-indigo-200 font-bold text-sm uppercase tracking-widest mb-6">is on the way!</p>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-white/10 rounded-xl p-3">
                                            <p className="text-[10px] text-indigo-200 uppercase tracking-widest">Vehicle</p>
                                            <p className="font-black text-white">{activeRide.vehicle_model || 'Unknown'}</p>
                                        </div>
                                        <div className="bg-white/10 rounded-xl p-3">
                                            <p className="text-[10px] text-indigo-200 uppercase tracking-widest">Rating</p>
                                            <div className="flex items-center justify-center gap-1 font-black text-white">
                                                <span className="text-yellow-400">★</span> {activeRide.driver_rating || '5.0'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <a href={`tel:${activeRide.driver_phone}`} className="flex-1 bg-white text-indigo-900 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">
                                            Call Driver
                                        </a>
                                        <button className="flex-1 bg-indigo-500/20 text-white border border-white/20 py-3 rounded-xl font-black text-xs uppercase tracking-widest">
                                            Message
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-navy-light rounded-2xl p-6 border border-white/5">
                                <h3 className="font-black text-white mb-4">Trip Status</h3>
                                <div className="space-y-6 relative">
                                    <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-white/10"></div>
                                    {[
                                        { status: 'assigned', label: 'Driver Assigned', active: true },
                                        { status: 'on_the_way', label: 'Driver on the way', active: ['on_the_way', 'picked_up'].includes(activeRide.status) },
                                        { status: 'picked_up', label: 'Ride in Progress', active: activeRide.status === 'picked_up' }
                                    ].map((s, i) => (
                                        <div key={i} className="flex items-center gap-4 relative z-10">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${s.active ? 'bg-accent border-accent text-navy' : 'bg-navy border-white/20 text-white/20'}`}>
                                                {s.active && <CheckCircle size={14} />}
                                            </div>
                                            <p className={`font-bold text-sm ${s.active ? 'text-white' : 'text-gray-600'}`}>{s.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {showSuccess && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8 backdrop-blur-sm">
                        <div className="bg-navy-light rounded-3xl p-8 border border-emerald-500/30 text-center w-full max-w-sm">
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                                <CheckCircle size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2">Request Sent!</h2>
                            <p className="text-gray-400 text-sm font-bold">Redirecting to trips...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MobileAlternativeJourney;
