import React, { useState, useEffect } from 'react';
import { Loader, Check, X, Truck, User, Clock } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';

const DriverManagement = () => {
    const { showSuccess, showError, showConfirm } = useModal();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/drivers.php', { credentials: 'include' });
            const data = await res.json();
            if (data.success) setDrivers(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const verifyDriver = async (id, status) => {
        const actionLabel = status ? 'AUTHORIZE' : 'REVOKE';
        showConfirm(`Are you sure you want to ${actionLabel} this operator's credentials?`, async () => {
            try {
                const res = await fetch('/api/admin/drivers.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'verify', driver_id: id, is_verified: status ? 1 : 0 }),
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.success) {
                    showSuccess(`Operator credentials ${status ? 'authorized' : 'revoked'}`);
                    fetchDrivers();
                }
            } catch (err) {
                showError('Authorization protocol failure');
            }
        }, `${actionLabel} Credentials`);
    };

    return (
        <div className="space-y-12 animate-fade-in">
            <div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter leading-none flex items-center gap-4 uppercase">
                    <Truck size={32} className="text-primary" />
                    Fleet Control Center
                </h2>
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2">Active Mobility Operator Logistics</div>
            </div>

            <div className="bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="py-8 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Operator Identity</th>
                                <th className="py-8 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Mobility Vector</th>
                                <th className="py-8 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Authorization Status</th>
                                <th className="py-8 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic text-right">Logistics Proxy</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="py-32">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader className="animate-spin text-primary" size={48} />
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Scanning Operator Signals</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : drivers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-32 text-center text-slate-500 font-black text-[10px] uppercase tracking-widest italic opacity-50">No registered mobility operators detected.</td>
                                </tr>
                            ) : (
                                drivers.map((d, i) => (
                                    <motion.tr
                                        key={d.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group hover:bg-white/[0.02] transition-all"
                                    >
                                        <td className="py-8 px-10">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-white/[0.05] border border-white/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-xl group-hover:shadow-primary/20">
                                                    <User size={24} />
                                                </div>
                                                <div>
                                                    <div className="text-lg font-black text-white italic tracking-tighter uppercase leading-none mb-1 group-hover:text-primary transition-colors">{d.full_name}</div>
                                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{d.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-8 px-10">
                                            <div className="text-sm font-black text-white italic tracking-tighter uppercase mb-1">{d.vehicle_model || 'UNASSIGNED'}</div>
                                            <div className="inline-block px-3 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.vehicle_number || 'NO_PLATE_SIGNAL'}</div>
                                        </td>
                                        <td className="py-8 px-10">
                                            <div className="flex flex-col gap-2 items-start">
                                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase border transition-all ${d.is_verified
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                                                    }`}>
                                                    {d.is_verified ? <Check size={10} /> : <Clock size={10} />}
                                                    {d.is_verified ? 'AUTHORIZED' : 'PENDING_VALIDATION'}
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase border ${d.online_status === 'online'
                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                                                    : 'bg-slate-500/10 text-slate-500 border-white/5'
                                                    }`}>
                                                    {d.online_status || 'OFFLINE'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-8 px-10 text-right">
                                            <button
                                                onClick={() => verifyDriver(d.id, !d.is_verified)}
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-xl active:scale-90 border ${d.is_verified
                                                    ? 'text-rose-400 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500 hover:text-white'
                                                    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                                                    }`}
                                                title={d.is_verified ? "Revoke Verification" : "Verify Driver"}
                                            >
                                                {d.is_verified ? <X size={20} /> : <Check size={20} />}
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DriverManagement;
