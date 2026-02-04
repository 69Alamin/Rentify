import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const MobileLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans max-w-md mx-auto relative overflow-x-hidden shadow-2xl">
            <main>
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
};

export default MobileLayout;
