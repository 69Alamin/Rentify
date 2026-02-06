import React from 'react';
import {
    LayoutDashboard, Users, Building, Calendar,
    Truck, Utensils, CreditCard, FileText,
    Bell, Settings, LogOut, Navigation
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'hotels', label: 'Hotel Operations', icon: Building },
        { id: 'bookings', label: 'Bookings', icon: Calendar },
        { id: 'verification', label: 'Verify Requests', icon: Building }, // Using Building as placeholder
        { type: 'divider' },
        { id: 'drivers', label: 'Driver Fleet', icon: Truck },
        { id: 'rides', label: 'Ride Management', icon: Navigation },
        { id: 'food', label: 'Food Service', icon: Utensils },
        { type: 'divider' },
        { id: 'finance', label: 'Financials', icon: CreditCard },
        { id: 'cms', label: 'Content (CMS)', icon: FileText },
        { id: 'notifs', label: 'Notifications', icon: Bell },
    ];

    return (
        <div className="w-64 bg-[#020617]/80 backdrop-blur-2xl h-screen fixed left-0 top-0 border-r border-white/5 flex flex-col z-50 animate-fade-in shadow-2xl">
            {/* Logo Area */}
            <div className="p-8">
                <Link to="/" className="flex items-center">
                    <Logo isDark={true} showText={true} textColor="text-white" />
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2 custom-scrollbar">
                {menuItems.map((item, idx) => {
                    if (item.type === 'divider') {
                        return <div key={idx} className="h-[1px] bg-white/5 my-6 mx-4"></div>;
                    }

                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl transition-all relative group overflow-hidden ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-slate-500 hover:bg-white/[0.03] hover:text-slate-200'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full shadow-[0_0_10px_rgba(255,107,0,0.8)]"
                                />
                            )}
                            <Icon size={18} className={`${isActive ? 'text-primary' : 'text-slate-600 group-hover:text-slate-300'} transition-colors duration-300`} />
                            <span className={`text-[11px] uppercase tracking-[0.15em] font-black transition-all duration-300 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5">
                <button
                    onClick={() => window.location.href = '/'}
                    className="w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all text-[11px] font-black uppercase tracking-widest group border border-transparent hover:border-rose-500/20"
                >
                    <LogOut size={18} className="text-slate-600 group-hover:text-rose-400 transition-colors" />
                    <span>Terminate Session</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
