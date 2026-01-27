import React, { useState, useEffect } from 'react';
import { Tag, Trash2, Plus, Zap } from 'lucide-react';
import { useModal } from '../../context/ModalContext';

const PricingRules = () => {
    const { showSuccess, showError, showConfirm } = useModal();
    const [rules, setRules] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newRule, setNewRule] = useState({ rule_name: '', multiplier: 1.5 });

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const res = await fetch('/api/admin/pricing.php', { credentials: 'include' });
            const data = await res.json();
            if (data.success) setRules(data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const addRule = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/pricing.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRule),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                fetchRules();
                setShowForm(false);
                setNewRule({ rule_name: '', multiplier: 1.5 });
            } else {
                showError(data.message);
            }
        } catch (err) {
            showError('Failed to add rule');
        }
    };

    const deleteRule = async (id) => {
        showConfirm('Are you sure you want to delete this pricing rule?', async () => {
            try {
                const res = await fetch(`/api/admin/pricing.php?id=${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                fetchRules();
            } catch (err) {
                console.error(err);
            }
        }, 'Delete Rule');
    };

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black mb-2 flex items-center gap-2"><Zap className="text-yellow-400 fill-yellow-400" /> Dynamic Pricing</h2>
                        <p className="opacity-80">Set multipliers for peak hours or emergency zones.</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all">
                        <Plus size={18} /> New Rule
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={addRule} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Rule Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Night Peak, Rain Surge"
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 font-bold text-secondary focus:ring-2 focus:ring-purple-500 outline-none"
                                value={newRule.rule_name}
                                onChange={e => setNewRule({ ...newRule, rule_name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="w-full md:w-32">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Multiplier</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 font-bold text-secondary focus:ring-2 focus:ring-purple-500 outline-none"
                                value={newRule.multiplier}
                                onChange={e => setNewRule({ ...newRule, multiplier: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="w-full md:w-auto bg-purple-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-purple-700">
                            Save Rule
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rules.map(r => (
                    <div key={r.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-purple-200 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center font-black text-purple-600 text-lg">
                                {r.multiplier}x
                            </div>
                            <div>
                                <h3 className="font-bold text-secondary">{r.rule_name}</h3>
                                <p className="text-xs text-gray-400">{r.hotel_name || 'Global Rule'}</p>
                            </div>
                        </div>
                        <button onClick={() => deleteRule(r.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PricingRules;
