import React, { useState, useEffect } from "react";
import axios from "axios";

const OrdersForHierarchy = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const memberId = '6773dc21704ec96477f5e8ff'
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(`http://localhost:8080/api/orders/${memberId}`);
        if (data.success) {
          setOrders(data.orders);
        } else {
          setError("Failed to fetch orders.");
        }
      } catch (err) {
        setError(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [memberId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Orders for Member and Hierarchy</h1>
      {orders.length > 0 ? (
        <ul>
          {orders.map((order) => (
            <li key={order._id}>
              <strong>Order ID:</strong> {order.order_id} <br />
              <strong>User:</strong> {order.user?.fName} {order.user?.lName} (
              {order.user?.userName}) <br />
              <strong>Total Price:</strong> {order.totalPrice} <br />
              <strong>Status:</strong> {order.orderStatus} <br />
              <hr />
            </li>
          ))}
        </ul>
      ) : (
        <p>No orders found for this member hierarchy.</p>
      )}
    </div>
  );
};

export default OrdersForHierarchy;
