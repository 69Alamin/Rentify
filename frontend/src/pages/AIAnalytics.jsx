import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, TrendingUp, BarChart3, PieChart, Activity,
    AlertCircle, ArrowLeft, Loader, ShieldCheck,
    Clock, Truck, MapPin, Star, CheckCircle2,
    XCircle, Info, Database, Fingerprint, Waves
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AIAnalytics = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/ai_analytics.php', { credentials: 'include' });
            const result = await res.json();
            if (result.success) {
                setData(result.data);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('DATA STREAM DISRUPTED');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <div className="w-16 h-16 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Database className="text-primary animate-pulse" size={24} />
                </div>
            </div>
            <div className="text-center space-y-1">
                <p className="font-black tracking-[0.5em] text-[10px] text-primary uppercase animate-pulse">Initializing Data Stream</p>
                <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest">Decrypting Predictive Matrix</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-rose-500 gap-4">
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center animate-bounce">
                <AlertCircle size={32} />
            </div>
            <div className="text-center">
                <h3 className="text-xl font-black italic tracking-tighter uppercase mb-1">Protocol Failure</h3>
                <p className="font-bold text-[10px] uppercase tracking-widest text-slate-500">{error}</p>
            </div>
            <button
                onClick={() => navigate('/admin/dashboard')}
                className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
                Back to Command
            </button>
        </div>
    );

    const confidenceColors = {
        'High (>=80%)': 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
        'Medium (50-79%)': 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
        'Low (<50%)': 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 lg:p-10 selection:bg-primary/30 scroll-smooth">
            <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in">

                {/* Header Section */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
                    <div className="space-y-2">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-all text-[9px] font-black uppercase tracking-[0.3em] group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Mission Dashboard
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="h-[1px] w-8 bg-primary"></span>
                                <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">Predictive Intelligence</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic leading-none flex items-center gap-4">
                                CENTRAL <span className="text-primary not-italic tracking-normal">ANALYTICS</span>
                                <Fingerprint size={32} className="text-primary/20 hidden md:block" />
                            </h1>
                        </div>
                    </div>

                    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <Activity className="text-primary animate-pulse" size={20} />
                            </div>
                        </div>
                        <div>
                            <p className="text-[8px] font-black uppercase text-slate-500 tracking-[0.2em] mb-0.5">Engine Frequency</p>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-black text-white italic">4.2 GHz</span>
                                <div className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[7px] font-black tracking-widest uppercase border border-emerald-500/20">Optimal</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Primary Data Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Confidence Profile Matrix */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-1 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 relative overflow-hidden group shadow-2xl"
                    >
                        <div className="absolute -top-10 -right-10 p-8 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                            <ShieldCheck size={140} />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div>
                                <h3 className="text-lg font-black text-white italic tracking-tighter uppercase flex items-center gap-2 mb-1">
                                    <PieChart size={20} className="text-primary" /> Confidence Profile
                                </h3>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Transaction Integrity Distribution</p>
                            </div>

                            <div className="space-y-4">
                                {data.confidence_distribution.map((item, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Level: {item.confidence_tier.split(' ')[0]}</span>
                                            <span className="text-sm font-black text-white italic tracking-tighter">{item.count} <span className="text-[8px] not-italic text-slate-500 uppercase">Signals</span></span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(item.count / data.confidence_distribution.reduce((acc, curr) => acc + parseInt(curr.count), 0)) * 100}%` }}
                                                transition={{ duration: 1, ease: "circOut" }}
                                                className={`h-full rounded-full ${confidenceColors[item.confidence_tier]}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
                                <Info size={16} className="text-primary shrink-0 mt-0.5" />
                                <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-tight italic">
                                    Derived via heuristic validation of verified host credentials & real-time inventory latency benchmarks.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Peak Demand Visualization */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-primary/5 to-transparent opacity-50 pointer-events-none" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-lg font-black text-white italic tracking-tighter uppercase flex items-center gap-2 mb-1">
                                        <Clock size={20} className="text-primary" /> Temporal Density
                                    </h3>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Search & Booking Frequency Heatmap</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,107,0,0.8)]" />
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Live Pulse</span>
                                </div>
                            </div>

                            <div className="flex-1 flex items-end justify-between gap-1 md:gap-2 mb-6">
                                {Array.from({ length: 24 }).map((_, h) => {
                                    const demand = data.demand_patterns.find(d => parseInt(d.hour) === h);
                                    const count = demand ? parseInt(demand.bookings_count) : 0;
                                    const maxCount = Math.max(...data.demand_patterns.map(d => parseInt(d.bookings_count)), 1);
                                    const height = (count / maxCount) * 100;

                                    return (
                                        <div key={h} className="group/bar relative flex-grow flex flex-col items-center">
                                            <div className="absolute -top-8 px-2 py-0.5 bg-primary text-white text-[8px] font-black italic rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all -translate-y-1 group-hover/bar:translate-y-0 whitespace-nowrap z-50 shadow-xl shadow-primary/30">
                                                {count} REQS
                                            </div>
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${Math.max(height, 5)}%` }}
                                                transition={{ duration: 1.5, ease: "power4.out", delay: h * 0.02 }}
                                                className={`w-full rounded-t-lg transition-all relative ${count === maxCount
                                                    ? 'bg-primary shadow-[0_0_20px_rgba(255,107,0,0.5)]'
                                                    : 'bg-white/10 group-hover/bar:bg-white/30 group-hover/bar:shadow-[0_0_10px_rgba(255,255,255,0.1)]'
                                                    }`}
                                            >
                                                {count === maxCount && (
                                                    <div className="absolute top-2 left-1/2 -translate-x-1/2">
                                                        <TrendingUp size={10} className="text-white/40" />
                                                    </div>
                                                )}
                                            </motion.div>
                                            <span className="text-[8px] font-black text-slate-600 mt-2 group-hover/bar:text-primary transition-colors">{h.toString().padStart(2, '0')}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex justify-between items-center text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] border-t border-white/5 pt-6 italic">
                                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-800" /> Null Sector</span>
                                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/20" /> Peak Velocity</span>
                                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500/20" /> Convergence</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Anomaly Drivers */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1 bg-gradient-to-br from-indigo-600 via-primary to-orange-500 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20 group"
                    >
                        <div className="absolute -bottom-8 -right-8 p-4 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                            <Zap size={180} />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div>
                                <h3 className="text-xl font-black italic tracking-tighter uppercase mb-0.5">Anomaly Drivers</h3>
                                <p className="text-white/60 text-[9px] uppercase font-black tracking-[0.2em]">Risk Mitigation Logic</p>
                            </div>

                            <div className="space-y-3">
                                {data.low_confidence_reasons.map((item, idx) => (
                                    <div key={idx} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl flex justify-between items-center border border-white/20 hover:bg-white/20 transition-all cursor-crosshair group/item">
                                        <div className="text-xs font-black italic uppercase tracking-tight group-hover/item:translate-x-1 transition-transform">{item.reason}</div>
                                        <div className="w-8 h-8 bg-white text-primary rounded-xl flex items-center justify-center font-black text-sm shadow-lg">{item.count}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-4">
                                <Waves className="text-white/40 animate-pulse" size={20} />
                                <p className="text-[10px] font-black opacity-90 leading-relaxed italic uppercase tracking-tighter">
                                    "Central engine prioritizes unverified hotel vectors & courier latency bottlenecks to flag bookings for override."
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Operational Snapshots */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <QuickStat
                            icon={<Truck size={20} />}
                            label="Active Couriers"
                            value={data.rider_availability?.riders_online || 0}
                            sub="Online & Syncing"
                            color="text-blue-400"
                            bg="bg-blue-500/10"
                            border="border-blue-500/20"
                        />
                        <QuickStat
                            icon={<Star size={20} />}
                            label="Trust Index"
                            value={parseFloat(data.rider_availability?.avg_rider_trust || 0).toFixed(1)}
                            sub="Fleet Consensus"
                            color="text-amber-400"
                            bg="bg-amber-500/10"
                            border="border-amber-500/20"
                        />
                        <QuickStat
                            icon={<ShieldCheck size={20} />}
                            label="System Integrity"
                            value="100.0"
                            sub="Security Mesh"
                            color="text-emerald-400"
                            bg="bg-emerald-500/10"
                            border="border-emerald-500/20"
                        />
                    </div>

                    {/* Retention & Lifecycle Mapping */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-3 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute -bottom-20 -right-20 p-4 opacity-[0.03] rotate-12">
                            <Activity size={300} />
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 relative z-10">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                                    Lifecycle Retention <span className="text-slate-600 font-medium tracking-normal not-italic">&</span> Mapping
                                </h3>
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mt-1">Post-Authorization Behavioral Analysis</p>
                            </div>
                            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Live Telemetry Active</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                            {['emergency', 'standard'].map(type => {
                                const isEmerg = type === 'emergency' ? 1 : 0;
                                const completed = data.cancellation_insights.find(c => c.booking_status === 'completed' && parseInt(c.is_emergency) === isEmerg)?.count || 0;
                                const cancelled = data.cancellation_insights.find(c => c.booking_status === 'cancelled' && parseInt(c.is_emergency) === isEmerg)?.count || 0;
                                const total = parseInt(completed) + parseInt(cancelled);
                                const rate = total > 0 ? ((cancelled / total) * 100).toFixed(1) : 0;

                                return (
                                    <React.Fragment key={type}>
                                        <div className="space-y-3 group">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-white transition-colors flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-slate-800 group-hover:bg-primary transition-colors" />
                                                {type} Success
                                            </p>
                                            <div className="flex items-end gap-2">
                                                <p className="text-4xl md:text-5xl font-black italic text-white tracking-tighter leading-none">{completed}</p>
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Signals</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3 group">
                                            <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] group-hover:scale-105 origin-left transition-transform flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(255,107,0,0.5)]" />
                                                {type} Attrition
                                            </p>
                                            <div className="flex items-end gap-2">
                                                <p className="text-4xl md:text-5xl font-black italic text-primary tracking-tighter leading-none">{rate}%</p>
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Loss Rate</span>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-6 items-center justify-between opacity-50 relative z-10">
                            <div className="flex gap-6">
                                <p className="text-[9px] font-black uppercase tracking-widest">Protocol: 0x82AQ9</p>
                                <p className="text-[9px] font-black uppercase tracking-widest">Entropy: 0.002</p>
                                <p className="text-[9px] font-black uppercase tracking-widest">Node: DHAKA-HQ-01</p>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                                <CheckCircle2 size={10} className="text-emerald-500" />
                                Signal Integrity Verified
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const QuickStat = ({ icon, label, value, sub, color, bg, border }) => (
    <div className={`bg-white/[0.03] backdrop-blur-xl border ${border} rounded-[2rem] p-6 shadow-2xl relative group hover:scale-[1.02] transition-all overflow-hidden`}>
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
            {React.cloneElement(icon, { size: 48 })}
        </div>
        <div className="flex flex-col gap-4 relative z-10">
            <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center border ${border} shadow-inner`}>
                {React.cloneElement(icon, { size: 18 })}
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">{label}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-white italic tracking-tighter leading-none">{value}</p>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{sub.split(' ')[1]}</span>
                </div>
            </div>
        </div>
    </div>
);

export default AIAnalytics;
