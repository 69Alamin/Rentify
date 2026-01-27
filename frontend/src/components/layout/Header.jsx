import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, Zap, User, Bell, Trash2, CheckCircle2, ChevronDown, LogOut, LayoutDashboard, History, Utensils, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../ui/Logo';

const ActiveStatusBadge = () => {
    const [status, setStatus] = useState(null);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch('/api/user/active_status.php', { credentials: 'include' });
                if (res.status === 401) {
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return;
                }
                const data = await res.json();
                if (data.success && data.active) setStatus(data);
                else setStatus(null);
            } catch (e) { }
        };
        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    if (!status) return null;

    return (
        <div className="bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse mr-2">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {status.message}
        </div>
    );
};

const ServiceButtons = ({ textColorClass, isScrolled, isLightPage }) => {
    const [checkInStatus, setCheckInStatus] = useState(null);
    const prevSigRef = useRef(null);
    const intervalRef = useRef(null);
    const controllerRef = useRef(null);
    const [isVisible, setIsVisible] = useState(() => (typeof document !== 'undefined' ? document.visibilityState === 'visible' : true));

    useEffect(() => {
        let isMounted = true;

        const checkStatus = async () => {
            // Skip if not logged in
            if (!localStorage.getItem('user')) return;

            // Abort any in-flight request
            if (controllerRef.current) controllerRef.current.abort();
            controllerRef.current = new AbortController();

            try {
                const res = await fetch('/api/bookings/check_in_status.php', { credentials: 'include', signal: controllerRef.current.signal });
                if (res.status === 401) {
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return;
                }
                const data = await res.json();
                if (!isMounted) return;
                const next = (data.success && data.is_checked_in) ? data : null;
                const sig = next
                    ? `${next?.services?.food_service?.available ? 1 : 0}-${next?.services?.journey_service?.available ? 1 : 0}`
                    : '0-0';
                if (sig !== prevSigRef.current) {
                    prevSigRef.current = sig;
                    setCheckInStatus(next);
                }
            } catch (e) {
                // ignore aborts; keep previous state to avoid flicker
            }
        };

        const startPolling = () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            checkStatus();
            intervalRef.current = setInterval(checkStatus, 30000); // 30s
        };

        const stopPolling = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (controllerRef.current) controllerRef.current.abort();
        };

        // Handle visibility to reduce unnecessary work
        const onVisibility = () => {
            const visible = document.visibilityState === 'visible';
            setIsVisible(visible);
            if (visible) startPolling(); else stopPolling();
        };

        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', onVisibility);
        }
        // Start if visible
        if (isVisible) startPolling();

        return () => {
            isMounted = false;
            if (typeof document !== 'undefined') {
                document.removeEventListener('visibilitychange', onVisibility);
            }
            stopPolling();
        };
    }, [isVisible]);

    if (!checkInStatus) return null;

    return (
        <div className="flex items-center gap-3">
            {checkInStatus.services.food_service.available && (
                <Link
                    to="/food"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${isScrolled || !isLightPage
                        ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30'
                        : 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20'
                        }`}
                >
                    <Utensils size={16} />
                    <span className="hidden md:inline">Food</span>
                </Link>
            )}
            {checkInStatus.services.journey_service.available && (
                <Link
                    to="/journey"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${isScrolled || !isLightPage
                        ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                        : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                        }`}
                >
                    <Navigation size={16} />
                    <span className="hidden md:inline">Journey</span>
                </Link>
            )}
        </div>
    );
};

const ActiveStatusBadge_old = () => {
    const [status, setStatus] = useState(null);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch('/api/user/active_status.php', { credentials: 'include' });
                if (res.status === 401) {
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return;
                }
                const data = await res.json();
                if (data.success && data.active) setStatus(data);
                else setStatus(null);
            } catch (e) { }
        };
        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    if (!status) return null;

    return (
        <div className="bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse mr-2">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {status.message}
        </div>
    );
};

const UserDropdown = ({ textColorClass, isScrolled, isLightPage }) => {
    const [isOpen, setIsOpen] = useState(false);
    const user = (() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch (e) {
            return {};
        }
    })();

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 font-bold transition-colors ${textColorClass} hover:opacity-80`}
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white text-xs shadow-md">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden lg:inline">{user.name || 'User'}</span>
                <ChevronDown size={14} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[70] py-2"
                        onMouseLeave={() => setIsOpen(false)}
                    >
                        <div className="px-4 py-2 border-b border-gray-50 mb-2">
                            <div className="text-xs font-bold text-gray-400 uppercase">Signed in as</div>
                            <div className="text-sm font-bold text-secondary truncate">{user.email}</div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${user.type === 'admin' ? 'bg-red-100 text-red-700' :
                                    user.type === 'vendor' ? 'bg-blue-100 text-blue-700' :
                                        user.type === 'driver' ? 'bg-green-100 text-green-700' :
                                            'bg-purple-100 text-purple-700'
                                    }`}>
                                    {user.type || 'User'}
                                </span>
                            </div>
                        </div>

                        <Link
                            to={user.type === 'vendor' ? '/vendor/dashboard' : user.type === 'admin' ? '/admin/dashboard' : (user.type === 'driver' || user.type === 'rider') ? '/driver/dashboard' : '/dashboard'}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                        >
                            <LayoutDashboard size={16} /> Dashboard
                        </Link>
                        {user.type === 'customer' && (
                            <>
                                <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors">
                                    <User size={16} /> My Profile
                                </Link>
                                <Link to="/history" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors">
                                    <History size={16} /> History
                                </Link>
                            </>
                        )}
                        <Link
                            to="/notifications"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                        >
                            <Bell size={16} /> Notifications
                        </Link>

                        <hr className="my-2 border-gray-50" />

                        <button
                            onClick={async () => {
                                try {
                                    await fetch('/api/auth/logout.php', { credentials: 'include' });
                                } catch (e) {
                                    console.error("Logout API failed", e);
                                }
                                localStorage.removeItem('user');
                                window.location.href = '/';
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors text-left"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(() => (typeof window !== 'undefined' ? window.scrollY > 20 : false));
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation();
    const notifRef = useRef(null);
    const mobileMenuRef = useRef(null);

    // Detect if on analytics page
    const isAnalyticsPage = location.pathname === '/admin/analytics';

    // Auto-close panels on navigation
    useEffect(() => {
        setIsNotifOpen(false);
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };

        if (isNotifOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isNotifOpen]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(interval);
        };
    }, []);

    // Page Type Logic
    // Fix: Admin Dashboard is now Light mode, so it should be treated as a light page (dark text)
    const darkBgPages = ['/'];
    const isLightPage = !darkBgPages.includes(location.pathname);

    // Hide header entirely on admin routes
    if (location.pathname.startsWith('/admin/')) {
        return null;
    }

    // Pages that should have a transparent navbar initially
    // Remove /admin/dashboard from transparent list to enforce standard navbar behavior
    const transparentNavbarPages = ['/', '/vendor/dashboard', '/driver/dashboard', '/dashboard'];
    const isTransparentNavbar = transparentNavbarPages.includes(location.pathname);

    const fetchNotifications = async () => {
        if (!localStorage.getItem('user')) return;
        try {
            const res = await fetch('/api/notifications/get_notifications.php?unread=true', { credentials: 'include' });
            if (res.status === 401) {
                localStorage.removeItem('user');
                window.location.href = '/login';
                return;
            }
            const data = await res.json();
            if (data.success) setNotifications(data.data);
        } catch (err) { console.error("Failed to fetch notifications"); }
    };

    const markAsRead = async (id) => {
        try {
            const res = await fetch('/api/notifications/mark_as_read.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notification_id: id }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) fetchNotifications();
        } catch (err) { console.error("Failed to mark as read"); }
    };

    // Helper to determine text color class
    // On Home (not scrolled): white
    // On Home (scrolled): white (on dark bg)
    // On Light Page: secondary (dark)
    const getTextColor = () => {
        if (!isLightPage || isScrolled) return 'text-white';
        return 'text-secondary';
    };

    const textColorClass = getTextColor();
    const isDarkLogo = isLightPage && !isScrolled;

    return (
        <>
            {/* Hover Trigger (Invisible area at the top) */}
            {isAnalyticsPage && (
                <div
                    onMouseEnter={() => setIsHovered(true)}
                    className="fixed top-0 left-0 right-0 h-10 z-[60]"
                />
            )}

            <motion.header
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                initial={false}
                animate={{
                    y: isAnalyticsPage && !isHovered ? -100 : 0
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`fixed top-4 left-4 right-4 z-50 transition-all duration-500 rounded-[2.5rem] ${isScrolled
                    ? 'glass-dark shadow-aura-lg py-3'
                    : isTransparentNavbar
                        ? 'bg-transparent py-5'
                        : 'glass-card shadow-aura-md border-b border-gray-100 py-4'
                    }`}
            >
                <div className="container mx-auto px-6 flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <Logo
                            className="w-10 h-10 md:w-12 md:h-12"
                            isDark={isScrolled || !isLightPage}
                            showText={true}
                            textColor={textColorClass}
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {['Home', 'Hotels', 'Services', 'About'].map((item) => (
                            <Link
                                key={item}
                                to={`/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`}
                                className={`font-medium transition-colors text-sm uppercase tracking-wide hover:text-primary ${textColorClass}`}
                            >
                                {item}
                            </Link>
                        ))}
                    </nav>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        {localStorage.getItem('user') ? (
                            <>
                                {/* Service Buttons (Food & Journey) */}
                                <ServiceButtons textColorClass={textColorClass} isScrolled={isScrolled} isLightPage={isLightPage} />

                                {/* Active Status Indicator */}
                                <ActiveStatusBadge_old />

                                {/* Notification Bell */}
                                <div className="relative mr-2" ref={notifRef}>
                                    <button
                                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                                        className={`p-2 rounded-full transition-all relative ${isNotifOpen ? 'bg-primary text-white' : (isScrolled || !isLightPage ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-secondary')}`}
                                    >
                                        <Bell size={20} />
                                        {notifications.length > 0 && (
                                            <span className="absolute top-0 right-0 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-secondary">
                                                {notifications.length}
                                            </span>
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {isNotifOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60]"
                                            >
                                                {/* Notification Content (Same as before) */}
                                                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                                    <h3 className="font-bold text-secondary">Notifications</h3>
                                                    {notifications.length > 0 && (
                                                        <button onClick={() => markAsRead('all')} className="text-[10px] font-black uppercase text-primary hover:underline">Mark all read</button>
                                                    )}
                                                </div>
                                                <div className="max-h-96 overflow-y-auto">
                                                    {notifications.length === 0 ? (
                                                        <div className="p-8 text-center text-gray-400 italic text-sm">No new alerts</div>
                                                    ) : (
                                                        notifications.map(n => (
                                                            <div
                                                                key={n.id}
                                                                onClick={() => markAsRead(n.id)}
                                                                className="p-4 hover:bg-gray-50 border-b border-gray-50 last:border-0 group relative cursor-pointer transition-colors"
                                                            >
                                                                <div className="flex gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                                        <Zap size={14} className="text-primary" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="text-xs font-bold text-secondary mb-1">{n.title}</div>
                                                                        <div className="text-[11px] text-gray-500 leading-tight">{n.message}</div>
                                                                        <div className="text-[9px] text-gray-400 mt-2 uppercase font-black tracking-widest">{new Date(n.created_at).toLocaleTimeString()}</div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => markAsRead(n.id)}
                                                                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-primary transition-all"
                                                                        title="Mark as read"
                                                                    >
                                                                        <CheckCircle2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                                <Link to="/dashboard" onClick={() => setIsNotifOpen(false)} className="block p-3 text-center text-xs font-bold text-gray-500 hover:bg-gray-50 bg-gray-50/50">View Dashboard</Link>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* User Dropdown */}
                                <UserDropdown
                                    textColorClass={textColorClass}
                                    isScrolled={isScrolled}
                                    isLightPage={isLightPage}
                                />
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className={`font-medium transition-colors hover:text-primary ${textColorClass}`}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2.5 aura-gradient-primary rounded-lg text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                                >
                                    <User size={18} />
                                    <span>Join Now</span>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className={`md:hidden ${textColorClass}`}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </motion.header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        ref={mobileMenuRef}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-secondary/95 backdrop-blur-xl pt-24 px-6 md:hidden"
                    >
                        <nav className="flex flex-col gap-6 text-center">
                            {['Home', 'Hotels', 'Services', 'About'].map((item) => (
                                <Link
                                    key={item}
                                    to={`/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`}
                                    className="text-2xl text-white font-bold hover:text-primary transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item}
                                </Link>
                            ))}
                            <hr className="border-gray-700 my-4" />
                            {localStorage.getItem('user') ? (
                                <>
                                    <Link
                                        to={(() => {
                                            const utype = JSON.parse(localStorage.getItem('user')).type;
                                            if (utype === 'vendor') return '/vendor/dashboard';
                                            if (utype === 'admin') return '/admin/dashboard';
                                            if (utype === 'driver' || utype === 'rider') return '/driver/dashboard';
                                            return '/dashboard';
                                        })()}
                                        className="text-xl text-white font-bold hover:text-primary"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    {JSON.parse(localStorage.getItem('user')).type === 'customer' && (
                                        <>
                                            <Link to="/food" className="text-xl text-orange-400 font-bold hover:text-orange-300 flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                                                <Utensils size={20} />
                                                Food Service
                                            </Link>
                                            <Link to="/journey" className="text-xl text-green-400 font-bold hover:text-green-300 flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                                                <Navigation size={20} />
                                                Alternative Journey
                                            </Link>
                                            <Link to="/history" className="text-xl text-white font-bold hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                                                History
                                            </Link>
                                        </>
                                    )}
                                    <button
                                        onClick={async () => {
                                            try {
                                                await fetch('/api/auth/logout.php', { credentials: 'include' });
                                            } catch (e) {
                                                console.error("Logout API failed", e);
                                            }
                                            localStorage.removeItem('user');
                                            window.location.href = '/';
                                        }}
                                        className="text-xl text-gray-300 hover:text-white"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-xl text-gray-300 hover:text-white"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="py-4 bg-primary rounded-xl text-white text-xl font-bold shadow-lg"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Join Now
                                    </Link>
                                </>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;
