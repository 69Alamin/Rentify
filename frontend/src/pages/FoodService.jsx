import React, { useState, useEffect } from 'react';
import { ShoppingCart, Clock, Loader, AlertCircle, MapPin, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FoodService = () => {
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
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    };

    const getImageUrl = (url) => {
        if (!url || url === 'assets/default_property.jpg') return '/assets/food/default_food.svg';
        if (typeof url === 'string' && (url.startsWith('http') || url.startsWith('blob:'))) return url;
        const cleanUrl = typeof url === 'string' ? (url.startsWith('/') ? url.substring(1) : url) : '';
        return `/${cleanUrl}`;
    };

    const placeOrder = async () => {
        if (cart.length === 0) {
            setError('Cart is empty');
            return;
        }

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
                setSuccess('Order placed successfully! Your food will be delivered soon.');
                setCart([]);
                setTimeout(() => {
                    setSuccess('');
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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-24 flex items-center justify-center">
                <Loader className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    if (!checkInStatus || !checkInStatus.is_checked_in) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-24 px-4">
                <div className="max-w-md mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg p-8 shadow-lg text-center"
                    >
                        <AlertCircle className="mx-auto mb-4 text-amber-500" size={48} />
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">Food Service</h2>
                        <p className="text-gray-600 mb-4">Food service is available only after check-in.</p>
                        <p className="text-sm text-gray-500">Please check in to your booking first.</p>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (!checkInStatus.services.food_service.available) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-24 px-4">
                <div className="max-w-md mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg p-8 shadow-lg text-center"
                    >
                        <Clock className="mx-auto mb-4 text-blue-500" size={48} />
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">Service Hours</h2>
                        <p className="text-gray-600 mb-4">Food service is available from 7:00 AM to 10:00 PM</p>
                        <p className="text-sm text-gray-500">{checkInStatus.services.food_service.reason}</p>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-24 pb-20">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
                            <ShoppingCart className="text-primary" size={32} />
                            Food Service
                        </h1>
                        <button
                            onClick={() => setShowCart(!showCart)}
                            className="relative bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
                        >
                            <ShoppingCart size={20} />
                            Cart ({cart.length})
                            {cart.length > 0 && (
                                <span className="ml-1 font-bold">৳{calculateTotal()}</span>
                            )}
                        </button>
                    </div>
                    <p className="text-gray-600 flex items-center gap-2">
                        <MapPin size={18} />
                        {checkInStatus.booking.hotel_name} • Room {checkInStatus.booking.room_type_name}
                    </p>
                </motion.div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 flex items-center gap-3"
                    >
                        <AlertCircle size={20} />
                        {error}
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700 flex items-center gap-3"
                    >
                        <CheckCircle size={20} />
                        {success}
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Menu Items */}
                    <div className="lg:col-span-2">
                        {menuItems.length === 0 ? (
                            <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                                No menu items available
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {menuItems.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
                                    >
                                        {item.image_url && (
                                            <img
                                                src={getImageUrl(item.image_url)}
                                                alt={item.name}
                                                className="w-full h-40 object-cover"
                                                onError={(e) => {
                                                    if (item.image_fallback && e.target.src !== getImageUrl(item.image_fallback)) {
                                                        e.target.src = getImageUrl(item.image_fallback);
                                                    } else {
                                                        e.target.src = '/assets/food/default_food.svg';
                                                    }
                                                }}
                                            />
                                        )}
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-800 mb-1">{item.name}</h3>
                                            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-bold text-primary">৳{item.price}</span>
                                                <button
                                                    onClick={() => addToCart(item)}
                                                    className="bg-primary text-white px-3 py-1 rounded hover:bg-primary/90 transition text-sm font-medium"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cart Sidebar */}
                    <AnimatePresence>
                        {(showCart || window.innerWidth >= 1024) && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white rounded-lg shadow-lg p-6 sticky top-24 max-h-96 overflow-y-auto"
                            >
                                <h2 className="text-xl font-bold mb-4 text-gray-800">Your Cart</h2>

                                {cart.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">Cart is empty</p>
                                ) : (
                                    <>
                                        <div className="space-y-3 mb-4">
                                            {cart.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-800">{item.name}</p>
                                                        <p className="text-sm text-gray-600">৳{item.price} x {item.quantity}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400 transition text-xs"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="w-6 text-center">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400 transition text-xs"
                                                        >
                                                            +
                                                        </button>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="px-2 py-1 bg-red-300 rounded hover:bg-red-400 transition text-xs text-red-700"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t pt-4 mb-4">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-medium text-gray-700">Total:</span>
                                                <span className="font-bold text-lg text-primary">৳{calculateTotal()}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={placeOrder}
                                            disabled={submitting || cart.length === 0}
                                            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader size={18} className="animate-spin" />
                                                    Placing...
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingCart size={18} />
                                                    Place Order
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default FoodService;
