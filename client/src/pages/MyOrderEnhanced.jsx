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
import autoTable from "jspdf-autotable";

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

  // Helper function to format price without currency symbol
  const formatPriceNumber = (price) => {
    return new Intl.NumberFormat("en-IN").format(price);
  };

  const downloadInvoice = (order) => {
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
    
    // Invoice Number (Right aligned)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth - 20, 25, { align: "right" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`#${order.orderNumber || order._id.slice(-8).toUpperCase()}`, pageWidth - 20, 35, { align: "right" });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Invoice Details Section
    const startY = 65;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice Details", 20, startY);
    
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
    doc.text(`Payment Status: ${order.paymentInfo?.status || 'Pending'}`, pageWidth/2 + 10, startY + 23);
    
    // Add set number and order status on new lines if set number exists
    if (order.setNumber) {
      doc.text(`Set Number: #${order.setNumber}`, 25, startY + 31);
      doc.text(`Order Status: ${order.orderStatus}`, pageWidth/2 + 10, startY + 31);
    } else {
      doc.text(`Order Status: ${order.orderStatus}`, pageWidth/2 + 10, startY + 31);
    }
    
    // Billing Information Section
    const billingY = startY + (order.setNumber ? 55 : 45);
    const sectionWidth = (pageWidth - 50) / 2;
    
    // TO Section (Left side)
    doc.setFillColor(248, 249, 250);
    doc.rect(20, billingY, sectionWidth, 45, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, billingY, sectionWidth, 45);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("TO", 25, billingY + 10);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(order.shippingInfo.name.toUpperCase(), 25, billingY + 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const addressLines = doc.splitTextToSize(order.shippingInfo.address, sectionWidth - 10);
    doc.text(addressLines, 25, billingY + 28);
    doc.text(`${order.shippingInfo.city}, ${order.shippingInfo.state}`, 25, billingY + 36);
    doc.text(`PIN: ${order.shippingInfo.pincode}`, 25, billingY + 42);
    
    // FROM Section (Right side)
    doc.setFillColor(248, 249, 250);
    doc.rect(pageWidth/2 + 5, billingY, sectionWidth, 45, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(pageWidth/2 + 5, billingY, sectionWidth, 45);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("FROM", pageWidth/2 + 10, billingY + 10);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("FEMMECURE", pageWidth/2 + 10, billingY + 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Bhopal, Madhya Pradesh", pageWidth/2 + 10, billingY + 28);
    doc.text("India", pageWidth/2 + 10, billingY + 34);
    doc.text("Phone: +91-7879523232", pageWidth/2 + 10, billingY + 40);
    
    // Order Items Table
    const tableStartY = billingY + 60;
    const tableData = order.orderItems.map((item, index) => [
      (index + 1).toString(),
      item.product.title,
      item.quantity.toString(),
      formatPriceNumber(item.product.price),
      formatPriceNumber(item.product.price * item.quantity)
    ]);
    
    autoTable(doc, {
      startY: tableStartY,
      head: [['S.No.', 'Product Description', 'Qty', 'Unit Price', 'Amount']],
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
    
    // Terms and Conditions
    const termsY = finalY + 50;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("TERMS & CONDITIONS", 20, termsY);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("• All sales are final. No returns or exchanges.", 20, termsY + 8);
    doc.text("• Delivery within 3-5 business days.", 20, termsY + 14);
    doc.text("• For any queries, contact our support team.", 20, termsY + 20);
    
    // Professional Footer
    doc.setFillColor(41, 128, 185);
    doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Thank you for choosing FemmeCure!", pageWidth/2, pageHeight - 18, { align: "center" });
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Email: support@femmecure.com | Phone: +91-7879523232", pageWidth/2, pageHeight - 10, { align: "center" });
    doc.text("Visit us: www.femmecure.com", pageWidth/2, pageHeight - 4, { align: "center" });
    
    // Save PDF
    doc.save(`FemmeCure_Invoice_${order.orderNumber || order._id.slice(-8)}.pdf`);
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
                      <p className="text-sm opacity-90 mb-1">Order Number</p>
                      <p className="text-xl font-bold">{order.orderNumber || `FEME-${order._id?.slice(-6)}`}</p>
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
                    {/* Show setNumber if available */}
                    {order.setNumber && (
                      <div>
                        <p className="text-sm opacity-90 mb-1">Set Number</p>
                        <p className="text-2xl font-bold">#{order.setNumber}</p>
                      </div>
                    )}
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
