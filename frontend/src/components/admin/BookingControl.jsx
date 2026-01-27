import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Loader, AlertTriangle, Check, X } from 'lucide-react';
import { useModal } from '../../context/ModalContext';

const BookingControl = () => {
    const { showSuccess, showError, showConfirm } = useModal();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/bookings_control.php', { credentials: 'include' });
            const data = await res.json();
            if (data.success) setBookings(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            let url = '/api/admin/bookings_control.php';
            let body = { booking_id: id, action };

            if (action === 'cancel') {
                // Use unified cancellation endpoint
                url = '/api/bookings/cancel.php';
                body = { booking_id: id };

                showConfirm(
                    'Are you sure you want to cancel this booking? This will refund the user (if applicable) and free the room.',
                    async () => {
                        try {
                            const res = await fetch(url, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(body),
                                credentials: 'include'
                            });
                            const data = await res.json();
                            if (data.success) {
                                showSuccess('Booking cancelled successfully');
                                fetchBookings();
                            } else {
                                showError(data.message);
                            }
                        } catch (err) {
                            showError('Action failed');
                        }
                    },
                    'Confirm Admin Cancellation'
                );
                return;
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                showSuccess(data.message);
                fetchBookings();
            } else {
                showError(data.message);
            }
        } catch (err) {
            showError('Action failed');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-secondary">Booking Control</h2>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr className="border-b border-gray-100">
                                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">ID</th>
                                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">Guest & Hotel</th>
                                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">Schedule</th>
                                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400">Status</th>
                                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="5" className="py-12 text-center"><Loader className="animate-spin inline text-primary" /></td></tr>
                            ) : bookings.map(b => (
                                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6 font-bold text-gray-400">
                                        #{b.id}
                                        {parseInt(b.is_emergency) === 1 && (
                                            <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-black tracking-wider">
                                                SOS
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="font-bold text-secondary">{b.hotel_name}</div>
                                        <div className="text-xs text-gray-500">{b.user_name}</div>
                                        <div className="text-[10px] text-gray-400">{b.room_type} Room {b.room_number}</div>
                                    </td>
                                    <td className="py-4 px-6 text-xs text-gray-500">
                                        <div className="flex items-center gap-1"><Calendar size={12} /> {new Date(b.check_in_time).toLocaleDateString()}</div>
                                        <div className="flex items-center gap-1 mt-1"><Clock size={12} /> {new Date(b.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${b.booking_status === 'confirmed' ? 'bg-green-100 text-green-600' :
                                            b.booking_status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                            }`}>{b.booking_status}</span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            {b.booking_status === 'pending' && (
                                                <button onClick={() => handleAction(b.id, 'approve')} className="p-2 text-green-500 hover:bg-green-50 rounded-lg" title="Approve">
                                                    <Check size={16} />
                                                </button>
                                            )}
                                            {b.booking_status !== 'cancelled' && b.booking_status !== 'completed' && (
                                                <button onClick={() => handleAction(b.id, 'cancel')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Cancel & Refund">
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
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

export default BookingControl;
