import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Hotel, Map as MapIcon, Calendar, User, ShoppingBag, Truck, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useModal } from '../../context/ModalContext';
import { useState, useEffect } from 'react';

const BottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;
    const [pendingBookings, setPendingBookings] = useState(0);
    const [pendingRides, setPendingRides] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);

    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    const isLoggedIn = !!user;
    const isRider = user?.type === 'driver' || user?.type === 'rider';
    const isVendor = user?.type === 'vendor';

    useEffect(() => {
        if (!isVendor) return;

        const checkPending = async () => {
            try {
                const res = await fetch('/api/vendor/bookings.php', { credentials: 'include' });
                const data = await res.json();
                if (data.success) {
                    const count = data.data.filter(b => b.booking_status === 'pending').length;
                    setPendingBookings(count);
                }
            } catch (e) { console.error('Pending check error', e); }
        };

        checkPending();
        const interval = setInterval(checkPending, 10000);
        return () => clearInterval(interval);
    }, [isVendor]);

    useEffect(() => {
        if (!isRider) return;

        const checkPendingRides = async () => {
            try {
                const res = await fetch('/api/rides/request.php', { credentials: 'include' });
                const data = await res.json();
                if (data.success) {
                    const count = data.data.filter(r => r.status === 'requested').length;
                    setPendingRides(count);
                }
            } catch (e) { console.error('Rider pending check error', e); }
        };

        checkPendingRides();
        const interval = setInterval(checkPendingRides, 10000);
        return () => clearInterval(interval);
    }, [isRider]);

    useEffect(() => {
        if (!isLoggedIn) return;

        const checkMessages = async () => {
            try {
                const res = await fetch('/api/chat/unread_count.php', { credentials: 'include' });
                const data = await res.json();
                if (data.success) {
                    setUnreadMessages(data.unread_count);
                }
            } catch (e) { }
        };

        checkMessages();
        const interval = setInterval(checkMessages, 10000);
        return () => clearInterval(interval);
    }, [isLoggedIn]);

    // Different navigation for riders vs vendors vs regular users
    const tabs = isRider ? [
        { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/driver/dashboard?category=overview', protected: true },
        { id: 'requests', icon: Truck, label: 'Ride Request', path: '/driver/dashboard?category=requests', protected: true, notification: pendingRides },
        { id: 'map', icon: MapIcon, label: 'Map', path: '/map' },
        { id: 'messages', icon: MessageCircle, label: 'Messages', path: '/messages', protected: true, notification: unreadMessages },
        { id: 'profile', icon: User, label: 'Profile', path: '/driver/dashboard?category=profile', protected: true },
    ] : isVendor ? [
        { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/vendor/dashboard?category=all', protected: true },
        { id: 'bookings', icon: Calendar, label: 'Booking', path: '/vendor/dashboard?category=bookings', protected: true, notification: pendingBookings },
        { id: 'hotels', icon: Hotel, label: 'My Hotels', path: '/vendor/dashboard?category=hotels', protected: true },
        { id: 'food', icon: ShoppingBag, label: 'Food', path: '/vendor/dashboard?category=food', protected: true },
        { id: 'messages', icon: MessageCircle, label: 'Messages', path: '/messages', protected: true, notification: unreadMessages },
        { id: 'profile', icon: User, label: 'Profile', path: '/vendor/dashboard?category=profile', protected: true },
    ] : [
        { id: 'home', icon: Home, label: 'Home', path: '/' },
        { id: 'hotels', icon: Hotel, label: 'Hotels', path: '/hotels' },
        { id: 'map', icon: MapIcon, label: 'Map', path: '/map' },
        { id: 'messages', icon: MessageCircle, label: 'Messages', path: '/messages', protected: true, notification: unreadMessages },
        { id: 'trips', icon: Calendar, label: 'Trips', path: '/history', protected: true },
        { id: 'profile', icon: User, label: 'Profile', path: '/profile', protected: true },
    ];

    const handleTabClick = (e, tab) => {
        if (tab.protected && !isLoggedIn) {
            e.preventDefault();
            // Redirect to login with return URL
            navigate(`/login?return=${encodeURIComponent(tab.path)}`, {
                state: { from: { pathname: tab.path } }
            });
        }
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-navy/80 backdrop-blur-lg border-t border-navy-border pb-safe pt-2 z-50">
            <div className="flex justify-around items-center px-2">
                {tabs.map((tab) => {
                    const searchParams = new URLSearchParams(location.search);
                    const currentCategory = searchParams.get('category');
                    const tabParams = tab.path.includes('?') ? new URLSearchParams(tab.path.split('?')[1]) : new URLSearchParams();
                    const tabCategory = tabParams.get('category');

                    let isActive = false;
                    if ((isVendor || isRider) && tabCategory) {
                        isActive = currentPath === tab.path.split('?')[0] && (currentCategory === tabCategory || (!currentCategory && tabCategory === 'overview'));
                    } else {
                        isActive = currentPath === tab.path || (tab.path !== '/' && currentPath.startsWith(tab.path));
                    }

                    return (
                        <Link
                            key={tab.id}
                            to={tab.path}
                            onClick={(e) => handleTabClick(e, tab)}
                            className="relative flex flex-col items-center justify-center p-2 w-full text-xs font-medium transition-colors"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute -top-2 w-8 h-1 bg-accent rounded-full"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}

                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className={`flex flex-col items-center gap-1 ${isActive ? 'text-accent' : 'text-gray-400'
                                    }`}
                            >
                                <div className="relative">
                                    <tab.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                    {tab.notification > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-pulse border-2 border-navy">
                                            {tab.notification}
                                        </span>
                                    )}
                                </div>
                                <span className={`${isActive ? 'opacity-100' : 'opacity-70'}`}>
                                    {tab.label}
                                </span>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
