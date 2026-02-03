import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaShoppingCart,
  FaStar,
  FaBoxOpen,
  FaChartLine,
  FaMoneyBillWave,
  FaClipboardList,
  FaArrowUp,
  FaArrowDown,
  FaTrophy,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Card, Button, Badge } from "../../ui";

// Get token from Redux
const useToken = () => {
  const { token } = useSelector((state) => state.auth);
  return token;
};

const Dashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const { allProduct } = useSelector((state) => state.product);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalReviews: 0,
    avgRating: 4.8,
  });
  const [memberOrders, setMemberOrders] = useState({
    total: 0,
    pending: 0,
    completed: 0,
  });
  const [pairRequests, setPairRequests] = useState([]);
  const [recentClaims, setRecentClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  // Fetch member-specific orders
  useEffect(() => {
    const fetchMemberOrders = async () => {
      if (user?.role === "member" && user?._id) {
        try {
          const response = await axios.get(`${BASE_URL}/product/orders`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data.success) {
            // Filter orders for this specific member
            const userOrders = response.data.data.filter(
              order => order.userId?._id === user._id || order.userId === user._id
            );

            const pending = userOrders.filter(
              order => order.status === "pending" || order.status === "processing"
            ).length;

            const completed = userOrders.filter(
              order => order.status === "delivered" || order.status === "completed"
            ).length;

            setMemberOrders({
              total: userOrders.length,
              pending: pending,
              completed: completed,
            });
          }
        } catch (error) {
          console.error("Failed to fetch member orders", error);
        }
      }
    };

    fetchMemberOrders();
  }, [user, token, BASE_URL]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Only fetch admin stats if user is admin
        if (user?.role === "admin") {
          const response = await axios.get(`${BASE_URL}/product/dashboard-stats`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data.success) {
            setStats({
              totalUsers: response.data.data.totalUsers || 0,
              totalOrders: response.data.data.totalOrders || 0,
              totalRevenue: response.data.data.totalRevenue || 0,
              totalProducts: response.data.data.totalProducts || allProduct?.length || 0,
              pendingOrders: response.data.data.pendingOrders || 0,
              completedOrders: response.data.data.completedOrders || 0,
              totalReviews: response.data.data.totalReviews || 0,
              avgRating: parseFloat(response.data.data.avgRating) || 4.8,
            });
            setRecentActivity(response.data.data.recentActivity || []);
          }

          // Fetch pair requests for admin
          try {
            const pairResponse = await axios.get(`${BASE_URL}/pair/admin/all?limit=5`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (pairResponse.data.success) {
              setPairRequests(pairResponse.data.data.pairRequests || []);
            }
          } catch (pairError) {
            console.error("Failed to fetch pair requests", pairError);
          }

          // Fetch recent ALML claims for admin
          try {
            const claimsResponse = await axios.get(`${BASE_URL}/product/transactions?transactionType=alml_claim&limit=5`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (claimsResponse.data.success) {
              setRecentClaims(claimsResponse.data.data || []);
            }
          } catch (claimsError) {
            console.error("Failed to fetch recent claims", claimsError);
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard statistics", error);
        // Fallback to basic stats
        setStats({
          ...stats,
          totalProducts: allProduct?.length || 0,
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [allProduct, token, user]);

  // Stats cards - different for admin and member
  const statsCards = user?.role === "admin" ? [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <FaUsers />,
      gradient: "from-blue-500 to-blue-600",
      change: "+12%",
      isPositive: true,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <FaShoppingCart />,
      gradient: "from-green-500 to-green-600",
      change: "+8%",
      isPositive: true,
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: <FaMoneyBillWave />,
      gradient: "from-purple-500 to-purple-600",
      change: "+15%",
      isPositive: true,
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: <FaBoxOpen />,
      gradient: "from-orange-500 to-orange-600",
      change: "+5",
      isPositive: true,
    },
  ] : [];

  // Quick actions - different for admin and member
  const quickActions = user?.role === "admin" ? [
    {
      title: "Add Product",
      icon: <FaBoxOpen />,
      link: "/admin/add-product",
      color: "primary",
    },
    {
      title: "View Orders",
      icon: <FaClipboardList />,
      link: "/admin/orders",
      color: "secondary",
    },
    {
      title: "All Products",
      icon: <FaShoppingCart />,
      link: "/admin/get-product",
      color: "accent",
    },
    {
      title: "Members",
      icon: <FaUsers />,
      link: "/admin/getAll-members",
      color: "dark",
    },
  ] : [
    {
      title: "My Orders",
      icon: <FaShoppingCart />,
      link: "/member/my-orders",
      color: "primary",
    },
    {
      title: "Shop Products",
      icon: <FaBoxOpen />,
      link: "/shop",
      color: "secondary",
    },
    {
      title: "My Team",
      icon: <FaUsers />,
      link: "/member/getAll-members",
      color: "accent",
    },
    {
      title: "Binary Tree",
      icon: <FaChartLine />,
      link: "/member/binary-trees",
      color: "dark",
    },
  ];

  const [recentActivity, setRecentActivity] = useState([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-dark-900 mb-2">
              Dashboard
            </h1>
            <p className="text-dark-600">
              Welcome back, <span className="font-semibold">{user?.userName}</span>!
            </p>
          </div>
          {user?.role === "admin" && (
            <div className="flex gap-3">
              <Button to="/admin/add-product" variant="primary" size="md">
                <FaBoxOpen className="mr-2" />
                Add Product
              </Button>
            </div>
          )}
        </div>

        {/* Referral Link - Only for Members */}
        {user?.role === "member" && (
          <Card variant="gradient" className="border-0">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-dark-900 mb-2">
                    Your Referral Link
                  </h3>
                  <p className="text-sm text-dark-600 break-all">
                    https://www.femmecurehelpingher.com/become-member/{user?.userName}
                  </p>
                </div>
                <Button
                  variant="dark"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https://www.femmecurehelpingher.com/become-member/${user?.userName}`
                    );
                    alert("Link copied!");
                  }}
                >
                  Copy Link
                </Button>
              </div>
              
              {/* Order Count */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-dark-200">
                <div className="bg-white/50 rounded-xl p-4">
                  <p className="text-xs text-dark-600 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-dark-900">{memberOrders.total}</p>
                </div>
                <div className="bg-white/50 rounded-xl p-4">
                  <p className="text-xs text-dark-600 mb-1">Pending Orders</p>
                  <p className="text-2xl font-bold text-orange-600">{memberOrders.pending}</p>
                </div>
                <div className="bg-white/50 rounded-xl p-4">
                  <p className="text-xs text-dark-600 mb-1">Completed Orders</p>
                  <p className="text-2xl font-bold text-green-600">{memberOrders.completed}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Cards - Only for Admin */}
        {user?.role === "admin" && statsCards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
              <Card
                key={index}
                hover
                className="relative overflow-hidden group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-br ${stat.gradient} text-white rounded-2xl text-2xl`}>
                      {stat.icon}
                  </div>
                  <Badge
                    variant={stat.isPositive ? "success" : "danger"}
                    size="sm"
                  >
                    {stat.isPositive ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                    {stat.change}
                  </Badge>
                </div>
                <h3 className="text-3xl font-bold text-dark-900 mb-1">
                  {loading ? "..." : stat.value}
                </h3>
                <p className="text-sm text-dark-600">{stat.title}</p>
              </div>
            </Card>
          ))}
          </div>
        )}

        {/* Quick Actions & Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <Card.Header>
                <Card.Title>Quick Actions</Card.Title>
              </Card.Header>
              <Card.Body>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      to={action.link}
                      className="group"
                    >
                      <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-dark-50 to-dark-100 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className={`text-4xl mb-3 text-${action.color}-500 group-hover:scale-110 transition-transform`}>
                          {action.icon}
                        </div>
                        <span className="text-sm font-semibold text-dark-700 text-center">
                          {action.title}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <Card.Header>
              <Card.Title>Recent Activity</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 pb-4 border-b border-dark-200 last:border-0 last:pb-0"
                  >
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'order' ? 'bg-green-100 text-green-600' :
                      activity.type === 'product' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'user' ? 'bg-purple-100 text-purple-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {activity.type === 'order' ? <FaShoppingCart /> :
                       activity.type === 'product' ? <FaBoxOpen /> :
                       activity.type === 'user' ? <FaUsers /> :
                       <FaStar />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-dark-900">
                        {activity.action}
                      </p>
                      <p className="text-xs text-dark-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Performance Overview - Only for Admin */}
        {user?.role === "admin" && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pair Claims Section */}
            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <Card.Title className="flex items-center gap-2">
                    <FaTrophy className="text-yellow-500" />
                    Recent Pair Claims
                  </Card.Title>
                  <Link to="/admin/pair-requests">
                    <Button variant="secondary" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  {pairRequests.length === 0 ? (
                    <div className="text-center py-8 text-dark-500">
                      No pair claims yet
                    </div>
                  ) : (
                    pairRequests.map((request, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-dark-50 hover:bg-dark-100 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-dark-900">
                            {request.member?.fName} {request.member?.lName}
                          </p>
                          <p className="text-xs text-dark-600">
                            @{request.member?.userName} • Pair {request.pairNumber}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {request.status === "pending" && (
                            <Badge variant="warning" size="sm">
                              <FaClock className="mr-1" />
                              Pending
                            </Badge>
                          )}
                          {request.status === "approved" && (
                            <Badge variant="success" size="sm">
                              <FaCheckCircle className="mr-1" />
                              Approved
                            </Badge>
                          )}
                          {request.status === "rejected" && (
                            <Badge variant="danger" size="sm">
                              <FaTimesCircle className="mr-1" />
                              Rejected
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>Sales Overview</Card.Title>
              </Card.Header>
              <Card.Body>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-dark-600">Pending Orders</span>
                    <span className="font-semibold text-dark-900">{stats.pendingOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-600">Completed Orders</span>
                    <span className="font-semibold text-dark-900">{stats.completedOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-600">Total Reviews</span>
                    <span className="font-semibold text-dark-900">{stats.totalReviews}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-600">Average Rating</span>
                    <div className="flex items-center gap-2">
                    <FaStar className="text-yellow-500" />
                    <span className="font-semibold text-dark-900">{stats.avgRating}</span>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Top Products</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="space-y-3">
                {allProduct?.slice(0, 4).map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-50 transition-colors"
                  >
                    <img
                      src={product.images[0]?.url}
                      alt={product.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-dark-900 line-clamp-1">
                        {product.title}
                      </p>
                      <p className="text-xs text-dark-600">₹{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
          </div>
        )}

        {/* Recent ROOT Claims Section - Only for Admin */}
        {user?.role === "admin" && (
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <FaTrophy className="text-purple-500" />
                Recent ROOT Achievement Claims
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="space-y-3">
                {recentClaims.length === 0 ? (
                  <div className="text-center py-8 text-dark-500">
                    No ROOT claims yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-dark-200">
                          <th className="text-left py-3 px-2 text-sm font-semibold text-dark-700">Member</th>
                          <th className="text-left py-3 px-2 text-sm font-semibold text-dark-700">Product</th>
                          <th className="text-center py-3 px-2 text-sm font-semibold text-dark-700">ROOT</th>
                          <th className="text-right py-3 px-2 text-sm font-semibold text-dark-700">Amount</th>
                          <th className="text-right py-3 px-2 text-sm font-semibold text-dark-700">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentClaims.map((claim, index) => (
                          <tr key={index} className="border-b border-dark-100 hover:bg-dark-50 transition-colors">
                            <td className="py-3 px-2">
                              <div>
                                <p className="text-sm font-semibold text-dark-900">
                                  {claim.memberId?.fName} {claim.memberId?.lName}
                                </p>
                                <p className="text-xs text-dark-600">@{claim.memberId?.userName}</p>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <p className="text-sm text-dark-900">{claim.productId?.title || 'N/A'}</p>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <Badge variant="primary" size="sm">
                                ROOT {claim.almlDetails?.rootNumber}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <span className="text-sm font-bold text-green-600">₹{claim.amount}</span>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <span className="text-xs text-dark-600">
                                {new Date(claim.createdAt).toLocaleDateString('en-IN')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
