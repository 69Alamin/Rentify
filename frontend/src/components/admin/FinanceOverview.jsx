import React, { useState, useEffect } from 'react';
import { Loader, TrendingUp, DollarSign, Calendar, CreditCard } from 'lucide-react';

const FinanceOverview = () => {
    const [stats, setStats] = useState({ today: 0, month: 0, total: 0 });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/finance.php', { credentials: 'include' });
            const data = await res.json();

            if (data.success) {
                setStats(data.stats);
                setTransactions(data.recent_transactions);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-secondary">Financial Overview</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-xs font-black text-emerald-600 uppercase mb-1">Gross Volume</div>
                        <div className="text-3xl font-black text-secondary">৳{Math.abs(stats.total_volume || 0).toLocaleString()}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-primary/20">
                    <div className="relative z-10">
                        <div className="text-xs font-black text-primary uppercase mb-1">Platform Revenue</div>
                        <div className="text-3xl font-black text-secondary">৳{(stats.total_revenue || 0).toLocaleString()}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100">
                    <div className="relative z-10">
                        <div className="text-xs font-black text-blue-600 uppercase mb-1">Vendor Payouts</div>
                        <div className="text-3xl font-black text-secondary">৳{(stats.total_payouts || 0).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-secondary">Recent Transactions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr className="border-b border-gray-100">
                                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">ID</th>
                                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">User</th>
                                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">Type</th>
                                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">Amount</th>
                                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="5" className="py-12 text-center"><Loader className="animate-spin inline text-primary" /></td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan="5" className="py-12 text-center text-gray-400">No transactions found</td></tr>
                            ) : transactions.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50/50">
                                    <td className="py-4 px-6 font-mono text-xs text-gray-400">#{t.id}</td>
                                    <td className="py-4 px-6 text-sm font-bold text-secondary">{t.user_name || 'Guest'}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${t.type === 'payment' ? 'bg-emerald-100 text-emerald-700' :
                                            t.type === 'refund' ? 'bg-red-100 text-red-700' :
                                                t.type === 'commission' ? 'bg-primary/10 text-primary' :
                                                    t.type === 'adjustment' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                            }`}>{t.type}</span>
                                    </td>
                                    <td className={`py-4 px-6 font-bold ${t.amount < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {t.amount < 0 ? '-' : '+'}৳{Math.abs(Number(t.amount)).toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6 text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinanceOverview;
