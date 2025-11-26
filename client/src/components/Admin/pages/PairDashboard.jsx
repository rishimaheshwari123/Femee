import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getPairDashboard, submitPairRequest } from "../../../services/operations/pairService";
import { FaUsers, FaCheckCircle, FaClock, FaTimesCircle, FaTrophy } from "react-icons/fa";

const PairDashboard = () => {
  const { token } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    const data = await getPairDashboard(token);
    if (data) {
      setDashboardData(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSubmitPair = async (pairNumber) => {
    setSubmitting(true);
    const result = await submitPairRequest(pairNumber, token);
    if (result) {
      await fetchDashboard(); // Refresh data
    }
    setSubmitting(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: <FaClock className="inline mr-1" />,
        label: "Pending",
      },
      approved: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: <FaCheckCircle className="inline mr-1" />,
        label: "Approved",
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: <FaTimesCircle className="inline mr-1" />,
        label: "Rejected",
      },
      not_submitted: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: null,
        label: "Not Submitted",
      },
    };

    const badge = badges[status] || badges.not_submitted;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  const { member, referrals, pairUnlockStatus, pairRequests } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Pair Reward Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome, {member.name}</p>
        </div>

        {/* Referral Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Left Referrals</p>
                <p className="text-4xl font-bold mt-2">{referrals.totalLeft}</p>
              </div>
              <FaUsers className="text-5xl text-blue-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Right Referrals</p>
                <p className="text-4xl font-bold mt-2">{referrals.totalRight}</p>
              </div>
              <FaUsers className="text-5xl text-green-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Completed Pairs</p>
                <p className="text-4xl font-bold mt-2">{referrals.completedPairs}</p>
              </div>
              <FaTrophy className="text-5xl text-purple-200 opacity-50" />
            </div>
          </div>
        </div>

        {/* Pair Unlock Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pair Rewards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pairUnlockStatus.map((pair) => (
              <div
                key={pair.pairNumber}
                className={`border-2 rounded-lg p-6 transition-all ${
                  pair.isUnlocked
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <FaTrophy
                      className={`text-4xl ${
                        pair.isUnlocked ? "text-green-600" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Pair {pair.pairNumber}
                  </h3>
                  <p className="text-3xl font-bold text-green-600 mb-4">
                    ₹{pair.reward}
                  </p>

                  <div className="mb-4">{getStatusBadge(pair.status)}</div>

                  {pair.canSubmit && (
                    <button
                      onClick={() => handleSubmitPair(pair.pairNumber)}
                      disabled={submitting}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Submitting..." : "Collect Reward"}
                    </button>
                  )}

                  {!pair.isUnlocked && (
                    <p className="text-sm text-gray-500 mt-2">
                      Need {pair.pairNumber} left + {pair.pairNumber} right
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pair Requests History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Request History</h2>

          {pairRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No pair requests submitted yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pair Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reward
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin Notes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Proof
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pairRequests.map((request) => (
                    <tr key={request.pairNumber}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          Pair {request.pairNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-green-600">
                          ₹{[100, 200, 400, 450][request.pairNumber - 1]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.submittedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {request.adminNotes || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.adminProof?.url ? (
                          <a
                            href={request.adminProof.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            View Proof
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">No proof</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How Pair Rewards Work
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• 1 Pair = 1 Left Referral + 1 Right Referral</li>
            <li>• Referrals are placed alternately (1st→Left, 2nd→Right, 3rd→Left...)</li>
            <li>• You can claim up to 4 pair rewards</li>
            <li>• Submit your request when a pair is unlocked</li>
            <li>• Admin will review and approve your request</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PairDashboard;
