import React, { useState, useEffect } from 'react';
import { Save, FileText, Loader } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';

const CMSManager = () => {
    const { showSuccess, showError, showConfirm } = useModal();
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('privacy_policy');

    const sections = [
        { key: 'privacy_policy', label: 'Privacy Protocol' },
        { key: 'terms_conditions', label: 'Terms of Engagement' },
        { key: 'about_us', label: 'Project Intelligence' },
        { key: 'contact_email', label: 'Direct Support Uplink' }
    ];

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/content_cms.php', { credentials: 'include' });
            const data = await res.json();
            if (data.success) setContent(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/content_cms.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: activeSection, value: content[activeSection] }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) showSuccess('Database entry synchronized');
        } catch (err) {
            showError('Synchronization protocol failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-12 animate-fade-in">
            <div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter leading-none flex items-center gap-4 uppercase">
                    <FileText size={32} className="text-primary animate-pulse" />
                    CONTENT OVERRIDE CONSOLE
                </h2>
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2">Global Data Matrix & Documentation Control</div>
            </div>

            <div className="flex flex-col xl:flex-row gap-12 min-h-[700px]">
                {/* Sidebar Navigation */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full xl:w-80 flex flex-col gap-4"
                >
                    <div className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -mr-16 -mt-16 opacity-30 pointer-events-none" />
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 px-4">Navigation Vectors</div>
                        <div className="space-y-2">
                            {sections.map(s => (
                                <button
                                    key={s.key}
                                    onClick={() => setActiveSection(s.key)}
                                    className={`w-full text-left px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden group ${activeSection === s.key
                                        ? 'text-white bg-primary shadow-xl shadow-primary/20'
                                        : 'text-slate-500 hover:text-white bg-white/[0.02] hover:bg-white/5'
                                        }`}
                                >
                                    <span className="relative z-10">{s.label}</span>
                                    {activeSection === s.key && (
                                        <motion.div layoutId="active-bg" className="absolute inset-0 bg-primary z-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Editor Module */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 flex flex-col"
                >
                    <div className="bg-white/[0.03] backdrop-blur-xl rounded-[3rem] border border-white/10 shadow-3xl flex flex-col h-full relative overflow-hidden">
                        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/5 blur-[100px] pointer-events-none" />

                        <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/[0.02]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-primary">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Editing Protocol</div>
                                    <h3 className="font-black text-white text-xl italic tracking-tighter uppercase leading-none">{sections.find(s => s.key === activeSection)?.label}</h3>
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full md:w-auto bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] italic flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 active:scale-95"
                            >
                                {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                                {saving ? 'Syncing...' : 'Authorize Changes'}
                            </button>
                        </div>

                        <div className="flex-1 p-1 pr-1.5 overflow-hidden">
                            <AnimatePresence mode='wait'>
                                {loading ? (
                                    <motion.div
                                        key="loader"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="h-full flex flex-col items-center justify-center gap-4"
                                    >
                                        <Loader className="animate-spin text-primary" size={64} />
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Retrieving Asset Stream</span>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key={activeSection}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="h-full p-8"
                                    >
                                        <textarea
                                            className="w-full h-full bg-white/[0.01] border-none text-slate-300 font-mono text-sm focus:ring-0 outline-none resize-none leading-relaxed custom-scrollbar p-6 rounded-3xl selection:bg-primary selection:text-white"
                                            value={content[activeSection] || ''}
                                            onChange={e => setContent({ ...content, [activeSection]: e.target.value })}
                                            placeholder="// Enter data packet here..."
                                            spellCheck="false"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CMSManager;
