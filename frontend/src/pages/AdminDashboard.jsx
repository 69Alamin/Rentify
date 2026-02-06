
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building, Calendar, DollarSign, Loader, Check, X, AlertCircle, BarChart3, TrendingUp, Zap } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import AdminSidebar from '../components/admin/AdminSidebar';

// Components
import UserManagement from '../components/admin/UserManagement';
import HotelManagement from '../components/admin/HotelManagement';
import BookingControl from '../components/admin/BookingControl';
import PricingRules from '../components/admin/PricingRules';
import DriverManagement from '../components/admin/DriverManagement';
import RideControl from '../components/admin/RideControl';
import FoodControl from '../components/admin/FoodControl';
import FinanceOverview from '../components/admin/FinanceOverview';
import CMSManager from '../components/admin/CMSManager';
import NotificationCenter from '../components/admin/NotificationCenter';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useModal();
    const [stats, setStats] = useState(null);
    const [pendingHotels, setPendingHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.type !== 'admin') {
            navigate('/');
            return;
        }
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, propsRes] = await Promise.all([
                fetch('/api/admin/stats.php', { credentials: 'include' }),
                fetch('/api/admin/verify_property.php', { credentials: 'include' })
            ]);

            const [statsData, propsData] = await Promise.all([
                statsRes.json(), propsRes.json()
            ]);

            if (statsData.success) setStats(statsData.data);
            if (propsData.success) setPendingHotels(propsData.data);
        } catch (err) {
            console.error('Error loading admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id, action) => {
        try {
            const res = await fetch('/api/admin/verify_property.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hotel_id: id, action }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                showSuccess(data.message);
                fetchData();
            }
        } catch (err) {
            showError('Error updating property');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617]">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="text-primary animate-pulse" size={20} />
                </div>
            </div>
            <p className="mt-4 text-xs font-black text-primary uppercase tracking-[0.3em] animate-pulse">Initializing Control</p>
        </div>
    );

    return (
        <div className="flex bg-[#020617] min-h-screen font-sans text-slate-200 overflow-hidden selection:bg-primary/30">
            {/* Sidebar */}
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content */}
            <div className="flex-1 ml-64 overflow-y-auto h-screen scroll-smooth custom-scrollbar">
                <div className="p-8 md:p-12 lg:p-16 max-w-[1600px] mx-auto space-y-12">

                    {/* Header Area - Mission Control Style */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-fade-in">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="h-[1px] w-8 bg-primary"></span>
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Operational Authority</span>
                            </div>
                            <h1 className="text-5xl font-black text-white tracking-tighter italic leading-none">
                                MISSION <span className="text-primary not-italic tracking-normal">CONTROL</span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">System Pulse</span>
                                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 shadow-2xl">
                                    <div className="relative w-2.5 h-2.5">
                                        <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
                                        <div className="relative rounded-full bg-emerald-500 w-2.5 h-2.5 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    </div>
                                    <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em]">Live Status</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Content based on Tab */}
                    {activeTab === 'overview' ? (
                        <div className="space-y-12 animate-fade-in">
                            {/* Stats Grid - Premium Glass Cards */}
                            {stats && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    <StatCard icon={<Users className="text-blue-400" />} label="Total Assets" value={stats.total_users} subLabel="Active Users" trend="+12.5%" />
                                    <StatCard icon={<Building className="text-indigo-400" />} label="Safe Havens" value={stats.total_hotels} subLabel="Verified Stays" trend="+4.2%" />
                                    <StatCard icon={<Calendar className="text-emerald-400" />} label="Total Cycles" value={stats.total_bookings} subLabel="Confirmed Bookings" trend="+8.9%" />
                                    <StatCard icon={<DollarSign className="text-violet-400" />} label="Net Capital" value={`৳${stats.total_revenue.toLocaleString()}`} subLabel="Revenue Stream" trend="+15.3%" />
                                </div>
                            )}

                            {/* Two Column Layout for Insights & Verifications */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* AI Insights - Central Intelligence */}
                                <div className="lg:col-span-2 relative group overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                    <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl h-full flex flex-col justify-center">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="space-y-4">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                                                    <Zap size={14} className="text-primary" />
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Nural Intelligence active</span>
                                                </div>
                                                <h3 className="text-3xl font-black text-white italic tracking-tighter">Predictive Analytics Engine</h3>
                                                <p className="text-slate-400 font-medium leading-relaxed max-w-xl">
                                                    Deploying real-time heuristic modeling to forecast booking surges and optimize tiered pricing protocols across all verified stay vectors.
                                                </p>
                                            </div>
                                            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center border border-white/5 animate-pulse">
                                                <BarChart3 size={40} className="text-primary/40" />
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => navigate('/admin/analytics')}
                                                className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-3"
                                            >
                                                Initialize Data Node <TrendingUp size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Health Meter */}
                                <div className="bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="relative w-32 h-32 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364.4" strokeDashoffset="36.4" className="text-primary shadow-[0_0_15px_rgba(255,107,0,0.5)]" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-black text-white italic leading-none">92%</span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Efficiency</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-white uppercase text-xs tracking-[0.2em]">Operational Load</h4>
                                        <p className="text-[10px] font-medium text-slate-500 max-w-[150px]">System resources performing within expected optimal parameters.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Pending Verifications Widget - List Theme */}
                            <div className="bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
                                <div className="p-10 border-b border-white/5 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-2xl font-black text-white italic tracking-tighter">Verification Queue</h3>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Assets awaiting authorization</p>
                                    </div>
                                    <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></div>
                                        {pendingHotels.length} Items Pending
                                    </div>
                                </div>
                                {pendingHotels.length === 0 ? (
                                    <div className="p-20 text-center space-y-4">
                                        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] flex items-center justify-center mx-auto text-emerald-500 animate-float">
                                            <Check size={36} />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Queue Clear</h4>
                                            <p className="text-slate-500 text-sm font-medium">No external stay vectors awaiting validation protocols.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {pendingHotels.map(p => (
                                                <div key={p.id} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all flex items-center justify-between group">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 bg-dark border border-white/10 rounded-2xl flex items-center justify-center text-primary font-black text-xl group-hover:scale-110 transition-transform">
                                                            {p.name.charAt(0)}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h4 className="font-black text-white text-base tracking-tight italic">{p.name}</h4>
                                                            <div className="flex items-center gap-2 text-slate-500">
                                                                <AlertCircle size={12} />
                                                                <p className="text-[10px] font-bold uppercase tracking-widest line-clamp-1">{p.address}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => handleVerify(p.id, 'reject')}
                                                            className="p-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl border border-white/5 hover:border-red-400/20 transition-all shadow-xl"
                                                            title="Reject Asset"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleVerify(p.id, 'verify')}
                                                            className="px-6 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-2xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all hover:scale-105"
                                                        >
                                                            Authorize
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Render Active Tab Content wrapped in a premium container
                        <div className="bg-white/[0.03] backdrop-blur-xl rounded-[3rem] border border-white/10 shadow-2xl p-10 min-h-[600px] animate-fade-in custom-scrollbar">
                            {activeTab === 'users' && <UserManagement />}
                            {activeTab === 'hotels' && <HotelManagement />}
                            {activeTab === 'bookings' && <BookingControl />}
                            {activeTab === 'pricing' && <PricingRules />}
                            {activeTab === 'finance' && <FinanceOverview />}
                            {activeTab === 'cms' && <CMSManager />}
                            {activeTab === 'notifs' && <NotificationCenter />}
                            {activeTab === 'drivers' && <DriverManagement />}
                            {activeTab === 'rides' && <RideControl />}
                            {activeTab === 'food' && <FoodControl />}
                            {activeTab === 'verification' && <div className="p-20 text-center space-y-4">
                                <Building size={48} className="text-slate-700 mx-auto" />
                                <h4 className="text-xl font-bold text-white uppercase italic tracking-widest">Protocol Redirect</h4>
                                <p className="text-slate-500 text-sm">Please utilize the Overview Hub for immediate verification actions.</p>
                            </div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, subLabel, trend }) => (
    <div className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl relative group hover:scale-[1.02] transition-all">
        <div className="absolute top-0 right-0 p-4">
            <span className="text-[10px] font-black text-emerald-400 tracking-widest">{trend}</span>
        </div>
        <div className="flex flex-col gap-6">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <div className="space-y-1">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{label}</div>
                <div className="text-3xl font-black text-white italic tracking-tighter">{value}</div>
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{subLabel}</div>
            </div>
        </div>
    </div>
);

export default AdminDashboard;
