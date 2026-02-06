import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout'; // Restore MainLayout
// import DebugLayout from './components/layout/DebugLayout';
import MobileLayout from './mobile/layout/MobileLayout';
import useIsMobile from './hooks/useIsMobile';

import Home from './pages/Home';
import MobileHome from './mobile/pages/MobileHome';
import MobileProfile from './mobile/pages/MobileProfile';
import MobileHotels from './mobile/pages/MobileHotels';
import MobileMap from './mobile/pages/MobileMap';
import MobileTrips from './mobile/pages/MobileTrips';
import MobileNotifications from './mobile/pages/MobileNotifications';
import MobileHotelDetails from './mobile/pages/MobileHotelDetails';
import MobileFoodService from './mobile/pages/MobileFoodService';
import MobileAlternativeJourney from './mobile/pages/MobileAlternativeJourney';
import MobileRiderDashboard from './mobile/pages/MobileRiderDashboard';
import MobileVendorDashboard from './mobile/pages/MobileVendorDashboard';
import MobileMessages from './mobile/pages/MobileMessages';
import MobileVerification from './mobile/pages/MobileVerification';
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
import Verification from './pages/Verification';
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
  const { isMobile } = useIsMobile();

  return (
    <ModalProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={isMobile ? <MobileLayout /> : <MainLayout />}>
            <Route index element={isMobile ? <MobileHome /> : <Home />} />
            <Route path="hotels" element={isMobile ? <MobileHotels /> : <Hotels />} />
            <Route path="hotels/:id" element={isMobile ? <MobileHotelDetails /> : <HotelDetails />} />

            {/* Public/Shared */}
            <Route path="services" element={<Services />} />
            <Route path="about" element={<About />} />
            <Route path="map" element={isMobile ? <MobileMap /> : <MapExplorer />} />
            <Route path="notifications" element={isMobile ? <MobileNotifications /> : <Notifications />} />
            {/* Protected routes for all roles */}
            <Route element={<ProtectedRoute />}>
              <Route path="messages" element={<MobileMessages />} />
            </Route>

            {/* Authentication */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Customer Routes */}
            <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="history" element={isMobile ? <MobileTrips /> : <OrderHistory />} />
              <Route path="food" element={isMobile ? <MobileFoodService /> : <FoodService />} />
              <Route path="journey" element={isMobile ? <MobileAlternativeJourney /> : <AlternativeJourney />} />
              <Route path="profile" element={isMobile ? <MobileProfile /> : <Profile />} />
            </Route>

            {/* Vendor Routes */}
            <Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
              <Route path="vendor/dashboard" element={isMobile ? <MobileVendorDashboard /> : <VendorDashboard />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin/analytics" element={<AIAnalytics />} />
            </Route>

            {/* Driver/Rider Routes */}
            <Route element={<ProtectedRoute allowedRoles={['driver', 'rider']} />}>
              <Route path="driver/dashboard" element={isMobile ? <MobileRiderDashboard /> : <DriverDashboard />} />
            </Route>

            {/* Trust Center (Verification) - Accessible to all user types */}
            <Route element={<ProtectedRoute allowedRoles={['driver', 'rider', 'vendor', 'customer']} />}>
              <Route path="trust-center" element={isMobile ? <MobileVerification /> : <Verification />} />
            </Route>

            <Route path="*" element={<div className="h-screen flex items-center justify-center text-2xl font-bold text-secondary">404 - Page Not Found</div>} />
          </Route>
        </Routes>
      </Router>
    </ModalProvider>
  );
}

export default App;
