import React, { useEffect, useState } from "react";
import { getAllOrder } from "../services/operations/order";
import { useSelector } from "react-redux";
import { 
  FaMoneyBillAlt, 
  FaDownload, 
  FaBox, 
  FaTruck, 
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope
} from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";

function MyOrderEnhanced() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchAllOrders = getAllOrder();
        const res = await fetchAllOrders(token);
        setOrders(res);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const getStatusColor = (status) => {
    const colors = {
      "Pending": "bg-yellow-100 text-yellow-800 border-yellow-300",
      "Processing": "bg-blue-100 text-blue-800 border-blue-300",
      "Shipped": "bg-purple-100 text-purple-800 border-purple-300",
      "Delivered": "bg-green-100 text-green-800 border-green-300",
      "Cancelled": "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusIcon = (status) => {
    const icons = {
      "Pending": <FaClock />,
      "Processing": <FaBox />,
      "Shipped": <FaTruck />,
      "Delivered": <FaCheckCircle />,
      "Cancelled": <FaClock />,
    };
    return icons[status] || <FaClock />;
  };

  const downloadInvoice = (order) => {
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
    
    // Invoice Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 105, 55, { align: "center" });
    
    // Order Details Box
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.5);
    doc.rect(15, 65, 180, 30);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Order ID: ${order.order_id}`, 20, 73);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 20, 80);
    doc.text(`Payment Status: ${order.paymentInfo?.status || 'Pending'}`, 20, 87);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Status: ${order.orderStatus}`, 120, 73);
    doc.text(`Total: ${formatPrice(order.totalPrice)}`, 120, 80);
    
    // Customer Information
    doc.setFillColor(240, 240, 240);
    doc.rect(15, 100, 85, 40, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Bill To:", 20, 108);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(order.shippingInfo.name, 20, 116);
    doc.text(order.shippingInfo.address, 20, 122);
    doc.text(`${order.shippingInfo.city}, ${order.shippingInfo.state}`, 20, 128);
    doc.text(`PIN: ${order.shippingInfo.pincode}`, 20, 134);
    
    // Shipping Information
    doc.setFillColor(240, 240, 240);
    doc.rect(110, 100, 85, 40, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Ship To:", 115, 108);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(order.shippingInfo.name, 115, 116);
    doc.text(order.shippingInfo.address, 115, 122);
    doc.text(`${order.shippingInfo.city}, ${order.shippingInfo.state}`, 115, 128);
    doc.text(`PIN: ${order.shippingInfo.pincode}`, 115, 134);
    
    // Order Items Table
    const tableData = order.orderItems.map((item, index) => [
      index + 1,
      item.product.title,
      item.quantity,
      formatPrice(item.product.price),
      formatPrice(item.product.price * item.quantity)
    ]);
    
    doc.autoTable({
      startY: 150,
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
    
    // Calculate final Y position after table
    const finalY = doc.lastAutoTable.finalY + 10;
    
    // Summary Box
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.5);
    doc.rect(120, finalY, 75, 35);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Subtotal:", 125, finalY + 8);
    doc.text(formatPrice(order.totalPrice), 185, finalY + 8, { align: "right" });
    
    doc.text("Delivery Charges:", 125, finalY + 16);
    doc.text("FREE", 185, finalY + 16, { align: "right" });
    
    doc.setDrawColor(200, 200, 200);
    doc.line(125, finalY + 20, 190, finalY + 20);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Grand Total:", 125, finalY + 28);
    doc.text(formatPrice(order.totalPrice), 185, finalY + 28, { align: "right" });
    
    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(34, 197, 94);
    doc.rect(0, pageHeight - 25, 210, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for your business!", 105, pageHeight - 15, { align: "center" });
    doc.text("For support: support@femmecure.com | +91-XXXXXXXXXX", 105, pageHeight - 8, { align: "center" });
    
    // Save PDF
    doc.save(`Invoice_${order.order_id}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <FaBox className="text-green-600" />
            My Orders
          </h1>
          <p className="text-gray-600 mt-2">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <a
              href="/shop"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Order ID</p>
                      <p className="text-xl font-bold">{order.order_id}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-90 mb-1">Order Date</p>
                      <p className="text-lg font-semibold">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm opacity-90 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold">{formatPrice(order.totalPrice)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Items */}
                    <div className="lg:col-span-2">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FaBox className="text-green-600" />
                        Order Items ({order.orderItems.length})
                      </h3>
                      <div className="space-y-3">
                        {order.orderItems.map((item) => (
                          <div
                            key={item._id}
                            className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.title}
                              className="w-20 h-20 object-cover rounded-lg shadow-md"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {item.product.title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Quantity: {item.quantity}
                              </p>
                              <p className="text-sm font-semibold text-green-600 mt-1">
                                {formatPrice(item.product.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping & Status */}
                    <div className="space-y-4">
                      {/* Status */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Status</h3>
                        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 ${getStatusColor(order.orderStatus)}`}>
                          {getStatusIcon(order.orderStatus)}
                          <span className="font-bold">{order.orderStatus}</span>
                        </div>
                      </div>

                      {/* Shipping Info */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <FaMapMarkerAlt className="text-green-600" />
                          Shipping Address
                        </h3>
                        <div className="text-sm text-gray-700 space-y-1">
                          <p className="font-semibold">{order.shippingInfo.name}</p>
                          <p>{order.shippingInfo.address}</p>
                          <p>
                            {order.shippingInfo.city}, {order.shippingInfo.state}
                          </p>
                          <p className="font-medium">PIN: {order.shippingInfo.pincode}</p>
                        </div>
                      </div>

                      {/* Download Invoice */}
                      <button
                        onClick={() => downloadInvoice(order)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
                      >
                        <FaDownload />
                        Download Invoice
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrderEnhanced;
