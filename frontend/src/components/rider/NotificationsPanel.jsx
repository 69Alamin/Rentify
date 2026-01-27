import React, { useState, useEffect } from 'react';
import { Bell, Trash2, Check, AlertCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import riderApi from '../../services/riderApi';

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Poll for new notifications every 5 seconds
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 5000);

    return () => clearInterval(interval);
  }, [page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await riderApi.getNotifications(page, 10);
      setNotifications(data.data || []);
      setTotalPages(data.pagination?.total_pages || 1);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await riderApi.getUnreadCount();
      setUnreadCount(data.data?.unread_count || 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const handleMarkAsRead = async (notificationId = null) => {
    try {
      await riderApi.markAsRead(notificationId ? [notificationId] : null);

      if (notificationId) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, is_read: 1 } : n
          )
        );
      } else {
        setNotifications(prev =>
          prev.map(n => ({ ...n, is_read: 1 }))
        );
      }

      await fetchUnreadCount();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await riderApi.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      await fetchUnreadCount();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      ride_offer: '🎫',
      ride_accepted: '✅',
      ride_completed: '✔️',
      payment: '💰',
      document: '📄',
      warning: '⚠️',
      info: 'ℹ️',
    };
    return icons[type] || '📢';
  };

  const getNotificationColor = (type) => {
    const colors = {
      ride_offer: 'bg-blue-50 border-blue-200',
      ride_accepted: 'bg-green-50 border-green-200',
      ride_completed: 'bg-purple-50 border-purple-200',
      payment: 'bg-yellow-50 border-yellow-200',
      document: 'bg-orange-50 border-orange-200',
      warning: 'bg-red-50 border-red-200',
      info: 'bg-gray-50 border-gray-200',
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
  };

  if (loading && notifications.length === 0) {
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

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full font-semibold">
              {unreadCount}
            </span>
          )}
        </h2>

        {unreadCount > 0 && (
          <button
            onClick={() => handleMarkAsRead()}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No notifications</p>
          <p className="text-sm">You're all caught up!</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {notifications.map(notification => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`rounded-lg p-4 border ${getNotificationColor(notification.type)} ${
                  notification.is_read === 0 ? 'ring-2 ring-blue-400' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <span className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`font-semibold ${
                          notification.is_read === 0 ? 'font-bold' : ''
                        }`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-700 mt-1">
                          {notification.message}
                        </p>
                      </div>

                      {notification.is_read === 0 && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                      <span>
                        {new Date(notification.created_at).toLocaleString()}
                      </span>

                      {notification.ride_id && (
                        <span className="px-2 py-1 bg-gray-200 rounded">
                          Ride #{notification.ride_id}
                        </span>
                      )}
                    </div>

                    {/* Action Data */}
                    {notification.action_data && (
                      <div className="mt-2 text-sm text-gray-700 bg-white rounded p-2 bg-opacity-50">
                        <p>{notification.action_data}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {notification.is_read === 0 && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Previous
          </button>

          <span className="px-4 py-2 text-sm text-gray-600 flex items-center">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Next
          </button>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">ℹ️ Info:</span> Notifications are automatically refreshed every 5 seconds. You'll receive alerts for ride offers, status updates, and payment confirmations.
        </p>
      </div>
    </motion.div>
  );
};

export default NotificationsPanel;
