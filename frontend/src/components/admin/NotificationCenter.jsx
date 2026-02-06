import React, { useState, useEffect } from 'react';
import { Send, Bell, Loader } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationCenter = () => {
    const { showSuccess, showError, showConfirm } = useModal();
    const [notifications, setNotifications] = useState([]);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetGroup, setTargetGroup] = useState('all');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/notifications.php', { credentials: 'include' });
            const data = await res.json();
            if (data.success) setNotifications(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const sendNotification = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const res = await fetch('/api/admin/notifications.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, message, type: 'info', target_group: targetGroup }),
                credentials: 'include'
            });

            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (parseErr) {
                console.error('Response parsing error:', text);
                showError('Sector communication breach: ' + text.substring(0, 200));
                return;
            }

            if (data.success) {
                showSuccess('Transmission Dispatched!');
                setTitle('');
                setMessage('');
                fetchHistory();
            } else {
                showError('Dispatch error: ' + (data.message || 'Unknown interference'));
            }
        } catch (err) {
            console.error('Network error:', err);
            showError('Network Interference: ' + err.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-12 animate-fade-in">
            <div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter leading-none flex items-center gap-4 uppercase">
                    <Send size={32} className="text-primary animate-pulse" />
                    COMM LINK HUB
                </h2>
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2">Global Broadcast & Signal Deployment</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Sender Form */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-1"
                >
                    <div className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative group overflow-hidden sticky top-8">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -mr-16 -mt-16 opacity-50 transition-opacity" />

                        <h3 className="font-black text-white text-sm uppercase tracking-widest italic mb-8 flex items-center gap-3">
                            <Send size={18} className="text-primary" />
                            Transmission Console
                        </h3>

                        <form onSubmit={sendNotification} className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Signal Header</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white italic placeholder:text-slate-600 focus:border-primary/50 focus:bg-white/[0.05] transition-all outline-none uppercase tracking-tighter"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="SYSTEM ALERT"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Receiver Grid</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black text-white uppercase tracking-widest appearance-none focus:border-primary/50 focus:bg-white/[0.05] transition-all outline-none"
                                        value={targetGroup}
                                        onChange={e => setTargetGroup(e.target.value)}
                                    >
                                        <option value="all" className="bg-slate-900">GLOBAL BLAST (ALL NODES)</option>
                                        <option value="customer" className="bg-slate-900">SECTOR ALPHA (CUSTOMERS)</option>
                                        <option value="vendor" className="bg-slate-900">SECTOR BETA (VENDORS)</option>
                                        <option value="driver" className="bg-slate-900">SECTOR DELTA (DRIVERS)</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Payload Data</label>
                                <textarea
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-xs font-medium text-slate-300 placeholder:text-slate-600 focus:border-primary/50 focus:bg-white/[0.05] transition-all outline-none h-40 resize-none leading-relaxed"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Enter encrypted message packet..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] italic text-xs hover:bg-orange-600 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-3 group active:scale-95"
                            >
                                {sending ? <Loader className="animate-spin" size={18} /> : <Bell size={18} className="group-hover:animate-bounce" />}
                                {sending ? 'Transmitting...' : 'Initiate Broadcast'}
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* History Feed */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-black text-white text-sm uppercase tracking-widest italic flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            Signal Log History
                        </h3>
                    </div>

                    <div className="space-y-6">
                        <AnimatePresence mode='popLayout'>
                            {loading ? (
                                <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 flex flex-col items-center gap-4">
                                    <Loader className="animate-spin text-primary" size={48} />
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Scanning Transmission Frequencies</span>
                                </motion.div>
                            ) : notifications.length === 0 ? (
                                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-white/[0.02] rounded-[2.5rem] border border-white/5">
                                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest italic opacity-50">Log matrix is currently vacant.</p>
                                </motion.div>
                            ) : (
                                notifications.map((n, i) => (
                                    <motion.div
                                        key={n.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 flex gap-8 items-start group hover:bg-white/[0.05] transition-all relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="w-12 h-12 bg-white/[0.05] border border-white/10 rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary transition-all group-hover:text-white">
                                            <Bell size={20} />
                                        </div>

                                        <div className="relative z-10 flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-black text-white text-lg italic tracking-tighter uppercase group-hover:text-primary transition-colors">{n.title}</h4>
                                                <div className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                                    ID: #{n.id}
                                                </div>
                                            </div>
                                            <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6 group-hover:text-white transition-colors">{n.message}</p>
                                            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                                <div className="text-[9px] font-black text-primary uppercase tracking-widest">{new Date(n.created_at).toLocaleString()}</div>
                                                <div className="w-1 h-1 rounded-full bg-slate-700" />
                                                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Global Protocol Encrypted</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationCenter;
