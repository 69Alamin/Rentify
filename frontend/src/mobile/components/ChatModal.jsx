import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, MessageCircle, Clock } from 'lucide-react';

const ChatModal = ({ isOpen, onClose, otherUserId, otherUserName, contextType = 'general', contextId = 0 }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchMessages = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const res = await fetch(`/api/chat/get.php?other_id=${otherUserId}&context_type=${contextType}&context_id=${contextId}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setMessages(data.data);
            }
        } catch (e) { console.error('Chat fetch error', e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (isOpen && otherUserId) {
            fetchMessages(true);
            const interval = setInterval(() => fetchMessages(false), 3000);
            return () => clearInterval(interval);
        } else if (isOpen && !otherUserId) {
            setLoading(false);
        }
    }, [isOpen, otherUserId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const tmpMsg = newMessage;
        setNewMessage('');

        try {
            const res = await fetch('/api/chat/send.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiver_id: otherUserId,
                    message: tmpMsg,
                    context_type: contextType,
                    context_id: contextId
                }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setMessages(prev => [...prev, data.data]);
            }
        } catch (e) { console.error('Chat send error', e); }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-navy/60 backdrop-blur-md flex items-end justify-center"
                >
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="w-full max-w-md bg-navy-card h-[85vh] rounded-t-[2.5rem] border-t border-white/10 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-navy/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-black">
                                    {otherUserName?.charAt(0) || <User size={20} />}
                                </div>
                                <div>
                                    <h3 className="font-black text-white text-sm">{otherUserName || 'Chat'}</h3>
                                    <p className="text-[9px] text-accent font-bold uppercase tracking-widest">
                                        {contextType === 'ride' ? `Trip #${contextId}` : contextType === 'hotel' ? `Booking #${contextId}` : 'Direct Message'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-white/50 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-2 opacity-20">
                                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Connecting...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-30">
                                    <MessageCircle size={48} />
                                    <div className="text-center">
                                        <p className="font-black text-white">Start the Conversation</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Say something to {otherUserName}</p>
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg, i) => (
                                    <div key={msg.id || i} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.sender_id === user.id
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-none'
                                            }`}>
                                            <p className="text-sm font-medium leading-relaxed">{msg.message}</p>
                                            <p className={`text-[8px] mt-1.5 opacity-40 font-bold uppercase ${msg.sender_id === user.id ? 'text-right' : 'text-left'}`}>
                                                {new Date(msg.created_at || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-6 bg-navy/50 border-t border-white/5">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-4 pr-14 py-4 text-sm font-bold text-white outline-none focus:border-accent transition-all placeholder:text-gray-600"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-accent text-navy rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-accent/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ChatModal;
