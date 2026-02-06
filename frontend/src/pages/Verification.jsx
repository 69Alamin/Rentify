import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Shield, Upload, FileText, CheckCircle,
    XCircle, Clock, AlertCircle, Loader, Award, Lock, ScanLine
} from 'lucide-react';

const Verification = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await fetch('/api/verification/status.php', { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setDocuments(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch documents', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e, docType) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'PROTOCOL ALERT: File exceeds 5MB limit.' });
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setMessage({ type: 'error', text: 'FORMAT ERROR: Only JPG, PNG, and PDF allowed.' });
            return;
        }

        setUploading(true);
        setMessage({ type: '', text: '' });
        const formData = new FormData();
        formData.append('document', file);
        formData.append('document_type', docType);

        try {
            const res = await fetch('/api/verification/upload.php', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'UPLOAD SUCCESS: Document securely archived.' });
                fetchDocuments();
            } else {
                setMessage({ type: 'error', text: data.message || 'UPLOAD FAILED: Server rejected payload.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'NETWORK OUTAGE: Connection disrupted.' });
        } finally {
            setUploading(false);
        }
    };

    const getDocumentInfo = (type) => {
        const info = {
            'license': { title: 'Driving Credentials', desc: 'Valid commercial or private license' },
            'nid': { title: 'National Identity', desc: 'Government issued ID card (Both sides)' },
            'trade_license': { title: 'Trade License', desc: 'Business authorization certificate' }
        };
        return info[type] || { title: type.replace('_', ' '), desc: 'Official documentation' };
    };

    const getStatusBadge = (status) => {
        const badges = {
            'verified': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: CheckCircle, label: 'VERIFIED' },
            'pending': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: Clock, label: 'AWAITING APPROVAL' },
            'rejected': { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', icon: XCircle, label: 'REJECTED' }
        };
        return badges[status] || badges['pending'];
    };

    const documentTypes = user.role === 'vendor'
        ? ['trade_license', 'nid']
        : user.role === 'driver' || user.role === 'rider'
            ? ['license', 'nid']
            : ['nid'];

    const verifiedCount = documents.filter(d => d.is_verified === 1).length;
    const totalRequired = documentTypes.length;
    const progress = (verifiedCount / totalRequired) * 100;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
                <Loader className="animate-spin text-primary" size={40} />
                <p className="font-black tracking-[0.3em] text-[10px] text-slate-500 uppercase animate-pulse">Establishing Secure Connection...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-primary/30 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6 w-full md:w-auto">
                            <button
                                onClick={() => navigate(-1)}
                                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:scale-105 transition-all group"
                            >
                                <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase flex items-center gap-3">
                                    Trust <span className="text-primary not-italic tracking-tight">Center</span>
                                    <Shield size={24} className="text-primary/50" />
                                </h1>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Identity Verification Protocol</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 w-full md:w-auto bg-white/[0.02] border border-white/5 rounded-2xl p-4 md:px-8 md:py-4">
                            <div className="relative">
                                <svg className="w-16 h-16 transform -rotate-90">
                                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="175.9" strokeDashoffset={175.9 - (175.9 * progress) / 100} className="text-primary shadow-[0_0_10px_rgba(255,107,0,0.5)] transition-all duration-1000" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">
                                    {Math.round(progress)}%
                                </div>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Clearance Level</p>
                                <p className="text-xl font-black text-white italic tracking-tight">{verifiedCount}/{totalRequired} VERIFIED</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-fade-in">
                {/* Status Message */}
                <AnimatePresence mode="wait">
                    {message.text && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -20, height: 0 }}
                            className={`rounded-2xl border px-6 py-4 flex items-center gap-4 shadow-2xl ${message.type === 'success'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                }`}
                        >
                            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <p className="font-bold text-xs uppercase tracking-wider">{message.text}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Secure Vault Info */}
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
                        <Lock size={200} />
                    </div>
                    <div className="flex items-start gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(255,107,0,0.3)]">
                            <Shield size={32} />
                        </div>
                        <div className="space-y-2 max-w-2xl">
                            <h2 className="text-xl font-black text-white italic tracking-tight uppercase">Encryption Protocol Active</h2>
                            <p className="text-sm font-medium text-slate-400 leading-relaxed">
                                All uploaded documentation is encrypted using AES-256 standards and stored in isolated secure containers.
                                Verification processing typically completes within 24-48 hours of submission.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {documentTypes.map((docType) => {
                        const info = getDocumentInfo(docType);
                        const existingDoc = documents.find(d => d.document_type === docType);
                        const badge = existingDoc ? getStatusBadge(existingDoc.status) : null;

                        return (
                            <motion.div
                                key={docType}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 cursor-default"
                            >
                                {/* Holographic Corner Accent */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rounded-tr-[2.5rem] rounded-bl-[4rem] opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex items-start justify-between mb-8 relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-[#0F172A] border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg">
                                            {docType === 'license' ? <Award size={28} /> :
                                                docType === 'nid' ? <ScanLine size={28} /> :
                                                    <FileText size={28} />}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white italic tracking-tight uppercase">{info.title}</h3>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{info.desc}</p>
                                        </div>
                                    </div>

                                    {badge && (
                                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${badge.bg} ${badge.text} ${badge.border} shadow-lg`}>
                                            <badge.icon size={14} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">{badge.label}</span>
                                        </div>
                                    )}
                                </div>

                                {existingDoc?.verification_notes && (
                                    <div className="mb-6 p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-400 text-xs font-bold uppercase tracking-wide flex items-start gap-3">
                                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                        <span>Correction Required: {existingDoc.verification_notes}</span>
                                    </div>
                                )}

                                <div className="relative z-10">
                                    <input
                                        type="file"
                                        id={`upload-${docType}`}
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => handleFileUpload(e, docType)}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor={`upload-${docType}`}
                                        className={`w-full h-32 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 group/upload ${uploading
                                                ? 'border-slate-700 bg-slate-900/50 cursor-not-allowed'
                                                : 'border-white/10 bg-white/[0.02] hover:bg-primary/5 hover:border-primary/30'
                                            }`}
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader className="animate-spin text-slate-500" size={24} />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Encrypting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover/upload:text-primary group-hover/upload:scale-110 transition-all">
                                                    <Upload size={20} />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/upload:text-white transition-colors">
                                                    {existingDoc ? 'Update Document' : 'Initiate Upload'}
                                                </span>
                                            </>
                                        )}
                                    </label>

                                    {existingDoc && (
                                        <div className="text-center mt-4">
                                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                                                Last Archive: {new Date(existingDoc.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Footer Security Badge */}
                <div className="flex justify-center pt-8 border-t border-white/5 opacity-50">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <Shield size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SSL Encrypted</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Manual Audit</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ScanLine size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ISO 27001</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Verification;
