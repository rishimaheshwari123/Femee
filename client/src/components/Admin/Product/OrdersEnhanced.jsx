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
  console.log("order", order)
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Professional Header
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 50, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("FEMMECURE", 20, 25);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Your Trusted Health Partner", 20, 35);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("ORDER DETAILS", pageWidth - 20, 25, { align: "right" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`#${order.orderNumber || `FEME-${order._id?.slice(-6)}`}`, pageWidth - 20, 35, { align: "right" });

    doc.setTextColor(0, 0, 0);

    // Order Information Section
    const startY = 65;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Order Information", 20, startY);

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(20, startY + 5, pageWidth - 40, 35);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Order Number: ${order.orderNumber || `FEME-${order._id?.slice(-6)}`}`, 25, startY + 15);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 25, startY + 23);
    doc.text(`Customer: ${order.user?.userName || 'N/A'}`, pageWidth/2 + 10, startY + 15);
    doc.text(`Order Status: ${order.orderStatus}`, 25, startY + 31);

    // Company & Customer Sections
    const companyY = startY + 50;
    const sectionWidth = (pageWidth - 50) / 2;

    // TO Section (Customer Details) - Using proper Hindi with text cleaning
    doc.setFillColor(248, 249, 250);
    doc.rect(20, companyY, sectionWidth, 55, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, companyY, sectionWidth, 55);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("TO (Customer)", 25, companyY + 10);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text((order.shippingInfo?.name || "N/A").toUpperCase(), 25, companyY + 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    
    // Clean and decode the address properly
    let cleanAddress = order.shippingInfo?.address || 'N/A';
    
    // Handle different encoding issues and Hindi text
    try {
        // Check if address contains Hindi/Devanagari characters
        const hasHindiText = /[\u0900-\u097F]/.test(cleanAddress);
        
        if (hasHindiText) {
            // If Hindi text is present, use user's address as fallback or create readable version
            const fallbackAddress = order.user?.address || '';
            
            // Try to use user's address if it's more readable
            if (fallbackAddress && fallbackAddress.length > 10 && !/[\u0900-\u097F]/.test(fallbackAddress)) {
                cleanAddress = fallbackAddress;
            } else {
                // Create a readable address from available data
                const addressParts = [];
                if (order.shippingInfo?.city) addressParts.push(order.shippingInfo.city);
                if (order.shippingInfo?.state) addressParts.push(order.shippingInfo.state);
                
                if (addressParts.length > 0) {
                    cleanAddress = addressParts.join(', ');
                } else {
                    cleanAddress = 'Address contains Hindi text - Please check original order';
                }
            }
        } else {
            // Handle encoded characters for non-Hindi text
            if (cleanAddress.includes('&') || cleanAddress.includes('%') || cleanAddress.includes('\\')) {
                cleanAddress = cleanAddress
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&nbsp;/g, ' ');
                
                try {
                    cleanAddress = decodeURIComponent(cleanAddress);
                } catch (e) {
                    // If decoding fails, keep original
                }
            }
            
            // Remove problematic special characters but keep basic punctuation
            cleanAddress = cleanAddress.replace(/[^\w\s\-,./()]/g, ' ').replace(/\s+/g, ' ').trim();
            
            // If still looks corrupted, use fallback
            if (cleanAddress.length < 5 || /^[^a-zA-Z0-9\s]{3,}/.test(cleanAddress)) {
                cleanAddress = order.user?.address || 'Address not available';
            }
        }
        
        // Remove phone numbers from address (both formats: 1234567890 and +91-1234567890)
        cleanAddress = cleanAddress
            .replace(/Mobile\s*[-:]?\s*\d{10}\/?\d{10}/gi, '') // Remove "Mobile -8433010567/9837147813"
            .replace(/Phone\s*[-:]?\s*\d{10}/gi, '') // Remove "Phone: 1234567890"
            .replace(/\b\d{10}\b/g, '') // Remove standalone 10-digit numbers
            .replace(/\+91[-\s]?\d{10}/g, '') // Remove +91-1234567890 format
            .replace(/[-\/]\d{10}/g, '') // Remove -1234567890 or /1234567890
            .replace(/\s+/g, ' ') // Clean up extra spaces
            .trim();
            
    } catch (error) {
        cleanAddress = order.user?.address || 'Address not available';
    }
    
    const addressLines = doc.splitTextToSize(cleanAddress, sectionWidth - 10);
    doc.text(addressLines, 25, companyY + 28);
    
    // PIN Code above phone numbers
    doc.text(`PIN: ${order.shippingInfo?.pincode || 'N/A'}`, 25, companyY + 40);
    
    // Primary & Secondary Phone Numbers for Customer - Fixed phone number field mapping
    doc.text(`Phone 1: ${order.shippingInfo?.phoneNumber || order.shippingInfo?.phone1 || 'N/A'}`, 25, companyY + 46);
    if(order.shippingInfo?.alternateNumber || order.shippingInfo?.phone2) {
        doc.text(`Phone 2: ${order.shippingInfo?.alternateNumber || order.shippingInfo?.phone2}`, 25, companyY + 52);
    }

    // FROM Section (Your Details)
    doc.setFillColor(248, 249, 250);
    doc.rect(pageWidth/2 + 5, companyY, sectionWidth, 55, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(pageWidth/2 + 5, companyY, sectionWidth, 55);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("FROM", pageWidth/2 + 10, companyY + 10);

    doc.setTextColor(0, 0, 0);
    doc.text("FEMMECURE", pageWidth/2 + 10, companyY + 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Bhopal, Madhya Pradesh", pageWidth/2 + 10, companyY + 28);
    doc.text("PIN Code: 462042", pageWidth/2 + 10, companyY + 34);
    doc.text("Phone: +91-7879523232", pageWidth/2 + 10, companyY + 42);
    doc.text("Alt: +91-9575227672", pageWidth/2 + 10, companyY + 48);

    // Order Items Table
    const tableStartY = companyY + 65;
    const tableData = order.orderItems.map((item, index) => [
        (index + 1).toString(),
        item.product?.title || "N/A",
        item.quantity.toString(),
        formatPriceNumber(Number(item.product?.price || 0)),
        formatPriceNumber(Number(item.product?.price || 0) * Number(item.quantity))
    ]);

    autoTable(doc, {
        startY: tableStartY,
        head: [['S.No.', 'Product Name', 'Qty', 'Unit Price', 'Amount']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], halign: 'center' },
        columnStyles: { 0: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' } }
    });

    // --- CALCULATION FIX ---
    const finalY = doc.lastAutoTable.finalY + 15;
    
    // Sari values ko Number mein convert karke add kar rhe hain
    const subtotal = Number(order.totalPrice || 0);
    const deliveryCharges = 0;
    const grandTotal = subtotal + deliveryCharges;

    const summaryX = pageWidth - 90;
    doc.rect(summaryX, finalY, 70, 35);
    doc.text("Subtotal:", summaryX + 5, finalY + 10);
    doc.text(formatPriceNumber(subtotal), summaryX + 65, finalY + 10, { align: "right" });
    
    doc.text("Delivery Charges:", summaryX + 5, finalY + 18);
    doc.text("FREE", summaryX + 65, finalY + 18, { align: "right" });

    doc.line(summaryX + 5, finalY + 22, summaryX + 65, finalY + 22);
    
    doc.setFont("helvetica", "bold");
    doc.text("GRAND TOTAL:", summaryX + 5, finalY + 30);
    doc.text(formatPriceNumber(grandTotal), summaryX + 65, finalY + 30, { align: "right" });

    // Footer
    doc.setFillColor(41, 128, 185);
    doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text("Thank you for shopping with FemmeCure!", pageWidth/2, pageHeight - 10, { align: "center" });

    doc.save(`Order_${order.orderNumber}.pdf`);
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
                        {(order.user?.fName && order.user?.lName) ? 
                          `${order.user.fName} ${order.user.lName}` : 
                          (order.user?.userName || "N/A")}
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
