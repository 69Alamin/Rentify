
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

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader className="animate-spin text-primary" size={30} /></div>;

    return (
        <div className="flex bg-[#F9FAFB] min-h-screen font-sans text-secondary overflow-hidden">
            {/* Sidebar */}
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content */}
            <div className="flex-1 ml-64 p-8 md:p-10 lg:p-12 overflow-y-auto h-screen scroll-smooth">
                <div className="max-w-7xl mx-auto space-y-10">

                    {/* Header Area */}
                    <div className="flex justify-between items-end">
                        <div className="animate-fade-in">
                            <h1 className="text-3xl font-black text-secondary tracking-tight italic">Mission Control</h1>
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">System Overview & Operations</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm animate-fade-in">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">System Operational</span>
                        </div>
                    </div>

                    {/* Dynamic Content based on Tab */}
                    {activeTab === 'overview' ? (
                        <div className="space-y-8 animate-fade-in">
                            {/* Stats Grid */}
                            {stats && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard icon={<Users className="text-blue-600" />} label="Total Users" value={stats.total_users} color="bg-blue-50" />
                                    <StatCard icon={<Building className="text-indigo-600" />} label="Hotels" value={stats.total_hotels} color="bg-indigo-50" />
                                    <StatCard icon={<Calendar className="text-emerald-600" />} label="Bookings" value={stats.total_bookings} color="bg-emerald-50" />
                                    <StatCard icon={<DollarSign className="text-violet-600" />} label="Revenue" value={`৳${stats.total_revenue.toLocaleString()}`} color="bg-violet-50" />
                                </div>
                            )}

                            {/* AI Insights Promo */}
                            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-aura-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group hover:shadow-aura-md transition-all">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
                                <div className="relative z-10 max-w-2xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary"><Zap size={20} /></div>
                                        <h3 className="text-xl font-black text-secondary italic">AI Intelligence Center</h3>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                        Access deeper insights around booking trends, cancelation predictions, and revenue forecasting using our advanced analytics engine.
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate('/admin/analytics')}
                                    className="relative z-10 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center gap-2 whitespace-nowrap uppercase tracking-wide text-xs"
                                >
                                    <BarChart3 size={18} /> View Analytics
                                </button>
                            </div>

                            {/* Pending Verifications Widget */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-aura-sm overflow-hidden hover:shadow-aura-md transition-all">
                                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                                    <h3 className="font-bold text-secondary">Pending Hotel Approvals</h3>
                                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">{pendingHotels.length} Pending</span>
                                </div>
                                {pendingHotels.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                                            <Check size={32} />
                                        </div>
                                        <h4 className="font-bold text-secondary">All Caught Up!</h4>
                                        <p className="text-gray-400 text-sm mt-1 font-medium">No hotels waiting for verification.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-50">
                                        {pendingHotels.map(p => (
                                            <div key={p.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 font-bold">
                                                        {p.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-secondary text-sm">{p.name}</h4>
                                                        <p className="text-xs text-gray-500 font-medium">{p.address}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleVerify(p.id, 'reject')}
                                                        className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all uppercase tracking-wide"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleVerify(p.id, 'verify')}
                                                        className="px-4 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-all uppercase tracking-wide"
                                                    >
                                                        Approve
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Render Active Tab Content wrapped in a clean container
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-aura-sm p-8 min-h-[600px] animate-fade-in hover:shadow-aura-md transition-all">
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
                            {activeTab === 'verification' && <div className="p-8 text-center text-gray-500 font-medium">Go to Overview for quick verifications.</div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
        <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center shadow-sm`}>{icon}</div>
        <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
            <div className="text-2xl font-black text-gray-900 tracking-tight leading-none">{value}</div>
        </div>
    </div>
);

export default AdminDashboard;
