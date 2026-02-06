import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Hotel, Map as MapIcon, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useModal } from '../../context/ModalContext'; // Using Modal for auth check effectively

const BottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    const isLoggedIn = !!user;
    const isRider = user?.type === 'driver' || user?.type === 'rider';

    // Different navigation for riders vs regular users
    const tabs = isRider ? [
        { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/driver/dashboard', protected: true },
        { id: 'map', icon: MapIcon, label: 'Navigate', path: '/map' },
        { id: 'profile', icon: User, label: 'Profile', path: '/driver/dashboard', protected: true },
    ] : [
        { id: 'home', icon: Home, label: 'Home', path: '/' },
        { id: 'hotels', icon: Hotel, label: 'Hotels', path: '/hotels' },
        { id: 'map', icon: MapIcon, label: 'Map', path: '/map' },
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
                    const isActive = currentPath === tab.path || (tab.path !== '/' && currentPath.startsWith(tab.path));

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
                                <tab.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
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
