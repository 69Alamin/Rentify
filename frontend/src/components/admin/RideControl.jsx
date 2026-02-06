import React, { useState, useEffect } from 'react';
import { Loader, MapPin, Navigation, X } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';

const RideControl = () => {
    const { showSuccess, showError, showConfirm } = useModal();
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRides();
    }, []);

    const fetchRides = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/rides.php', { credentials: 'include' });
            const data = await res.json();
            if (data.success) setRides(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const cancelRide = async (id) => {
        showConfirm('Execute emergency ride termination? This protocol cannot be undone once sanctioned.', async () => {
            try {
                const res = await fetch('/api/admin/rides.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'cancel', ride_id: id }),
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.success) {
                    showSuccess('Interception protocol successful');
                    fetchRides();
                } else {
                    showError(data.message);
                }
            } catch (err) {
                showError('Protocol breach detected');
            }
        }, 'Confirm Interception');
    };

    return (
        <div className="space-y-12 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter leading-none flex items-center gap-4">
                        <Navigation size={32} className="text-primary animate-pulse" />
                        ACTIVE DEPLOYMENTS
                    </h2>
                    <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2">Surface Vector Monitoring System</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <AnimatePresence mode='popLayout'>
                    {loading ? (
                        <div className="col-span-full py-24 flex flex-col items-center gap-4">
                            <Loader className="animate-spin text-primary" size={48} />
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Syncing Vector Streams</span>
                        </div>
                    ) : rides.length === 0 ? (
                        <div className="col-span-full py-24 text-center">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic opacity-50">No active signatures in sectoral airspace</div>
                        </div>
                    ) : rides.map((r, i) => (
                        <motion.div
                            key={r.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative group overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -mr-16 -mt-16 group-hover:opacity-100 opacity-30 transition-opacity" />

                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${r.status === 'requested' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                    r.status === 'in_progress' ? 'bg-primary/10 text-primary border-primary/20 animate-pulse' :
                                        r.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    }`}>{r.status}</span>
                                <div className="text-[10px] font-black text-slate-600 tracking-widest uppercase italic group-hover:text-primary transition-colors">SIG_#{r.id}</div>
                            </div>

                            <div className="space-y-6 mb-10 relative z-10">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                        <MapPin size={14} className="text-emerald-400" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Extraction Point</div>
                                        <div className="text-[11px] font-black text-white uppercase tracking-tighter leading-tight line-clamp-2 italic">{r.pickup_address}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                                        <MapPin size={14} className="text-rose-400" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Insertion Vector</div>
                                        <div className="text-[11px] font-black text-white uppercase tracking-tighter leading-tight line-clamp-2 italic">{r.destination_address}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center bg-white/[0.02] -mx-8 -mb-8 px-8 py-6 border-t border-white/5 relative z-10 group-hover:bg-white/[0.04] transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-primary/20 flex items-center justify-center font-black text-xs text-primary italic uppercase tracking-tighter overflow-hidden">
                                        {r.driver_name ? r.driver_name.charAt(0) : '?'}
                                    </div>
                                    <div>
                                        <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Assigned Agent</div>
                                        <div className="text-[11px] font-black text-white uppercase tracking-tighter italic">{r.driver_name || 'UNASSIGNED'}</div>
                                    </div>
                                </div>
                                {r.status !== 'cancelled' && r.status !== 'completed' && (
                                    <button
                                        onClick={() => cancelRide(r.id)}
                                        className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center hover:bg-rose-500/20 transition-all shadow-lg hover:rotate-90"
                                        title="Emergency Intercept"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RideControl;
