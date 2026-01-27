import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    TrendingUp,
    BarChart3,
    PieChart,
    Activity,
    AlertCircle,
    ArrowLeft,
    Loader,
    ShieldCheck,
    Clock,
    Truck,
    MapPin,
    Star,
    CheckCircle2,
    XCircle,
    Info
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
            setError('Failed to load analytics engine');
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
        <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-white/50 gap-4">
            <Loader className="animate-spin text-primary" size={40} />
            <p className="font-bold tracking-widest text-[10px] uppercase">Booting Analytics Engine...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-red-500 gap-4">
            <AlertCircle size={40} />
            <p className="font-bold">{error}</p>
            <button onClick={() => navigate('/admin/dashboard')} className="text-white hover:underline">Back to Safety</button>
        </div>
    );

    const confidenceColors = {
        'High (>=80%)': 'bg-green-500',
        'Medium (50-79%)': 'bg-yellow-500',
        'Low (<50%)': 'bg-red-500'
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <button onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-2 text-white/40 hover:text-white mb-2 transition-colors text-[10px] font-bold uppercase tracking-widest">
                            <ArrowLeft size={14} /> Admin Command
                        </button>
                        <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter flex items-center gap-3">
                            AI <span className="text-primary">Analytics</span>
                        </h1>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-xl flex items-center gap-3">
                        <div className="relative">
                            <div className="w-8 h-8 rounded-full border-2 border-primary/20 flex items-center justify-center">
                                <Activity className="text-primary animate-pulse" size={16} />
                            </div>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-0.5">System Status</p>
                            <p className="text-xs font-bold">Operational • Real-time</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Confidence Profile */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-1 bg-white/[0.03] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:bg-white/[0.05] transition-all"
                    >
                        <div className="absolute top-0 right-0 p-5 opacity-5 -rotate-12 transition-transform group-hover:rotate-0 duration-700">
                            <ShieldCheck size={60} />
                        </div>
                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                            <PieChart size={16} className="text-primary" /> Confidence Profile
                        </h3>
                        <div className="space-y-4">
                            {data.confidence_distribution.map((item, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                        <span className="text-white/60">{item.confidence_tier}</span>
                                        <span>{item.count} Bookings</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(item.count / data.confidence_distribution.reduce((acc, curr) => acc + parseInt(curr.count), 0)) * 100}%` }}
                                            className={`h-full ${confidenceColors[item.confidence_tier]} shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-5 p-3 bg-white/5 rounded-xl border border-white/10 flex items-start gap-2">
                            <Info size={14} className="text-primary shrink-0 mt-0.5" />
                            <p className="text-[9px] text-white/40 font-bold leading-relaxed uppercase tracking-tighter">
                                Calculations derived from hotel verification status and real-time room inventory availability.
                            </p>
                        </div>
                    </motion.div>

                    {/* Demand Heatmap */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:bg-white/[0.05] transition-all"
                    >
                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                            <Clock size={16} className="text-primary" /> Hourly Demand Peak
                        </h3>
                        <div className="flex items-end justify-between h-32 gap-1">
                            {Array.from({ length: 24 }).map((_, h) => {
                                const demand = data.demand_patterns.find(d => parseInt(d.hour) === h);
                                const count = demand ? parseInt(demand.bookings_count) : 0;
                                const maxCount = Math.max(...data.demand_patterns.map(d => parseInt(d.bookings_count)), 1);
                                const height = (count / maxCount) * 100;

                                return (
                                    <div key={h} className="group/bar relative flex-grow flex flex-col items-center">
                                        <div className="absolute -top-6 px-1.5 py-0.5 bg-primary text-white text-[8px] font-black rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {count}
                                        </div>
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            className={`w-full rounded-t-sm transition-all ${count === maxCount ? 'bg-primary shadow-[0_0_20px_rgba(255,107,0,0.4)]' : 'bg-white/10 group-hover/bar:bg-white/20'}`}
                                        />
                                        <span className="text-[7px] font-bold text-white/20 mt-1">{h}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 flex justify-between items-center text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">
                            <span>Shift Entry</span>
                            <span>Mid-day Ops</span>
                            <span>Shift Exit</span>
                        </div>
                    </motion.div>

                    {/* Reasons & Logic */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-1 bg-gradient-to-br from-primary to-orange-600 rounded-2xl p-5 text-white relative overflow-hidden shadow-2xl shadow-primary/20"
                    >
                        <div className="absolute top-0 right-0 p-5 opacity-10 -rotate-45">
                            <BarChart3 size={80} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-sm font-bold mb-1 italic">Low Confidence Drivers</h3>
                            <p className="text-white/60 text-[9px] uppercase font-black tracking-widest mb-4">System Optimization Logic</p>

                            <div className="space-y-2">
                                {data.low_confidence_reasons.map((item, idx) => (
                                    <div key={idx} className="bg-black/20 p-2.5 rounded-xl flex justify-between items-center border border-white/10 backdrop-blur-sm">
                                        <div className="text-[10px] font-bold">{item.reason}</div>
                                        <div className="bg-white text-primary px-2 py-0.5 rounded-full text-[9px] font-black">{item.count}</div>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-4 text-[10px] font-bold opacity-80 leading-relaxed italic">
                                "The DBMS engine analyzes unverified hotels and rider latency to flag bookings that require human intervention."
                            </p>
                        </div>
                    </motion.div>

                    {/* Quick Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                    <Truck size={18} />
                                </div>
                                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Real-time</div>
                            </div>
                            <p className="text-2xl font-black italic">{data.rider_availability?.riders_online || 0}</p>
                            <p className="text-[10px] font-bold text-white/40 mt-0.5 uppercase tracking-tighter">Couriers Active</p>
                        </div>

                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                                    <Star size={18} />
                                </div>
                                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Trust Avg</div>
                            </div>
                            <p className="text-2xl font-black italic">{parseFloat(data.rider_availability?.avg_rider_trust || 0).toFixed(1)}</p>
                            <p className="text-[10px] font-bold text-white/40 mt-0.5 uppercase tracking-tighter">Rider Satisfaction</p>
                        </div>

                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                                    <CheckCircle2 size={18} />
                                </div>
                                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Health</div>
                            </div>
                            <p className="text-2xl font-black italic">100%</p>
                            <p className="text-[10px] font-bold text-white/40 mt-0.5 uppercase tracking-tighter">System Integrity</p>
                        </div>
                    </motion.div>

                    {/* Cancellation Metrics */}
                    <div className="lg:col-span-3 bg-white/[0.03] border border-white/10 rounded-3xl p-6 mt-4 h-full relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 p-6 opacity-5">
                            <XCircle size={100} />
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div>
                                <h3 className="text-xl font-black italic tracking-tight">Retention <span className="text-white/40">&</span> Reliability</h3>
                                <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">Post-Booking Flow Analysis</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="px-3 py-1 bg-secondary rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">Historical Data Only</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {['emergency', 'standard'].map(type => {
                                const isEmerg = type === 'emergency' ? 1 : 0;
                                const completed = data.cancellation_insights.find(c => c.booking_status === 'completed' && parseInt(c.is_emergency) === isEmerg)?.count || 0;
                                const cancelled = data.cancellation_insights.find(c => c.booking_status === 'cancelled' && parseInt(c.is_emergency) === isEmerg)?.count || 0;
                                const total = parseInt(completed) + parseInt(cancelled);
                                const rate = total > 0 ? ((cancelled / total) * 100).toFixed(1) : 0;

                                return (
                                    <React.Fragment key={type}>
                                        <div>
                                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{type} Success</p>
                                            <p className="text-2xl font-black">{completed}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">{type} Drop-off Rate</p>
                                            <p className="text-2xl font-black italic text-primary">{rate}%</p>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAnalytics;
