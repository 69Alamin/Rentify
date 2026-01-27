import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <ModalProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="hotels" element={<Hotels />} />
            <Route path="hotels/:id" element={<HotelDetails />} />
            {/* Removed redundant public dashboard route if intended for customers only, or keep if shared? 
                Assuming 'dashboard' is customer specific based on protection plan. 
                If 'dashboard.jsx' is shared, we might need logic inside. 
                But for now, I put it under customer. */ }

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
      </Router>
    </ModalProvider>
  );
}

export default App;
