import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, Trash2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useModal } from '../../context/ModalContext';
import riderApi from '../../services/riderApi';

const DocumentUpload = () => {
  const { showSuccess, showError, showConfirm } = useModal();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentForm, setDocumentForm] = useState({
    document_type: 'license',
    expiry_date: '',
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await riderApi.getDocuments();
      setDocuments(data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setDocumentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    if (!documentForm.expiry_date) {
      setError('Please select expiry date');
      return;
    }

    try {
      setUploading(true);
      const result = await riderApi.uploadDocument(
        selectedFile,
        documentForm.document_type,
        documentForm.expiry_date
      );

      if (result.success) {
        setDocuments([...documents, result.data]);
        setSelectedFile(null);
        setDocumentForm({
          document_type: 'license',
          expiry_date: '',
        });
        setError(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertCircle },
      verified: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
      expired: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    const IconComponent = statusInfo.icon;

    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
        <IconComponent className="w-3 h-3" />
        <span className="capitalize">{status}</span>
      </div>
    );
  };

  const getDocumentLabel = (type) => {
    const labels = {
      license: 'Driving License',
      nid: 'National ID',
      papers: 'Vehicle Papers',
      registration: 'Vehicle Registration',
      insurance: 'Vehicle Insurance',
    };
    return labels[type] || type;
  };

  const isDocumentExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FileText className="w-6 h-6" />
        Documents & Verification
      </h2>

      {/* Upload Form */}
      <div className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-200">
        <h3 className="font-semibold text-lg mb-4">Upload New Document</h3>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select
              name="document_type"
              value={documentForm.document_type}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="license">Driving License</option>
              <option value="nid">National ID</option>
              <option value="papers">Vehicle Papers</option>
              <option value="registration">Vehicle Registration</option>
              <option value="insurance">Vehicle Insurance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date
            </label>
            <input
              type="date"
              name="expiry_date"
              value={documentForm.expiry_date}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Upload (JPG, PNG, PDF - Max 5MB)
            </label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-blue-100 transition">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="font-medium text-gray-700">
                  {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-600">JPG, PNG or PDF</p>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      </div>

      {/* Documents List */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Your Documents</h3>

        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No documents uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map(doc => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold">{getDocumentLabel(doc.document_type)}</h4>
                      {getStatusBadge(doc.verification_status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Uploaded</p>
                        <p className="font-medium">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600 text-xs mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Expiry Date
                        </p>
                        <p className={`font-medium ${isDocumentExpired(doc.expiry_date) ? 'text-red-600' : 'text-gray-900'
                          }`}>
                          {new Date(doc.expiry_date).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600 text-xs mb-1">File</p>
                        <p className="font-medium text-blue-600 cursor-pointer hover:underline">
                          View
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600 text-xs mb-1">Actions</p>
                        <button
                          onClick={() => {
                            showConfirm('Are you sure you want to delete this document?', () => {
                              setDocuments(documents.filter(d => d.id !== doc.id));
                              showSuccess('Document removed from current view');
                            }, 'Delete Document');
                          }}
                          className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>

                    {doc.verification_notes && (
                      <div className="mt-3 bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-600">
                          <span className="font-semibold">Admin Notes:</span> {doc.verification_notes}
                        </p>
                      </div>
                    )}

                    {isDocumentExpired(doc.expiry_date) && (
                      <div className="mt-3 bg-red-50 rounded p-2 border border-red-200">
                        <p className="text-xs text-red-700 font-semibold">
                          ⚠️ This document has expired. Please upload a new one.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-amber-50 rounded-lg p-4 border border-amber-200">
        <p className="text-sm text-amber-700">
          <span className="font-semibold">📋 Requirements:</span>
        </p>
        <ul className="text-sm text-amber-700 mt-2 list-disc list-inside space-y-1">
          <li>Driving License is mandatory</li>
          <li>Vehicle papers and registration required</li>
          <li>All documents must be valid and not expired</li>
          <li>Admin verification required before going live</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default DocumentUpload;
