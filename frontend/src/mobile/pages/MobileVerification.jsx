import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ChevronLeft, Shield, Upload, FileText, CheckCircle,
    XCircle, Clock, AlertCircle, Loader
} from 'lucide-react';
import { useModal } from '../../context/ModalContext';

const MobileVerification = () => {
    const navigate = useNavigate();
    const { showError, showSuccess } = useModal();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedType, setSelectedType] = useState('');
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

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            showError('File too large. Maximum size is 5MB');
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            showError('Invalid file type. Only JPG, PNG, and PDF allowed');
            return;
        }

        setUploading(true);
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
                showSuccess('Document uploaded successfully!');
                fetchDocuments();
                setSelectedType('');
            } else {
                showError(data.message || 'Upload failed');
            }
        } catch (err) {
            showError('Network error. Please try again');
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

    if (loading) {
        return (
            <div className="min-h-screen bg-navy flex items-center justify-center">
                <Loader className="animate-spin text-accent" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-navy pb-24 text-white font-sans">
            {/* Header */}
            <div className="sticky top-0 bg-navy/95 backdrop-blur-xl z-50 border-b border-white/5 px-6 py-4 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-black tracking-tight">Trust Center</h1>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Identity Verification</p>
                </div>
                <Shield className="text-accent" size={24} />
            </div>

            <div className="px-6 py-6">
                {/* Info Banner */}
                <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 mb-8 flex items-start gap-3">
                    <AlertCircle className="text-accent flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="text-sm font-bold text-white mb-1">Secure Your Account</p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Upload your documents to verify your identity and unlock premium features.
                        </p>
                    </div>
                </div>

                {/* Document Upload Cards */}
                <div className="space-y-4 mb-8">
                    {documentTypes.map((docType) => {
                        const info = getDocumentInfo(docType);
                        const existingDoc = documents.find(d => d.document_type === docType);
                        const badge = existingDoc ? getStatusBadge(existingDoc.status) : null;

                        return (
                            <motion.div
                                key={docType}
                                whileTap={{ scale: 0.98 }}
                                className="bg-navy-light border border-white/5 rounded-2xl p-5 hover:bg-white/5 transition-all"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                            <FileText size={22} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{info.title}</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">{info.desc}</p>
                                        </div>
                                    </div>
                                    {badge && (
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                                            <badge.icon size={12} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">{badge.label}</span>
                                        </div>
                                    )}
                                </div>

                                {existingDoc?.verification_notes && (
                                    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 mb-3">
                                        <p className="text-xs text-red-400 font-medium">{existingDoc.verification_notes}</p>
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
                                    <div className={`w-full py-3 rounded-xl border-2 border-dashed ${uploading ? 'border-gray-700 bg-gray-900/50' : 'border-accent/30 bg-accent/5 hover:bg-accent/10'} flex items-center justify-center gap-2 cursor-pointer transition-all`}>
                                        {uploading ? (
                                            <>
                                                <Loader className="animate-spin" size={18} />
                                                <span className="text-sm font-bold text-gray-400">Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={18} className="text-accent" />
                                                <span className="text-sm font-bold text-accent">
                                                    {existingDoc ? 'Re-upload' : 'Upload'} Document
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </label>

                                {existingDoc && (
                                    <p className="text-[10px] text-gray-600 mt-2 text-center">
                                        Uploaded {new Date(existingDoc.created_at).toLocaleDateString()}
                                    </p>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Help Section */}
                <div className="bg-navy-light/30 border border-white/5 rounded-2xl p-5">
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                        <Shield size={18} className="text-accent" />
                        Security & Privacy
                    </h3>
                    <ul className="space-y-2 text-xs text-gray-400">
                        <li className="flex items-start gap-2">
                            <CheckCircle size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>All documents are encrypted and stored securely</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>Verification typically takes 24-48 hours</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>Accepted formats: JPG, PNG, PDF (max 5MB)</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default MobileVerification;
