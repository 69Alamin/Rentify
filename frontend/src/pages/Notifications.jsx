import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Trash2, Clock, AlertCircle, Info, Zap, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'unread'
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, [filter]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const url = filter === 'unread'
                ? '/api/notifications/get_notifications.php?unread=true'
                : '/api/notifications/get_notifications.php';
            const res = await fetch(url, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setNotifications(data.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch notifications");
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const res = await fetch('/api/notifications/mark_as_read.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notification_id: id }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(prev =>
                    id === 'all'
                        ? prev.map(n => ({ ...n, is_read: 1 }))
                        : prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
                );
            }
        } catch (err) {
            console.error("Failed to mark as read");
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="text-emerald-500" size={24} />;
            case 'error': return <AlertCircle className="text-orange-500" size={24} />;
            case 'warning': return <Zap className="text-violet-500" size={24} />;
            default: return <Info className="text-primary" size={24} />;
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-20">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-400 hover:text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-4 transition-all group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
                        </button>
                        <h1 className="text-5xl font-black text-secondary tracking-tighter italic uppercase">
                            Inbox <span className="text-orange-500">&</span> <span className="text-primary">Alerts</span>
                        </h1>
                        <p className="text-gray-400 font-medium mt-2">Manage your stay updates and system notifications.</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] shadow-aura-md border border-indigo-50">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-secondary text-white shadow-lg' : 'text-gray-400 hover:text-secondary'}`}
                        >
                            History
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all relative ${filter === 'unread' ? 'bg-secondary text-white shadow-lg' : 'text-gray-400 hover:text-secondary'}`}
                        >
                            Unread
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-lg animate-bounce">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Actions Bar */}
                {notifications.length > 0 && (
                    <div className="flex justify-between items-center mb-8 px-4">
                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                            Showing {notifications.length} notifications
                        </div>
                        <button
                            onClick={() => markAsRead('all')}
                            className="flex items-center gap-2 text-primary hover:text-primary-hover font-black text-[10px] uppercase tracking-widest transition-all"
                        >
                            <Trash2 size={14} /> Clear All Unread
                        </button>
                    </div>
                )}

                {/* Notification List */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="bg-white rounded-[3rem] p-20 flex flex-col items-center justify-center shadow-aura-md border border-indigo-50">
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                <Zap className="text-primary opacity-20" size={48} />
                            </motion.div>
                            <p className="text-gray-300 font-black uppercase tracking-[0.3em] mt-8">Syncing Inbox...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[3rem] p-24 text-center shadow-aura-md border border-indigo-50 relative overflow-hidden group"
                        >
                            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-50/50 rounded-full blur-[60px] group-hover:bg-orange-50/50 transition-colors duration-1000" />
                            <div className="w-24 h-24 bg-gray-50 text-gray-200 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-white">
                                <Bell size={40} />
                            </div>
                            <h3 className="text-3xl font-black text-secondary tracking-tighter italic uppercase mb-4">Pure Silence</h3>
                            <p className="text-gray-400 font-medium max-w-sm mx-auto mb-10">You're all caught up! No notifications to display at the moment.</p>
                            <Link to="/hotels" className="inline-flex px-10 py-5 aura-gradient-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-aura-lg shadow-indigo-500/20 hover:scale-105 transition-all">
                                Explore Stays
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                            layout
                            className="bg-white rounded-[3rem] shadow-aura-md border border-indigo-50 overflow-hidden"
                        >
                            <AnimatePresence mode="popLayout">
                                {notifications.map((n, idx) => (
                                    <motion.div
                                        key={n.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`group relative p-8 flex gap-8 items-start border-b border-gray-50 last:border-0 hover:bg-indigo-50/30 transition-all cursor-pointer ${!n.is_read ? 'bg-indigo-50/20' : ''}`}
                                        onClick={() => !n.is_read && markAsRead(n.id)}
                                    >
                                        {!n.is_read && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-violet-500" />
                                        )}

                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-all group-hover:scale-110 ${!n.is_read ? 'bg-white' : 'bg-gray-50'}`}>
                                            {getIcon(n.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-2 gap-4">
                                                <div className="flex flex-col">
                                                    <h4 className={`text-xl font-black tracking-tight italic uppercase truncate ${!n.is_read ? 'text-secondary' : 'text-gray-400'}`}>
                                                        {n.title}
                                                    </h4>
                                                    {n.message.includes('৳') && (
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <span className="px-2 py-0.5 bg-primary/10 text-primary-hover text-[10px] font-black rounded uppercase tracking-widest">
                                                                Cost: {n.message.match(/৳[0-9,.]+/)?.[0] || 'See message'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-300 group-hover:text-primary transition-colors whitespace-nowrap pt-1">
                                                    <Clock size={12} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{formatTime(n.created_at)}</span>
                                                </div>
                                            </div>
                                            <p className={`font-medium leading-relaxed mb-4 ${!n.is_read ? 'text-gray-600' : 'text-gray-400'}`}>
                                                {n.message}
                                            </p>

                                            {!n.is_read && (
                                                <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Mark as read <ChevronRight size={14} />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
