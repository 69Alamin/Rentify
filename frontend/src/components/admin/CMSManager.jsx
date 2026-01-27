import React, { useState, useEffect } from 'react';
import { Save, FileText, Loader } from 'lucide-react';
import { useModal } from '../../context/ModalContext';

const CMSManager = () => {
    const { showSuccess, showError, showConfirm } = useModal();
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('privacy_policy');

    const sections = [
        { key: 'privacy_policy', label: 'Privacy Policy' },
        { key: 'terms_conditions', label: 'Terms & Conditions' },
        { key: 'about_us', label: 'About Us' },
        { key: 'contact_email', label: 'Support Email' }
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
            if (data.success) showSuccess('Saved successfully');
        } catch (err) {
            showError('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 min-h-[600px]">
            {/* Sidebar */}
            <div className="w-full md:w-64 flex flex-col gap-2">
                {sections.map(s => (
                    <button
                        key={s.key}
                        onClick={() => setActiveSection(s.key)}
                        className={`text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeSection === s.key ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Editor Area */}
            <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-secondary flex items-center gap-2"><FileText size={18} /> Editing: {sections.find(s => s.key === activeSection)?.label}</h3>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-green-500 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-green-600 disabled:opacity-50"
                    >
                        {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />} Save Changes
                    </button>
                </div>

                {loading ? <div className="flex-1 flex items-center justify-center"><Loader className="animate-spin text-primary" /></div> : (
                    <textarea
                        className="flex-1 w-full bg-gray-50 border-none rounded-xl p-6 font-mono text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                        value={content[activeSection] || ''}
                        onChange={e => setContent({ ...content, [activeSection]: e.target.value })}
                        placeholder="Enter content here..."
                    />
                )}
            </div>
        </div>
    );
};

export default CMSManager;
