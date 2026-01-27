import React, { useState, useEffect } from 'react';
import { Star, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import riderApi from '../../services/riderApi';

const RatingsWidget = () => {
  const [ratings, setRatings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchRatings();
  }, [page]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const data = await riderApi.getRatings(page, 5);
      setRatings(data.data || []);
      setSummary(data.summary);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading && !summary) {
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
        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
        Ratings & Reviews
      </h2>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600 mb-1">
              {summary.average_rating?.toFixed(1) || '0'}
            </p>
            <p className="text-xs text-gray-700">Average Rating</p>
            <div className="flex justify-center mt-2">
              {renderStars(Math.round(summary.average_rating || 0))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
            <p className="text-2xl font-bold text-blue-600 mb-1">
              {summary.total_ratings || 0}
            </p>
            <p className="text-xs text-gray-700">Total Ratings</p>
          </div>

          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
              <div className="flex justify-center mb-1">
                {renderStars(star)}
              </div>
              <p className="text-lg font-bold text-gray-700">
                {summary[`rating_${star}_count`] || 0}
              </p>
              <p className="text-xs text-gray-600">
                {summary.total_ratings > 0
                  ? `${((summary[`rating_${star}_count`] || 0) / summary.total_ratings * 100).toFixed(0)}%`
                  : '0%'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Reviews */}
      <div className="border-t pt-6">
        <h3 className="font-semibold text-lg mb-4">Recent Reviews</h3>

        {ratings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No ratings yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ratings.map(rating => (
              <div key={rating.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{rating.customer_name || 'Customer'}</p>
                    <p className="text-xs text-gray-600">
                      Ride #{rating.ride_id} • {new Date(rating.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex">
                    {renderStars(rating.rating)}
                  </div>
                </div>

                {rating.category && (
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {rating.category}
                    </span>
                  </div>
                )}

                {rating.review && (
                  <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                    "{rating.review}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {summary && summary.total_pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {page} of {summary.total_pages}
            </span>
            <button
              onClick={() => setPage(Math.min(summary.total_pages, page + 1))}
              disabled={page === summary.total_pages}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-amber-50 rounded-lg p-4 border border-amber-200">
        <p className="text-sm text-amber-700">
          <span className="font-semibold">💡 Tip:</span> Maintain a high rating to get more ride offers and earn rewards!
        </p>
      </div>
    </motion.div>
  );
};

export default RatingsWidget;
