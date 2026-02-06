import React, { useState, useEffect } from 'react';
import { Loader, TrendingUp, DollarSign, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const FinanceOverview = () => {
    const [stats, setStats] = useState({ today: 0, month: 0, total: 0 });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/finance.php', { credentials: 'include' });
            const data = await res.json();

            if (data.success) {
                setStats(data.stats);
                setTransactions(data.recent_transactions);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12 animate-fade-in">
            <div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter leading-none uppercase">Financial Matrix</h2>
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2">Global Revenue & Transaction Flow</div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: "Gross Volume", value: Math.abs(stats.total_volume || 0), color: "emerald", icon: TrendingUp },
                    { label: "Platform Revenue", value: stats.total_revenue || 0, color: "primary", icon: DollarSign },
                    { label: "Vendor Payouts", value: stats.total_payouts || 0, color: "blue", icon: CreditCard },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 relative group overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color === 'primary' ? 'primary' : stat.color + '-500'}/10 blur-[50px] -mr-16 -mt-16 group-hover:opacity-100 opacity-50 transition-opacity`} />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-8 h-8 rounded-xl bg-${stat.color === 'primary' ? 'primary' : stat.color + '-500'}/20 flex items-center justify-center text-${stat.color === 'primary' ? 'primary' : stat.color + '-400'}`}>
                                    <stat.icon size={16} />
                                </div>
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</div>
                            </div>
                            <div className="text-4xl font-black text-white italic tracking-tighter">৳{stat.value.toLocaleString()}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Transactions List */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <h3 className="font-black text-white text-sm uppercase tracking-widest italic flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Live Transaction Stream
                    </h3>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="py-8 px-8 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">ID / Hash</th>
                                <th className="py-8 px-8 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">Subject</th>
                                <th className="py-8 px-8 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500 text-center">Type</th>
                                <th className="py-8 px-8 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500 text-center">Net Impact</th>
                                <th className="py-8 px-8 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500 text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader className="animate-spin text-primary" size={32} />
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Scanning Financial Grid</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center text-slate-500 font-black text-[10px] uppercase tracking-widest italic opacity-50">
                                        No financial signatures detected.
                                    </td>
                                </tr>
                            ) : transactions.map(t => (
                                <motion.tr
                                    key={t.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-white/[0.02] group transition-all"
                                >
                                    <td className="py-8 px-8">
                                        <span className="font-black text-xs text-slate-600 group-hover:text-primary transition-colors">#{t.id}</span>
                                    </td>
                                    <td className="py-8 px-8">
                                        <div className="text-[11px] font-black text-white uppercase tracking-tighter leading-none mb-1">{t.user_name || 'SYSTEM_GUEST'}</div>
                                        <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest opacity-60">Auth Protocol Secure</div>
                                    </td>
                                    <td className="py-8 px-8 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border inline-block ${t.type === 'payment' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            t.type === 'refund' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                t.type === 'commission' ? 'bg-primary/10 text-primary border-primary/20' :
                                                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                            }`}>{t.type}</span>
                                    </td>
                                    <td className={`py-8 px-8 text-center font-black text-xs tracking-widest italic group-hover:scale-110 transition-transform ${t.amount < 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
                                        {t.amount < 0 ? '▼' : '▲'} ৳{Math.abs(Number(t.amount)).toLocaleString()}
                                    </td>
                                    <td className="py-8 px-8 text-right">
                                        <div className="flex flex-col items-end">
                                            <div className="text-[10px] font-black text-white uppercase tracking-widest">{new Date(t.created_at).toLocaleDateString()}</div>
                                            <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
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

export default FinanceOverview;
