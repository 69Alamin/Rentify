import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Hotels from './pages/Hotels';
import HotelDetails from './pages/HotelDetails';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import About from './pages/About';
import MapExplorer from './pages/MapExplorer';
import Login from './pages/Login';
import Register from './pages/Register';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DriverDashboard from './pages/DriverDashboard';
import OrderHistory from './pages/OrderHistory';
import FoodService from './pages/FoodService';
import AIAnalytics from './pages/AIAnalytics';
import AlternativeJourney from './pages/AlternativeJourney';

import Notifications from './pages/Notifications';

import Profile from './pages/Profile';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ModalProvider } from './context/ModalContext';
import ScrollToTop from './components/ScrollToTop';

// Mobile Imports
import MobileApp from './mobile/MobileApp';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ModalProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Mobile UI triggered by /mobile or screen width */}
          <Route path="/mobile/*" element={<MobileApp />} />

          {/* Main App Logic */}
          <Route path="/*" element={
            isMobile ? (
              <Routes>
                <Route path="*" element={<Navigate to="/mobile" replace />} />
              </Routes>
            ) : (
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="hotels" element={<Hotels />} />
                  <Route path="hotels/:id" element={<HotelDetails />} />

                  {/* Public/Shared */}
                  <Route path="services" element={<Services />} />
                  <Route path="about" element={<About />} />
                  <Route path="map" element={<MapExplorer />} />
                  <Route path="notifications" element={<Notifications />} />

                  {/* Authentication */}
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />

                  {/* Customer Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="history" element={<OrderHistory />} />
                    <Route path="food" element={<FoodService />} />
                    <Route path="journey" element={<AlternativeJourney />} />
                    <Route path="profile" element={<Profile />} />
                  </Route>

                  {/* Vendor Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
                    <Route path="vendor/dashboard" element={<VendorDashboard />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="admin/dashboard" element={<AdminDashboard />} />
                    <Route path="admin/analytics" element={<AIAnalytics />} />
                  </Route>

                  {/* Driver Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['driver', 'rider']} />}>
                    <Route path="driver/dashboard" element={<DriverDashboard />} />
                  </Route>
                  <Route path="*" element={<div className="h-screen flex items-center justify-center text-2xl font-bold text-secondary">404 - Page Not Found</div>} />
                </Route>
              </Routes>
            )
          } />
        </Routes>
      </Router>
    </ModalProvider>
  );
}

export default App;
