import React, { useState, useEffect } from 'react';
import { Send, Bell, Loader } from 'lucide-react';
import { useModal } from '../../context/ModalContext';

const NotificationCenter = () => {
    const { showSuccess, showError, showConfirm } = useModal();
    const [notifications, setNotifications] = useState([]);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetGroup, setTargetGroup] = useState('all');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/notifications.php', { credentials: 'include' });
            const data = await res.json();
            if (data.success) setNotifications(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const sendNotification = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const res = await fetch('/api/admin/notifications.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, message, type: 'info', target_group: targetGroup }),
                credentials: 'include'
            });

            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (parseErr) {
                console.error('Response parsing error:', text);
                showError('Server error: ' + text.substring(0, 200));
                return;
            }

            if (data.success) {
                showSuccess('Sent Successfully!');
                setTitle('');
                setMessage('');
                fetchHistory();
            } else {
                showError('Failed: ' + (data.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Network error:', err);
            showError('Network Error: ' + err.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sender Form */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-3xl shadow-lg shadow-primary/5 border border-primary/10">
                    <h3 className="font-bold text-secondary mb-4 flex items-center gap-2"><Send size={18} className="text-primary" /> Send Announcement</h3>
                    <form onSubmit={sendNotification} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Title</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 font-bold text-secondary focus:ring-2 focus:ring-primary outline-none"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="System Update"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Target Audience</label>
                            <select
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 font-bold text-secondary focus:ring-2 focus:ring-primary outline-none"
                                value={targetGroup}
                                onChange={e => setTargetGroup(e.target.value)}
                            >
                                <option value="all">Global Blast (All Users)</option>
                                <option value="customer">Customers Only</option>
                                <option value="vendor">Vendors Only</option>
                                <option value="driver">Drivers Only</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Message</label>
                            <textarea
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 font-medium text-secondary focus:ring-2 focus:ring-primary outline-none h-32 resize-none"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="We'll be down for maintenance..."
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {sending ? <Loader className="animate-spin" size={18} /> : <Bell size={18} />}
                            {targetGroup === 'all' ? 'Blast to All Users' : `Blast to ${targetGroup.charAt(0).toUpperCase() + targetGroup.slice(1)}s`}
                        </button>
                    </form>
                </div>
            </div>

            {/* History Feed */}
            <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-secondary text-lg">Recent Alerts</h3>
                {loading ? <div className="text-center py-12"><Loader className="animate-spin inline text-primary" /></div> : (
                    notifications.length === 0 ? <p className="text-gray-400 text-center py-8">No history</p> :
                        notifications.map(n => (
                            <div key={n.id} className="bg-white p-4 rounded-xl border border-gray-100 flex gap-4 items-start">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 shrink-0">
                                    <Bell size={18} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-secondary text-sm">{n.title}</h4>
                                    <p className="text-gray-500 text-xs mt-1">{n.message}</p>
                                    <div className="text-[10px] text-gray-400 mt-2">{new Date(n.created_at).toLocaleString()} • Global</div>
                                </div>
                            </div>
                        ))
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;
