import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Loader, AlertCircle, CheckCircle, Navigation, Star, ShieldCheck, Send, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AlternativeJourney = () => {
    const [step, setStep] = useState(1); // 1: pickup, 2: destination, 3: riders
    const [pickupLocation, setPickupLocation] = useState('');
    const [pickupCoords, setPickupCoords] = useState(null);
    const [pickupSearch, setPickupSearch] = useState('');
    const [destinationLocation, setDestinationLocation] = useState('');
    const [destinationCoords, setDestinationCoords] = useState(null);
    const [destinationSearch, setDestinationSearch] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState('bike');
    const [availableRiders, setAvailableRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [distance, setDistance] = useState(null);
    const [estimatedFare, setEstimatedFare] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        getCurrentLocation();
    }, []);

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
        } catch (err) {
            setError('Unable to get location. Search manually.');
        } finally {
            setLoading(false);
        }
    };

    const reverseGeocode = async (lat, lng) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                { headers: { 'Accept': 'application/json' } }
            );
            const data = await res.json();
            return data.address?.road || data.address?.city || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        } catch {
            return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
    };

    const geocodeAddress = async (address, type) => {
        if (address.length < 2) {
            setError('Please enter a valid location');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
                { headers: { 'Accept': 'application/json' } }
            );
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
            } else {
                setError('Location not found. Try a different search.');
            }
        } catch (err) {
            console.error('Geocoding error:', err);
            setError('Location search failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const calculateFare = (dist, vehicle) => {
        const basePrice = vehicle === 'car' ? 100 : 50;
        const perKm = vehicle === 'car' ? 40 : 15;
        return Math.round(basePrice + (dist * perKm));
    };

    const handleProceedToDestination = () => {
        if (!pickupCoords || !pickupLocation) {
            setError('Please select pickup location');
            return;
        }
        setError('');
        setStep(2);
    };

    const handleProceedToRiders = async () => {
        if (!destinationCoords || !destinationLocation) {
            setError('Please select destination');
            return;
        }

        const dist = calculateDistance(
            pickupCoords.lat, pickupCoords.lng,
            destinationCoords.lat, destinationCoords.lng
        );
        setDistance(dist.toFixed(2));
        setEstimatedFare(calculateFare(dist, selectedVehicle));
        setError('');
        setStep(3);
    };

    const handleRequestRide = async () => {
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
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                    setStep(1);
                    setPickupLocation('');
                    setPickupCoords(null);
                    setDestinationLocation('');
                    setDestinationCoords(null);
                    getCurrentLocation();
                }, 2500);
            } else {
                setError(data.message || 'Ride request failed');
                console.log('API Error:', data);
            }
        } catch (err) {
            setError('Ride request error: ' + err.message);
            console.log('Request Error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 pt-28">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
                    <h1 className="text-4xl font-black text-secondary mb-2">🚗 Shared Ride</h1>
                    <p className="text-gray-600">Book an instant ride with available drivers</p>
                </motion.div>

                {/* Progress Indicator */}
                <div className="flex justify-between mb-10 px-2">
                    {[1, 2, 3].map(s => (
                        <div key={s} className="flex items-center flex-1">
                            <motion.div
                                animate={{ scale: s <= step ? 1.1 : 1 }}
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm transition-all ${s <= step
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'bg-gray-300 text-gray-600'
                                    }`}
                            >
                                {s}
                            </motion.div>
                            {s < 3 && <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${s < step ? 'bg-primary' : 'bg-gray-300'}`}></div>}
                        </div>
                    ))}
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3">
                        <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                        <p className="font-bold text-red-700">{error}</p>
                    </motion.div>
                )}

                {/* Step 1: Pickup Location */}
                {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-3xl font-black text-secondary mb-8 italic">📍 Where are you?</h2>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-4 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search pickup location..."
                                        value={pickupSearch}
                                        onChange={(e) => setPickupSearch(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                geocodeAddress(pickupSearch, 'pickup');
                                            }
                                        }}
                                        className="w-full p-4 pl-12 border-2 border-gray-200 rounded-2xl focus:border-primary outline-none font-bold text-lg"
                                    />
                                </div>
                                <button
                                    onClick={() => geocodeAddress(pickupSearch, 'pickup')}
                                    disabled={loading || !pickupSearch}
                                    className="p-4 bg-secondary text-white rounded-2xl font-bold hover:bg-secondary-hover transition-all disabled:opacity-50 whitespace-nowrap"
                                >
                                    {loading ? <Loader size={18} className="animate-spin" /> : 'Search'}
                                </button>
                            </div>

                            {pickupCoords && (
                                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                                            <MapPin className="text-blue-700" size={28} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-blue-900 text-lg">{pickupLocation}</p>
                                            <p className="text-sm text-blue-700 mt-1">Lat: {pickupCoords.lat.toFixed(4)}, Lng: {pickupCoords.lng.toFixed(4)}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={getCurrentLocation}
                                    disabled={loading}
                                    className="p-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
                                >
                                    {loading ? <Loader size={18} className="animate-spin mx-auto" /> : 'Use My Location'}
                                </button>
                                <button
                                    onClick={handleProceedToDestination}
                                    disabled={!pickupCoords}
                                    className="p-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all disabled:opacity-50"
                                >
                                    Continue →
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Destination */}
                {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-3xl font-black text-secondary mb-8 italic">🎯 Where to?</h2>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-4 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search destination..."
                                        value={destinationSearch}
                                        onChange={(e) => setDestinationSearch(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                geocodeAddress(destinationSearch, 'destination');
                                            }
                                        }}
                                        className="w-full p-4 pl-12 border-2 border-gray-200 rounded-2xl focus:border-primary outline-none font-bold text-lg"
                                    />
                                </div>
                                <button
                                    onClick={() => geocodeAddress(destinationSearch, 'destination')}
                                    disabled={loading || !destinationSearch}
                                    className="p-4 bg-secondary text-white rounded-2xl font-bold hover:bg-secondary-hover transition-all disabled:opacity-50 whitespace-nowrap"
                                >
                                    {loading ? <Loader size={18} className="animate-spin" /> : 'Search'}
                                </button>
                            </div>

                            {destinationCoords && (
                                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Navigation className="text-purple-700" size={28} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-purple-900 text-lg">{destinationLocation}</p>
                                            <p className="text-sm text-purple-700 mt-1">Lat: {destinationCoords.lat.toFixed(4)}, Lng: {destinationCoords.lng.toFixed(4)}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="p-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={handleProceedToRiders}
                                    disabled={!destinationCoords || loading}
                                    className="p-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all disabled:opacity-50"
                                >
                                    {loading ? <Loader size={18} className="animate-spin mx-auto" /> : 'Find Riders →'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Confirm & Request */}
                {step === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-3xl font-black text-secondary mb-8 italic">✅ Confirm Ride Request</h2>

                        {/* Ride Summary */}
                        <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b-2 border-gray-100">
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase mb-2">From</p>
                                <p className="font-bold text-gray-800 text-lg">{pickupLocation}</p>
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase mb-2">To</p>
                                <p className="font-bold text-gray-800 text-lg">{destinationLocation}</p>
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase mb-2">Distance</p>
                                <p className="font-bold text-gray-800 text-lg">{distance} km</p>
                            </div>
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase mb-2">Estimated Fare</p>
                                <p className="font-black text-primary text-3xl">৳{estimatedFare}</p>
                            </div>
                        </div>

                        {/* Vehicle Selection */}
                        <div className="mb-8">
                            <p className="text-xs font-black text-gray-400 uppercase mb-4">Vehicle Type</p>
                            <div className="flex gap-4">
                                {['bike', 'car'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            setSelectedVehicle(type);
                                            setEstimatedFare(calculateFare(parseFloat(distance), type));
                                        }}
                                        className={`flex-1 p-4 rounded-2xl font-bold transition-all border-2 ${selectedVehicle === type
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-gray-200 text-gray-700 hover:border-primary'
                                            }`}
                                    >
                                        {type === 'bike' ? '🏍️ Bike' : '🚗 Car'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Info Message */}
                        <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200 mb-8">
                            <p className="text-sm font-bold text-blue-900">Your request will be sent to all online drivers. The first available driver will accept your ride.</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setStep(2)}
                                className="p-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleRequestRide}
                                disabled={submitting}
                                className="p-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                                {submitting ? 'Requesting...' : 'Request Ride'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-[3rem] w-full max-w-md p-10 relative shadow-2xl text-center">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>
                            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="text-primary w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-black text-secondary mb-3 italic">🎉 Request Sent!</h2>
                            <p className="text-gray-600 font-medium px-4 mb-8">
                                Your shared ride request has been sent. A nearby driver will accept shortly!
                            </p>
                            <button onClick={() => setShowSuccessModal(false)} className="w-full bg-primary text-white py-5 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition uppercase tracking-widest">
                                GOT IT
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AlternativeJourney;
