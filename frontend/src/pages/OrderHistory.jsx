import React, { useState, useEffect } from 'react';
import { Utensils, Truck, Clock, MapPin, CheckCircle, XCircle, ChevronRight, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrderHistory = () => {
    const [activeTab, setActiveTab] = useState('food');
    const [foodOrders, setFoodOrders] = useState([]);
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [foodRes, rideRes] = await Promise.all([
                fetch('/api/food/order.php', { credentials: 'include' }),
                fetch('/api/rides/request.php', { credentials: 'include' })
            ]);

            const foodData = await foodRes.json();
            const rideData = await rideRes.json();

            if (foodData.success) setFoodOrders(foodData.data);
            if (rideData.success) setRides(rideData.data);
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-700',
            preparing: 'bg-blue-100 text-blue-700',
            ready: 'bg-purple-100 text-purple-700',
            delivered: 'bg-green-100 text-green-700',
            requested: 'bg-yellow-100 text-yellow-700',
            accepted: 'bg-blue-100 text-blue-700',
            started: 'bg-orange-100 text-orange-700',
            completed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center"><Loader className="animate-spin text-primary" size={30} /></div>;

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-secondary mb-2">Service History</h1>
                    <p className="text-gray-500 font-medium">Track your room services and journey requests</p>
                </div>

                <div className="flex gap-4 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit">
                    <button
                        onClick={() => setActiveTab('food')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'food' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Utensils size={18} /> Food Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('rides')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'rides' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Truck size={18} /> Ride Requests
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'food' ? (
                        <motion.div
                            key="food"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            {foodOrders.map(order => (
                                <div key={order.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-secondary text-lg">Order #{order.id}</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-primary font-bold">{order.hotel_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-secondary">৳{order.total_amount}</div>
                                            <div className="text-xs text-gray-400 flex items-center gap-1 justify-end"><Clock size={12} /> {new Date(order.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl mb-4">
                                        <div className="text-xs font-bold text-gray-400 uppercase mb-2">Items Included</div>
                                        <div className="text-sm text-gray-700">
                                            {JSON.parse(order.items_json).map(i => `${i.name} (x${i.quantity})`).join(', ')}
                                        </div>
                                    </div>
                                    {order.status === 'pending' && (
                                        <div className="flex items-center gap-2 text-xs text-orange-600 font-bold bg-orange-50 p-2 rounded-lg">
                                            <Loader size={12} className="animate-spin" /> Preparing your gourmet meal...
                                        </div>
                                    )}
                                </div>
                            ))}
                            {foodOrders.length === 0 && (
                                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <Utensils className="mx-auto text-gray-200 mb-4" size={48} />
                                    <p className="text-gray-400 font-bold">No food orders yet</p>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="rides"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            {rides.map(ride => (
                                <div key={ride.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-secondary text-lg">Journey #{ride.id}</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(ride.status)}`}>
                                                    {ride.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400">{new Date(ride.created_at).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-primary">৳{ride.estimated_fare}</div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{ride.vehicle_type}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 relative mb-6">
                                        <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-gray-100 border-dashed border-l"></div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary relative z-10"><MapPin size={12} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Pickup</p>
                                                <p className="text-sm font-bold text-secondary truncate max-w-[300px]">{ride.pickup_address}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-secondary relative z-10"><ChevronRight size={12} className="rotate-90" /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Destination</p>
                                                <p className="text-sm font-bold text-secondary truncate max-w-[300px]">{ride.destination_address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {ride.driver_name && (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">{ride.driver_name.charAt(0)}</div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Driver Assigned</p>
                                                    <p className="text-sm font-bold text-secondary leading-none">{ride.driver_name}</p>
                                                </div>
                                            </div>
                                            <button className="text-primary font-bold text-xs hover:underline">Contact</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {rides.length === 0 && (
                                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <Truck className="mx-auto text-gray-200 mb-4" size={48} />
                                    <p className="text-gray-400 font-bold">No ride requests yet</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OrderHistory;
