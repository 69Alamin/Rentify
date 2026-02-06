import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Zap } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';

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
                showSuccess('Economic vector adjusted');
            } else {
                showError(data.message);
            }
        } catch (err) {
            showError('Economic protocol breach');
        }
    };

    const deleteRule = async (id) => {
        showConfirm('Decommission this pricing vector? Global economic equilibrium will be affected.', async () => {
            try {
                const res = await fetch(`/api/admin/pricing.php?id=${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                fetchRules();
                showSuccess('Vector decommissioned');
            } catch (err) {
                console.error(err);
            }
        }, 'Authorize Deletion');
    };

    return (
        <div className="space-y-12 animate-fade-in">
            <div className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 group-hover:opacity-100 opacity-50 transition-opacity" />
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black text-white italic tracking-tighter leading-none flex items-center gap-4 uppercase">
                            <Zap className="text-primary animate-pulse" size={32} />
                            SURGE PROTOCOLS
                        </h2>
                        <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2">Dynamic Economic Equilibrium Matrix</div>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-orange-600 transition-all shadow-xl shadow-primary/20 active:scale-95"
                    >
                        <Plus size={18} /> {showForm ? 'CLOSE CONSOLE' : 'INITIATE VECTOR'}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2.5rem] border border-primary/20 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary/5 blur-[50px] rounded-full" />

                        <form onSubmit={addRule} className="flex flex-col md:flex-row gap-8 items-end relative z-10">
                            <div className="flex-1 w-full space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Vector Identifier</label>
                                <input
                                    type="text"
                                    placeholder="e.g. NIGHT_PEAK_01"
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white italic placeholder:text-slate-600 focus:border-primary/50 focus:bg-white/[0.05] transition-all outline-none uppercase tracking-tighter"
                                    value={newRule.rule_name}
                                    onChange={e => setNewRule({ ...newRule, rule_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="w-full md:w-48 space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Economic Multiplier</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-primary italic focus:border-primary/50 focus:bg-white/[0.05] transition-all outline-none"
                                    value={newRule.multiplier}
                                    onChange={e => setNewRule({ ...newRule, multiplier: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full md:w-auto bg-primary text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-xl shadow-primary/20 active:scale-95">
                                AUTHORIZE VECTOR
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode='popLayout'>
                    {rules.map((r, i) => (
                        <motion.div
                            key={r.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 group hover:bg-white/[0.05] transition-all relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-center gap-6 relative z-10 mb-8">
                                <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center font-black text-primary text-xl italic tracking-tighter">
                                    {r.multiplier}x
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="font-black text-white text-lg italic tracking-tighter uppercase truncate leading-none mb-2">{r.rule_name}</h3>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-primary" />
                                        {r.hotel_name || 'GLOBAL_PROTOCOL'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center bg-white/[0.02] -mx-8 -mb-8 px-8 py-6 border-t border-white/5 relative z-10 group-hover:bg-white/[0.04] transition-colors">
                                <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] italic">ACTIVE_SURGE_SIGNAL</div>
                                <button
                                    onClick={() => deleteRule(r.id)}
                                    className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-400 border border-slate-500/20 flex items-center justify-center hover:bg-rose-500/20 hover:text-rose-400 transition-all hover:rotate-90"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PricingRules;
