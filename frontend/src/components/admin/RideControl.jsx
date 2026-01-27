import React, { useState, useEffect } from 'react';
import { Loader, MapPin, Navigation, X } from 'lucide-react';
import { useModal } from '../../context/ModalContext';

const RideControl = () => {
    const { showSuccess, showError, showConfirm } = useModal();
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRides();
    }, []);

    const fetchRides = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/rides.php', { credentials: 'include' });
            const data = await res.json();
            if (data.success) setRides(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const cancelRide = async (id) => {
        showConfirm('Are you sure you want to cancel this ride request?', async () => {
            try {
                const res = await fetch('/api/admin/rides.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'cancel', ride_id: id }),
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.success) {
                    showSuccess('Ride cancelled');
                    fetchRides();
                } else {
                    showError(data.message);
                }
            } catch (err) {
                showError('Error cancelling ride');
            }
        }, 'Cancel Ride');
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-secondary flex items-center gap-2"><Navigation className="text-blue-500" /> Active Rides</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 flex justify-center"><Loader className="animate-spin text-primary" /></div>
                ) : rides.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-400">No active ride requests</div>
                ) : rides.map(r => (
                    <div key={r.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-100 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${r.status === 'requested' ? 'bg-yellow-100 text-yellow-600' :
                                r.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                                    r.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>{r.status}</span>
                            <div className="text-xs font-bold text-gray-400">#{r.id}</div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-start gap-2">
                                <div className="mt-1"><MapPin size={14} className="text-green-500" /></div>
                                <div className="text-sm font-medium text-secondary line-clamp-2">{r.pickup_address}</div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="mt-1"><MapPin size={14} className="text-red-500" /></div>
                                <div className="text-sm font-medium text-secondary line-clamp-2">{r.destination_address}</div>
                            </div>
                        </div>

                        <div className="flex justify-between items-end border-t border-gray-50 pt-4">
                            <div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Driver</div>
                                <div className="text-xs font-bold text-secondary">{r.driver_name || 'Not Assigned'}</div>
                            </div>
                            {r.status !== 'cancelled' && r.status !== 'completed' && (
                                <button onClick={() => cancelRide(r.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RideControl;
