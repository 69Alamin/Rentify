import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MobileLayout from './components/MobileLayout';
import MobileHome from './pages/MobileHome';
import MobileBooking from './pages/MobileBooking';
import MobileEmergency from './pages/MobileEmergency';
import MobileProfile from './pages/MobileProfile';
import HotelDetails from '../pages/HotelDetails'; // Reuse existing detail page logic but may need mobile tweaks
import MapExplorer from '../pages/MapExplorer';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const MobileApp = () => {
    return (
        <Routes>
            <Route element={<MobileLayout />}>
                <Route index element={<MobileHome />} />
                <Route path="home" element={<MobileHome />} />
                <Route path="booking" element={<MobileBooking />} />
                <Route path="emergency" element={<MobileEmergency />} />
                <Route path="profile" element={<MobileProfile />} />
                <Route path="map" element={<MapExplorer isMobile={true} />} />
                <Route path="hotels/:id" element={<HotelDetails isMobile={true} />} />

                {/* Auth routes */}
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
            </Route>

            {/* 404 for mobile */}
            <Route path="*" element={<div className="h-screen flex items-center justify-center text-xl font-bold text-secondary">404 - Mobile Page Not Found</div>} />
        </Routes>
    );
};

export default MobileApp;
