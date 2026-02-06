import React, { useState, useEffect } from 'react';
import {
    Search, Loader, Shield, Ban, CheckCircle, RefreshCcw,
    MoreVertical, DollarSign, Mail, Calendar, X, Building,
    Navigation, Zap, BarChart3, TrendingUp, AlertCircle, Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useModal } from '../../context/ModalContext';

const UserManagement = () => {
    const { showSuccess, showError, showConfirm } = useModal();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // Details Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [filterRole, filterStatus]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                search,
                role: filterRole,
                status: filterStatus
            });
            const res = await fetch(`/api/admin/users.php?${query.toString()}`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (userId, action, value) => {
        try {
            const res = await fetch('/api/admin/users.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, action, ...value }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                showSuccess(data.message);
                fetchUsers();
            } else {
                showError(data.message);
            }
        } catch (err) {
            showError('Action failed');
        }
    };

    const onViewDetails = async (userId) => {
        setSelectedUser(userId);
        setDetailsLoading(true);
        try {
            const res = await fetch(`/api/admin/user_details.php?user_id=${userId}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setUserDetails(data.data);
            } else {
                showError(data.message);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDetailsLoading(false);
        }
    };

    // Balance Logic
    const [balanceModalOpen, setBalanceModalOpen] = useState(false);
    const [balanceTarget, setBalanceTarget] = useState(null); // user object
    const [balanceAmount, setBalanceAmount] = useState('');
    const [isSubmittingBalance, setIsSubmittingBalance] = useState(false);

    const openBalanceModal = (user) => {
        setBalanceTarget(user);
        setBalanceAmount('');
        setBalanceModalOpen(true);
    };

    const handleAddBalance = async (e) => {
        e.preventDefault();
        const amount = parseFloat(balanceAmount);
        if (!amount || amount <= 0) {
            showError('Please enter a valid amount');
            return;
        }

        setIsSubmittingBalance(true);
        try {
            const res = await fetch('/api/admin/add_balance.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: balanceTarget.id, amount, type: 'credit' }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                showSuccess(data.message);
                setBalanceModalOpen(false);
                fetchUsers(); // Refresh list to see balance update if displayed, or just to sync
            } else {
                showError(data.message);
            }
        } catch (err) {
            showError('Network error');
        } finally {
            setIsSubmittingBalance(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Search & Filter Bar - Glassmorphism */}
            <div className="flex flex-col lg:flex-row gap-6 justify-between items-center bg-white/[0.03] backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-2xl">
                <div className="relative w-full lg:w-[450px] group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search assets by name, identifier, or signal..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none text-sm font-medium text-white placeholder:text-slate-600 transition-all shadow-inner"
                    />
                </div>
                <div className="flex gap-4 w-full lg:w-auto">
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="bg-white/[0.02] border border-white/5 px-6 py-4 rounded-2xl text-[11px] font-black text-slate-400 uppercase tracking-widest outline-none cursor-pointer hover:bg-white/[0.05] hover:text-white transition-all appearance-none text-center min-w-[140px]"
                    >
                        <option value="" className="bg-slate-900 uppercase">All Roles</option>
                        <option value="customer" className="bg-slate-900 uppercase">Customer</option>
                        <option value="vendor" className="bg-slate-900 uppercase">Hotel Manager</option>
                        <option value="driver" className="bg-slate-900 uppercase">Driver</option>
                        <option value="admin" className="bg-slate-900 uppercase">Admin</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-white/[0.02] border border-white/5 px-6 py-4 rounded-2xl text-[11px] font-black text-slate-400 uppercase tracking-widest outline-none cursor-pointer hover:bg-white/[0.05] hover:text-white transition-all appearance-none text-center min-w-[140px]"
                    >
                        <option value="" className="bg-slate-900 uppercase">Any Status</option>
                        <option value="active" className="bg-slate-900 uppercase">Active</option>
                        <option value="blocked" className="bg-slate-900 uppercase">Blocked</option>
                        <option value="verified" className="bg-slate-900 uppercase">Verified</option>
                    </select>
                </div>
            </div>

            {/* Premium Table - Glassmorphism */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="py-8 px-8 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">Subject Details</th>
                                <th className="py-8 px-8 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">Authorization</th>
                                <th className="py-8 px-8 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500 text-center">Capital</th>
                                <th className="py-8 px-8 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">Status</th>
                                <th className="py-8 px-8 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader className="animate-spin text-primary" size={32} />
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Syncing Database</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Search size={48} className="text-slate-700" />
                                            <span className="text-sm font-bold text-slate-500 italic">No assets located in current sector.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map(u => (
                                    <tr key={u.id} className="group hover:bg-white/[0.03] transition-all duration-300">
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-black group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                                                    {u.full_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-black text-white italic tracking-tighter group-hover:text-primary transition-colors">{u.full_name}</div>
                                                    <div className="text-[10px] font-bold text-slate-500 tracking-wider mt-0.5 uppercase opacity-60">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${u.user_type === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                u.user_type === 'vendor' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                    u.user_type === 'driver' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                }`}>
                                                {u.user_type} {u.admin_role ? `(${u.admin_role})` : ''}
                                            </span>
                                        </td>
                                        <td className="py-6 px-8 text-center">
                                            <span className="font-black text-white italic">৳{(parseFloat(u.balance || 0)).toLocaleString()}</span>
                                        </td>
                                        <td className="py-6 px-8">
                                            {u.is_blocked ? (
                                                <div className="inline-flex items-center gap-2 text-[9px] font-black bg-rose-500/10 text-rose-400 px-4 py-1.5 rounded-full border border-rose-500/20 tracking-widest shadow-lg shadow-rose-500/5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div> RESTRICTED
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-2 text-[9px] font-black bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full border border-emerald-500/20 tracking-widest shadow-lg shadow-emerald-500/5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div> OPERATIONAL
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-6 px-8 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => openBalanceModal(u)}
                                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-400/20 transition-all shadow-xl"
                                                    title="Inject Capital"
                                                >
                                                    <DollarSign size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onViewDetails(u.id)}
                                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10 hover:border-primary/20 transition-all shadow-xl"
                                                    title="Access Logs"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(u.id, 'verify_user', { verified: u.is_verified ? 0 : 1 })}
                                                    className={`w-10 h-10 rounded-xl border border-white/5 flex items-center justify-center transition-all shadow-xl ${u.is_verified ? 'bg-primary/5 text-primary' : 'bg-white/5 text-slate-500 hover:bg-primary/10 hover:text-primary hover:border-primary/20'}`}
                                                    title={u.is_verified ? "Revoke Verification" : "Authorize Verification"}
                                                >
                                                    <Shield size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(u.id, 'toggle_block', { blocked: u.is_blocked ? 0 : 1 })}
                                                    className={`w-10 h-10 rounded-xl border border-white/5 flex items-center justify-center transition-all shadow-xl ${u.is_blocked ? 'bg-rose-500/10 text-rose-400 hover:bg-emerald-500/10 hover:text-emerald-400' : 'bg-white/5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400'}`}
                                                    title={u.is_blocked ? "Lift Restriction" : "Impose Restriction"}
                                                >
                                                    <Ban size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal - Premium Glass */}
            {selectedUser && (
                <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="bg-[#0F172A]/90 backdrop-blur-2xl rounded-[3rem] w-full max-w-5xl max-h-[85vh] overflow-y-auto p-12 shadow-2xl relative border border-white/10 custom-scrollbar"
                    >
                        <button
                            onClick={() => setSelectedUser(null)}
                            className="absolute top-8 right-8 p-3 hover:bg-white/5 rounded-2xl transition-all text-slate-500 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-white italic tracking-tighter leading-none">SUBJECT PROFILE</h2>
                            <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2">Dossier & History Access</div>
                        </div>

                        {detailsLoading ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <Loader className="animate-spin text-primary" size={40} />
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Decrypting Records</span>
                            </div>
                        ) : userDetails ? (
                            <div className="space-y-12">
                                {/* Profile Header */}
                                <div className="flex flex-col md:flex-row gap-10 items-center p-10 bg-white/[0.02] rounded-[2.5rem] border border-white/5 shadow-inner">
                                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-orange-600 rounded-3xl flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-primary/20 transform -rotate-3">
                                        {userDetails.profile.full_name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 space-y-6 text-center md:text-left">
                                        <div className="flex flex-wrap gap-3 items-center justify-center md:justify-start">
                                            <h3 className="text-2xl font-black text-white italic tracking-tight">{userDetails.profile.full_name}</h3>
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">{userDetails.profile.user_type}</span>
                                            {userDetails.profile.is_blocked ? (
                                                <span className="text-[9px] font-black bg-rose-500/10 text-rose-400 px-3 py-1 rounded-full border border-rose-500/20 tracking-widest uppercase">Restricted</span>
                                            ) : (
                                                <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 tracking-widest uppercase">Authorized</span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                            <div className="flex items-center gap-3"><Mail size={14} className="text-slate-600" /> {userDetails.profile.email}</div>
                                            <div className="flex items-center gap-3"><Mail size={14} className="text-slate-600" /> {userDetails.profile.phone || 'No phone signal'}</div>
                                            <div className="flex items-center gap-3 text-emerald-400"><DollarSign size={14} /> Capital: ৳{(parseFloat(userDetails.profile.balance || 0)).toLocaleString()}</div>
                                            <div className="flex items-center gap-3"><Calendar size={14} className="text-slate-600" /> Commissioned: {new Date(userDetails.profile.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    {/* Recent Bookings */}
                                    <div className="space-y-6">
                                        <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3 italic">
                                            <Building size={16} className="text-primary" /> Recent Deployments
                                        </h4>
                                        <div className="space-y-4">
                                            {userDetails.bookings.length === 0 ? (
                                                <p className="text-slate-600 text-xs italic font-medium p-8 bg-white/[0.01] rounded-2xl border border-white/5 text-center">No deployment history found.</p>
                                            ) : userDetails.bookings.map(b => (
                                                <div key={b.id} className="p-6 rounded-2xl border border-white/5 hover:border-primary/20 transition-all bg-white/[0.01] group/item">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="font-black text-white italic tracking-tight group-hover/item:text-primary transition-colors uppercase">{b.hotel_name || 'Decommissioned Facility'}</div>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${b.booking_status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>{b.booking_status}</span>
                                                    </div>
                                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{b.room_name} • ৳{b.total_price}</div>
                                                    <div className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">{new Date(b.check_in_time).toLocaleDateString()}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recent Rides */}
                                    <div className="space-y-6">
                                        <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3 italic">
                                            <Navigation size={16} className="text-blue-400" /> Extraction History
                                        </h4>
                                        <div className="space-y-4">
                                            {userDetails.rides.length === 0 ? (
                                                <p className="text-slate-600 text-xs italic font-medium p-8 bg-white/[0.01] rounded-2xl border border-white/5 text-center">No extraction data detected.</p>
                                            ) : userDetails.rides.map(r => (
                                                <div key={r.id} className="p-6 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all bg-white/[0.01] group/item">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="font-black text-white italic tracking-tight group-hover/item:text-blue-400 transition-colors uppercase">Log Entry #{r.id}</div>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${r.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>{r.status}</span>
                                                    </div>
                                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Net Fare: ৳{r.total_fare}</div>
                                                    <div className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] truncate">Vector: {r.destination_address}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <h4 className="text-xl font-black text-rose-500 uppercase italic tracking-tighter">Access Denied</h4>
                                <p className="text-slate-500 text-sm mt-2">Critical error loading subject dossiers.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
            {/* Add Balance Modal - Premium Glass */}
            {balanceModalOpen && balanceTarget && (
                <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-fade-in">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#0F172A]/90 backdrop-blur-2xl rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative border border-white/10"
                    >
                        <h3 className="text-2xl font-black text-white italic tracking-tighter mb-1">CAPITAL INJECTION</h3>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Target: <strong className="text-primary italic">{balanceTarget.full_name}</strong></p>

                        <form onSubmit={handleAddBalance}>
                            <div className="mb-8">
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Amount to Authorize (৳)</label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-primary">৳</div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="1"
                                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl pl-14 pr-6 py-6 font-black text-4xl text-white focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all shadow-inner"
                                        placeholder="0.00"
                                        value={balanceAmount}
                                        onChange={(e) => setBalanceAmount(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setBalanceModalOpen(false)}
                                    className="flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-white/5 transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingBalance}
                                    className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 active:scale-95"
                                >
                                    {isSubmittingBalance ? <Loader size={18} className="animate-spin" /> : <DollarSign size={18} />}
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
