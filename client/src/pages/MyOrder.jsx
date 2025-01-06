import React, { useEffect, useState } from "react";
import { getAllOrder } from "../services/operations/order";
import { useSelector } from "react-redux";
import { FaMoneyBillAlt } from "react-icons/fa";

function MyOrder() {
  const [orders, setOrders] = useState([]);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchAllOrders = getAllOrder();
        const res = await fetchAllOrders(token);
        setOrders(res);
      } catch (error) {
        console.error("Error fetching orders:", error);
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

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-500 to-green-500 text-white py-6 shadow-md">
        <h2 className="text-center text-3xl font-bold">Your Orders</h2>
      </header>

      <div className="container mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="text-center text-2xl text-gray-600 mt-10">
            No Order Found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-gray-200 rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">
                    <strong>Order ID:</strong> {order.order_id}
                  </span>
                  <span className="text-gray-600">
                    <strong>Order Date:</strong>{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">
                    Shipping Information:
                  </h3>
                  <p className="text-gray-700">{order.shippingInfo.name}</p>
                  <p className="text-gray-700">{order.shippingInfo.address}</p>
                  <p className="text-gray-700">
                    {order.shippingInfo.city}, {order.shippingInfo.state} -{" "}
                    {order.shippingInfo.pincode}
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">
                    Order Items:
                  </h3>
                  <ul className="list-disc pl-5">
                    {order.orderItems.map((item) => (
                      <li
                        key={item._id}
                        className="flex items-center mb-2 text-gray-700"
                      >
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-full mr-3"
                        />
                        <span>
                          {item.product.title} - Quantity: {item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FaMoneyBillAlt className="text-green-500" />
                    <strong>Total Price:</strong> {formatPrice(order.totalPrice)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.orderStatus === "Delivered"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrder;
