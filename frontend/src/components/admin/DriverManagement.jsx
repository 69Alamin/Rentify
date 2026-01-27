import React, { useState, useEffect } from 'react';
import { Loader, Check, X, Truck, User } from 'lucide-react';
import { useModal } from '../../context/ModalContext';

const DriverManagement = () => {
    const { showSuccess, showError, showConfirm } = useModal();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/drivers.php', { credentials: 'include' });
            const data = await res.json();
            if (data.success) setDrivers(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const verifyDriver = async (id, status) => {
        try {
            const res = await fetch('/api/admin/drivers.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'verify', driver_id: id, is_verified: status ? 1 : 0 }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                showSuccess(data.message);
                fetchDrivers();
            }
        } catch (err) {
            showError('Error updating driver status');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-secondary flex items-center gap-2"><Truck className="text-primary" /> Driver Fleet</h2>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr className="border-b border-gray-100">
                                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">Driver Info</th>
                                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">Vehicle</th>
                                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">Status</th>
                                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="4" className="py-12 text-center"><Loader className="animate-spin inline text-primary" /></td></tr>
                            ) : drivers.length === 0 ? (
                                <tr><td colSpan="4" className="py-12 text-center text-gray-400">No registered drivers</td></tr>
                            ) : drivers.map(d => (
                                <tr key={d.id} className="hover:bg-gray-50/50">
                                    <td className="py-4 px-6">
                                        <div className="font-bold text-secondary">{d.full_name}</div>
                                        <div className="text-xs text-gray-400">{d.email}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="text-sm font-bold text-gray-600">{d.vehicle_model || 'N/A'}</div>
                                        <div className="text-[10px] text-gray-400 bg-gray-100 inline-block px-1 rounded">{d.vehicle_number || 'No Plate'}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col gap-1 items-start">
                                            {d.is_verified ?
                                                <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded flex items-center gap-1"><Check size={8} /> Verified</span> :
                                                <span className="text-[10px] font-bold bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded">Pending</span>
                                            }
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${d.online_status === 'online' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                                {d.online_status?.toUpperCase() || 'OFFLINE'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => verifyDriver(d.id, !d.is_verified)}
                                            className={`p-2 rounded-lg transition-colors ${d.is_verified ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                                            title={d.is_verified ? "Revoke Verification" : "Verify Driver"}
                                        >
                                            {d.is_verified ? <X size={16} /> : <Check size={16} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DriverManagement;
