import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Shield, ArrowRight, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const MobileHome = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
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
            } finally {
                setLoading(false);
            }
        };
        fetchHotels();
    }, []);

    const getImageUrl = (url) => {
        if (!url || url === 'assets/default_property.jpg') return '/assets/default_hotel.png';
        if (typeof url === 'string' && url.startsWith('http')) return url;
        return `/${url}`;
    };

    return (
        <div className="px-6 pt-10 pb-6">
            <header className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-black text-secondary tracking-tighter italic">Rentify</h1>
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-primary">
                        <Star size={20} fill="currentColor" />
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search for quick stays..."
                        className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary shadow-sm font-bold text-secondary text-sm"
                    />
                </div>
            </header>

            {/* Express Actions */}
            <div className="mb-8">
                {/* Explore Map CTA */}
                <motion.div
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/mobile/map')}
                    className="bg-secondary rounded-[2.5rem] p-8 text-white shadow-xl shadow-gray-200 relative overflow-hidden h-48 flex flex-col justify-end"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12 text-primary">
                        <MapPin size={100} />
                    </div>
                    <div className="relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-2 py-1 rounded-full backdrop-blur-md mb-3 inline-block">Spatial Hub</span>
                        <h2 className="text-3xl font-black italic tracking-tighter leading-none mb-1">Explore Map</h2>
                        <p className="text-white/70 text-xs font-bold uppercase tracking-widest leading-tight">Locate and book stays visually</p>
                    </div>
                </motion.div>
            </div>

            <section>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-secondary italic tracking-tighter">Nearby Tiers</h3>
                    <Link to="/hotels" className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">View All</Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {hotels.slice(0, 5).map((hotel) => (
                            <motion.div
                                key={hotel.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate(`/mobile/hotels/${hotel.id}`)}
                                className="bg-white rounded-3xl overflow-hidden shadow-aura-sm border border-gray-100 group"
                            >
                                <div className="h-48 relative">
                                    <img
                                        src={getImageUrl(hotel.image_url)}
                                        alt={hotel.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4">
                                        {hotel.is_verified == 1 && (
                                            <div className="bg-indigo-600 text-white px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg backdrop-blur-md bg-indigo-600/90">
                                                <Shield size={10} fill="currentColor" /> Verified
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-[10px] font-black">{hotel.rating || '4.8'}</span>
                                    </div>
                                </div>
                                <div className="p-5 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-black text-secondary truncate w-40 leading-none">{hotel.name}</h4>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                                            <MapPin size={10} className="text-primary" /> {hotel.city || 'Dhaka'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-black text-secondary italic">৳{hotel.price_per_hour}</div>
                                        <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">per hour</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default MobileHome;
