import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Filter, Star, MapPin, Car } from 'lucide-react';
import MobileHotelCard from '../components/MobileHotelCard';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/ui/Logo';

const MobileHome = () => {
    const [heroIndex, setHeroIndex] = useState(0);
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [featuredHotels, setFeaturedHotels] = useState([]);
    const [notifications, setNotifications] = useState([]);

    const heroLines = [
        { lead: 'Book a room fast,', accent: 'ride to the door' },
        { lead: 'Check in by the hour,', accent: 'pay only for time' },
        { lead: 'Find verified stays,', accent: 'add pickup in seconds' },
        { lead: 'Rest, refresh, repeat,', accent: 'any time you need' }
    ];

    // Fetch Notifications
    const fetchNotifications = async () => {
        const user = localStorage.getItem('user');
        if (!user) return;

        try {
            const res = await fetch('/api/notifications/get_notifications.php?unread=true', { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setNotifications(data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await fetch('/api/hotels.php');
                const data = await response.json();
                if (data.success) {
                    setHotels(data.data);
                    // Randomly select 5 hotels for "Popular"
                    const shuffled = [...data.data].sort(() => 0.5 - Math.random());
                    setFeaturedHotels(shuffled.slice(0, 5));
                }
            } catch (err) {
                console.error("Failed to load hotels");
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
        fetchNotifications();

        // Poll for notifications
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Navigation for smoother transition
    const navigate = useNavigate();

    // Filter logic
    // Hero Text Rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % heroLines.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleSearchClick = () => {
        // Navigate with a tiny delay to allow for any visual feedback (optional) but mostly to feel deliberate
        navigate('/hotels');
    };

    const unreadCount = notifications.length;

    return (
        <div className="pb-24 pt-safe font-sans">
            {/* Header */}
            <header className="px-6 pt-6 pb-2 flex justify-between items-center">
                <Logo className="w-10 h-10" isDark={true} showText={true} textColor="text-white" />
                <Link to="/notifications">
                    <button className="w-10 h-10 rounded-full bg-navy-card border border-navy-border flex items-center justify-center text-white relative transition-transform active:scale-95">
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(255,165,0,0.6)]" />
                        )}
                    </button>
                </Link>
            </header>

            {/* Search Bar - Smoother Interaction */}
            <div className="px-6 py-4">
                <motion.div
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSearchClick}
                    className="relative group cursor-pointer"
                >
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="block w-full pl-10 pr-3 py-3 border border-navy-border rounded-xl leading-5 bg-navy-card text-gray-300 transition-all sm:text-sm shadow-sm">
                        Where to next?
                    </div>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="bg-navy-border p-1.5 rounded-lg">
                            <Filter className="h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Dynamic Hero Text */}
            <div className="px-6 py-6 min-h-[140px] flex items-center justify-center text-center">
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-3xl font-black text-white leading-tight"
                >
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={heroIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
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
            </div>

            {/* Featured Section */}
            <section className="mt-8">
                <div className="px-6 mb-4 flex justify-between items-end">
                    <h2 className="text-xl font-display font-bold text-white">Popular Stays</h2>
                    <Link to="/hotels" className="text-accent text-sm font-medium">See All</Link>
                </div>

                {loading ? (
                    <div className="px-6 flex gap-4 overflow-hidden">
                        {[1, 2].map(i => (
                            <div key={i} className="w-72 h-80 bg-navy-card rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="px-6 flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory py-4 pb-8">
                        {featuredHotels.map((hotel, idx) => (
                            <motion.div
                                key={hotel.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="snap-center"
                            >
                                {/* Reusing the simpler card style for horizontal scroll, slightly modified inline or use the component */}
                                <Link to={`/hotels/${hotel.id}`}>
                                    <div className="w-64 h-80 relative rounded-2xl overflow-hidden bg-navy-light/50 border border-white/5 shadow-lg">
                                        <img
                                            src={hotel.image_url || '/assets/default_hotel.png'}
                                            alt={hotel.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = '/assets/default_hotel.png'; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-transparent to-transparent" />

                                        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                            <span className="text-xs font-bold text-white">{hotel.rating || 'N/A'}</span>
                                        </div>

                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                            <h3 className="text-lg font-bold text-white mb-1 truncate">{hotel.name}</h3>
                                            <div className="flex items-center gap-1 text-gray-400 mb-2">
                                                <MapPin className="w-3 h-3" />
                                                <span className="text-xs truncate">{hotel.location || hotel.address}</span>
                                            </div>
                                            <span className="text-xl font-bold text-accent">৳{hotel.price_per_hour}</span>
                                            <span className="text-xs text-gray-400">/hr</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* Alternative Journey Promo */}
            <section className="px-6 mt-6 mb-2">
                <Link to="/journey">
                    <div className="relative p-6 rounded-3xl overflow-hidden shadow-lg border border-white/5 group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-navy-card transition-all group-hover:from-blue-600/30"></div>
                        <div className="relative flex justify-between items-center z-10">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>
                                </div>
                                <h2 className="text-xl font-black text-white italic">Alternative Journey</h2>
                                <p className="text-xs text-gray-300 mt-1 font-medium">Shared rides for smart travel.</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform -rotate-6 group-hover:rotate-0 transition-transform">
                                <Car className="text-white" size={24} />
                            </div>
                        </div>
                    </div>
                </Link>
            </section>

            {/* How It Works (Mobile Adapted) */}
            <section className="px-6 mt-8 mb-8">
                <h2 className="text-xl font-display font-bold text-white mb-6">How It Works</h2>
                <div className="space-y-4">
                    {[
                        { title: "Pick a Hotel", desc: "Browse verified hotels and compare hourly rates.", step: "01" },
                        { title: "Choose Time", desc: "Set check‑in and duration. Only pay for usage.", step: "02" },
                        { title: "Ride or Walk In", desc: "Add pickup service or check in directly.", step: "03" }
                    ].map((item, idx) => (
                        <div key={idx} className="relative p-5 rounded-2xl bg-navy-card border border-white/5 overflow-hidden">
                            <div className="absolute -right-2 -bottom-4 text-6xl font-black text-white/5 select-none">
                                {item.step}
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                                <p className="text-xs text-gray-400 leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section (Mobile Adapted) */}
            <section className="px-6 mb-8">
                <div className="relative rounded-3xl overflow-hidden bg-primary p-8 text-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent/20" />
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

                    <div className="relative z-10">
                        <h2 className="text-2xl font-black text-white italic tracking-tighter mb-2">Smarter Stays</h2>
                        <p className="text-xs text-white/80 font-medium mb-6 leading-relaxed">
                            Book your next quick stay in minutes with optional pickup rides.
                        </p>
                        <Link
                            to="/hotels"
                            className="inline-block w-full py-3 bg-white text-primary rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg"
                        >
                            Explore Now
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default MobileHome;
