import React, { useState, useEffect } from 'react';
import { User, Upload, Edit2, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import riderApi from '../../services/riderApi';

const RiderProfile = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    vehicle_type: 'car',
    vehicle_number: '',
    vehicle_name: '',
    license_number: '',
    license_expiry: '',
    bank_account: '',
    bank_name: '',
    ifsc_code: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await riderApi.getProfile();
      setProfile(data.data);
      setFormData(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await riderApi.uploadPhoto(file);
      if (result.success) {
        setProfile(prev => ({ ...prev, photo_url: result.data.photo_url }));
        setError(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const result = await riderApi.saveProfile(formData);
      setProfile(result.data);
      setEditing(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const getApprovalStatus = () => {
    if (profile?.approval_status === 'approved') {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Approved</span>
        </div>
      );
    } else if (profile?.approval_status === 'rejected') {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Rejected</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-yellow-600">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Pending Review</span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-6 h-6" />
          Profile
        </h2>
        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Edit2 className="w-4 h-4" />
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Photo */}
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            {profile?.photo_url ? (
              <img
                src={profile.photo_url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-gray-400" />
            )}
          </div>
          {editing && (
            <label className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600">
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload Photo'}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}
          <div className="mt-4">
            {getApprovalStatus()}
          </div>
        </div>

        {/* Personal Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            {editing ? (
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile?.full_name || 'N/A'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            {editing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile?.phone || 'N/A'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="font-semibold text-lg mb-4">Vehicle Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Type
            </label>
            {editing ? (
              <select
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="bike">Bike</option>
                <option value="auto">Auto</option>
                <option value="car">Car</option>
              </select>
            ) : (
              <p className="text-gray-900 capitalize">{profile?.vehicle_type}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Number
            </label>
            {editing ? (
              <input
                type="text"
                name="vehicle_number"
                value={formData.vehicle_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile?.vehicle_number || 'N/A'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Name
            </label>
            {editing ? (
              <input
                type="text"
                name="vehicle_name"
                value={formData.vehicle_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile?.vehicle_name || 'N/A'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              License Number
            </label>
            {editing ? (
              <input
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile?.license_number || 'N/A'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              License Expiry
            </label>
            {editing ? (
              <input
                type="date"
                name="license_expiry"
                value={formData.license_expiry}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile?.license_expiry || 'N/A'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bank Info */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="font-semibold text-lg mb-4">Bank Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Name
            </label>
            {editing ? (
              <input
                type="text"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile?.bank_name || 'N/A'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number
            </label>
            {editing ? (
              <input
                type="text"
                name="bank_account"
                value={formData.bank_account}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile?.bank_account ? `****${profile.bank_account.slice(-4)}` : 'N/A'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IFSC Code
            </label>
            {editing ? (
              <input
                type="text"
                name="ifsc_code"
                value={formData.ifsc_code}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{profile?.ifsc_code || 'N/A'}</p>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => {
              setEditing(false);
              setFormData(profile);
            }}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default RiderProfile;
