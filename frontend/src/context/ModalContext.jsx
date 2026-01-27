import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, XCircle, HelpCircle, X } from 'lucide-react';

const ModalContext = createContext(null);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error('useModal must be used within a ModalProvider');
    return context;
};

export const ModalProvider = ({ children }) => {
    const [modal, setModal] = useState({
        isOpen: false,
        type: 'info', // 'success', 'error', 'warning', 'info', 'confirm'
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null,
        confirmText: 'OK',
        cancelText: 'Cancel'
    });

    const showModal = useCallback(({ type = 'info', title, message, onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancel' }) => {
        setModal({
            isOpen: true,
            type,
            title: title || (type.charAt(0).toUpperCase() + type.slice(1)),
            message,
            onConfirm,
            onCancel,
            confirmText: type === 'confirm' ? (confirmText === 'OK' ? 'Confirm' : confirmText) : confirmText,
            cancelText
        });
    }, []);

    const hideModal = useCallback(() => {
        setModal(prev => ({ ...prev, isOpen: false }));
    }, []);

    // Helper functions for easy access
    const showAlert = useCallback((message, type = 'info', title = null) => {
        showModal({ type, title, message });
    }, [showModal]);

    const showSuccess = useCallback((message, title = 'Success') => {
        showAlert(message, 'success', title);
    }, [showAlert]);

    const showError = useCallback((message, title = 'Error') => {
        showAlert(message, 'error', title);
    }, [showAlert]);

    const showConfirm = useCallback((message, onConfirm, title = 'Confirm Action') => {
        showModal({
            type: 'confirm',
            title,
            message,
            onConfirm: () => {
                hideModal();
                if (onConfirm) onConfirm();
            },
            onCancel: hideModal
        });
    }, [showModal, hideModal]);

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="text-green-500" size={48} />;
            case 'error': return <XCircle className="text-red-500" size={48} />;
            case 'warning': return <AlertCircle className="text-yellow-500" size={48} />;
            case 'confirm': return <HelpCircle className="text-primary" size={48} />;
            default: return <Info className="text-blue-500" size={48} />;
        }
    };

    const getTypeStyles = (type) => {
        switch (type) {
            case 'success': return 'bg-green-50 text-green-700 border-green-100';
            case 'error': return 'bg-red-50 text-red-700 border-red-100';
            case 'warning': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            case 'confirm': return 'bg-primary/5 text-primary border-primary/10';
            default: return 'bg-blue-50 text-blue-700 border-blue-100';
        }
    };

    return (
        <ModalContext.Provider value={{ showAlert, showSuccess, showError, showConfirm, hideModal }}>
            {children}

            <AnimatePresence>
                {modal.isOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={modal.type !== 'confirm' ? hideModal : undefined}
                            className="absolute inset-0 bg-secondary/80 backdrop-blur-md"
                        />

                        {/* Modal Card */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden p-8 border border-gray-100"
                        >
                            <button
                                onClick={hideModal}
                                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-gray-200/50 ${getTypeStyles(modal.type)}`}>
                                    {getIcon(modal.type)}
                                </div>

                                <h3 className="text-2xl font-black text-secondary mb-2 italic tracking-tight">
                                    {modal.title}
                                </h3>

                                <p className="text-gray-500 font-medium leading-relaxed">
                                    {modal.message}
                                </p>

                                <div className="mt-8 flex gap-3 w-full">
                                    {modal.type === 'confirm' && (
                                        <button
                                            onClick={() => {
                                                if (modal.onCancel) modal.onCancel();
                                                hideModal();
                                            }}
                                            className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                                        >
                                            {modal.cancelText}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (modal.onConfirm) modal.onConfirm();
                                            else hideModal();
                                        }}
                                        className={`flex-1 py-4 rounded-2xl font-black italic shadow-lg transition-all hover:scale-105 active:scale-95 ${modal.type === 'error' ? 'bg-red-500 text-white shadow-red-500/20' :
                                                modal.type === 'success' ? 'bg-green-500 text-white shadow-green-500/20' :
                                                    'bg-primary text-white shadow-primary/20'
                                            }`}
                                    >
                                        {modal.confirmText}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </ModalContext.Provider>
    );
};
