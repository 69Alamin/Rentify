import React, { useState, useEffect } from 'react';
import {
    Building, Power, Trash2, MapPin, Loader, Plus, X,
    Users, DollarSign, Calendar, BedDouble, ChevronRight,
    Star, Phone, Mail, Eye, TrendingUp, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HotelManagement = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [hotelDetails, setHotelDetails] = useState(null);

    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/hotels.php', { credentials: 'include' });
            const data = await res.json();
            if (data.success) setHotels(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchHotelDetails = async (hotelId) => {
        setDetailsLoading(true);
        try {
            const res = await fetch(`/api/admin/hotel_details.php?id=${hotelId}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setHotelDetails(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleHotelClick = (hotel) => {
        setSelectedHotel(hotel);
        fetchHotelDetails(hotel.id);
    };

    const closeDetails = () => {
        setSelectedHotel(null);
        setHotelDetails(null);
    };

    const toggleActive = async (id, currentStatus, e) => {
        e.stopPropagation();
        // Optimistic update
        setHotels(hotels.map(h => h.id === id ? { ...h, is_active: !currentStatus } : h));

        try {
            await fetch('/api/admin/hotels.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle_active', id, is_active: currentStatus ? 0 : 1 }),
                credentials: 'include'
            });
        } catch (err) {
            console.error(err);
            fetchHotels(); // Revert on error
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'occupied': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            case 'maintenance': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            default: return 'bg-white/5 text-slate-400 border-white/10';
        }
    };

    const getBookingStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-primary/10 text-primary border-primary/20';
            case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'completed': return 'bg-white/5 text-slate-400 border-white/10';
            case 'cancelled': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            default: return 'bg-white/5 text-slate-400 border-white/10';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter leading-none">FACILITY OVERWATCH</h2>
                    <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2">Asset Status & Emergency Protocols</div>
                </div>
                <button className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:bg-orange-600 transition-all flex items-center gap-3 active:scale-95 group">
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Add New Asset
                </button>
            </div>

            {loading ? (
                <div className="py-24 flex flex-col items-center gap-4">
                    <Loader className="animate-spin text-primary" size={32} />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Scanning Grid</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {hotels.map(h => (
                        <motion.div
                            key={h.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => handleHotelClick(h)}
                            className={`relative bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2.5rem] border transition-all group cursor-pointer overflow-hidden ${!h.is_active ? 'border-rose-500/30 opacity-60 grayscale-[0.8]' : 'border-white/10 hover:border-primary/30 hover:bg-white/[0.05] shadow-2xl'}`}
                        >
                            {/* Glow Effect */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full group-hover:bg-primary/10 transition-colors"></div>

                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all transform -rotate-3">
                                    🏨
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={(e) => toggleActive(h.id, h.is_active, e)}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${h.is_active ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'}`}
                                        title={h.is_active ? "Kill Signal (Deactivate)" : "Restore Signal"}
                                    >
                                        <Power size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="font-black text-white text-xl italic tracking-tighter mb-2 truncate group-hover:text-primary transition-colors uppercase">{h.name}</h3>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 opacity-70">
                                    <MapPin size={12} className="text-primary" /> {h.address}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 opacity-70">
                                    <Users size={12} className="text-slate-600" /> {h.owner_name || 'NO ASSIGNED AGENT'}
                                </div>

                                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${h.is_verified ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                                        {h.is_verified ? "VERIFIED" : "PENDING"}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] ${h.is_active ? "text-emerald-400" : "text-rose-400"}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${h.is_active ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`}></div>
                                            {h.is_active ? "LIVE" : "OFFLINE"}
                                        </div>
                                        <ChevronRight size={16} className="text-slate-700 group-hover:text-primary transition-all group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Hotel Details Modal - Premium Dossier */}
            <AnimatePresence>
                {selectedHotel && (
                    <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={closeDetails}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0F172A]/90 backdrop-blur-2xl rounded-[3rem] w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl relative border border-white/10"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-12 border-b border-white/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full"></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <h2 className="text-4xl font-black text-white italic tracking-tighter leading-none uppercase mb-4">{selectedHotel.name}</h2>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                                <MapPin size={14} className="text-primary" /> {selectedHotel.address}
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${selectedHotel.is_verified ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                                                {selectedHotel.is_verified ? "SECURE FACILITY" : "UNVERIFIED SECTOR"}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={closeDetails}
                                        className="p-4 hover:bg-white/5 rounded-2xl transition-all text-slate-500 hover:text-white border border-transparent hover:border-white/10"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-12 overflow-y-auto max-h-[calc(90vh-160px)] custom-scrollbar">
                                {detailsLoading ? (
                                    <div className="py-24 flex flex-col items-center gap-4">
                                        <Loader className="animate-spin text-primary" size={40} />
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Retrieving Asset Dossier</span>
                                    </div>
                                ) : hotelDetails ? (
                                    <div className="space-y-12">
                                        {/* Operational Stats Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                                            {[
                                                { icon: Calendar, label: "Deployments", value: hotelDetails.stats.total_bookings, color: "text-blue-400", bg: "bg-blue-500/10" },
                                                { icon: TrendingUp, label: "Live Active", value: hotelDetails.stats.active_bookings, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                                                { icon: DollarSign, label: "Gross Capital", value: `৳${hotelDetails.stats.total_revenue.toLocaleString()}`, color: "text-purple-400", bg: "bg-purple-500/10" },
                                                { icon: Building, label: "Sector Units", value: hotelDetails.stats.total_rooms, color: "text-primary", bg: "bg-primary/10" },
                                                { icon: Eye, label: "Ready", value: hotelDetails.stats.available_rooms, color: "text-teal-400", bg: "bg-teal-500/10" },
                                                { icon: Clock, label: "Occupied", value: hotelDetails.stats.booked_rooms, color: "text-rose-400", bg: "bg-rose-500/10" },
                                            ].map((stat, i) => (
                                                <div key={i} className={`${stat.bg} p-6 rounded-3xl border border-white/5 group hover:border-white/10 transition-all`}>
                                                    <div className={`flex items-center gap-2 ${stat.color} mb-3`}>
                                                        <stat.icon size={16} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{stat.label}</span>
                                                    </div>
                                                    <p className="text-xl font-black text-white italic tracking-tighter">{stat.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Agent Information */}
                                        <div className="bg-white/[0.02] rounded-[3rem] border border-white/5 p-10 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[80px] rounded-full"></div>
                                            <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
                                                <div className="w-24 h-24 bg-gradient-to-br from-primary to-orange-600 rounded-3xl flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-primary/20 transform -rotate-3">
                                                    {hotelDetails.hotel.owner_name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div className="flex-1 space-y-4 text-center md:text-left">
                                                    <div className="flex flex-wrap gap-3 items-center justify-center md:justify-start">
                                                        <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase">{hotelDetails.hotel.owner_name || 'Anonymous Agent'}</h4>
                                                        <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">Authorized Vendor</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                        <div className="flex items-center gap-3"><Mail size={14} className="text-slate-600" /> {hotelDetails.hotel.owner_email || 'ENCRYPTED'}</div>
                                                        <div className="flex items-center gap-3"><Phone size={14} className="text-slate-600" /> {hotelDetails.hotel.owner_phone || 'SIGNAL LOST'}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary hover:bg-primary/10 hover:border-primary/20 transition-all shadow-xl">
                                                        <Mail size={18} />
                                                    </button>
                                                    <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-400/20 transition-all shadow-xl">
                                                        <Phone size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                            {/* Room Sectors */}
                                            <div className="space-y-6">
                                                <h3 className="text-sm font-black text-white italic uppercase tracking-[0.2em] flex items-center gap-3">
                                                    <BedDouble size={18} className="text-primary" /> Sector Config ({hotelDetails.room_types.length})
                                                </h3>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {hotelDetails.room_types.map(rt => (
                                                        <div key={rt.id} className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 hover:border-primary/20 transition-all group/item">
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div>
                                                                    <h4 className="font-black text-white italic uppercase tracking-tight group-hover/item:text-primary transition-colors">{rt.name}</h4>
                                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">CAPACITY: {rt.capacity} SUBJECTS</p>
                                                                </div>
                                                                <span className="text-primary font-black text-lg italic tracking-tighter">৳{rt.base_price_per_hour}<span className="text-[10px] text-slate-500">/HR</span></span>
                                                            </div>
                                                            <div className="flex gap-4">
                                                                <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 tracking-widest uppercase">
                                                                    {rt.available_count} READY
                                                                </span>
                                                                <span className="text-[9px] font-black bg-rose-500/10 text-rose-400 px-3 py-1 rounded-full border border-rose-500/20 tracking-widest uppercase">
                                                                    {rt.room_count - rt.available_count} ACTIVE
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Deployment History */}
                                            <div className="space-y-6">
                                                <h3 className="text-sm font-black text-white italic uppercase tracking-[0.2em] flex items-center gap-3">
                                                    <Calendar size={18} className="text-blue-400" /> Recent Deployments ({hotelDetails.bookings.length})
                                                </h3>
                                                <div className="space-y-4">
                                                    {hotelDetails.bookings.map(booking => (
                                                        <div key={booking.id} className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 hover:border-blue-400/20 transition-all group/item">
                                                            <div className="flex justify-between items-center mb-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-black text-white italic group-hover/item:text-blue-400 transition-colors">
                                                                        {booking.room_number}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-[10px] font-black text-white uppercase tracking-widest">{booking.user_name}</div>
                                                                        <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-0.5">{booking.user_email}</div>
                                                                    </div>
                                                                </div>
                                                                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${getBookingStatusColor(booking.booking_status)}`}>
                                                                    {booking.booking_status}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-end">
                                                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
                                                                    {new Date(booking.check_in_time).toLocaleDateString()} • {new Date(booking.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                                <div className="text-sm font-black text-primary italic">৳{parseFloat(booking.total_price).toLocaleString()}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Technical Metadata */}
                                        <div className="bg-white/[0.03] rounded-[2.5rem] p-8 border border-white/5">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                                {[
                                                    { label: "Commissioned", value: new Date(hotelDetails.hotel.created_at).toLocaleDateString() },
                                                    { label: "Signal Status", value: hotelDetails.hotel.is_active ? 'OPERATIONAL' : 'OFFLINE', color: hotelDetails.hotel.is_active ? 'text-emerald-400' : 'text-rose-400' },
                                                    { label: "Authorization", value: hotelDetails.hotel.is_verified ? 'SECURE' : 'PENDING', color: hotelDetails.hotel.is_verified ? 'text-emerald-400' : 'text-amber-400' },
                                                    { label: "Description", value: hotelDetails.hotel.description || 'N/A' },
                                                ].map((meta, i) => (
                                                    <div key={i}>
                                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">{meta.label}</p>
                                                        <p className={`font-black text-[11px] tracking-widest uppercase ${meta.color || 'text-white'}`}>{meta.value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-24">
                                        <div className="text-rose-500 font-black italic text-2xl uppercase tracking-tighter mb-2">Access Denied</div>
                                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Critical failure retrieving asset data.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HotelManagement;
