import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, ChevronRight, LogOut, Shield, CreditCard, Bell, Settings, HelpCircle, FileText, X, Save, Lock, Loader, TrendingUp } from 'lucide-react';
import { useModal } from '../../context/ModalContext';

const MobileProfile = () => {
    const navigate = useNavigate();
    const { showConfirm, showSuccess, showError } = useModal();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ trips: 0, rating: 5.0, status: 'Active' });

    // Edit Profile State
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [editForm, setEditForm] = useState({ full_name: '', phone: '', vehicle_model: '', number_plate: '' });
    const [savingProfile, setSavingProfile] = useState(false);

    // Change Password State
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '' });
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        fetchProfileData();
    }, [navigate]);

    const fetchProfileData = async () => {
        try {
            const [profileRes, bookingsRes] = await Promise.all([
                fetch('/api/user/get_profile.php', { credentials: 'include' }),
                fetch('/api/bookings/list.php')
            ]);

            if (profileRes.status === 401) {
                navigate('/login');
                return;
            }

            const profileData = await profileRes.json();
            const bookingsData = await bookingsRes.json();

            if (profileData.success) {
                setUser(profileData.data);
                setEditForm({
                    full_name: profileData.data.full_name || '',
                    phone: profileData.data.phone || '',
                    vehicle_model: profileData.data.vehicle_model || '',
                    number_plate: profileData.data.number_plate || ''
                });
            }

            if (bookingsData.success) {
                setStats(prev => ({ ...prev, trips: bookingsData.data.length }));
            }

        } catch (err) {
            console.error("Failed to load profile", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        showConfirm(
            'Are you sure you want to sign out?',
            async () => {
                try {
                    await fetch('/api/auth/logout.php', { credentials: 'include' });
                    localStorage.removeItem('user');
                    navigate('/login');
                    showSuccess('Logged out successfully');
                } catch (e) {
                    console.error("Logout failed", e);
                }
            },
            'Sign Out'
        );
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const res = await fetch('/api/user/update_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });
            const data = await res.json();
            if (data.success) {
                showSuccess('Profile updated successfully');
                setUser(prev => ({ ...prev, ...editForm }));
                setShowEditProfile(false);
            } else {
                showError(data.message || 'Update failed');
            }
        } catch (err) {
            showError('Network error');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.new_password.length < 6) {
            showError('Password must be at least 6 characters');
            return;
        }
        setSavingPassword(true);
        try {
            const res = await fetch('/api/auth/change_password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passwordForm)
            });
            const data = await res.json();
            if (data.success) {
                showSuccess('Password changed successfully');
                setPasswordForm({ current_password: '', new_password: '' });
                setShowChangePassword(false);
            } else {
                showError(data.message || 'Change failed');
            }
        } catch (err) {
            showError('Network error');
        } finally {
            setSavingPassword(false);
        }
    };

    const menuItems = [
        { icon: User, label: 'Personal Information', sub: 'Edit your details', action: () => setShowEditProfile(true) },
        { icon: Shield, label: 'Security', sub: 'Change Password', action: () => setShowChangePassword(true) },
        { icon: Shield, label: 'Trust Center', sub: 'Verify your identity', action: () => navigate('/trust-center') },
    ];

    const supportItems = [
        { icon: FileText, label: 'Terms & Privacy', action: () => { } },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-navy flex items-center justify-center">
                <Loader className="animate-spin text-accent" size={32} />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-navy pb-24 text-white font-sans">
            {/* Header / Cover */}
            <div className="relative h-48 bg-gradient-to-b from-primary/20 to-navy">
                <div className="absolute -bottom-12 left-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-navy-light border-4 border-navy shadow-xl overflow-hidden flex items-center justify-center">
                            <span className="text-4xl font-bold text-accent">
                                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                            </span>
                        </div>
                        {user.is_verified && (
                            <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 border-4 border-navy">
                                <Shield size={12} fill="currentColor" className="text-white" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-6 mt-14">
                <h1 className="text-2xl font-bold">{user.full_name || 'Guest User'}</h1>
                <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                    <Mail size={12} /> {user.email}
                </p>
                {user.phone && (
                    <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                        <Phone size={12} /> {user.phone}
                    </p>
                )}

                <div className="flex gap-3 mt-6">
                    <div className="flex-1 bg-navy-light rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center gap-1">
                        <span className="text-accent font-bold text-lg">{stats.trips}</span>
                        <span className="text-[10px] uppercase text-gray-500 tracking-wider">Trips</span>
                    </div>
                    <div className="flex-1 bg-navy-light rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center gap-1">
                        <span className="text-accent font-bold text-lg">{stats.rating}</span>
                        <span className="text-[10px] uppercase text-gray-500 tracking-wider">Rating</span>
                    </div>
                    <div className="flex-1 bg-navy-light rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center gap-1">
                        <span className="text-emerald-400 font-bold text-lg">{stats.status}</span>
                        <span className="text-[10px] uppercase text-gray-500 tracking-wider">Status</span>
                    </div>
                </div>
            </div>

            {/* Wallet Card */}
            <div className="px-6 mt-6">
                <div className="bg-secondary p-6 rounded-2xl relative overflow-hidden shadow-xl border border-white/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                                <TrendingUp size={20} className="text-white" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 backdrop-blur-md px-2 py-1 rounded-full border border-white/5 text-white">Balance</span>
                        </div>
                        <div className="text-xs font-bold text-white/60 mb-1 uppercase tracking-widest">Available Credit</div>
                        <div className="text-3xl font-black tracking-tight mb-4 italic text-white">
                            ৳{parseFloat(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="bg-white text-secondary py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white/90 transition-all">Add Funds</button>
                            <button className="bg-white/10 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white/20 transition-all border border-white/5">History</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu List */}
            <div className="px-6 mt-8 space-y-6">
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">Account</h3>
                    <div className="space-y-3">
                        {menuItems.map((item, idx) => (
                            <motion.button
                                key={idx}
                                whileTap={{ scale: 0.98 }}
                                onClick={item.action}
                                className="w-full bg-navy-light border border-white/5 p-4 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300 group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                                    <item.icon size={20} />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-bold text-sm text-gray-200">{item.label}</div>
                                    <div className="text-xs text-gray-500">{item.sub}</div>
                                </div>
                                <ChevronRight size={16} className="text-gray-600" />
                            </motion.button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">Support</h3>
                    <div className="space-y-3">
                        {supportItems.map((item, idx) => (
                            <motion.button
                                key={idx}
                                whileTap={{ scale: 0.98 }}
                                onClick={item.action}
                                className="w-full bg-navy-light border border-white/5 p-4 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300 group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                                    <item.icon size={20} />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-bold text-sm text-gray-200">{item.label}</div>
                                </div>
                                <ChevronRight size={16} className="text-gray-600" />
                            </motion.button>
                        ))}

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={handleLogout}
                            className="w-full mt-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-4 text-red-500 hover:bg-red-500/20 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                <LogOut size={20} />
                            </div>
                            <span className="font-bold text-sm">Sign Out</span>
                        </motion.button>
                    </div>
                </div>
            </div>

            <div className="text-center mt-8 pb-4">
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Version 1.0.2</p>
                <p className="text-[9px] text-gray-700 mt-1">Made with ♥ by Quickrent</p>
            </div>

            {/* Edit Profile Sheet with Portal */}
            {createPortal(
                <AnimatePresence>
                    {showEditProfile && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 z-[9999] backdrop-blur-sm"
                                onClick={() => setShowEditProfile(false)}
                            />
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="fixed bottom-0 left-0 right-0 bg-navy-light rounded-t-[2.5rem] z-[10000] p-6 pb-safe border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh]"
                            >
                                <div className="flex-1 overflow-y-auto">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                                        <button onClick={() => setShowEditProfile(false)} className="p-2 bg-white/5 rounded-full text-gray-400">
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <form onSubmit={handleSaveProfile} className="space-y-4 pb-8">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={editForm.full_name}
                                                onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                                                className="w-full bg-navy border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-accent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                                            <input
                                                type="tel"
                                                value={editForm.phone}
                                                onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                                className="w-full bg-navy border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-accent"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={savingProfile}
                                            className="w-full py-4 bg-accent text-navy font-bold rounded-xl mt-4 flex items-center justify-center gap-2"
                                        >
                                            {savingProfile ? <Loader className="animate-spin" size={20} /> : <><Save size={20} /> Save Changes</>}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Change Password Sheet with Portal */}
            {createPortal(
                <AnimatePresence>
                    {showChangePassword && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 z-[9999] backdrop-blur-sm"
                                onClick={() => setShowChangePassword(false)}
                            />
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="fixed bottom-0 left-0 right-0 bg-navy-light rounded-t-[2.5rem] z-[10000] p-6 pb-safe border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh]"
                            >
                                <div className="flex-1 overflow-y-auto">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold text-white">Change Password</h2>
                                        <button onClick={() => setShowChangePassword(false)} className="p-2 bg-white/5 rounded-full text-gray-400">
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <form onSubmit={handleChangePassword} className="space-y-4 pb-8">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Current Password</label>
                                            <input
                                                type="password"
                                                value={passwordForm.current_password}
                                                onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                                className="w-full bg-navy border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-accent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
                                            <input
                                                type="password"
                                                value={passwordForm.new_password}
                                                onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                                className="w-full bg-navy border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-accent"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={savingPassword}
                                            className="w-full py-4 bg-accent text-navy font-bold rounded-xl mt-4 flex items-center justify-center gap-2"
                                        >
                                            {savingPassword ? <Loader className="animate-spin" size={20} /> : <><Lock size={20} /> Update Password</>}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default MobileProfile;
