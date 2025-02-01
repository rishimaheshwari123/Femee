import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getAllOrders, updateOrder } from "../../../services/operations/admin";
import { jsPDF } from "jspdf"; // Library for generating PDF

function Orders() {
  const { token } = useSelector((state) => state.auth);
  const [allOrders, setAllOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const orders = await getAllOrders(token);
        console.log(orders);
        setAllOrders(orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [token]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrder({ orderId, newStatus }, token);
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

    // Company Address (From)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("From:", 14, 30);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Bhopal, Madhya Pradesh", 14, 35);
    doc.text("Contact: +91 7879523232, +91 9575227672", 14, 40);

    // Shipping Info Section (To)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("To:", 14, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(order.shippingInfo?.name ?? "N/A", 14, 55);
    doc.text(order.shippingInfo?.address ?? "N/A", 14, 60);
    doc.text(
      `${order.shippingInfo?.city ?? "N/A"}, ${
        order.shippingInfo?.state ?? "N/A"
      } - ${order.shippingInfo?.pincode ?? "N/A"}`,
      14,
      65
    );
    doc.text(`Contact: ${order.shippingInfo?.phone1 ?? "N/A"}`, 14, 70);
    doc.text(`Second Contact: ${order.shippingInfo?.phone2 ?? "N/A"}`, 14, 75);

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Price (INR)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                UTR Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ordered At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change Order Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allOrders.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order._id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.user?.userName ?? "N/A"} ({order.user?.email ?? "N/A"})
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.orderItems?.map((item) => (
                    <div key={item._id} className="flex items-center space-x-2">
                      <img
                        src={item.product?.images[0]?.url ?? ""}
                        alt={item.product?.title ?? "N/A"}
                        className="h-12 w-12 object-contain"
                      />
                      <span>{item.product?.title ?? "N/A"}</span>
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.orderItems?.map((item) => (
                    <div key={item._id} className="text-sm text-gray-500">
                      {item.product?.sizes ?? "N/A"}
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.orderStatus}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(order.totalPrice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order?.paymentInfo?.utr}
                  </td>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select
                    value={order.orderStatus}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200 focus:border-blue-500"
                  >
                    {[
                      "Ordered",
                      "Processing",
                      "Shipped",
                      "Delivered",
                      "Cancelled",
                    ].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
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
