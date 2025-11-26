import React, { useEffect, useState } from "react";
import { getMembersProfileApi } from "../../../services/operations/memeber";
import { useSelector } from "react-redux";
import { FaUsers, FaTrophy, FaChevronDown, FaChevronUp } from "react-icons/fa";

const GetAllMembersWithPairs = () => {
  const { user } = useSelector((state) => state.auth);
  const [childMembers, setChildMembers] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const getMember = async () => {
    try {
      setLoading(true);
      const response = await getMembersProfileApi(user?._id);
      setChildMembers(response);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMember();
  }, []);

  // Calculate left and right referrals for a member
  const calculateLeftRight = (children) => {
    if (!children || children.length === 0) {
      return { left: 0, right: 0, pairs: 0 };
    }

    const left = Math.ceil(children.length / 2);
    const right = Math.floor(children.length / 2);
    const pairs = Math.min(left, right);

    return { left, right, pairs };
  };

  const toggleRow = (index) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const getPairBadge = (pairs) => {
    if (pairs === 0) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">No Pairs</span>;
    } else if (pairs >= 4) {
      return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">4 Pairs ⭐</span>;
    } else if (pairs >= 3) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">{pairs} Pairs</span>;
    } else {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">{pairs} Pairs</span>;
    }
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900">All Members</h1>
          <p className="text-gray-600 mt-1">View all child members with pair information</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {childMembers?.child?.length || 0}
                </p>
              </div>
              <FaUsers className="text-4xl text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Members</p>
                <p className="text-2xl font-bold text-green-600">
                  {childMembers?.child?.filter((c) => c.isActive).length || 0}
                </p>
              </div>
              <FaUsers className="text-4xl text-green-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Members with Pairs</p>
                <p className="text-2xl font-bold text-purple-600">
                  {childMembers?.child?.filter((c) => calculateLeftRight(c.child).pairs > 0).length || 0}
                </p>
              </div>
              <FaTrophy className="text-4xl text-purple-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {!childMembers?.child || childMembers.child.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No child members found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referrals
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pairs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {childMembers.child.map((child, index) => {
                    const { left, right, pairs } = calculateLeftRight(child.child);
                    const isExpanded = expandedRows.has(index);

                    return (
                      <React.Fragment key={index}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {child?.fName} {child?.lName}
                              </p>
                              <p className="text-sm text-gray-500">@{child?.userName}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="text-gray-900">{child?.email || "N/A"}</p>
                              <p className="text-gray-500">{child?.phone || "N/A"}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {child?.isActive ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                L: {left}
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                R: {right}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getPairBadge(pairs)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(child?.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleRow(index)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              {isExpanded ? (
                                <>
                                  <FaChevronUp /> Hide
                                </>
                              ) : (
                                <>
                                  <FaChevronDown /> Show
                                </>
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Row */}
                        {isExpanded && (
                          <tr>
                            <td colSpan="7" className="px-6 py-4 bg-gray-50">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">
                                    Personal Information
                                  </h4>
                                  <div className="space-y-1 text-sm">
                                    <p>
                                      <span className="text-gray-600">Address:</span>{" "}
                                      {child?.address || "N/A"}
                                    </p>
                                    <p>
                                      <span className="text-gray-600">Role:</span>{" "}
                                      {child?.role || "N/A"}
                                    </p>
                                    <p>
                                      <span className="text-gray-600">Tier:</span>{" "}
                                      {child?.tier || "N/A"}
                                    </p>
                                    <p>
                                      <span className="text-gray-600">Total Children:</span>{" "}
                                      {child?.child?.length || 0}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">
                                    Pair Information
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-24 text-sm text-gray-600">Left:</div>
                                      <div className="flex-1 bg-blue-200 rounded-full h-6 relative">
                                        <div
                                          className="bg-blue-600 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                          style={{ width: `${Math.min((left / 4) * 100, 100)}%` }}
                                        >
                                          {left}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-24 text-sm text-gray-600">Right:</div>
                                      <div className="flex-1 bg-green-200 rounded-full h-6 relative">
                                        <div
                                          className="bg-green-600 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                          style={{ width: `${Math.min((right / 4) * 100, 100)}%` }}
                                        >
                                          {right}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                                      <p className="text-sm font-semibold text-purple-900">
                                        Completed Pairs: {pairs} / 4
                                      </p>
                                      <p className="text-xs text-purple-700 mt-1">
                                        Potential Rewards: ₹
                                        {pairs >= 1 ? 100 : 0}
                                        {pairs >= 2 ? " + ₹200" : ""}
                                        {pairs >= 3 ? " + ₹400" : ""}
                                        {pairs >= 4 ? " + ₹450" : ""} = ₹
                                        {pairs >= 4
                                          ? 1150
                                          : pairs >= 3
                                          ? 700
                                          : pairs >= 2
                                          ? 300
                                          : pairs >= 1
                                          ? 100
                                          : 0}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Understanding Pair Calculation
          </h3>
          <ul className="space-y-1 text-xs text-blue-800">
            <li>• Children are placed alternately: 1st→Left, 2nd→Right, 3rd→Left, 4th→Right...</li>
            <li>• 1 Pair = 1 Left + 1 Right referral</li>
            <li>• Maximum 4 pairs per member (₹1,150 total rewards)</li>
            <li>• Pair rewards: Pair 1 (₹100), Pair 2 (₹200), Pair 3 (₹400), Pair 4 (₹450)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GetAllMembersWithPairs;
