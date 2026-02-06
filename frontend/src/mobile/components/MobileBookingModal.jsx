import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Car, MapPin, Loader, AlertCircle, LogIn, X, CheckCircle, Send, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MobileBookingModal = ({ room, hotel, isOpen, isEmergency, onClose, onBookingSuccess }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        checkInDate: '',
        hours: 1,
        guests: 1,
        vehicleNeeded: false,
        vehicleType: 'motorbike',
        pickup_lat: null,
        pickup_lng: null,
        guest_name: '',
        guest_email: '',
        guest_phone: ''
    });

    const minDateTime = () => {
        const now = new Date();
        const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        return local.toISOString().slice(0, 16);
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me.php', { credentials: 'include' });
                const data = await res.json();
                if (data.authenticated) {
                    setUser(data.user);
                }
            } catch (err) { }
        };
        checkAuth();
    }, []);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setError('');
            setSuccess('');
            setLoading(false);
            setFormData((prev) => ({
                ...prev,
                hours: isEmergency ? 2 : prev.hours,
                checkInDate: isEmergency ? minDateTime() : (prev.checkInDate || minDateTime())
            }));

            if (isEmergency) {
                setTimeout(() => handleLockRoom(), 500);
            }
        }
    }, [isOpen]);

    const calculateCheckout = () => {
        if (!formData.checkInDate) return null;
        const date = new Date(formData.checkInDate);
        date.setHours(date.getHours() + formData.hours);
        return date.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const handleLockRoom = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/bookings/lock_room.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ room_type_id: room.id, action: 'lock' }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setStep(2);
            } else {
                setError(data.message || 'Room is currently unavailable');
            }
        } catch (err) {
            setError('Connection failed');
        } finally {
            setLoading(false);
        }
    };

    const handleReleaseRoom = async () => {
        try {
            await fetch('/api/bookings/lock_room.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ room_type_id: room.id, action: 'release' }),
                credentials: 'include'
            });
        } catch (e) { }
    };

    const handleClose = async () => {
        if (step > 1) await handleReleaseRoom();
        onClose();
    };

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setFormData(prev => ({
                    ...prev,
                    vehicleNeeded: true,
                    pickup_lat: pos.coords.latitude,
                    pickup_lng: pos.coords.longitude
                }));
            },
            () => setError('Location access denied')
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError('');

        const payload = {
            hotel_id: hotel.id,
            room_type_id: room.id,
            check_in_date: formData.checkInDate,
            booked_hours: formData.hours,
            guests: formData.guests,
            vehicle_needed: formData.vehicleNeeded,
            vehicle_type: formData.vehicleType,
            pickup_lat: formData.pickup_lat,
            pickup_lng: formData.pickup_lng,
            guest_name: formData.guest_name,
            guest_email: formData.guest_email,
            guest_phone: formData.guest_phone,
            is_emergency: isEmergency ? 1 : 0
        };

        try {
            const res = await fetch('/api/bookings/create.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setSuccess('Booking Confirmed!');
                setTimeout(() => {
                    onBookingSuccess?.();
                    onClose();
                }, 2000);
            } else if (data.require_login) {
                window.location.href = '/login?return=/';
            } else {
                setError(data.message || 'Booking failed');
                setLoading(false);
            }
        } catch (err) {
            setError('Network error');
            setLoading(false);
        }
    };

    if (!isOpen || !room || !hotel) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center bottom-[safe-area-inset-bottom]"
                style={{ zIndex: 99999 }}
                onClick={handleClose}
            >
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="bg-navy rounded-t-[2rem] sm:rounded-3xl w-full max-w-lg border-t sm:border border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Progress Bar */}
                    <div className="flex h-1 w-full bg-white/5">
                        <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: `${(step / 3) * 100}%` }}
                            className="bg-accent h-full shadow-[0_0_10px_rgba(255,165,0,0.5)]"
                        />
                    </div>

                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex justify-between items-start">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 block text-accent">
                                {isEmergency ? '⚠️ Priority Request' : `Step ${step} of 3`}
                            </span>
                            <h2 className="text-xl font-black text-white italic leading-tight uppercase tracking-tighter">
                                {isEmergency ? 'Emergency Stay' : (step === 1 ? 'Schedule Stay' : step === 2 ? 'Customize' : 'Confirm')}
                            </h2>
                        </div>
                        <button onClick={handleClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-grow scrollbar-hide">
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold border border-red-500/20 flex items-center gap-3">
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-8 flex flex-col items-center text-center space-y-4"
                            >
                                <div className="w-16 h-16 bg-accent text-navy rounded-full flex items-center justify-center shadow-lg shadow-accent/20">
                                    <CheckCircle size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white">Confirmed!</h3>
                                <p className="text-gray-400 text-xs uppercase tracking-widest">Redirecting to Trips...</p>
                            </motion.div>
                        )}

                        {!success && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {step === 1 && (
                                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Check-in Time</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={18} />
                                                <input
                                                    type="datetime-local"
                                                    value={formData.checkInDate}
                                                    onChange={e => setFormData({ ...formData, checkInDate: e.target.value })}
                                                    min={minDateTime()}
                                                    className="w-full bg-navy-light border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-accent text-white font-bold text-sm color-scheme-dark"
                                                    style={{ colorScheme: 'dark' }}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Duration</label>
                                            <div className="grid grid-cols-5 gap-2">
                                                {[1, 2, 3, 6, 12].map(h => (
                                                    <button
                                                        key={h}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, hours: h })}
                                                        className={`py-3 rounded-lg font-black text-xs transition-all ${formData.hours === h ? 'bg-accent text-navy shadow-lg shadow-accent/20' : 'bg-navy-light text-gray-400 border border-white/5'}`}
                                                    >
                                                        {h}H
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {formData.checkInDate && (
                                            <div className="bg-navy-light border border-white/5 p-4 rounded-xl text-white flex justify-between items-center">
                                                <div>
                                                    <span className="text-[9px] uppercase font-black text-gray-400 block mb-1 tracking-widest">Check-out By</span>
                                                    <span className="text-sm font-bold text-white">{calculateCheckout()}</span>
                                                </div>
                                                <Clock className="text-gray-600" size={20} />
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleLockRoom}
                                            disabled={loading}
                                            className="w-full bg-white text-navy py-4 rounded-xl font-black shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs mt-4"
                                        >
                                            {loading ? <Loader className="animate-spin" size={16} /> : 'Continue'}
                                        </button>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Guests</label>
                                                <select
                                                    value={formData.guests}
                                                    onChange={e => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                                                    className="w-full bg-navy-light border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-accent font-bold text-white"
                                                >
                                                    {[...Array(room.capacity)].map((_, i) => (
                                                        <option key={i + 1} value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Add Ride</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, vehicleNeeded: !formData.vehicleNeeded })}
                                                    className={`w-full py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 border ${formData.vehicleNeeded ? 'bg-orange-600 text-white border-orange-600' : 'bg-navy-light text-gray-400 border-white/10'}`}
                                                >
                                                    <Car size={16} /> {formData.vehicleNeeded ? 'ADDED' : 'NO'}
                                                </button>
                                            </div>
                                        </div>

                                        {formData.vehicleNeeded && (
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={handleUseLocation}
                                                    className="w-full px-4 py-3 text-[10px] font-black bg-navy-light border border-white/10 rounded-xl text-white hover:border-accent transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                                                >
                                                    <MapPin size={14} className="text-accent" /> Use My Location
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex gap-4 pt-4">
                                            <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 text-[10px] font-black text-gray-400 uppercase hover:text-white transition-colors">Back</button>
                                            <button
                                                type="button"
                                                onClick={() => setStep(3)}
                                                className="flex-[2] bg-accent text-navy py-4 rounded-xl font-black shadow-lg shadow-accent/20 hover:bg-white transition-all text-xs tracking-widest uppercase"
                                            >
                                                Review
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                                        <div className="bg-navy-light rounded-xl p-5 space-y-3 border border-white/5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Room Charge</span>
                                                <span className="font-bold text-white text-xs">৳{room.base_price_per_hour} × {formData.hours}H</span>
                                            </div>
                                            {formData.vehicleNeeded && (
                                                <div className="flex justify-between items-center text-orange-400">
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Transport</span>
                                                    <span className="font-bold text-xs">৳150</span>
                                                </div>
                                            )}
                                            <div className="pt-3 border-t border-white/10 flex justify-between items-end">
                                                <div>
                                                    <span className="text-[10px] font-black text-accent uppercase tracking-widest block mb-0.5">Total</span>
                                                    <span className="text-2xl font-black text-white italic">৳{(room.base_price_per_hour * formData.hours + (formData.vehicleNeeded ? 150 : 0)).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button type="button" onClick={() => setStep(2)} className="flex-1 py-4 text-[10px] font-black text-gray-400 uppercase hover:text-white transition-colors">Edit</button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-[2] bg-white text-navy py-4 rounded-xl font-black shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-[10px]"
                                            >
                                                {loading ? <Loader className="animate-spin" size={16} /> : (user ? 'Pay & Book' : 'Login & Book')}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </form>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default MobileBookingModal;
