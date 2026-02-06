import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Loader, Check, X } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { motion } from 'framer-motion';

const BookingControl = () => {
    const { showSuccess, showError, showConfirm } = useModal();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/bookings_control.php', { credentials: 'include' });
            const data = await res.json();
            if (data.success) setBookings(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            let url = '/api/admin/bookings_control.php';
            let body = { booking_id: id, action };

            if (action === 'cancel') {
                url = '/api/bookings/cancel.php';
                body = { booking_id: id };

                showConfirm(
                    'Execute full deployment rollback? This will trigger automated refund protocols and release sector occupancy.',
                    async () => {
                        try {
                            const res = await fetch(url, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(body),
                                credentials: 'include'
                            });
                            const data = await res.json();
                            if (data.success) {
                                showSuccess('Operational rollback successful');
                                fetchBookings();
                            } else {
                                showError(data.message);
                            }
                        } catch (err) {
                            showError('Protocol failure');
                        }
                    },
                    'Confirm Operational Termination'
                );
                return;
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                showSuccess(data.message);
                fetchBookings();
            } else {
                showError(data.message);
            }
        } catch (err) {
            showError('Command failed');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter leading-none">DEPLOYMENT LOGS</h2>
                    <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2">Active Extraction & Stay Protocols</div>
                </div>
            </div>

            <div className="bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="py-8 px-8 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">ID / Vector</th>
                                <th className="py-8 px-8 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">Subject & Extraction point</th>
                                <th className="py-8 px-8 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500 text-center">Protocol Window</th>
                                <th className="py-8 px-8 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500 text-center">Status</th>
                                <th className="py-8 px-8 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader className="animate-spin text-primary" size={32} />
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Syncing Mission Data</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center text-slate-500 font-black text-[10px] uppercase tracking-widest italic opacity-50">
                                        No active deployments found in this sector.
                                    </td>
                                </tr>
                            ) : bookings.map(b => (
                                <motion.tr
                                    key={b.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-white/[0.02] group transition-all"
                                >
                                    <td className="py-8 px-8">
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-xs text-slate-600 group-hover:text-primary transition-colors">#{b.id}</span>
                                            {parseInt(b.is_emergency) === 1 && (
                                                <span className="bg-rose-500/10 text-rose-500 text-[8px] px-2 py-0.5 rounded-full border border-rose-500/20 font-black tracking-tighter animate-pulse uppercase">
                                                    CRITICAL SOS
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-8 px-8">
                                        <div className="font-black text-white italic uppercase tracking-tighter leading-none mb-2">{b.hotel_name}</div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{b.user_name}</div>
                                        <div className="text-[9px] font-black text-primary uppercase tracking-tighter opacity-70 italic">{b.room_type} Room {b.room_number}</div>
                                    </td>
                                    <td className="py-8 px-8 text-center">
                                        <div className="inline-flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest">
                                                <Calendar size={12} className="text-primary" /> {new Date(b.check_in_time).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 tracking-tighter uppercase italic opacity-60">
                                                <Clock size={12} /> {new Date(b.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(b.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-8 px-8 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border inline-block ${b.booking_status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            b.booking_status === 'cancelled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            }`}>{b.booking_status}</span>
                                    </td>
                                    <td className="py-8 px-8 text-right">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {b.booking_status === 'pending' && (
                                                <button
                                                    onClick={() => handleAction(b.id, 'approve')}
                                                    className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/20 transition-all shadow-lg"
                                                    title="Approve Deployment"
                                                >
                                                    <Check size={18} />
                                                </button>
                                            )}
                                            {b.booking_status !== 'cancelled' && b.booking_status !== 'completed' && (
                                                <button
                                                    onClick={() => handleAction(b.id, 'cancel')}
                                                    className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center hover:bg-rose-500/20 transition-all shadow-lg"
                                                    title="Operational Rollback"
                                                >
                                                    <X size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BookingControl;
