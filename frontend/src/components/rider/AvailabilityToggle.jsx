import React, { useState, useEffect } from 'react';
import { Power, MapPin, Clock, Loader, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import riderApi from '../../services/riderApi';

const AvailabilityToggle = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [workingHours, setWorkingHours] = useState({
    start_time: '06:00',
    end_time: '23:00',
  });
  const [editingHours, setEditingHours] = useState(false);

  useEffect(() => {
    fetchStatus();
    requestLocationPermission();
  }, []);

  useEffect(() => {
    let locationInterval;
    if (isOnline) {
      locationInterval = setInterval(updateLocation, 5000);
    }
    return () => {
      if (locationInterval) clearInterval(locationInterval);
    };
  }, [isOnline]);

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.error('Location error:', error);
          setError('Unable to access location. Please enable GPS.');
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
    }
  };

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await riderApi.getAvailabilityStatus();
      setIsOnline(data.data.is_online === 1 || data.data.is_online === true);
      if (data.data.working_hours) {
        setWorkingHours(data.data.working_hours);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async () => {
    if (!location) return;

    try {
      await riderApi.updateLocation(
        location.latitude,
        location.longitude,
        location.accuracy
      );
    } catch (err) {
      console.error('Location update failed:', err);
    }
  };

  const handleToggleOnline = async () => {
    if (!location) {
      setError('Location not available. Please enable GPS.');
      return;
    }

    try {
      setToggling(true);
      const newStatus = !isOnline;
      await riderApi.toggleOnline(
        newStatus,
        location.latitude,
        location.longitude
      );
      setIsOnline(newStatus);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setToggling(false);
    }
  };

  const handleSaveWorkingHours = async () => {
    try {
      setLoading(true);
      await riderApi.setWorkingHours(
        workingHours.start_time,
        workingHours.end_time
      );
      setEditingHours(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isOnline === undefined) {
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

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Availability</h2>
        <button
          onClick={handleToggleOnline}
          disabled={toggling || !location}
          className={`flex items-center gap-3 px-6 py-3 rounded-lg text-white font-semibold transition-all disabled:opacity-50 ${
            isOnline
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          <Power className="w-5 h-5" />
          {toggling ? 'Updating...' : isOnline ? 'Online' : 'Offline'}
        </button>
      </div>

      {/* Status Card */}
      <div
        className={`rounded-lg p-4 mb-6 ${
          isOnline ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-3 h-3 rounded-full animate-pulse ${
              isOnline ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className={isOnline ? 'text-green-700' : 'text-red-700'}>
            {isOnline ? 'Currently Online' : 'Currently Offline'}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          {location
            ? `Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
            : 'Getting location...'}
        </p>
      </div>

      {/* Location Status */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-blue-900">Location Status</span>
        </div>
        <p className="text-sm text-blue-700">
          {location ? (
            <>
              <span className="font-medium">Active</span> - Accuracy: ±{location.accuracy?.toFixed(0)}m
            </>
          ) : (
            'Waiting for GPS signal...'
          )}
        </p>
      </div>

      {/* Working Hours */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Working Hours
          </h3>
          <button
            onClick={() => setEditingHours(!editingHours)}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            {editingHours ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editingHours ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={workingHours.start_time}
                onChange={(e) =>
                  setWorkingHours(prev => ({ ...prev, start_time: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={workingHours.end_time}
                onChange={(e) =>
                  setWorkingHours(prev => ({ ...prev, end_time: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSaveWorkingHours}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Hours'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Start</p>
              <p className="font-semibold">{workingHours.start_time}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">End</p>
              <p className="font-semibold">{workingHours.end_time}</p>
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-amber-50 rounded-lg p-4 border border-amber-200">
        <p className="text-sm text-amber-700">
          <span className="font-semibold">💡 Tip:</span> You will be automatically set offline after 30 minutes of inactivity.
        </p>
      </div>
    </motion.div>
  );
};

export default AvailabilityToggle;
