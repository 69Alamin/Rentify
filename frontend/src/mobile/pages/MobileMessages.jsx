import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, ChevronRight, Clock, User, Loader, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatModal from '../components/ChatModal.jsx';

const MobileMessages = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [adminContact, setAdminContact] = useState(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 20000); // 20s instead of 10s

        // Fetch Admin Contact
        fetch('/api/chat/get_admin.php')
            .then(res => res.json())
            .then(data => {
                if (data.success) setAdminContact(data.data);
            })
            .catch(err => console.error('Admin fetch error', err));

        return () => clearInterval(interval);
    }, []);

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/chat/list.php', { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setConversations(data.data);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredConversations = conversations.filter(c =>
        (c.other_user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.context_type || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen bg-navy flex flex-col items-center justify-center">
            <Loader className="animate-spin text-accent mb-4" size={32} />
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Accessing Secure Comms...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-navy text-white pb-28 font-sans md:pt-28">
            {/* Header */}
            <div className="bg-navy/95 backdrop-blur-xl px-6 pt-12 pb-6 border-b border-white/5 sticky top-0 md:top-28 z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-white italic tracking-tight">Intelligence</h1>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Direct Secure Terminals</p>
                    </div>
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                        <MessageCircle size={20} />
                    </div>
                </div>

                {/* Search */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search Intel..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-accent transition-all font-bold text-sm"
                    />
                </div>
            </div>

            {/* List */}
            <div className="p-4 space-y-2">
                {/* Admin Contact Button (Restricted to Vendor/Rider/Driver) */}
                {adminContact && ['vendor', 'rider', 'driver'].includes(user.type) && (
                    <button
                        onClick={() => setSelectedConversation({
                            other_user_id: adminContact.id,
                            other_user_name: adminContact.name,
                            context_type: 'general',
                            context_id: 0
                        })}
                        className="w-full bg-gradient-to-r from-accent to-orange-500 rounded-[1.5rem] p-4 flex items-center justify-between shadow-lg shadow-accent/20 mb-4 active:scale-95 transition-transform"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-navy backdrop-blur-sm">
                                <Shield size={24} strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-black text-navy text-sm uppercase tracking-wide">Contact Admin</h3>
                                <p className="text-xs text-navy/70 font-bold">Priority Support Channel</p>
                            </div>
                        </div>
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-navy shadow-sm">
                            <ChevronRight size={20} />
                        </div>
                    </button>
                )}
                {filteredConversations.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                            <MessageCircle size={32} />
                        </div>
                        <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">No Active Intelligence Found</p>
                    </div>
                ) : (
                    filteredConversations.map((conv, idx) => (
                        <motion.button
                            key={`${conv.other_user_id}-${conv.context_type}-${conv.context_id}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedConversation(conv)}
                            className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] p-4 flex items-center gap-4 active:bg-white/10 transition-colors relative"
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-navy-light to-navy border border-white/10 rounded-2xl flex items-center justify-center relative flex-shrink-0">
                                {conv.other_user_avatar ? (
                                    <img src={conv.other_user_avatar} className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                    <User size={24} className="text-gray-500" />
                                )}
                                {conv.unread && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-navy animate-pulse" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-white text-sm truncate">{conv.other_user_name}</h3>
                                    <span className="text-[8px] text-gray-500 flex items-center gap-1 font-black uppercase tracking-tighter">
                                        <Clock size={8} /> {conv.last_message_time ? new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                </div>
                                <p className={`text-xs truncate ${conv.unread ? 'text-white font-bold' : 'text-gray-500'}`}>
                                    {conv.last_message}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/10 text-gray-400 border border-white/5">
                                        {conv.context_type} #{conv.context_id}
                                    </span>
                                </div>
                            </div>

                            <ChevronRight size={16} className="text-gray-700" />
                        </motion.button>
                    ))
                )}
            </div>

            {/* Chat Modal Layer */}
            <ChatModal
                isOpen={!!selectedConversation}
                onClose={() => {
                    setSelectedConversation(null);
                    fetchConversations();
                }}
                otherUserId={selectedConversation?.other_user_id}
                otherUserName={selectedConversation?.other_user_name}
                contextId={selectedConversation?.context_id}
                contextType={selectedConversation?.context_type}
            />
        </div>
    );
};

export default MobileMessages;
