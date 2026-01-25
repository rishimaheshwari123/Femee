import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getAllOrders, updateOrder } from "../../../services/operations/admin";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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
        console.log("Fetched orders:", orders); // Debug log
        // Sort by createdAt - latest first
        const sortedOrders = orders.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setAllOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
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

  // Helper function to format price without currency symbol
  const formatPriceNumber = (price) => {
    return new Intl.NumberFormat("en-IN").format(price);
  };

  const handleDownloadPDF = (order) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Professional Header
    doc.setFillColor(41, 128, 185); // Professional blue
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Company Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("FEMMECURE", 20, 25);
    
    // Tagline
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Your Trusted Health Partner", 20, 35);
    
    // Order Number (Right aligned)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("ORDER DETAILS", pageWidth - 20, 25, { align: "right" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`#${order.orderNumber || `FEME-${order._id?.slice(-6)}`}`, pageWidth - 20, 35, { align: "right" });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Order Details Section
    const startY = 65;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Order Information", 20, startY);
    
    // Details box - make it taller to accommodate more info
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(20, startY + 5, pageWidth - 40, order.setNumber ? 40 : 30);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Order Number: ${order.orderNumber || `FEME-${order._id?.slice(-6)}`}`, 25, startY + 15);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })}`, 25, startY + 23);
    
    doc.text(`UTR: ${order.paymentInfo?.utr || 'N/A'}`, pageWidth/2 + 10, startY + 15);
    doc.text(`Customer: ${order.user?.userName || 'N/A'}`, pageWidth/2 + 10, startY + 23);
    
    // Add set number and order status on new lines if set number exists
    if (order.setNumber) {
      doc.text(`Set Number: #${order.setNumber}`, 25, startY + 31);
      doc.text(`Order Status: ${order.orderStatus}`, pageWidth/2 + 10, startY + 31);
    } else {
      doc.text(`Order Status: ${order.orderStatus}`, pageWidth/2 + 10, startY + 31);
    }
    
    // Company Information Section
    const companyY = startY + (order.setNumber ? 55 : 45);
    const sectionWidth = (pageWidth - 50) / 2;
    
    // TO Section (Left side)
    doc.setFillColor(248, 249, 250);
    doc.rect(20, companyY, sectionWidth, 45, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, companyY, sectionWidth, 45);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("TO", 25, companyY + 10);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text((order.shippingInfo?.name || "N/A").toUpperCase(), 25, companyY + 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    if (order.shippingInfo?.address) {
      const addressLines = doc.splitTextToSize(order.shippingInfo.address, sectionWidth - 10);
      doc.text(addressLines, 25, companyY + 28);
    }
    doc.text(`${order.shippingInfo?.city || ''}, ${order.shippingInfo?.state || ''}`, 25, companyY + 36);
    doc.text(`PIN: ${order.shippingInfo?.pincode || 'N/A'}`, 25, companyY + 42);
    
    // FROM Section (Right side)
    doc.setFillColor(248, 249, 250);
    doc.rect(pageWidth/2 + 5, companyY, sectionWidth, 45, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(pageWidth/2 + 5, companyY, sectionWidth, 45);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("FROM", pageWidth/2 + 10, companyY + 10);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("FEMMECURE", pageWidth/2 + 10, companyY + 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Bhopal, Madhya Pradesh", pageWidth/2 + 10, companyY + 28);
    doc.text("India", pageWidth/2 + 10, companyY + 34);
    doc.text("Phone: +91-7879523232", pageWidth/2 + 10, companyY + 40);
    
    // Order Items Table
    const tableStartY = companyY + 60;
    const tableData = order.orderItems.map((item, index) => [
      (index + 1).toString(),
      item.product?.title || "N/A",
      item.quantity.toString(),
      formatPriceNumber(item.product?.price || 0),
      formatPriceNumber((item.product?.price || 0) * item.quantity)
    ]);
    
    autoTable(doc, {
      startY: tableStartY,
      head: [['S.No.', 'Product Name', 'Qty', 'Unit Price', 'Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        0: { cellWidth: 18, halign: 'center' },
        1: { cellWidth: 90, halign: 'left' },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 28, halign: 'right' },
        4: { cellWidth: 28, halign: 'right' }
      },
      margin: { left: 20, right: 20 },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      }
    });
    
    // Calculate totals
    const finalY = doc.lastAutoTable.finalY + 15;
    const subtotal = order.totalPrice;
    const deliveryCharges = 0;
    const grandTotal = subtotal + deliveryCharges;
    
    // Summary Section
    const summaryX = pageWidth - 90;
    const summaryWidth = 70;
    
    // Summary box
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(summaryX, finalY, summaryWidth, 35);
    
    // Summary content
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", summaryX + 5, finalY + 10);
    doc.text(formatPriceNumber(subtotal), summaryX + summaryWidth - 5, finalY + 10, { align: "right" });
    
    doc.text("Delivery Charges:", summaryX + 5, finalY + 18);
    doc.text("FREE", summaryX + summaryWidth - 5, finalY + 18, { align: "right" });
    
    // Divider line
    doc.setDrawColor(150, 150, 150);
    doc.line(summaryX + 5, finalY + 22, summaryX + summaryWidth - 5, finalY + 22);
    
    // Grand Total
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("GRAND TOTAL:", summaryX + 5, finalY + 30);
    doc.text(formatPriceNumber(grandTotal), summaryX + summaryWidth - 5, finalY + 30, { align: "right" });
    
    // Admin Notes Section
    const notesY = finalY + 50;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("ADMIN NOTES", 20, notesY);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`• Customer Email: ${order.user?.email || 'N/A'}`, 20, notesY + 8);
    doc.text(`• Order ID: ${order._id}`, 20, notesY + 14);
    doc.text(`• Payment UTR: ${order.paymentInfo?.utr || 'N/A'}`, 20, notesY + 20);
    
    // Professional Footer
    doc.setFillColor(41, 128, 185);
    doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("FemmeCure - Admin Order Details", pageWidth/2, pageHeight - 18, { align: "center" });
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Email: support@femmecure.com | Phone: +91-7879523232", pageWidth/2, pageHeight - 10, { align: "center" });
    doc.text("Visit us: www.femmecure.com", pageWidth/2, pageHeight - 4, { align: "center" });
    
    // Save PDF
    doc.save(`FemmeCure_Order_${order.orderNumber || order._id.slice(-8)}.pdf`);
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
                    Order Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Sequence #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Phone Numbers
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Set Number
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
                        {order.orderNumber || `FEME-${order._id.slice(-6)}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        Customer sees this
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-blue-600">
                        #{order.sequenceNumber || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.internalNumber || 'N/A'}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.user?.userName || 
                         (order.user?.fName && order.user?.lName ? 
                          `${order.user.fName} ${order.user.lName}` : 
                          "N/A")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.user?.email || "N/A"}
                      </div>
                      <div className="text-xs text-blue-600 font-medium">
                        Role: {order.user?.role || "N/A"}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        Primary: {order.shippingInfo?.phone1 || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600">
                        Secondary: {order.shippingInfo?.phone2 || "N/A"}
                      </div>
                      {order.user?.phone && (
                        <div className="text-xs text-blue-600">
                          Profile: {order.user.phone}
                        </div>
                      )}
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
                      {order.setNumber ? (
                        <div className="text-sm font-bold text-blue-600">
                          #{order.setNumber}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">
                          N/A
                        </div>
                      )}
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
