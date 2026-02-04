import React, { useState, useEffect } from 'react';
import { MapPin, Star, Filter, SlidersHorizontal, ChevronDown, Loader, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hotels = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await fetch('/api/hotels.php');
                const data = await response.json();
                if (data.success) {
                    setHotels(data.data);
                } else {
                    setError('Failed to load hotels');
                }
            } catch (err) {
                setError('Network error. Could not fetch hotels.');
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
    }, []);

    const filteredHotels = activeFilter === 'All'
        ? hotels
        : hotels.filter(p => p.hotel_type === activeFilter);

    const getImageUrl = (url) => {
        if (!url || url === 'assets/default_property.jpg') return '/assets/default_hotel.png';
        if (typeof url === 'string' && url.startsWith('http')) return url;
        return `/${url}`;
    };

    if (loading) return (
        <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
            <Loader className="animate-spin text-primary" size={40} />
        </div>
    );

    if (error) return (
        <div className="min-h-screen pt-24 pb-20 flex items-center justify-center text-red-600 gap-2">
            <AlertCircle size={24} /> {error}
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-20">
            <div className="container mx-auto px-6">
                {/* Header & Filters */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-secondary mb-2">Available Hotels</h1>
                        <p className="text-gray-500">Find the perfect spot for your hourly stay.</p>
                    </div>

                    <div className="flex gap-2 p-1 overflow-x-auto pb-2 w-full md:w-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
                        {['All', 'Airport Stay', 'Medical Stay', 'Transit Hub', 'Quick Rest', 'Business'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeFilter === filter
                                    ? 'bg-secondary text-white shadow-md'
                                    : 'text-gray-400 hover:text-secondary hover:bg-gray-50'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredHotels.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            No hotels found matching your criteria.
                        </div>
                    ) : (
                        filteredHotels.map((hotel, idx) => (
                            <motion.div
                                key={hotel.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-gray-100 flex flex-col h-full"
                            >
                                <Link to={`/hotels/${hotel.id}`} className="flex flex-col h-full">
                                    <div className="relative h-60 overflow-hidden">
                                        <img
                                            src={getImageUrl(hotel.image_url)}
                                            alt={hotel.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                console.error(`Failed to load image for ${hotel.name}:`, hotel.image_url);
                                                e.target.src = '/assets/default_hotel.png';
                                            }}
                                        />
                                        {hotel.rating && (
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-sm font-bold text-secondary flex items-center gap-1">
                                                <Star className="fill-yellow-400 text-yellow-400 w-3 h-3" /> {hotel.rating}
                                            </div>
                                        )}
                                        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/20">
                                            {hotel.hotel_type}
                                        </div>
                                    </div>

                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-secondary group-hover:text-primary transition-colors">{hotel.name}</h3>
                                            {hotel.price_per_hour && (
                                                <div className="text-right">
                                                    <span className="text-secondary font-black text-2xl italic">৳{hotel.price_per_hour}</span>
                                                    <span className="text-[10px] text-gray-400 block font-black uppercase tracking-widest mt-0.5">/hour</span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-gray-500 mb-4 flex items-center gap-2 text-sm line-clamp-1">
                                            <MapPin size={14} className="text-gray-400" /> {hotel.address}
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Available Now
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Hotels;
