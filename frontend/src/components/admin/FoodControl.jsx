import React, { useState, useEffect } from 'react';
import { Loader, Utensils, Archive, Trash2, CheckCircle, Clock, ShoppingBag } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';

const FoodControl = () => {
    const { showSuccess, showError, showConfirm } = useModal();
    const [activeTab, setActiveTab] = useState('orders');
    const [items, setItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'menu' ? 'type=menu' : 'type=orders';
            const res = await fetch(`/api/admin/food.php?${endpoint}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                if (activeTab === 'menu') setItems(data.data);
                else setOrders(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (id, status) => {
        try {
            const res = await fetch('/api/admin/food.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update_order_status', order_id: id, status }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) fetchData();
        } catch (err) { showError('Failed'); }
    };

    const toggleItem = async (id, current) => {
        try {
            await fetch('/api/admin/food.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle_item', id, is_available: current ? 0 : 1 }),
                credentials: 'include'
            });
            fetchData();
        } catch (err) { }
    };

    const deleteItem = async (id) => {
        showConfirm('Delete this menu item?', async () => {
            try {
                await fetch(`/api/admin/food.php?id=${id}&type=menu`, { method: 'DELETE', credentials: 'include' });
                fetchData();
            } catch (err) { }
        }, 'Delete Item');
    };

    return (
        <div className="space-y-12 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter leading-none flex items-center gap-4 uppercase">
                        <Utensils size={32} className="text-primary" />
                        Supply Protocols
                    </h2>
                    <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2">Global Nutritional Distribution Matrix</div>
                </div>

                <div className="flex bg-white/[0.03] backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 self-start">
                    {[
                        { id: 'orders', label: 'Incoming Demands', icon: ShoppingBag },
                        { id: 'menu', label: 'Sector Inventory', icon: Archive },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode='wait'>
                {loading ? (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-24 flex flex-col items-center gap-4"
                    >
                        <Loader className="animate-spin text-primary" size={48} />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Syncing Supply Data</span>
                    </motion.div>
                ) : activeTab === 'orders' ? (
                    <motion.div
                        key="orders"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {orders.length === 0 ? (
                            <div className="py-24 text-center text-slate-500 font-black text-[10px] uppercase tracking-widest italic opacity-50">No active demand signatures detected.</div>
                        ) : orders.map((o, idx) => (
                            <motion.div
                                key={o.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 flex flex-col md:flex-row justify-between items-center group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex items-center gap-8 relative z-10 w-full md:w-auto mb-6 md:mb-0">
                                    <div className="flex flex-col items-center">
                                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Impact ID</div>
                                        <div className="text-xl font-black text-white italic tracking-tighter group-hover:text-primary transition-colors">#{o.id}</div>
                                    </div>
                                    <div className="h-10 w-px bg-white/10" />
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-4 py-1 rounded-full text-[8px] font-black tracking-widest uppercase border ${o.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                o.status === 'cooking' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 animate-pulse' :
                                                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }`}>{o.status}</span>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                <Clock size={12} className="text-primary" /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <div className="text-xs font-black text-white uppercase tracking-tighter leading-none italic">
                                            Subject: <span className="text-primary">{o.customer_name}</span> @ {o.hotel_name}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 relative z-10 w-full md:w-auto">
                                    {o.status === 'pending' && (
                                        <button
                                            onClick={() => updateOrderStatus(o.id, 'cooking')}
                                            className="grow md:grow-0 px-8 py-3 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-orange-500/20 transition-all shadow-lg active:scale-95"
                                        >
                                            Initiate Preparation
                                        </button>
                                    )}
                                    {o.status === 'cooking' && (
                                        <button
                                            onClick={() => updateOrderStatus(o.id, 'delivered')}
                                            className="grow md:grow-0 px-8 py-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all shadow-lg active:scale-95"
                                        >
                                            Finalize Logistics
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="menu"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {items.length === 0 ? (
                            <div className="col-span-full py-24 text-center text-slate-500 font-black text-[10px] uppercase tracking-widest italic opacity-50">Sector inventory is currently void.</div>
                        ) : items.map((i, idx) => (
                            <motion.div
                                key={i.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <h4 className="text-xl font-black text-white italic tracking-tighter leading-none group-hover:text-primary transition-colors uppercase">{i.name}</h4>
                                    <div className="text-sm font-black text-primary italic tracking-widest">৳{i.price}</div>
                                </div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 line-clamp-2 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">{i.description}</p>

                                <div className="flex justify-between items-center bg-white/[0.02] -mx-8 -mb-8 px-8 py-6 border-t border-white/5 relative z-10 group-hover:bg-white/[0.04] transition-colors">
                                    <button
                                        onClick={() => toggleItem(i.id, i.is_available)}
                                        className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border transition-all ${i.is_available
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                            }`}
                                    >
                                        {i.is_available ? 'OPERATIONAL' : 'OFFLINE'}
                                    </button>
                                    <button
                                        onClick={() => deleteItem(i.id)}
                                        className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-400 border border-slate-500/20 flex items-center justify-center hover:bg-rose-500/20 hover:text-rose-400 transition-all hover:rotate-90"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FoodControl;
