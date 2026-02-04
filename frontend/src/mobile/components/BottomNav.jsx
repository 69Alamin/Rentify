import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Shield, User } from 'lucide-react';

const BottomNav = () => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe-area-inset-bottom">
            <NavLink
                to="/mobile/home"
                className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-primary' : 'text-gray-400'}`}
            >
                <Home size={22} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
            </NavLink>

            <NavLink
                to="/mobile/booking"
                className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-primary' : 'text-gray-400'}`}
            >
                <Calendar size={22} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Booking</span>
            </NavLink>

            <NavLink
                to="/mobile/emergency"
                className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-red-500' : 'text-gray-400'}`}
            >
                <div className="relative">
                    <Shield size={22} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">SOS</span>
            </NavLink>

            <NavLink
                to="/mobile/profile"
                className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-primary' : 'text-gray-400'}`}
            >
                <User size={22} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;
