import React, { useState, useEffect } from 'react';
import { Clock, MapPin, User, Phone, AlertCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import riderApi from '../../services/riderApi';

const RideOffers = ({ onRideAccepted }) => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdowns, setCountdowns] = useState({});
  const [rejecting, setRejecting] = useState(null);
  const [accepting, setAccepting] = useState(null);

  useEffect(() => {
    fetchPendingRides();
    const interval = setInterval(fetchPendingRides, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdowns(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(rideId => {
          updated[rideId] -= 1;
          if (updated[rideId] <= 0) {
            handleAutoReject(rideId);
            delete updated[rideId];
          }
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchPendingRides = async () => {
    try {
      const data = await riderApi.getPendingRides();
      setRides(data.data || []);

      // Initialize countdowns for new rides
      data.data?.forEach(ride => {
        if (!countdowns[ride.id]) {
          setCountdowns(prev => ({ ...prev, [ride.id]: 30 }));
        }
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching rides:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRide = async (rideId) => {
    try {
      setAccepting(rideId);
      await riderApi.acceptRide(rideId);
      setRides(prev => prev.filter(r => r.id !== rideId));
      setCountdowns(prev => {
        const updated = { ...prev };
        delete updated[rideId];
        return updated;
      });
      onRideAccepted?.();
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setAccepting(null);
    }
  };

  const handleRejectRide = async (rideId, reason = 'Rider rejected') => {
    try {
      setRejecting(rideId);
      await riderApi.rejectRide(rideId, reason);
      setRides(prev => prev.filter(r => r.id !== rideId));
      setCountdowns(prev => {
        const updated = { ...prev };
        delete updated[rideId];
        return updated;
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setRejecting(null);
    }
  };

  const handleAutoReject = async (rideId) => {
    try {
      await riderApi.rejectRide(rideId, 'Auto-rejected: No response');
      setRides(prev => prev.filter(r => r.id !== rideId));
    } catch (err) {
      console.error('Auto-reject failed:', err);
    }
  };

  if (loading && rides.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {rides.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No ride offers at the moment</p>
          <p className="text-sm">Stay online to receive ride requests</p>
        </div>
      ) : (
        <AnimatePresence>
          {rides.map(ride => (
            <motion.div
              key={ride.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-blue-500"
            >
              <div className="p-4">
                {/* Timer */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-gray-600">Ride Request</p>
                    <p className="font-semibold text-lg">#{ride.id}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    countdowns[ride.id] > 10
                      ? 'bg-green-100 text-green-700'
                      : countdowns[ride.id] > 5
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span className="font-semibold">{countdowns[ride.id]}s</span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{ride.customer_name || 'Customer'}</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {ride.customer_phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pickup & Dropoff */}
                <div className="space-y-2 mb-4">
                  <div className="flex gap-3">
                    <MapPin className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Pickup</p>
                      <p className="text-sm font-medium">{ride.pickup_location || `${ride.pickup_latitude}, ${ride.pickup_longitude}`}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600">Dropoff</p>
                      <p className="text-sm font-medium">{ride.dropoff_location || `${ride.dropoff_latitude}, ${ride.dropoff_longitude}`}</p>
                    </div>
                  </div>
                </div>

                {/* Ride Details */}
                <div className="grid grid-cols-3 gap-2 mb-4 bg-blue-50 rounded-lg p-3">
                  <div>
                    <p className="text-xs text-gray-600">Distance</p>
                    <p className="font-semibold text-sm">{ride.distance?.toFixed(1) || 'N/A'} km</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Fare</p>
                    <p className="font-semibold text-sm">₹{ride.fare || 'TBD'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Type</p>
                    <p className="font-semibold text-sm capitalize">{ride.vehicle_type}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleRejectRide(ride.id)}
                    disabled={rejecting === ride.id || accepting === ride.id}
                    className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 font-medium"
                  >
                    {rejecting === ride.id ? 'Rejecting...' : 'Decline'}
                  </button>
                  <button
                    onClick={() => handleAcceptRide(ride.id)}
                    disabled={accepting === ride.id || rejecting === ride.id}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium"
                  >
                    {accepting === ride.id ? 'Accepting...' : 'Accept'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default RideOffers;
