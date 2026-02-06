import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Loader, AlertCircle } from 'lucide-react';
import MobileHotelCard from '../components/MobileHotelCard';

const MobileHotels = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

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
                setError('Could not fetch hotels');
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
    }, []);

    const filteredHotels = hotels.filter(hotel => {
        const matchesFilter = activeFilter === 'All' || hotel.hotel_type === activeFilter;
        const matchesSearch = hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hotel.address.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const filters = ['All', 'Airport Stay', 'Medical Stay', 'Transit Hub', 'Quick Rest', 'Business'];

    if (loading) return (
        <div className="min-h-screen bg-navy flex items-center justify-center">
            <Loader className="animate-spin text-accent" size={32} />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-navy flex items-center justify-center text-red-400 gap-2">
            <AlertCircle size={24} /> {error}
        </div>
    );

    return (
        <div className="bg-navy min-h-screen pb-24 font-sans text-white">
            {/* Header / Search */}
            <div className="sticky top-0 bg-navy/95 backdrop-blur-xl z-20 pt-safe-top px-4 pb-4 border-b border-navy-border/50">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4 mt-2">
                    Find Stays
                </h1>

                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search hotels, areas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-navy-light/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-accent/50 transition-colors"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
                        <Filter size={14} />
                    </button>
                </div>

                {/* Filter Caps */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${activeFilter === filter
                                ? 'bg-accent text-navy border-accent'
                                : 'bg-navy-light text-gray-400 border-white/5 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="px-4 py-6">
                {filteredHotels.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <p>No hotels found.</p>
                        <button onClick={() => { setActiveFilter('All'); setSearchQuery(''); }} className="text-accent text-sm font-bold mt-2">Clear Filters</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {filteredHotels.map((hotel, idx) => (
                            <motion.div
                                key={hotel.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <MobileHotelCard hotel={hotel} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MobileHotels;
