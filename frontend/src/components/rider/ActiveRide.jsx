import React, { useState, useEffect } from 'react';
import { MapPin, Phone, User, Clock, Navigation, CheckCircle, AlertCircle, Loader, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import riderApi from '../../services/riderApi';
import EmbeddedNavigation from '../EmbeddedNavigation';

const ActiveRide = ({ rideId, onRideCompleted }) => {
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);

  useEffect(() => {
    fetchRideStatus();
    const interval = setInterval(fetchRideStatus, 3000);
    return () => clearInterval(interval);
  }, [rideId]);

  const fetchRideStatus = async () => {
    try {
      const data = await riderApi.getRideStatus(rideId);
      setRide(data.data);
      setCurrentStatus(data.data.status);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await riderApi.updateRideStatus(rideId, newStatus);
      setCurrentStatus(newStatus);
      await fetchRideStatus();
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelRide = async () => {
    try {
      setUpdating(true);
      await riderApi.cancelRide(rideId, cancelReason || 'Rider cancelled');
      setShowCancelModal(false);
      setCancelReason('');
      onRideCompleted?.();
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Ride not found</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      accepted: 'bg-blue-100 text-blue-700',
      on_the_way: 'bg-purple-100 text-purple-700',
      picked_up: 'bg-orange-100 text-orange-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusSteps = () => {
    const steps = ['accepted', 'on_the_way', 'picked_up', 'completed'];
    const currentIndex = steps.indexOf(currentStatus);
    return steps.map((step, index) => ({
      step,
      label: step.replace(/_/g, ' '),
      completed: index <= currentIndex,
      active: step === currentStatus,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Ride Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold">Ride #{ride.id}</h2>
          <p className="text-gray-600 text-sm">
            {new Date(ride.created_at).toLocaleString()}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(currentStatus)}`}>
          {currentStatus?.replace(/_/g, ' ') || 'N/A'}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="mb-6 pb-6 border-b">
        <div className="flex justify-between items-center">
          {getStatusSteps().map((step, index) => (
            <div key={step.step} className="flex-1 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step.completed
                  ? step.active
                    ? 'bg-blue-500 text-white'
                    : 'bg-green-500 text-white'
                  : 'bg-gray-300 text-white'
                  }`}
              >
                {step.completed ? <CheckCircle className="w-5 h-5" /> : index + 1}
              </div>
              <p className="text-xs text-center text-gray-600 capitalize">{step.label}</p>
              {index < getStatusSteps().length - 1 && (
                <div
                  className={`absolute w-12 h-0.5 mt-4 ${step.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">{ride.customer_name || 'Customer'}</p>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {ride.customer_phone}
            </p>
          </div>
        </div>
      </div>

      {/* Route Info */}
      <div className="space-y-4 mb-6">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            <div className="w-0.5 h-12 bg-gray-300" />
            <MapPin className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <div className="mb-6">
              <p className="text-xs text-gray-600 mb-1">Pickup Location</p>
              <p className="font-semibold">{ride.pickup_location || 'N/A'}</p>
              <p className="text-xs text-gray-500">
                {ride.pickup_latitude}, {ride.pickup_longitude}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Dropoff Location</p>
              <p className="font-semibold">{ride.dropoff_location || 'N/A'}</p>
              <p className="text-xs text-gray-500">
                {ride.dropoff_latitude}, {ride.dropoff_longitude}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ride Details */}
      <div className="grid grid-cols-3 gap-3 mb-6 bg-gray-50 rounded-lg p-4">
        <div>
          <p className="text-xs text-gray-600 mb-1">Distance</p>
          <p className="font-semibold">{ride.distance?.toFixed(1) || 'N/A'} km</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Fare</p>
          <p className="font-semibold">₹{ride.fare || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Duration</p>
          <p className="font-semibold">{ride.duration_minutes || 'N/A'} min</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {(currentStatus === 'accepted' || currentStatus === 'on_the_way' || currentStatus === 'picked_up') && (
          <button
            onClick={() => setShowNavigation(true)}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            Navigate
          </button>
        )}
        {currentStatus === 'accepted' && (
          <button
            onClick={() => updateStatus('on_the_way')}
            disabled={updating}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            {updating ? 'Updating...' : 'I\'m On The Way'}
          </button>
        )}

        {currentStatus === 'on_the_way' && (
          <button
            onClick={() => updateStatus('picked_up')}
            disabled={updating}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium"
          >
            {updating ? 'Updating...' : 'Customer Picked Up'}
          </button>
        )}

        {currentStatus === 'picked_up' && (
          <button
            onClick={() => updateStatus('completed')}
            disabled={updating}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {updating ? 'Updating...' : 'Ride Completed'}
          </button>
        )}

        {currentStatus !== 'completed' && currentStatus !== 'cancelled' && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium"
          >
            Cancel Ride
          </button>
        )}

        {currentStatus === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="font-semibold text-green-700">Ride Completed!</p>
            <p className="text-sm text-green-600">Earnings: ₹{ride.earnings}</p>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 max-w-sm"
          >
            <h3 className="text-xl font-bold mb-4">Cancel Ride?</h3>
            <p className="text-gray-600 mb-4">
              Cancelling the ride will deduct ₹50 from your wallet as a penalty.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              className="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              rows="3"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Keep Ride
              </button>
              <button
                onClick={handleCancelRide}
                disabled={updating}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {updating ? 'Cancelling...' : 'Cancel Ride'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Navigation Modal */}
      <AnimatePresence>
        {showNavigation && (
          <div className="fixed inset-0 z-[100] bg-navy flex flex-col">
            <EmbeddedNavigation
              pickupLat={ride.pickup_lat}
              pickupLng={ride.pickup_lng}
              dropoffLat={ride.destination_lat}
              dropoffLng={ride.destination_lng}
              navigationType={currentStatus === 'picked_up' ? 'dropoff' : 'pickup'}
              customerName={ride.customer_name}
              onClose={() => setShowNavigation(false)}
              isMobile={true}
            />
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ActiveRide;
