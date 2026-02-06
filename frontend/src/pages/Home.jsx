import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Clock, Star, ArrowRight, Shield, Coffee, Zap, AlertTriangle, Loader, X } from 'lucide-react';
import Logo from '../components/ui/Logo';
import { Link, useNavigate } from 'react-router-dom';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

const Home = () => {
    const [hotels, setHotels] = useState([]);
    const heroLines = [
        { lead: 'Book a room fast,', accent: 'ride to the door' },
        { lead: 'Check in by the hour,', accent: 'pay only for time' },
        { lead: 'Find verified stays,', accent: 'add pickup in seconds' },
        { lead: 'Rest, refresh, repeat,', accent: 'any time you need' }
    ];
    const [heroIndex, setHeroIndex] = useState(0);
    const [findingEmergency, setFindingEmergency] = useState(false);
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const [hoveringEmergency, setHoveringEmergency] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const res = await fetch('/api/hotels.php');
                const data = await res.json();
                if (data.success) {
                    setHotels(data.data || []);
                }
            } catch (err) {
                console.error('Failed to load hotels');
            }
        };

        fetchHotels();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % heroLines.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const getImageUrl = (url) => {
        if (!url || url === 'assets/default_property.jpg') return '/assets/default_hotel.png';
        if (typeof url === 'string' && url.startsWith('http')) return url;
        return `/${url}`;
    };

    const popularHotels = hotels.slice(0, 3);

    const handleEmergencyStay = () => {
        setShowEmergencyModal(false);
        setFindingEmergency(true);
        if (!navigator.geolocation) {
            setFindingEmergency(false);
            alert("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // Calculate distances and find nearest
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
                    navigate(`/hotels/${sorted[0].id}?emergency=true`);
                } else {
                    setFindingEmergency(false);
                    alert("No properties found nearby.");
                }
            },
            () => {
                setFindingEmergency(false);
                alert("Location access denied. Please enable location to use Emergency Mode.");
            },
            { enableHighAccuracy: true }
        );
    };

    return (
        <div className="overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark">
                {/* Background Gradients */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-[20%] -left-[10%] w-[700px] h-[700px] bg-primary/30 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute top-[10%] left-[30%] w-[400px] h-[400px] bg-aura-purple/20 rounded-full blur-[100px] animate-float" />
                    <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
                </div>

                <div className="container mx-auto px-6 relative z-10 pt-20">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-primary mb-8">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                            </span>
                            <span className="text-sm font-semibold tracking-wide uppercase">Instant hourly stays & pickup rides</span>
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={heroIndex}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                    className="block"
                                >
                                    {heroLines[heroIndex].lead}
                                    <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                                        {heroLines[heroIndex].accent}
                                    </span>
                                </motion.span>
                            </AnimatePresence>
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                            Quickrent connects you with verified hotels for hourly stays and optional pickup rides. Perfect for transit breaks, short rests, or work sessions.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                            <Link to="/hotels" className="px-8 py-4 bg-primary hover:scale-105 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3">
                                <Search size={16} />
                                Find Stays
                            </Link>
                            <div className="relative group/emergency">
                                <button
                                    onClick={() => setShowEmergencyModal(true)}
                                    onMouseEnter={() => setHoveringEmergency(true)}
                                    onMouseLeave={() => setHoveringEmergency(false)}
                                    disabled={findingEmergency}
                                    className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-500/20 transition-all hover:-translate-y-0.5 flex flex-col items-center justify-center gap-1 disabled:bg-red-950/50 min-w-[200px] relative overflow-hidden"
                                >
                                    {/* Pulse Effect */}
                                    <span className="absolute inset-0 bg-white/20 animate-ping opacity-20 pointer-events-none" />

                                    <div className="flex items-center gap-3">
                                        {findingEmergency ? <Loader size={16} className="animate-spin" /> : <Shield size={16} className="text-white" />}
                                        Secure Immediate Sanctuary
                                    </div>
                                    <span className="text-[7px] opacity-60 normal-case tracking-normal font-bold">Nearest verified safe-room</span>
                                </button>

                                {/* Tooltip */}
                                <AnimatePresence>
                                    {hoveringEmergency && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 p-4 bg-white rounded-2xl shadow-2xl z-50 pointer-events-none border border-gray-100"
                                        >
                                            <div className="text-xs font-black text-red-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <AlertTriangle size={12} /> Priority Protocol
                                            </div>
                                            <p className="text-xs text-gray-500 font-bold leading-relaxed">
                                                One-click activation to locate and secure the absolute nearest verified stay using your live coordinates.
                                            </p>
                                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-gray-100 rotate-45" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <Link to="/map" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3">
                                <MapPin size={16} />
                                View Map
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Quick Stats / Features */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto"
                    >
                        {[
                            { icon: Clock, label: "Hourly Flex", sub: "Book exactly what you need" },
                            { icon: Shield, label: "Verified Stays", sub: "Trusted hotels only" },
                            { icon: Zap, label: "Instant Confirm", sub: "No delays" },
                            { icon: Coffee, label: "Comfort Ready", sub: "Wi‑Fi, AC, & more" }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors text-center group">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <item.icon className="text-primary" size={24} />
                                </div>
                                <h3 className="text-white font-bold mb-1">{item.label}</h3>
                                <p className="text-gray-400 text-sm">{item.sub}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Popular Properties */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-4xl font-bold text-secondary mb-4">Top Picks Near You</h2>
                            <p className="text-gray-600 text-lg">Quickrent’s most booked hotels for short stays.</p>
                        </div>
                        <Link to="/hotels" className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                            View All <ArrowRight size={20} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {popularHotels.map((property) => (
                            <Link key={property.id} to={`/hotels/${property.id}`} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={getImageUrl(property.image_url)}
                                        alt={property.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {/* VERIFIED BADGE */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        {property.is_verified == 1 && (
                                            <div className="bg-indigo-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                                                <Shield size={10} fill="currentColor" /> Verified Stay
                                            </div>
                                        )}
                                    </div>

                                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5">
                                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-xs font-black text-secondary">{property.rating || '4.8'}</span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-black text-secondary tracking-tight mb-0.5 group-hover:text-primary transition-colors">{property.name}</h3>
                                            <p className="text-xs text-gray-400 flex items-center gap-1 font-black uppercase tracking-widest">
                                                <MapPin size={12} className="text-primary" /> {property.city || 'Dhaka'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-secondary italic leading-none">৳{property.price_per_hour}<span className="text-xs font-bold text-gray-400 opacity-60">/hr</span></div>
                                        </div>
                                    </div>

                                    <div className="flex gap-1.5 mb-6">
                                        {['High Speed WiFi', 'Instant Check-in'].map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-gray-50 text-xs font-black text-gray-400 uppercase tracking-widest rounded-lg border border-gray-100">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="w-full py-3.5 bg-secondary text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg group-hover:bg-primary transition-all flex items-center justify-center gap-2">
                                        Book Stay Now <ArrowRight size={14} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <Link to="/hotels" className="w-full md:hidden mt-8 py-3 bg-white border border-gray-200 text-secondary rounded-xl font-bold shadow-sm text-center block">
                        View All Hotels
                    </Link>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl font-bold text-secondary mb-4">How Quickrent Works</h2>
                        <p className="text-gray-600 text-lg">Book a room, add a ride, and check in smoothly.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relataive">
                        {[
                            { title: "Pick a Hotel", desc: "Browse verified hotels and compare hourly rates.", step: "01" },
                            { title: "Choose Time", desc: "Set check‑in and duration. Only pay for the hours you use.", step: "02" },
                            { title: "Ride or Walk In", desc: "Add pickup service or check in directly at the hotel.", step: "03" }
                        ].map((item, idx) => (
                            <div key={idx} className="relative p-8 rounded-2xl bg-gray-50 border border-gray-100 group">
                                <div className="absolute -top-4 left-6 text-5xl font-black text-gray-200/50 group-hover:text-primary/10 transition-colors select-none">
                                    {item.step}
                                </div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 border border-gray-100">
                                        <div className="w-6 h-6 bg-primary rounded" />
                                    </div>
                                    <h3 className="text-lg font-black text-secondary mb-2 uppercase italic tracking-tighter">{item.title}</h3>
                                    <p className="text-gray-400 text-xs font-bold leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-dark relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent" />
                </div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div variants={fadeInUp} className="flex flex-col items-center text-center">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 italic tracking-tighter">Ready for a <span className="text-primary italic">Smarter</span> Stay?</h2>
                    </motion.div>
                    <p className="text-base text-gray-400 mb-10 max-w-2xl mx-auto font-bold">
                        Book your next quick stay in minutes and add a pickup ride when you need it.
                    </p>
                    <Link to="/hotels" className="inline-flex px-10 py-4 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                        Explore Hotels <ArrowRight className="ml-2" size={16} />
                    </Link>
                </div>
            </section>
            {/* Emergency Confirmation Modal */}
            <AnimatePresence>
                {showEmergencyModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowEmergencyModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl overflow-hidden border border-gray-100"
                        >
                            <button
                                onClick={() => setShowEmergencyModal(false)}
                                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-secondary z-20"
                            >
                                <X size={20} />
                            </button>

                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none text-red-600">
                                <Shield size={200} />
                            </div>

                            <div className="relative z-10 text-center">
                                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <AlertTriangle size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-secondary italic tracking-tighter mb-4 uppercase">Activate Priority Sanctuary?</h3>
                                <p className="text-gray-500 font-bold text-sm leading-relaxed mb-8">
                                    This protocol will request your current location to instantly secure the nearest verified safe-room. Use this for urgent, high-stress situations only.
                                </p>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleEmergencyStay}
                                        className="w-full py-4 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all flex items-center justify-center gap-3"
                                    >
                                        Proceed to Sanctuary <ArrowRight size={16} />
                                    </button>
                                    <button
                                        onClick={() => setShowEmergencyModal(false)}
                                        className="w-full py-4 bg-gray-50 text-gray-400 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-100 hover:text-secondary transition-all"
                                    >
                                        Cancel Protocol
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;
