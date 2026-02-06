import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Truck, Zap, ShieldCheck, X, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../context/ModalContext';

const PendingBookingCard = ({ onSuccess }) => {
    const { showSuccess, showError } = useModal();
    const [pendingBooking, setPendingBooking] = useState(null);
    const [confirmingBooking, setConfirmingBooking] = useState(false);
    const [loading, setLoading] = useState(true);

    const getImageUrl = (url) => {
        if (!url || url === 'assets/default_property.jpg') return '/assets/default_hotel.png';
        if (typeof url === 'string' && url.startsWith('http')) return url;
        const cleanUrl = typeof url === 'string' ? (url.startsWith('/') ? url.substring(1) : url) : '';
        return `/${cleanUrl}`;
    };

    const fetchPendingBooking = async () => {
        try {
            const res = await fetch('/api/bookings/get_pending.php', { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setPendingBooking(data.data);
            } else {
                setPendingBooking(null);
            }
        } catch (err) {
            console.error('Failed to fetch pending booking', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingBooking();
        const interval = setInterval(fetchPendingBooking, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleConfirmPending = async () => {
        if (!pendingBooking) return;
        setConfirmingBooking(true);
        try {
            const res = await fetch('/api/bookings/create.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pendingBooking),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                showSuccess('Booking completed successfully!');
                setPendingBooking(null);
                if (onSuccess) onSuccess(data.booking_id);
            } else {
                showError(data.message || 'Failed to complete booking');
            }
        } catch (err) {
            showError('Booking finalization failed');
        } finally {
            setConfirmingBooking(false);
        }
    };

    const handleClearPending = async () => {
        try {
            await fetch('/api/bookings/clear_pending.php', {
                method: 'POST',
                credentials: 'include'
            });
            setPendingBooking(null);
        } catch (err) {
            setPendingBooking(null);
        }
    };

    if (loading || !pendingBooking) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="mb-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] p-6 md:p-8 text-white shadow-2xl relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Zap size={100} />
                </div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-3 py-1 rounded-full backdrop-blur-md mb-3 inline-block">Unfinished Booking Found</span>
                            <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase leading-tight">Finish Your Order</h3>
                        </div>
                        <button
                            onClick={handleClearPending}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-5 md:p-6 border border-white/10 flex flex-col md:flex-row gap-6 items-center mb-6">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg border border-white/10 font-black">
                            <img
                                src={getImageUrl(pendingBooking.details?.image_url)}
                                alt="Hotel"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = '/assets/default_hotel.png'; }}
                            />
                        </div>
                        <div className="flex-grow text-center md:text-left">
                            <h4 className="text-lg md:text-xl font-black leading-tight">{pendingBooking.details?.hotel_name}</h4>
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">{pendingBooking.details?.room_name}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 mt-4">
                                <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold">
                                    <Clock size={12} className="text-indigo-200" /> {pendingBooking.booked_hours} Hours
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold">
                                    <Calendar size={12} className="text-indigo-200" /> {new Date(pendingBooking.check_in_date).toLocaleDateString()}
                                </div>
                                {pendingBooking.vehicle_needed && (
                                    <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold">
                                        <Truck size={12} className="text-indigo-200" /> Transport
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-center md:text-right flex-shrink-0">
                            <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Grand Total</p>
                            <p className="text-3xl md:text-4xl font-black italic">৳{pendingBooking.pricing?.grand_total}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleConfirmPending}
                        disabled={confirmingBooking}
                        className="w-full bg-white text-indigo-600 py-4 md:py-5 rounded-2xl font-black text-[10px] md:text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {confirmingBooking ? <Loader size={20} className="animate-spin" /> : <><ShieldCheck size={20} /> Complete Payment & Confirm</>}
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PendingBookingCard;
