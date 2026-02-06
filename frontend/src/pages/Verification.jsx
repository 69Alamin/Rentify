import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ChevronLeft, Shield, Upload, FileText, CheckCircle,
    XCircle, Clock, AlertCircle, Loader, Award
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
            setMessage({ type: 'error', text: 'File too large. Maximum size is 5MB' });
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setMessage({ type: 'error', text: 'Invalid file type. Only JPG, PNG, and PDF allowed' });
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
                setMessage({ type: 'success', text: 'Document uploaded successfully!' });
                fetchDocuments();
            } else {
                setMessage({ type: 'error', text: data.message || 'Upload failed' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error. Please try again' });
        } finally {
            setUploading(false);
        }
    };

    const getDocumentInfo = (type) => {
        const info = {
            'license': { title: 'Driving License', desc: 'Upload your valid driving license' },
            'nid': { title: 'National ID', desc: 'Upload your NID card (front & back)' },
            'trade_license': { title: 'Trade License', desc: 'Upload your business trade license' }
        };
        return info[type] || { title: type, desc: '' };
    };

    const getStatusBadge = (status) => {
        const badges = {
            'verified': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: CheckCircle, label: 'Verified' },
            'pending': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', icon: Clock, label: 'Pending Review' },
            'rejected': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', icon: XCircle, label: 'Rejected' }
        };
        return badges[status] || badges['pending'];
    };

    const documentTypes = user.role === 'vendor'
        ? ['trade_license', 'nid']
        : user.role === 'driver' || user.role === 'rider'
            ? ['license', 'nid']
            : ['nid']; // Customers only need NID

    const verifiedCount = documents.filter(d => d.is_verified === 1).length;
    const totalRequired = documentTypes.length;

    if (loading) {
        return (
            <div className="min-h-screen bg-navy flex items-center justify-center">
                <Loader className="animate-spin text-accent" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-navy text-white">
            {/* Header */}
            <div className="bg-gradient-to-b from-primary/20 to-navy border-b border-white/5">
                <div className="max-w-6xl mx-auto px-8 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight">Trust Center</h1>
                                <p className="text-sm text-gray-400 font-medium mt-1">Identity Verification System</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-accent/10 border border-accent/20 rounded-2xl px-5 py-3">
                            <Award className="text-accent" size={24} />
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Verification Progress</p>
                                <p className="text-xl font-black text-accent">{verifiedCount}/{totalRequired} Verified</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-8 py-10">
                {/* Message Box */}
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-6 p-4 rounded-xl border ${message.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}
                    >
                        <p className="font-bold">{message.text}</p>
                    </motion.div>
                )}

                {/* Info Banner */}
                <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 mb-10 flex items-start gap-4">
                    <AlertCircle className="text-accent flex-shrink-0 mt-1" size={28} />
                    <div>
                        <p className="text-lg font-bold text-white mb-2">Secure Your Account & Unlock Premium Features</p>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Upload your verification documents to build trust with our community. All documents are encrypted and stored securely.
                            Verification typically takes 24-48 hours.
                        </p>
                    </div>
                </div>

                {/* Document Cards Grid */}
                <div className="grid grid-cols-2 gap-6 mb-10">
                    {documentTypes.map((docType) => {
                        const info = getDocumentInfo(docType);
                        const existingDoc = documents.find(d => d.document_type === docType);
                        const badge = existingDoc ? getStatusBadge(existingDoc.status) : null;

                        return (
                            <motion.div
                                key={docType}
                                whileHover={{ scale: 1.02 }}
                                className="bg-navy-light border border-white/5 rounded-3xl p-8 hover:bg-white/5 transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                                            <FileText size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{info.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{info.desc}</p>
                                        </div>
                                    </div>
                                </div>

                                {badge && (
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${badge.bg} ${badge.text} ${badge.border} mb-4`}>
                                        <badge.icon size={16} />
                                        <span className="text-xs font-black uppercase tracking-widest">{badge.label}</span>
                                    </div>
                                )}

                                {existingDoc?.verification_notes && (
                                    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 mb-4">
                                        <p className="text-sm text-red-400 font-medium">{existingDoc.verification_notes}</p>
                                    </div>
                                )}

                                <label className="block">
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => handleFileUpload(e, docType)}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                    <div className={`w-full py-4 rounded-xl border-2 border-dashed ${uploading ? 'border-gray-700 bg-gray-900/50' : 'border-accent/30 bg-accent/5 hover:bg-accent/10'} flex items-center justify-center gap-3 cursor-pointer transition-all`}>
                                        {uploading ? (
                                            <>
                                                <Loader className="animate-spin" size={22} />
                                                <span className="font-bold text-gray-400">Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={22} className="text-accent" />
                                                <span className="font-bold text-accent">
                                                    {existingDoc ? 'Re-upload' : 'Upload'} Document
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </label>

                                {existingDoc && (
                                    <p className="text-xs text-gray-600 mt-3 text-center">
                                        Uploaded on {new Date(existingDoc.created_at).toLocaleDateString()}
                                    </p>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Security Info */}
                <div className="bg-navy-light/50 border border-white/5 rounded-2xl p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <Shield size={24} className="text-accent" />
                        Security & Privacy
                    </h3>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-emerald-400 flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-bold text-white mb-1">End-to-End Encryption</p>
                                <p className="text-sm text-gray-400">All documents are encrypted and stored securely</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-emerald-400 flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-bold text-white mb-1">Fast Processing</p>
                                <p className="text-sm text-gray-400">Verification typically takes 24-48 hours</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-emerald-400 flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-bold text-white mb-1">Multiple Formats</p>
                                <p className="text-sm text-gray-400">Accepted: JPG, PNG, PDF (max 5MB)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Verification;
