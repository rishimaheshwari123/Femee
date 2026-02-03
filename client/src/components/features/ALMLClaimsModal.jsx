import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheckCircle, FaClock, FaLock, FaTrophy } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiConnector } from '../../services/apiConnector';

/**
 * ALML Claims Modal
 * Shows step-wise achievement progress for a ROOT
 * Allows claiming when all 5 steps are complete
 */
const ALMLClaimsModal = ({ isOpen, onClose, memberId, productId, rootNumber, productTitle }) => {
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [chartData, setChartData] = useState(null);

  // Fetch achievement chart
  useEffect(() => {
    if (isOpen && memberId && productId && rootNumber) {
      fetchChart();
    }
  }, [isOpen, memberId, productId, rootNumber]);

  const fetchChart = async () => {
    try {
      setLoading(true);
      const BASE_URL = process.env.REACT_APP_BASE_URL;
      const token = JSON.parse(localStorage.getItem('token'));
      
      const response = await apiConnector(
        'GET',
        `${BASE_URL}/alml/${memberId}/chart/${productId}/${rootNumber}`,
        null,
        {
          Authorization: `Bearer ${token}`
        }
      );

      if (response.data.success) {
        setChartData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching achievement chart:', error);
      toast.error('Failed to load achievement data');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!chartData?.summary?.canClaim) {
      toast.error('All steps must be completed before claiming');
      return;
    }

    try {
      setClaiming(true);
      const BASE_URL = process.env.REACT_APP_BASE_URL;
      const token = JSON.parse(localStorage.getItem('token'));

      const response = await apiConnector(
        'POST',
        `${BASE_URL}/alml/${memberId}/claim`,
        { productId, rootNumber },
        {
          Authorization: `Bearer ${token}`
        }
      );

      if (response.data.success) {
        toast.success(response.data.data.message);
        onClose();
        // Refresh page to show updated wallet
        window.location.reload();
      }
    } catch (error) {
      console.error('Error claiming achievements:', error);
      toast.error(error.response?.data?.message || 'Failed to claim achievements');
    } finally {
      setClaiming(false);
    }
  };

  if (!isOpen) return null;

  const getStepIcon = (step) => {
    if (step.isComplete) {
      return <FaCheckCircle className="text-green-500 text-xl" />;
    } else if (step.currentMembers > 0) {
      return <FaClock className="text-yellow-500 text-xl" />;
    } else {
      return <FaLock className="text-gray-400 text-xl" />;
    }
  };

  const getProgressPercentage = (current, required) => {
    return Math.min((current / required) * 100, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes className="text-2xl" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <FaTrophy className="text-3xl" />
            <h2 className="text-2xl font-bold">Achievement Progress</h2>
          </div>
          <p className="text-purple-100">
            {productTitle} - ROOT {rootNumber}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : chartData ? (
            <div className="space-y-4">
              {/* Steps */}
              {chartData.steps.map((step) => (
                <div
                  key={step.step}
                  className={`border-2 rounded-xl p-4 transition-all ${
                    step.isComplete
                      ? 'border-green-500 bg-green-50'
                      : step.currentMembers > 0
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStepIcon(step)}
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          Step {step.step}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {step.currentMembers}/{step.requiredMembers} Members
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">
                        ₹{step.bonusAmount}
                      </p>
                      {step.isComplete && (
                        <span className="text-xs text-green-600 font-medium">
                          Complete ✓
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        step.isComplete
                          ? 'bg-green-500'
                          : step.currentMembers > 0
                          ? 'bg-yellow-500'
                          : 'bg-gray-400'
                      }`}
                      style={{
                        width: `${getProgressPercentage(step.currentMembers, step.requiredMembers)}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border-2 border-purple-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">Progress:</span>
                  <span className="text-lg font-bold text-purple-700">
                    {chartData.summary.completedSteps}/{chartData.summary.totalSteps} Steps
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Total Bonus:</span>
                  <span className="text-2xl font-bold text-purple-700">
                    ₹{chartData.summary.totalBonusAmount}
                  </span>
                </div>
              </div>

              {/* Status Message */}
              {chartData.summary.isClaimed ? (
                <div className="p-4 bg-green-100 border-2 border-green-500 rounded-xl text-center">
                  <FaCheckCircle className="text-green-500 text-3xl mx-auto mb-2" />
                  <p className="text-green-700 font-bold">
                    Already Claimed ₹{chartData.summary.claimedAmount}
                  </p>
                </div>
              ) : !chartData.summary.allStepsComplete ? (
                <div className="p-4 bg-yellow-100 border-2 border-yellow-500 rounded-xl text-center">
                  <FaClock className="text-yellow-500 text-3xl mx-auto mb-2" />
                  <p className="text-yellow-700 font-bold">
                    Complete all 5 steps to claim ₹{chartData.summary.totalBonusAmount}
                  </p>
                  <p className="text-yellow-600 text-sm mt-1">
                    {chartData.summary.totalSteps - chartData.summary.completedSteps} steps remaining
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No achievement data available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {chartData && !chartData.summary.isClaimed && (
          <div className="p-6 bg-gray-50 border-t">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleClaim}
                disabled={!chartData.summary.canClaim || claiming}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  chartData.summary.canClaim && !claiming
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {claiming ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Claiming...
                  </span>
                ) : (
                  `Claim ₹${chartData.summary.totalBonusAmount}`
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ALMLClaimsModal;
