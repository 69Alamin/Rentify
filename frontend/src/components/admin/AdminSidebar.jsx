import React from 'react';
import {
    LayoutDashboard, Users, Building, Calendar,
    Truck, Utensils, CreditCard, FileText,
    Bell, Settings, LogOut, Navigation
} from 'lucide-react';

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
        <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col z-50 animate-fade-in shadow-sm">
            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-primary/20">Q</div>
                <div>
                    <h2 className="font-black italic tracking-tighter text-lg text-secondary">Quickrent</h2>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-black leading-none mt-0.5">Admin Console</p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto pt-2 px-4 space-y-1">
                {menuItems.map((item, idx) => {
                    if (item.type === 'divider') {
                        return <div key={idx} className="h-px bg-gray-50 my-4 mx-2"></div>;
                    }

                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${isActive
                                ? 'bg-primary/5 text-primary font-bold'
                                : 'text-slate-500 hover:bg-gray-50 hover:text-secondary font-medium'
                                }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full"></div>
                            )}
                            <Icon size={18} className={`${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-secondary'} transition-colors`} />
                            <span className="text-xs uppercase tracking-wider">{item.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-50">
                <button
                    onClick={() => window.location.href = '/'}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all text-xs font-bold uppercase tracking-wide group"
                >
                    <LogOut size={18} className="text-slate-400 group-hover:text-red-600 transition-colors" />
                    <span>Exit Console</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
