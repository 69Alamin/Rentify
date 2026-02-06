import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bell, CheckCircle, Clock, Info, AlertCircle, Zap, Trash2, ChevronRight, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MobileNotifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'unread'

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

    const markAsRead = async (id, e) => {
        if (e) e.stopPropagation();
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
                // If filtering by unread, remove it from list
                if (filter === 'unread' && id !== 'all') {
                    setNotifications(prev => prev.filter(n => n.id !== id));
                } else if (filter === 'unread' && id === 'all') {
                    setNotifications([]);
                }
            }
        } catch (err) {
            console.error("Failed to mark as read");
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="text-emerald-400" size={20} />;
            case 'error': return <AlertCircle className="text-red-400" size={20} />;
            case 'warning': return <Zap className="text-yellow-400" size={20} />;
            default: return <Info className="text-accent" size={20} />;
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="min-h-screen bg-navy text-white font-sans pb-24">
            {/* Header */}
            <div className="sticky top-0 bg-navy/95 backdrop-blur-xl z-20 pt-safe-top px-4 pb-4 border-b border-navy-border/50">
                <div className="flex items-center gap-4 pt-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold">Notifications</h1>
                    <div className="ml-auto">
                        <button
                            onClick={(e) => markAsRead('all', e)}
                            className="text-xs font-bold text-accent uppercase tracking-wider px-3 py-1.5 bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors"
                        >
                            Read All
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'all'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-navy-light text-gray-400 border border-white/5'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'unread'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-navy-light text-gray-400 border border-white/5'
                            }`}
                    >
                        Unread
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="px-4 py-4 space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader className="animate-spin text-accent mb-4" size={32} />
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Loading...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-navy-light rounded-full flex items-center justify-center mb-4 text-gray-600">
                            <Bell size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-300">No Notifications</h3>
                        <p className="text-gray-500 text-sm mt-1">You're all caught up!</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {notifications.map((n, idx) => (
                            <motion.div
                                key={n.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`relative p-4 rounded-2xl border ${!n.is_read
                                    ? 'bg-navy-card border-accent/20 shadow-[0_0_15px_-3px_rgba(255,165,0,0.1)]'
                                    : 'bg-navy-light border-white/5'
                                    }`}
                                onClick={() => !n.is_read && markAsRead(n.id)}
                            >
                                <div className="flex gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${!n.is_read ? 'bg-accent/10' : 'bg-white/5'
                                        }`}>
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className={`text-sm font-bold ${!n.is_read ? 'text-white' : 'text-gray-400'}`}>
                                                {n.title}
                                            </h4>
                                            <span className="text-[10px] font-medium text-gray-500 whitespace-nowrap pt-1">
                                                {formatTime(n.created_at)}
                                            </span>
                                        </div>
                                        <p className={`text-xs mt-1 leading-relaxed ${!n.is_read ? 'text-gray-300' : 'text-gray-500'}`}>
                                            {n.message}
                                        </p>
                                        {!n.is_read && (
                                            <div className="flex items-center gap-1 mt-2 text-accent text-[10px] font-bold uppercase tracking-wider">
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                <span>New</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default MobileNotifications;
