import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Car, MapPin, Loader, AlertCircle, LogIn, UserPlus, X, CheckCircle, Send, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BookingModal = ({ room, hotel, isOpen, isEmergency, onClose, onBookingSuccess }) => {
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

            // Auto-advance if emergency
            if (isEmergency) {
                // Short delay to ensure state updates before locking
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

    const calculateConfidenceScore = () => {
        let score = 30; // Base platform reliability
        if (hotel.is_verified == 1) score += 30;
        if (room.available_count >= 2) score += 40;
        else if (room.available_count === 1) score += 20;

        let label = "Guaranteed";
        let color = "text-green-500";
        if (score < 70) { label = "High Probability"; color = "text-yellow-500"; }
        if (score < 40) { label = "Standard"; color = "text-gray-400"; }

        return { score, label, color };
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

        // Immediately disable the button to prevent duplicate submissions
        if (loading) return; // Already processing
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
                setSuccess('Booking Confirmed! Stay tuned for your host message.');
                setTimeout(() => {
                    onBookingSuccess?.();
                    onClose();
                }, 2000);
            } else if (data.require_login) {
                // Redirect to login if guest booking is cached
                window.location.href = '/login?return=/dashboard';
            } else {
                setError(data.message || 'Booking failed');
                setLoading(false); // Re-enable on error
            }
        } catch (err) {
            setError('Network error');
            setLoading(false); // Re-enable on error
        }
        // Note: Don't set loading to false on success - modal will close
    };

    if (!isOpen || !room || !hotel) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-secondary/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.98, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] border border-gray-100"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Progress Bar */}
                    <div className="flex h-1.5 w-full bg-gray-100">
                        <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: `${(step / 3) * 100}%` }}
                            className="bg-primary h-full"
                        />
                    </div>

                    {/* Header */}
                    <div className={`p-6 border-b border-gray-100 flex justify-between items-start ${isEmergency ? 'bg-red-50/50' : ''}`}>
                        <div>
                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 block ${isEmergency ? 'text-red-500' : 'text-primary'}`}>
                                {isEmergency ? '⚠️ Priority Sanctuary Protocol' : `Step ${step} of 3`}
                            </span>
                            <h2 className="text-2xl font-black text-secondary italic leading-tight uppercase tracking-tighter">
                                {isEmergency ? 'Secure Rapid Sanctuary' : (step === 1 ? 'Schedule Stay' : step === 2 ? 'Stay Configuration' : 'Final Review')}
                            </h2>
                        </div>
                        <button onClick={handleClose} className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-secondary">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-8 overflow-y-auto flex-grow scrollbar-hide">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3">
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}
                        {success && (
                            <div className="space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-8 bg-emerald-50 text-emerald-600 rounded-2xl text-sm font-black italic flex flex-col items-center gap-4 text-center border border-emerald-100 shadow-sm"
                                >
                                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                                        <CheckCircle size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-lg">Stay Secured!</p>
                                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Redirecting to Dashboard...</p>
                                    </div>
                                </motion.div>

                                {!user && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="p-8 bg-secondary rounded-2xl text-white relative overflow-hidden group shadow-xl"
                                    >
                                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
                                            <Zap size={80} />
                                        </div>
                                        <div className="relative z-10">
                                            <h4 className="text-lg font-black italic mb-2 tracking-tight">Upgrade Your Experience</h4>
                                            <p className="text-white/50 text-[10px] font-bold mb-6 leading-relaxed uppercase tracking-widest">Join now for instant check-ins, room service, and verified rewards.</p>
                                            <Link
                                                to="/register"
                                                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-black text-[10px] hover:bg-white hover:text-secondary transition-all shadow-lg shadow-primary/20 uppercase tracking-widest"
                                            >
                                                Sign Up Now <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {step === 1 && (
                                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                                    <div className="grid gap-6">
                                        <div className="relative">
                                            <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Check-in Time</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                                                <input
                                                    type="datetime-local"
                                                    value={formData.checkInDate}
                                                    onChange={e => setFormData({ ...formData, checkInDate: e.target.value })}
                                                    min={minDateTime()}
                                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary transition-all font-bold text-secondary"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Duration (Hours)</label>
                                            <div className="grid grid-cols-5 gap-2">
                                                {[1, 2, 3, 6, 12].map(h => (
                                                    <button
                                                        key={h}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, hours: h })}
                                                        className={`py-3 rounded-xl font-black text-sm transition-all ${formData.hours === h ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                                    >
                                                        {h}H
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {formData.checkInDate && (
                                        <div className="bg-secondary p-5 rounded-2xl text-white flex justify-between items-center shadow-lg">
                                            <div>
                                                <span className="text-[9px] uppercase font-black text-white/40 block mb-1 tracking-widest">Estimated Check-out</span>
                                                <span className="text-sm font-bold">{calculateCheckout()}</span>
                                            </div>
                                            <Clock className="opacity-10" size={24} />
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleLockRoom}
                                        disabled={loading}
                                        className="w-full bg-secondary text-white py-4 rounded-xl font-black shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[11px]"
                                    >
                                        {loading ? <Loader className="animate-spin" size={18} /> : 'Next: Configure Stay'}
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
                                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 outline-none focus:border-primary font-bold text-secondary"
                                            >
                                                {[...Array(room.capacity)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>{i + 1} Person{i > 0 ? 's' : ''}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Transport</label>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, vehicleNeeded: !formData.vehicleNeeded })}
                                                className={`w-full py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${formData.vehicleNeeded ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-gray-100 text-gray-400'}`}
                                            >
                                                <Car size={16} /> {formData.vehicleNeeded ? 'RIDE ADDED' : 'ADD RIDE'}
                                            </button>
                                        </div>
                                    </div>


                                    {formData.vehicleNeeded && (
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={handleUseLocation}
                                                className="px-4 py-2 text-[10px] font-black bg-white border-2 border-gray-100 rounded-full text-secondary hover:border-primary transition-all flex items-center gap-2"
                                            >
                                                <MapPin size={14} className="text-primary" /> USE CURRENT LOCATION
                                            </button>
                                            {formData.pickup_lat && <span className="text-[8px] font-black text-green-500 uppercase">✓ Pin Set</span>}
                                        </div>
                                    )}

                                    <div className="flex gap-4 pt-4">
                                        <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 text-[10px] font-black text-gray-400 uppercase hover:text-secondary transition-colors">Go Back</button>
                                        <button
                                            type="button"
                                            onClick={() => setStep(3)}
                                            className="flex-[2] bg-primary text-white py-4 rounded-[2rem] font-black shadow-xl hover:scale-105 active:scale-95 transition-all text-xs tracking-widest uppercase"
                                        >
                                            Pricing Review
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-8">
                                    <div className="bg-[#f8fafc] rounded-2xl p-6 space-y-4 border border-gray-100">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Base Rate</span>
                                            <span className="font-bold text-secondary text-xs">৳{room.base_price_per_hour} × {formData.hours}H</span>
                                        </div>
                                        {formData.vehicleNeeded && (
                                            <div className="flex justify-between items-center text-orange-600">
                                                <span className="text-[9px] font-black uppercase tracking-widest">Transport Service</span>
                                                <span className="font-bold text-xs">৳150 (fixed)</span>
                                            </div>
                                        )}
                                        <div className="pt-4 border-t border-dashed border-gray-200 flex justify-between items-end">
                                            <div>
                                                <span className="text-[8px] font-black text-primary uppercase tracking-widest block mb-0.5">Grand Total</span>
                                                <span className="text-3xl font-black text-secondary italic">৳{(room.base_price_per_hour * formData.hours + (formData.vehicleNeeded ? 150 : 0)).toLocaleString()}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[8px] font-black text-gray-400 block uppercase tracking-widest">Ending</span>
                                                <span className="text-[10px] font-black text-secondary">{new Date(new Date(formData.checkInDate).getTime() + (formData.hours * 3600000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Confidence Score */}
                                    {(() => {
                                        const { score, label, color } = calculateConfidenceScore();
                                        return (
                                            <div className="bg-white border-2 border-gray-50 rounded-[2rem] p-6 flex items-center gap-6">
                                                <div className="relative w-16 h-16 flex-shrink-0">
                                                    <svg className="w-full h-full" viewBox="0 0 36 36">
                                                        <path className="text-gray-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                                        <path className={color.replace('text', 'stroke')} strokeDasharray={`${score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                                        <text x="18" y="20.35" className="text-[8px] font-black" fill="currentColor" textAnchor="middle">{score}%</text>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <ShieldCheck className={color} size={14} />
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{label} Match</span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                                                        {hotel.is_verified ? "✓ Verified Hotel" : "• Standard Listing"} ·
                                                        {room.available_count >= 2 ? " ✓ High Availability" : " • Limited Stock"}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <div className="flex gap-4">
                                        <button type="button" onClick={() => setStep(2)} className="flex-1 py-4 text-[10px] font-black text-gray-400 uppercase hover:text-secondary transition-colors">Edit</button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-[2] bg-primary text-white py-4 rounded-xl font-black shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-[10px]"
                                        >
                                            {loading ? (
                                                <Loader className="animate-spin" size={18} />
                                            ) : user ? (
                                                <><Send size={16} /> Finalize Booking</>
                                            ) : (
                                                <><LogIn size={16} /> Login & Secure Stay</>
                                            )}
                                        </button>
                                    </div>

                                    <p className="text-[10px] text-center text-gray-400 px-8">By confirming, you agree to our terms of short-stay occupancy. Guest data is securely processed for this booking only.</p>
                                </motion.div>
                            )}
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence >
    );
};

export default BookingModal;
