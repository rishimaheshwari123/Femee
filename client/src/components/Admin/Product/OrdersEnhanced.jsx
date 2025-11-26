import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getAllOrders, updateOrder } from "../../../services/operations/admin";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { 
  FaDownload, 
  FaBox, 
  FaFilter, 
  FaSearch,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaTimesCircle
} from "react-icons/fa";

function OrdersEnhanced() {
  const { token } = useSelector((state) => state.auth);
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const orders = await getAllOrders(token);
        setAllOrders(orders);
        setFilteredOrders(orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  useEffect(() => {
    let filtered = allOrders;

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter(order => order.orderStatus === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, allOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrder({ orderId, newStatus }, token);
      setAllOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleDownloadPDF = (order) => {
    const doc = new jsPDF();
    
    // Header with gradient effect
    doc.setFillColor(34, 197, 94);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Company Logo/Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("FemmeCure", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Your Trusted Health Partner", 105, 28, { align: "center" });
    
    // Order Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("ORDER DETAILS", 105, 55, { align: "center" });
    
    // Order Info Box
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.5);
    doc.rect(15, 65, 180, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Order ID: ${order._id}`, 20, 73);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 20, 80);
    doc.text(`Status: ${order.orderStatus}`, 120, 73);
    doc.text(`UTR: ${order.paymentInfo?.utr || 'N/A'}`, 120, 80);
    
    // From Section
    doc.setFillColor(240, 240, 240);
    doc.rect(15, 95, 85, 35, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("From:", 20, 103);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("FemmeCure", 20, 111);
    doc.text("Bhopal, Madhya Pradesh", 20, 117);
    doc.text("Contact: +91 7879523232", 20, 123);
    
    // To Section
    doc.setFillColor(240, 240, 240);
    doc.rect(110, 95, 85, 35, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("To:", 115, 103);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(order.shippingInfo?.name || "N/A", 115, 111);
    doc.text(order.shippingInfo?.address || "N/A", 115, 117);
    doc.text(`${order.shippingInfo?.city}, ${order.shippingInfo?.state}`, 115, 123);
    
    // Order Items Table
    const tableData = order.orderItems.map((item, index) => [
      index + 1,
      item.product?.title || "N/A",
      item.quantity,
      `₹${item.product?.price || 0}`,
      `₹${(item.product?.price || 0) * item.quantity}`
    ]);
    
    doc.autoTable({
      startY: 140,
      head: [['#', 'Product', 'Qty', 'Price', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 11
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 80 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' }
      },
      margin: { left: 15, right: 15 }
    });
    
    const finalY = doc.lastAutoTable.finalY + 10;
    
    // Total Box
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.5);
    doc.rect(120, finalY, 75, 20);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Grand Total:", 125, finalY + 12);
    doc.text(`₹${order.totalPrice}`, 185, finalY + 12, { align: "right" });
    
    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(34, 197, 94);
    doc.rect(0, pageHeight - 25, 210, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for your order!", 105, pageHeight - 15, { align: "center" });
    doc.text("For support: support@femmecure.com | +91-7879523232", 105, pageHeight - 8, { align: "center" });
    
    doc.save(`Order_${order._id}.pdf`);
  };

  const getStatusColor = (status) => {
    const colors = {
      "Ordered": "bg-blue-100 text-blue-800",
      "Processing": "bg-yellow-100 text-yellow-800",
      "Shipped": "bg-purple-100 text-purple-800",
      "Delivered": "bg-green-100 text-green-800",
      "Cancelled": "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    const icons = {
      "Ordered": <FaClock />,
      "Processing": <FaBox />,
      "Shipped": <FaTruck />,
      "Delivered": <FaCheckCircle />,
      "Cancelled": <FaTimesCircle />,
    };
    return icons[status] || <FaClock />;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaBox className="text-green-600" />
            All Orders
          </h1>
          <p className="text-gray-600 mt-2">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order ID, User name, or Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                <option value="All">All Status</option>
                <option value="Ordered">Ordered</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-green-600 to-green-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order._id.slice(-8)}
                      </div>
                      <div className="text-xs text-gray-500">
                        UTR: {order.paymentInfo?.utr || 'N/A'}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.user?.userName || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.user?.email || "N/A"}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {order.orderItems?.slice(0, 2).map((item) => (
                          <div key={item._id} className="flex items-center gap-2">
                            <img
                              src={item.product?.images[0]?.url}
                              alt={item.product?.title}
                              className="h-10 w-10 object-cover rounded"
                            />
                            <div className="text-sm">
                              <div className="font-medium text-gray-900 truncate max-w-[150px]">
                                {item.product?.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                Qty: {item.quantity}
                              </div>
                            </div>
                          </div>
                        ))}
                        {order.orderItems?.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{order.orderItems.length - 2} more
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">
                        {formatPrice(order.totalPrice)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border-2 ${getStatusColor(order.orderStatus)} focus:ring-2 focus:ring-green-500 focus:outline-none`}
                      >
                        <option value="Ordered">Ordered</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDownloadPDF(order)}
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg"
                      >
                        <FaDownload />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrdersEnhanced;
