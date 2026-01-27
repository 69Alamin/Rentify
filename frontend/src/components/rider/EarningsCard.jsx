import React, { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, Wallet, Download, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import riderApi from '../../services/riderApi';

const EarningsCard = () => {
  const [balance, setBalance] = useState(0);
  const [summary, setSummary] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
  });
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [period, setPeriod] = useState('daily');

  useEffect(() => {
    fetchEarnings();
  }, [period]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const [balanceRes, summaryRes, detailsRes] = await Promise.all([
        riderApi.getWalletBalance(),
        riderApi.getEarningsSummary(period),
        riderApi.getEarningsDetails(1, 10),
      ]);

      setBalance(balanceRes.data.balance);
      setSummary(summaryRes.data);
      setDetails(detailsRes.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalChange = (e) => {
    const { name, value } = e.target;
    setWithdrawalForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRequestWithdrawal = async (e) => {
    e.preventDefault();

    if (!withdrawalForm.amount || parseInt(withdrawalForm.amount) < 500) {
      setError('Minimum withdrawal amount is ₹500');
      return;
    }

    try {
      setWithdrawing(true);
      await riderApi.requestWithdrawal(
        withdrawalForm.amount,
        withdrawalForm.bank_name,
        withdrawalForm.account_number,
        withdrawalForm.ifsc_code
      );

      setWithdrawalForm({
        amount: '',
        bank_name: '',
        account_number: '',
        ifsc_code: '',
      });
      setShowWithdrawalForm(false);
      setError(null);

      // Refresh earnings
      await fetchEarnings();
    } catch (err) {
      setError(err.message);
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading && !balance) {
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
      className="space-y-6"
    >
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <Wallet className="w-8 h-8 opacity-80" />
          <span className="text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full">Wallet</span>
        </div>
        <p className="text-gray-100 text-sm mb-2">Available Balance</p>
        <p className="text-4xl font-bold">₹{balance.toFixed(2)}</p>
        <button
          onClick={() => setShowWithdrawalForm(true)}
          className="mt-4 w-full bg-white text-blue-600 py-2 rounded-lg hover:bg-gray-100 font-semibold flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Withdraw Funds
        </button>
      </div>

      {/* Earnings Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Earnings Summary
        </h3>

        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          {['daily', 'weekly', 'monthly'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                period === p
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {summary && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-xs text-gray-600 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">₹{summary.total_earnings?.toFixed(2) || '0.00'}</p>
              <p className="text-xs text-gray-600 mt-2">{summary.ride_count || 0} rides</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-xs text-gray-600 mb-1">After Commission</p>
              <p className="text-2xl font-bold text-blue-600">₹{summary.net_earnings?.toFixed(2) || '0.00'}</p>
              <p className="text-xs text-gray-600 mt-2">{summary.commission_percentage || 20}% deducted</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-xs text-gray-600 mb-1">Average Per Ride</p>
              <p className="text-2xl font-bold text-purple-600">
                ₹{summary.average_per_ride?.toFixed(2) || '0.00'}
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <p className="text-xs text-gray-600 mb-1">Distance Covered</p>
              <p className="text-2xl font-bold text-orange-600">{summary.total_distance?.toFixed(1) || '0'} km</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Earnings */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Recent Earnings
        </h3>

        {details.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No earnings yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {details.map(earning => (
              <div key={earning.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div>
                  <p className="font-medium">Ride #{earning.ride_id}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(earning.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">+₹{earning.net_amount?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-gray-600">
                    Gross: ₹{earning.gross_amount?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdrawal Form Modal */}
      {showWithdrawalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">Request Withdrawal</h3>

            <form onSubmit={handleRequestWithdrawal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (Min ₹500)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={withdrawalForm.amount}
                  onChange={handleWithdrawalChange}
                  placeholder="₹"
                  min="500"
                  step="100"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bank_name"
                  value={withdrawalForm.bank_name}
                  onChange={handleWithdrawalChange}
                  placeholder="e.g., HDFC Bank"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  name="account_number"
                  value={withdrawalForm.account_number}
                  onChange={handleWithdrawalChange}
                  placeholder="Your account number"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifsc_code"
                  value={withdrawalForm.ifsc_code}
                  onChange={handleWithdrawalChange}
                  placeholder="e.g., HDFC0000001"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-700">
                  <span className="font-semibold">ℹ️ Info:</span> Withdrawals are processed within 24 hours.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawalForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawing}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium"
                >
                  {withdrawing ? 'Processing...' : 'Request Withdrawal'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default EarningsCard;
