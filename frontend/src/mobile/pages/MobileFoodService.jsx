import React, { useState, useEffect } from 'react';
import { ShoppingCart, Clock, Loader, AlertCircle, MapPin, CheckCircle, X, ChevronLeft, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MobileFoodService = () => {
    const navigate = useNavigate();
    const [checkInStatus, setCheckInStatus] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showCart, setShowCart] = useState(false);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/bookings/check_in_status.php', { credentials: 'include' });
            const data = await res.json();

            if (data.success && data.is_checked_in) {
                setCheckInStatus(data);
                if (data.services.food_service.available) {
                    fetchMenu(data.booking.hotel_id);
                }
            } else {
                setError(data.message || 'Food service available after check-in');
            }
        } catch (err) {
            setError('Failed to check status: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchMenu = async (hotelId) => {
        try {
            const res = await fetch(`/api/food/menu.php?hotel_id=${hotelId}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setMenuItems(data.data);
            }
        } catch (err) {
            console.error('Error fetching menu:', err);
        }
    };

    const addToCart = (item) => {
        const existing = cart.find(c => c.id === item.id);
        if (existing) {
            setCart(cart.map(c =>
                c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
            ));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
    };

    const removeFromCart = (itemId) => {
        setCart(cart.filter(c => c.id !== itemId));
    };

    const updateQuantity = (itemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
        } else {
            setCart(cart.map(c =>
                c.id === itemId ? { ...c, quantity } : c
            ));
        }
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.quantity), 0).toFixed(2);
    };

    const getImageUrl = (url) => {
        if (!url || url === 'assets/default_property.jpg') return '/assets/food/default_food.svg';
        if (typeof url === 'string' && (url.startsWith('http') || url.startsWith('blob:'))) return url;
        const cleanUrl = typeof url === 'string' ? (url.startsWith('/') ? url.substring(1) : url) : '';
        return `/${cleanUrl}`;
    };

    const placeOrder = async () => {
        if (cart.length === 0) return;
        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/food/order.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    booking_id: checkInStatus.booking.id,
                    items: cart.map(c => ({
                        id: c.id,
                        name: c.name,
                        quantity: c.quantity,
                        price: c.price
                    })),
                    total: parseFloat(calculateTotal())
                }),
                credentials: 'include'
            });

            const data = await res.json();
            if (data.success) {
                setSuccess('Order placed successfully!');
                setCart([]);
                setTimeout(() => {
                    setSuccess('');
                    setShowCart(false);
                }, 3000);
            } else {
                setError(data.message || 'Failed to place order');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-navy flex items-center justify-center">
                <Loader className="animate-spin text-accent" size={32} />
            </div>
        );
    }

    if (!checkInStatus || !checkInStatus.is_checked_in) {
        return (
            <div className="min-h-screen bg-navy text-white p-6 flex flex-col items-center justify-center text-center">
                <AlertCircle className="text-orange-500 mb-4" size={48} />
                <h2 className="text-xl font-bold mb-2">Check-in Required</h2>
                <p className="text-gray-400 text-sm">Please check in to your booking first to order food.</p>
                <button onClick={() => navigate('/history')} className="mt-6 bg-white/10 text-white px-6 py-3 rounded-xl font-bold">Go to Trips</button>
            </div>
        );
    }

    if (!checkInStatus.services.food_service.available) {
        return (
            <div className="min-h-screen bg-navy text-white p-6 flex flex-col items-center justify-center text-center">
                <Clock className="text-blue-500 mb-4" size={48} />
                <h2 className="text-xl font-bold mb-2">Service Hours</h2>
                <p className="text-gray-400 text-sm mb-2">Food service is available from 7:00 AM to 10:00 PM</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{checkInStatus.services.food_service.reason}</p>
                <button onClick={() => navigate(-1)} className="mt-6 bg-white/10 text-white px-6 py-3 rounded-xl font-bold">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-navy text-white pb-24">
            {/* Header */}
            <div className="bg-navy/95 backdrop-blur-xl px-6 pt-12 pb-4 border-b border-white/5 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full text-white">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-white">Room Service</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{checkInStatus.booking.hotel_name}</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCart(true)}
                    className="relative p-2 bg-accent rounded-xl text-navy"
                >
                    <ShoppingCart size={20} />
                    {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border border-navy">{cart.length}</span>
                    )}
                </button>
            </div>

            <div className="p-4 space-y-4">
                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold">{error}</div>}

                {!loading && menuItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <Utensils size={48} className="text-gray-500 mb-4" />
                        <p className="text-gray-400 font-bold">No items available</p>
                    </div>
                )}

                {menuItems.map((item) => (
                    <div key={item.id} className="bg-navy-light rounded-2xl p-4 flex gap-4 border border-white/5">
                        <div className="w-20 h-20 bg-navy rounded-xl overflow-hidden flex-shrink-0">
                            <img src={getImageUrl(item.image_url)} className="w-full h-full object-cover" onError={(e) => e.target.src = '/assets/food/default_food.svg'} />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-white text-sm truncate">{item.name}</h3>
                                <p className="text-xs text-gray-400 line-clamp-2">{item.description}</p>
                            </div>
                            <div className="flex justify-between items-end mt-2">
                                <span className="text-accent font-black">৳{item.price}</span>
                                <button
                                    onClick={() => addToCart(item)}
                                    className="px-3 py-1.5 bg-white/10 text-white rounded-lg text-xs font-bold hover:bg-accent hover:text-navy transition-colors"
                                >
                                    ADD
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Cart Sheet */}
            <AnimatePresence>
                {showCart && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm" onClick={() => setShowCart(false)} />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="fixed bottom-0 left-0 right-0 bg-navy-light rounded-t-3xl z-50 p-6 max-h-[80vh] flex flex-col border-t border-white/10"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-white">Your Order</h2>
                                <button onClick={() => setShowCart(false)}><X className="text-gray-400" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 mb-6">
                                {cart.length === 0 ? <p className="text-center text-gray-500 py-8">Cart is empty</p> : cart.map(item => (
                                    <div key={item.id} className="flex justify-between items-center bg-navy p-3 rounded-xl border border-white/5">
                                        <div>
                                            <p className="font-bold text-white text-sm">{item.name}</p>
                                            <p className="text-xs text-accent">৳{item.price} x {item.quantity}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-white/5 text-white flex items-center justify-center">-</button>
                                            <span className="text-sm font-bold">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-white/5 text-white flex items-center justify-center">+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-white/10 pt-4">
                                <div className="flex justify-between items-end mb-4">
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total</span>
                                    <span className="text-2xl font-black text-accent">৳{calculateTotal()}</span>
                                </div>
                                <button
                                    onClick={placeOrder}
                                    disabled={submitting || cart.length === 0}
                                    className="w-full py-4 bg-accent text-navy rounded-xl font-black uppercase tracking-widest shadow-lg shadow-accent/20"
                                >
                                    {submitting ? <Loader className="animate-spin mx-auto" size={20} /> : 'Place Order'}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Success Overlay */}
            <AnimatePresence>
                {success && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
                        <div className="bg-navy-light/90 backdrop-blur-md p-6 rounded-2xl border border-emerald-500/30 flex flex-col items-center">
                            <CheckCircle className="text-emerald-500 mb-2" size={48} />
                            <p className="text-emerald-500 font-bold">{success}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MobileFoodService;
