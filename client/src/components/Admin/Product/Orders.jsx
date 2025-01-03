import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getAllOrders, updateOrder } from "../../../services/operations/admin";
import { jsPDF } from "jspdf"; // Library for generating PDF

function Orders() {
  const { token } = useSelector((state) => state.auth);
  const [allOrders, setAllOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const orders = await getAllOrders(token);
        console.log(orders)
        setAllOrders(orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [token]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrder({orderId, newStatus}, token);
      setSelectedStatus(newStatus);
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
    doc.setFont("helvetica", "normal");
  
    // Header
    doc.setFontSize(24);
    doc.setTextColor(0, 102, 204); // Blue color for the header
    doc.setFont("helvetica", "bold");
    doc.text("Order Details", 14, 20);
  
    doc.setTextColor(0, 0, 0); // Reset color to black for the rest
  
    // Store details
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Store Name", 14, 30);
    doc.setFont("helvetica", "italic");
    doc.text("store@example.com", 14, 35);
    doc.text("Phone: +123456789", 14, 40);
    
    doc.setFont("helvetica", "normal");
  
    // Order Information Section
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Order Information", 14, 50);
  
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text(`Order ID: ${order.order_id}`, 14, 55);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 60);
    doc.text(`Status: ${order.orderStatus}`, 14, 65);
  
    // Payment Info
    doc.setFont("helvetica", "bold");
    doc.text("Payment Information", 14, 75);
  
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Payment ID: ${order.paymentInfo.razorpayPaymentId}`, 14, 80);
    doc.text(`Paid At: ${new Date(order.paidAt).toLocaleString()}`, 14, 85);
  
    // Shipping Info Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Shipping Information", 14, 95);
  
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`From: BHOPAL`, 14, 105);
    doc.text(`To: ${order.shippingInfo.name}`, 14, 110);
    doc.text(`${order.shippingInfo.address}`, 14, 115);
    doc.text(`${order.shippingInfo.city}, ${order.shippingInfo.state} - ${order.shippingInfo.pincode}`, 14, 120);
  
    // Order Items Table
    const startY = 130;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Product", 14, startY);
    doc.text("Quantity", 90, startY);
 
  
    let currentY = startY + 10;
    doc.setFont("helvetica", "normal");
  
    order.orderItems.forEach((item) => {
      doc.text(item.product.title, 14, currentY);
      doc.text(item.quantity.toString(), 90, currentY);

      currentY += 10;
    });
  
    // Total Price Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`Total Price: ₹${order.totalPrice}`, 14, currentY + 10);
  
    // Footer (optional)
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for shopping with us!", 14, currentY + 20);
    doc.text("For support: support@example.com", 14, currentY + 25);
  
    // Save the PDF
    doc.save(`Order-${order.order_id}.pdf`);
  };
  
  

  return (
    <div className="p-4 border border-gray-300 rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">All Orders</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price (INR)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordered At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change Order Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allOrders.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.order_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.user.name} ({order.user.email})</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.orderItems.map((item) => (
                    <div key={item._id} className="flex items-center space-x-2">
                      <img src={item.product.images[0]?.url} alt={item.product.title} className="h-12 w-12 object-contain" />
                      <span>{item.product.title}</span>
                      <div className="text-sm bg-green-500 p-2 rounded-full text-black">{item.quantity}</div>
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.orderStatus}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(order.totalPrice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200 focus:border-blue-500"
                  >
                    {["Ordered", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleDownloadPDF(order)}
                    className="bg-blue-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                  >
                    Download PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Orders;
