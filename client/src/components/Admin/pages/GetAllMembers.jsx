import { useEffect, useState } from "react";
import {
  getAllMembersApi,
  updateVerifyMembersApi,
  updateTierMembersApi,
  deleteMemberApi,
  getMembersProfileApi,
} from "../../../services/operations/memeber";
import { getAllOrders } from "../../../services/operations/admin";
import { FaEye, FaTimes, FaChevronDown, FaChevronRight, FaUser, FaSearch, FaIdCard, FaShoppingCart } from "react-icons/fa";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const tiers = ["Silver", "Gold", "Platinum", "Diamond", "Blue Diamond"];

// Expandable Tree Node Component
const TreeNode = ({ member, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!isExpanded && children.length === 0 && member.child?.length > 0) {
      setLoading(true);
      try {
        const childrenData = await Promise.all(
          member.child.map(child => {
            // Extract ID whether it's an object or string
            const childId = typeof child === 'object' ? child._id : child;
            return getMembersProfileApi(childId);
          })
        );
        setChildren(childrenData.filter(Boolean));
      } catch (error) {
        console.error("Error loading children:", error);
        toast.error("Failed to load children");
      } finally {
        setLoading(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  const hasChildren = member.child && member.child.length > 0;

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-green-50 cursor-pointer"
        style={{ marginLeft: `${level * 24}px` }}
        onClick={hasChildren ? handleToggle : undefined}
      >
        <div className="w-6 flex items-center justify-center">
          {hasChildren ? (
            loading ? (
              <div className="animate-spin">⏳</div>
            ) : isExpanded ? (
              <FaChevronDown className="text-green-600" />
            ) : (
              <FaChevronRight className="text-gray-400" />
            )
          ) : (
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          )}
        </div>

        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          level === 0 ? 'bg-blue-500' : 'bg-green-500'
        } text-white`}>
          <FaUser />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">
              {member.fName} {member.lName}
            </span>
            <span className="text-sm text-gray-500">@{member.userName}</span>
            <span className={`text-xs px-2 py-1 rounded ${
              member.tier === 'Diamond' || member.tier === 'Blue Diamond' 
                ? 'bg-purple-100 text-purple-700'
                : member.tier === 'Gold' || member.tier === 'Platinum'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {member.tier}
            </span>
          </div>
          {hasChildren && (
            <div className="text-xs text-gray-500 mt-1">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                {member.child.length} referral{member.child.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
          Level {level}
        </div>
      </div>

      {isExpanded && children.length > 0 && (
        <div className="mt-1">
          {children.map((child) => (
            <TreeNode key={child._id} member={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const GetAllMembers = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [showTreeModal, setShowTreeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberOrders, setMemberOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const { user, token } = useSelector((state) => state.auth);

  const getMember = async () => {
    try {
      const response = await getAllMembersApi();
      const sortedMembers = (response || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setMembers(sortedMembers);
      setFilteredMembers(sortedMembers);
    } catch (error) {
      toast.error("Failed to fetch members.");
    }
  };

  useEffect(() => {
    let result = [...members];

    if (searchTerm) {
      result = result.filter(
        (member) =>
          member.fName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.lName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.phone?.toString().includes(searchTerm)
      );
    }

    if (filterTier !== "All") {
      result = result.filter((member) => member.tier === filterTier);
    }

    if (filterStatus !== "All") {
      result = result.filter((member) =>
        filterStatus === "Active" ? member.isActive : !member.isActive
      );
    }

    setFilteredMembers(result);
  }, [searchTerm, filterTier, filterStatus, members]);

  const handleActivate = async (id) => {
    try {
      const updatedMember = await updateVerifyMembersApi(id);
      if (updatedMember) {
        setMembers((prev) =>
          prev.map((member) =>
            member._id === id ? { ...member, isActive: true } : member
          )
        );
        toast.success("Member activated successfully!");
      }
    } catch {
      toast.error("Failed to activate the member.");
    }
  };

  const handleDeleteRequest = async (id) => {
    try {
      const deleted = await deleteMemberApi(id);
      if (deleted) {
        setMembers((prev) => prev.filter((member) => member._id !== id));
        toast.success("Member deleted successfully!");
      }
    } catch {
      toast.error("Failed to delete the member.");
    }
  };

  const handleTierChange = async (id, tier) => {
    try {
      const updatedMember = await updateTierMembersApi(id, tier);
      if (updatedMember) {
        setMembers((prev) =>
          prev.map((member) =>
            member._id === id ? { ...member, tier } : member
          )
        );
        toast.success(`Tier updated to ${tier}!`);
      }
    } catch {
      toast.error("Failed to update tier.");
    }
  };

  const openTreeModal = (member) => {
    console.log("Opening tree for:", member);
    setSelectedMember(member);
    setShowTreeModal(true);
  };

  const openProfileModal = async (member) => {
    setSelectedMember(member);
    setShowProfileModal(true);
    setLoadingOrders(true);
    
    try {
      // Fetch all orders and filter by this member
      const allOrders = await getAllOrders(token);
      const memberOrdersList = allOrders.filter(order => 
        order && order.user && order.user._id === member._id
      );
      setMemberOrders(memberOrdersList);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
      setMemberOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    getMember();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">👥 All Members</h1>
          <p className="text-gray-600 mt-1">Manage your network members</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, username, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tier Filter */}
            <div>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="All">All Tiers</option>
                {tiers.map((tier) => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Showing <strong>{filteredMembers.length}</strong> of <strong>{members.length}</strong> members
            </span>
            {(searchTerm || filterTier !== "All" || filterStatus !== "All") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterTier("All");
                  setFilterStatus("All");
                }}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 font-medium">No members found</p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            filteredMembers.map((member) => (
              <div
                key={member._id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                {/* Member Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {member?.fName?.[0]}{member?.lName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-lg truncate">
                      {member.fName} {member.lName}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">@{member.userName}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <select
                        value={member.tier}
                        onChange={(e) => handleTierChange(member._id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded font-semibold border ${
                          member.tier === 'Diamond' || member.tier === 'Blue Diamond'
                            ? 'bg-purple-100 text-purple-700 border-purple-300'
                            : member.tier === 'Gold' || member.tier === 'Platinum'
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                      >
                        {tiers.map((tier) => (
                          <option key={tier} value={tier}>{tier}</option>
                        ))}
                      </select>
                      {member.isActive ? (
                        <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 font-semibold">
                          ✓ Active
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 font-semibold">
                          ⏳ Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Member Info */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📧</span>
                    <span className="truncate">{member.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📱</span>
                    <span>{member.phone || "N/A"}</span>
                  </div>
                  {user?.role === "admin" && member.parent && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>👤</span>
                      <span className="truncate">
                        Referred by: {member.parent.fName} {member.parent.lName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openProfileModal(member)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 font-medium text-sm"
                    >
                      <FaIdCard />
                      Profile
                    </button>
                    <button
                      onClick={() => openTreeModal(member)}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 font-medium text-sm"
                    >
                      <FaEye />
                      Network ({member.child?.length || 0})
                    </button>
                  </div>

                  {!member.isActive ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleActivate(member._id)}
                        className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                      >
                        ✓ Activate
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(member._id)}
                        className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDeleteRequest(member._id)}
                      className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tree Modal */}
      {showTreeModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    🌳 Referral Network
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedMember.fName} {selectedMember.lName} (@{selectedMember.userName})
                  </p>
                </div>
                <button
                  onClick={() => setShowTreeModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {selectedMember.child && selectedMember.child.length > 0 ? (
                <div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Tip:</strong> Click on members with referrals to expand their network
                    </p>
                  </div>
                  <TreeNode member={selectedMember} level={0} />
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🌱</div>
                  <p className="text-gray-500 font-medium">No referrals yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    This member hasn't referred anyone
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {selectedMember.child && selectedMember.child.length > 0 && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedMember.child.length}
                    </p>
                    <p className="text-xs text-gray-600">Direct Referrals</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedMember.tier}
                    </p>
                    <p className="text-xs text-gray-600">Member Tier</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedMember.isActive ? '✓' : '⏳'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {selectedMember.isActive ? 'Active' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-blue-600 text-2xl font-bold">
                    {selectedMember.fName?.[0]}{selectedMember.lName?.[0]}
                  </div>
                  <div className="text-white">
                    <h2 className="text-2xl font-bold">
                      {selectedMember.fName} {selectedMember.lName}
                    </h2>
                    <p className="text-blue-100">@{selectedMember.userName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaUser className="text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium">Full Name</p>
                      <p className="text-gray-800 font-semibold">{selectedMember.fName} {selectedMember.lName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Username</p>
                      <p className="text-gray-800">@{selectedMember.userName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Email</p>
                      <p className="text-gray-800">{selectedMember.email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Phone</p>
                      <p className="text-gray-800">{selectedMember.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Secondary Contact</p>
                      <p className="text-gray-800">{selectedMember.sContact || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Address</p>
                      <p className="text-gray-800">{selectedMember.address || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Account Information</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium">Member Tier</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedMember.tier === 'Diamond' || selectedMember.tier === 'Blue Diamond'
                          ? 'bg-purple-100 text-purple-700'
                          : selectedMember.tier === 'Gold' || selectedMember.tier === 'Platinum'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedMember.tier}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Account Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedMember.isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {selectedMember.isActive ? '✓ Active' : '⏳ Pending'}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Role</p>
                      <p className="text-gray-800 capitalize">{selectedMember.role}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Member Since</p>
                      <p className="text-gray-800">{new Date(selectedMember.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Direct Referrals</p>
                      <p className="text-gray-800 font-semibold">{selectedMember.child?.length || 0} members</p>
                    </div>
                    {selectedMember.parent && (
                      <div>
                        <p className="text-gray-500 font-medium">Referred By</p>
                        <p className="text-gray-800">
                          {selectedMember.parent.fName} {selectedMember.parent.lName} (@{selectedMember.parent.userName})
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bank Details */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Bank Details</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium">Account Holder Name</p>
                      <p className="text-gray-800">{selectedMember.bankHolderName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Account Number</p>
                      <p className="text-gray-800 font-mono">{selectedMember.acc || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">IFSC Code</p>
                      <p className="text-gray-800 font-mono">{selectedMember.ifsc || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Bank Name</p>
                      <p className="text-gray-800">{selectedMember.bankName || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Orders Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaShoppingCart className="text-green-600" />
                    Order History
                  </h3>
                  {loadingOrders ? (
                    <div className="text-center py-8">
                      <div className="animate-spin text-4xl">⏳</div>
                      <p className="text-gray-500 mt-2">Loading orders...</p>
                    </div>
                  ) : memberOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📦</div>
                      <p className="text-gray-500">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {memberOrders.map((order, index) => (
                        <div key={order._id} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-500">Order #{index + 1}</span>
                            <span className={`text-xs px-2 py-1 rounded font-semibold ${
                              order.orderStatus === 'Delivered' 
                                ? 'bg-green-100 text-green-700'
                                : order.orderStatus === 'Processing'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {order.orderStatus}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 font-semibold">₹{order.totalPrice}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {order.orderItems?.length || 0} item(s)
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{selectedMember.child?.length || 0}</p>
                  <p className="text-xs text-gray-600">Referrals</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{memberOrders.length}</p>
                  <p className="text-xs text-gray-600">Orders</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                 ₹{memberOrders.reduce((sum, order) => {
  const price = Number(order.totalPrice) || 0;
  return sum + price;
}, 0)}

                  </p>
                  <p className="text-xs text-gray-600">Total Spent</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">{selectedMember.tier}</p>
                  <p className="text-xs text-gray-600">Tier</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetAllMembers;
