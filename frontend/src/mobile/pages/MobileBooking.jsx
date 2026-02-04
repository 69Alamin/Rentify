import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, Loader, AlertCircle, ArrowRight, ShieldCheck, Zap, Users, Car, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MobileBooking = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [hotels, setHotels] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
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
        vehicleType: 'car'
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
                if (data.authenticated) setUser(data.user);
            } catch (err) { }
        };
        checkAuth();

        const fetchHotels = async () => {
            try {
                const res = await fetch('/api/hotels.php');
                const data = await res.json();
                if (data.success) setHotels(data.data || []);
            } catch (err) { }
        };
        fetchHotels();

        setFormData(prev => ({ ...prev, checkInDate: minDateTime() }));
    }, []);

    const handleSelectHotel = async (hotel) => {
        setSelectedHotel(hotel);
        setLoading(true);
        try {
            const res = await fetch(`/api/hotels/details.php?id=${hotel.id}`);
            const data = await res.json();
            if (data.success) {
                setSelectedHotel({ ...hotel, rooms: data.data.rooms });
                setStep(2);
            }
        } catch (err) {
            setError('Failed to load hotel details');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmBooking = async () => {
        setLoading(true);
        setError('');

        const payload = {
            hotel_id: selectedHotel.id,
            room_type_id: selectedRoom.id,
            check_in_date: formData.checkInDate,
            booked_hours: formData.hours,
            guests: formData.guests,
            vehicle_needed: formData.vehicleNeeded,
            vehicle_type: formData.vehicleType,
            is_emergency: 0
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
                setSuccess('Booking Secured!');
                setTimeout(() => navigate('/mobile/profile'), 2000);
            } else if (data.require_login) {
                navigate('/mobile/login');
            } else {
                setError(data.message || 'Booking failed');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-10 pt-10 px-6 min-h-screen">
            <header className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-1 bg-primary rounded-full"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Protocol Step {step}</span>
                </div>
                <h1 className="text-3xl font-black text-secondary italic tracking-tighter uppercase leading-none">
                    {step === 1 ? 'Select Tier' : step === 2 ? 'Select Suite' : 'Config Stay'}
                </h1>
            </header>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        {hotels.map(hotel => (
                            <motion.div
                                key={hotel.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelectHotel(hotel)}
                                className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4"
                            >
                                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-gray-100">
                                    <img src={hotel.image_url || '/assets/default_hotel.png'} alt={hotel.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-secondary truncate mb-1">{hotel.name}</h4>
                                    <div className="flex items-center gap-2 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                        <MapPin size={10} className="text-primary" /> {hotel.city}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-secondary italic leading-none truncate pr-2">৳{hotel.price_per_hour}</div>
                                    <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">/hr</div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1">
                            <span className="text-lg">←</span> Change Hotel
                        </button>
                        {selectedHotel?.rooms?.map(room => (
                            <motion.div
                                key={room.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { setSelectedRoom(room); setStep(3); }}
                                className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4"
                            >
                                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-gray-100">
                                    <img src={room.image_url || '/assets/default_hotel.png'} alt={room.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-secondary truncate mb-1">{room.name}</h4>
                                    <div className="flex items-center gap-2 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                        <Users size={10} className="text-primary" /> Caps {room.capacity}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-secondary italic leading-none">৳{room.base_price_per_hour}</div>
                                    <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">/hr</div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <button onClick={() => setStep(2)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1">
                            <span className="text-lg">←</span> Change Suite
                        </button>

                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Check-in Node</label>
                                <input
                                    type="datetime-local"
                                    value={formData.checkInDate}
                                    onChange={e => setFormData({ ...formData, checkInDate: e.target.value })}
                                    min={minDateTime()}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-4 outline-none focus:border-primary font-bold text-secondary text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Hours</label>
                                    <select
                                        value={formData.hours}
                                        onChange={e => setFormData({ ...formData, hours: parseInt(e.target.value) })}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-4 outline-none focus:border-primary font-bold text-secondary text-sm"
                                    >
                                        {[1, 2, 3, 4, 6, 8, 12, 24].map(h => <option key={h} value={h}>{h} Hours</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Guests</label>
                                    <select
                                        value={formData.guests}
                                        onChange={e => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-4 outline-none focus:border-primary font-bold text-secondary text-sm"
                                    >
                                        {[...Array(selectedRoom?.capacity || 1)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1} Pax</option>)}
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={() => setFormData({ ...formData, vehicleNeeded: !formData.vehicleNeeded })}
                                className={`w-full py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${formData.vehicleNeeded ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-100 text-gray-400'}`}
                            >
                                <Car size={16} /> {formData.vehicleNeeded ? 'Transport Active' : 'Add Pickup Component'}
                            </button>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-red-100">
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        <div className="bg-secondary rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
                            <div className="relative z-10">
                                <div className="flex justify-between items-end mb-8">
                                    <div>
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">Total Fee</span>
                                        <div className="text-4xl font-black italic tracking-tighter">৳{(selectedRoom?.base_price_per_hour * formData.hours + (formData.vehicleNeeded ? 150 : 0)).toLocaleString()}</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">Ending</span>
                                        <div className="text-sm font-bold">{new Date(new Date(formData.checkInDate).getTime() + (formData.hours * 3600000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleConfirmBooking}
                                    disabled={loading || success}
                                    className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                                >
                                    {loading ? <Loader className="animate-spin" size={18} /> : success ? <><CheckCircle size={18} /> SECURED</> : <><Zap size={18} /> Secure Protocol</>}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading && !selectedHotel && (
                <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <Loader className="animate-spin text-primary" size={32} />
                </div>
            )}
        </div>
    );
};

export default MobileBooking;
