import React, { useState, useEffect } from 'react';
import { Search, Loader, Shield, Ban, CheckCircle, RefreshCcw, MoreVertical, DollarSign } from 'lucide-react';
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users by name, email, phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="bg-gray-50 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 outline-none cursor-pointer hover:bg-gray-100"
                    >
                        <option value="">All Roles</option>
                        <option value="customer">Customer</option>
                        <option value="vendor">Hotel Manager</option>
                        <option value="driver">Driver</option>
                        <option value="admin">Admin</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-gray-50 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 outline-none cursor-pointer hover:bg-gray-100"
                    >
                        <option value="">Any Status</option>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                        <option value="verified">Verified</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr className="border-b border-gray-100">
                                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">User Details</th>
                                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">Role</th>
                                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">Balance</th>
                                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">Status</th>
                                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">Verified</th>
                                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-primary"><Loader className="animate-spin inline" /></td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-gray-400 font-medium">No users found</td>
                                </tr>
                            ) : (
                                users.map(u => (
                                    <tr key={u.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="font-bold text-secondary">{u.full_name}</div>
                                            <div className="text-xs text-gray-400">{u.email}</div>
                                            <div className="text-[10px] text-gray-400">{u.phone || 'No phone'}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.user_type === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                u.user_type === 'vendor' ? 'bg-orange-100 text-orange-700' :
                                                    u.user_type === 'driver' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                {u.user_type} {u.admin_role ? `(${u.admin_role})` : ''}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="font-bold text-secondary">৳{(parseFloat(u.balance || 0)).toFixed(2)}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            {u.is_blocked ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-600 px-2 py-1 rounded">
                                                    <Ban size={10} /> BLOCKED
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-600 px-2 py-1 rounded">
                                                    <CheckCircle size={10} /> ACTIVE
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            {u.is_verified ? (
                                                <CheckCircle className="text-green-500" size={16} />
                                            ) : (
                                                <span className="text-xs text-gray-400">Unverified</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openBalanceModal(u)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                                                    title="Add Balance"
                                                >
                                                    <DollarSign size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onViewDetails(u.id)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                                                    title="View History & Details"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                {/* Verification Toggle */}
                                                <button
                                                    onClick={() => handleAction(u.id, 'verify_user', { verified: u.is_verified ? 0 : 1 })}
                                                    className={`p-2 rounded-lg transition-colors ${u.is_verified ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}`}
                                                    title={u.is_verified ? "Un-verify User" : "Verify User"}
                                                >
                                                    <Shield size={16} />
                                                </button>

                                                {/* Block Toggle */}
                                                <button
                                                    onClick={() => handleAction(u.id, 'toggle_block', { blocked: u.is_blocked ? 0 : 1 })}
                                                    className={`p-2 rounded-lg transition-colors ${u.is_blocked ? 'text-green-500 bg-green-50 hover:bg-green-100' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                                                    title={u.is_blocked ? "Unblock User" : "Block User"}
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

            {/* Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative">
                        <button
                            onClick={() => setSelectedUser(null)}
                            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <Ban size={24} className="text-gray-400" />
                        </button>

                        <h2 className="text-2xl font-black text-secondary mb-1">User Profile</h2>
                        <div className="text-gray-400 text-sm mb-8">Detailed history and information</div>

                        {detailsLoading ? (
                            <div className="flex justify-center py-12"><Loader className="animate-spin text-primary" size={40} /></div>
                        ) : userDetails ? (
                            <div className="space-y-8">
                                {/* Profile Header */}
                                <div className="flex flex-col md:flex-row gap-6 items-start p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary/20">
                                        {userDetails.profile.full_name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <h3 className="text-xl font-bold text-secondary">{userDetails.profile.full_name}</h3>
                                            <span className="text-xs font-bold uppercase bg-blue-100 text-blue-600 px-2 py-0.5 rounded">{userDetails.profile.user_type}</span>
                                            {userDetails.profile.is_blocked ? <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded">BLOCKED</span> : <span className="text-xs font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded">ACTIVE</span>}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                            <div>📧 {userDetails.profile.email}</div>
                                            <div>📱 {userDetails.profile.phone || 'No phone'}</div>
                                            <div className="text-emerald-600 font-bold">💰 Balance: ৳{(parseFloat(userDetails.profile.balance || 0)).toFixed(2)}</div>
                                            <div>📅 Joined: {new Date(userDetails.profile.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Recent Bookings */}
                                    <div>
                                        <h4 className="font-bold text-secondary mb-4 flex items-center gap-2">🏨 Recent Bookings</h4>
                                        <div className="space-y-3">
                                            {userDetails.bookings.length === 0 ? <p className="text-gray-400 text-sm">No bookings found</p> :
                                                userDetails.bookings.map(b => (
                                                    <div key={b.id} className="p-4 rounded-xl border border-gray-100 hover:border-primary/20 transition-colors bg-white shadow-sm">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <div className="font-bold text-sm text-secondary">{b.hotel_name || 'Deleted Hotel'}</div>
                                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${b.booking_status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                                                }`}>{b.booking_status}</span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mb-2">{b.room_name} • ৳{b.total_price}</div>
                                                        <div className="text-[10px] text-gray-400">
                                                            {new Date(b.check_in_time).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>

                                    {/* Recent Rides */}
                                    <div>
                                        <h4 className="font-bold text-secondary mb-4 flex items-center gap-2">🚗 Recent Rides</h4>
                                        <div className="space-y-3">
                                            {userDetails.rides.length === 0 ? <p className="text-gray-400 text-sm">No rides found</p> :
                                                userDetails.rides.map(r => (
                                                    <div key={r.id} className="p-4 rounded-xl border border-gray-100 hover:border-blue-500/20 transition-colors bg-white shadow-sm">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <div className="font-bold text-sm text-secondary">Ride #{r.id}</div>
                                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${r.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                                                }`}>{r.status}</span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 mb-2">৳{r.total_fare}</div>
                                                        <div className="text-[10px] text-gray-400 truncate w-full">To: {r.destination_address}</div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-red-500">Failed to load user details</div>
                        )}
                    </div>
                </div>
            )}
            {/* Add Balance Modal */}
            {balanceModalOpen && balanceTarget && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
                        <h3 className="text-lg font-bold text-secondary mb-1">Add Balance</h3>
                        <p className="text-gray-500 text-xs mb-4">Adding funds to <strong>{balanceTarget.full_name}</strong></p>

                        <form onSubmit={handleAddBalance}>
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Amount (৳)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-2xl text-secondary focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="0.00"
                                    value={balanceAmount}
                                    onChange={(e) => setBalanceAmount(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setBalanceModalOpen(false)}
                                    className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingBalance}
                                    className="flex-1 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                                >
                                    {isSubmittingBalance ? <Loader size={18} className="animate-spin" /> : <DollarSign size={18} />}
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
