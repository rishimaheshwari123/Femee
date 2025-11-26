import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getAllPairRequestsAdmin,
  approvePairRequestAdmin,
  rejectPairRequestAdmin,
} from "../../../services/operations/pairService";
import { FaCheckCircle, FaTimesCircle, FaClock, FaEye, FaImage } from "react-icons/fa";

const AdminPairRequests = () => {
  const { token } = useSelector((state) => state.auth);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    pairNumber: "",
    page: 1,
    limit: 20,
  });

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approveData, setApproveData] = useState({ notes: "", proof: null });
  const [rejectNotes, setRejectNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    const data = await getAllPairRequestsAdmin(token, filters);
    if (data) {
      setRequests(data.pairRequests);
      setPagination(data.pagination);
      setStatistics(data.statistics);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    const formData = new FormData();
    if (approveData.proof) {
      formData.append("proof", approveData.proof);
    }
    if (approveData.notes) {
      formData.append("notes", approveData.notes);
    }

    const result = await approvePairRequestAdmin(token, selectedRequest._id, formData);
    if (result) {
      setShowApproveModal(false);
      setSelectedRequest(null);
      setApproveData({ notes: "", proof: null });
      await fetchRequests();
    }
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectNotes.trim()) {
      alert("Please provide rejection notes");
      return;
    }

    setProcessing(true);
    const result = await rejectPairRequestAdmin(token, selectedRequest._id, rejectNotes);
    if (result) {
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectNotes("");
      await fetchRequests();
    }
    setProcessing(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: <FaClock className="inline mr-1" />,
      },
      approved: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: <FaCheckCircle className="inline mr-1" />,
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: <FaTimesCircle className="inline mr-1" />,
      },
    };

    const badge = badges[status] || badges.pending;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Pair Requests Management</h1>
          <p className="text-gray-600 mt-1">Review and manage member pair reward requests</p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow p-4">
              <p className="text-sm text-yellow-800">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{statistics.pending}</p>
            </div>
            <div className="bg-green-50 rounded-lg shadow p-4">
              <p className="text-sm text-green-800">Approved</p>
              <p className="text-2xl font-bold text-green-900">{statistics.approved}</p>
            </div>
            <div className="bg-red-50 rounded-lg shadow p-4">
              <p className="text-sm text-red-800">Rejected</p>
              <p className="text-2xl font-bold text-red-900">{statistics.rejected}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pair Number
              </label>
              <select
                value={filters.pairNumber}
                onChange={(e) => setFilters({ ...filters, pairNumber: e.target.value, page: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Pairs</option>
                <option value="1">Pair 1 (₹100)</option>
                <option value="2">Pair 2 (₹200)</option>
                <option value="3">Pair 3 (₹400)</option>
                <option value="4">Pair 4 (₹450)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Per Page
              </label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters({ ...filters, limit: e.target.value, page: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No pair requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Pair
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Reward
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {request.member.fName} {request.member.lName}
                          </p>
                          <p className="text-sm text-gray-500">{request.member.userName}</p>
                          <p className="text-xs text-gray-400">{request.member.email}</p>
                        </div>
                      </td>
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
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {request.status === "pending" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowApproveModal(true);
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-colors"
                            >
                              <FaCheckCircle className="inline mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRejectModal(true);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors"
                            >
                              <FaTimesCircle className="inline mr-1" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div>
                            {request.adminProof?.url && (
                              <a
                                href={request.adminProof.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <FaImage className="inline mr-1" />
                                View Proof
                              </a>
                            )}
                            {request.adminNotes && (
                              <p className="text-xs text-gray-500 mt-1">{request.adminNotes}</p>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
              <div className="text-sm text-gray-700">
                Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalRecords} total)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Approve Pair {selectedRequest.pairNumber} Request
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Member: {selectedRequest.member.fName} {selectedRequest.member.lName}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Proof (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setApproveData({ ...approveData, proof: e.target.files[0] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={approveData.notes}
                onChange={(e) => setApproveData({ ...approveData, notes: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Add any notes..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={processing}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
              >
                {processing ? "Processing..." : "Approve"}
              </button>
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedRequest(null);
                  setApproveData({ notes: "", proof: null });
                }}
                disabled={processing}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Reject Pair {selectedRequest.pairNumber} Request
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Member: {selectedRequest.member.fName} {selectedRequest.member.lName}
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Please provide a reason for rejection..."
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={processing || !rejectNotes.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
              >
                {processing ? "Processing..." : "Reject"}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectNotes("");
                }}
                disabled={processing}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPairRequests;
