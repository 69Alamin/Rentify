import React, { useState, useEffect } from 'react';
import { Loader, Utensils, Archive, Plus, Trash2, CheckCircle } from 'lucide-react';
import { useModal } from '../../context/ModalContext';

const FoodControl = () => {
    const { showSuccess, showError, showConfirm } = useModal();
    const [activeTab, setActiveTab] = useState('orders');
    const [items, setItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'menu' ? 'type=menu' : 'type=orders';
            const res = await fetch(`/api/admin/food.php?${endpoint}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                if (activeTab === 'menu') setItems(data.data);
                else setOrders(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (id, status) => {
        try {
            const res = await fetch('/api/admin/food.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update_order_status', order_id: id, status }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) fetchData();
        } catch (err) { showError('Failed'); }
    };

    const toggleItem = async (id, current) => {
        try {
            await fetch('/api/admin/food.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle_item', id, is_available: current ? 0 : 1 }),
                credentials: 'include'
            });
            fetchData();
        } catch (err) { }
    };

    const deleteItem = async (id) => {
        showConfirm('Delete this menu item?', async () => {
            try {
                await fetch(`/api/admin/food.php?id=${id}&type=menu`, { method: 'DELETE', credentials: 'include' });
                fetchData();
            } catch (err) { }
        }, 'Delete Item');
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b border-gray-100 pb-2">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`pb-2 px-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'orders' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-secondary'}`}
                >
                    Incoming Orders
                </button>
                <button
                    onClick={() => setActiveTab('menu')}
                    className={`pb-2 px-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'menu' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-secondary'}`}
                >
                    Global Menu
                </button>
            </div>

            {loading ? <div className="flex justify-center py-12"><Loader className="animate-spin text-primary" /></div> : (
                activeTab === 'orders' ? (
                    <div className="space-y-4">
                        {orders.length === 0 ? <p className="text-gray-400 text-center py-8">No orders yet</p> : orders.map(o => (
                            <div key={o.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-secondary text-sm">#{o.id}</span>
                                        <span className={`text-[10px] font-bold px-2 rounded ${o.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                            o.status === 'cooking' ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-600'
                                            }`}>{o.status.toUpperCase()}</span>
                                    </div>
                                    <div className="text-xs text-gray-500">Order for <b>{o.customer_name}</b> at {o.hotel_name}</div>
                                </div>
                                <div className="flex gap-2">
                                    {o.status === 'pending' && (
                                        <button onClick={() => updateOrderStatus(o.id, 'cooking')} className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-orange-600">Start Cooking</button>
                                    )}
                                    {o.status === 'cooking' && (
                                        <button onClick={() => updateOrderStatus(o.id, 'delivered')} className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-green-600">Mark Delivered</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.length === 0 ? <p className="col-span-full text-gray-400 text-center py-8">No items found</p> : items.map(i => (
                            <div key={i.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 group">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-secondary">{i.name}</h4>
                                    <span className="text-xs font-black text-primary">৳{i.price}</span>
                                </div>
                                <p className="text-xs text-gray-400 mb-4 line-clamp-2">{i.description}</p>
                                <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                                    <button
                                        onClick={() => toggleItem(i.id, i.is_available)}
                                        className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${i.is_available ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
                                    >
                                        {i.is_available ? 'AVAILABLE' : 'UNAVAILABLE'}
                                    </button>
                                    <button onClick={() => deleteItem(i.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

export default FoodControl;
