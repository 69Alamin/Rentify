import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, MapPin, Loader, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MobileEmergency = () => {
    const [finding, setFinding] = useState(false);
    const [hotels, setHotels] = useState([]);
    const [nearest, setNearest] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch all hotels to pick nearest locally for speed
        const fetchHotels = async () => {
            try {
                const res = await fetch('/api/hotels.php');
                const data = await res.json();
                if (data.success) setHotels(data.data || []);
            } catch (err) { }
        };
        fetchHotels();
    }, []);

    const handleActivate = () => {
        setFinding(true);
        if (!navigator.geolocation) {
            alert("Geolocation not supported");
            setFinding(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const sorted = [...hotels].map(p => {
                    const lat2 = parseFloat(p.latitude);
                    const lng2 = parseFloat(p.longitude);
                    if (!lat2 || !lng2) return { ...p, dist: 999999 };
                    const R = 6371;
                    const dLat = (lat2 - latitude) * Math.PI / 180;
                    const dLon = (lng2 - longitude) * Math.PI / 180;
                    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(latitude * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    return { ...p, dist: R * c };
                }).sort((a, b) => a.dist - b.dist);

                if (sorted.length > 0) {
                    setNearest(sorted[0]);
                } else {
                    alert("No properties found nearby.");
                }
                setFinding(false);
            },
            () => {
                alert("Location access denied.");
                setFinding(false);
            },
            { enableHighAccuracy: true }
        );
    };

    return (
        <div className="min-h-screen bg-red-600 p-8 text-white flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Background Animation */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
                <Shield size={400} />
            </motion.div>

            <AnimatePresence mode="wait">
                {!nearest ? (
                    <motion.div
                        key="initial"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative z-10 w-full"
                    >
                        <Shield size={80} className="mx-auto mb-8" />
                        <h1 className="text-4xl font-black italic tracking-tighter mb-4 uppercase">Priority Sanctuary</h1>
                        <p className="text-white/70 font-bold text-xs uppercase tracking-widest mb-12 px-4 leading-relaxed">
                            One-tap activation to locate and secure the absolute nearest verified stay using your live coordinates.
                        </p>

                        <button
                            onClick={handleActivate}
                            disabled={finding}
                            className="w-full bg-white text-red-600 py-6 rounded-3xl font-black text-sm shadow-2xl flex items-center justify-center gap-3 uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
                        >
                            {finding ? <Loader size={20} className="animate-spin" /> : <><Shield size={20} /> Activate Protocol</>}
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 w-full bg-white rounded-[2.5rem] p-8 text-secondary shadow-2xl"
                    >
                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={32} />
                        </div>
                        <h2 className="text-2xl font-black italic tracking-tighter mb-2 uppercase text-red-600">Sanctuary Located</h2>
                        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-8">Nearest verified property identified</p>

                        <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-left border border-gray-100">
                            <h3 className="font-black text-lg mb-1">{nearest.name}</h3>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                <MapPin size={12} className="text-primary" /> {nearest.dist.toFixed(2)} km away
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => navigate(`/mobile/hotels/${nearest.id}?emergency=true`)}
                                className="w-full bg-red-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                            >
                                Secure Now <ArrowRight size={18} />
                            </button>
                            <button
                                onClick={() => setNearest(null)}
                                className="w-full py-4 text-gray-400 font-black text-[10px] uppercase tracking-widest"
                            >
                                Cancel Protocol
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MobileEmergency;
