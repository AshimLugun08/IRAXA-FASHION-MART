// frontend/src/pages/Orders.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Orders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("User in Orders component:", user);
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // 🛑 FIX 1: Use the correct endpoint for logged-in user's orders
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/orders/my-orders`, { 
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrders(res.data);
      } catch (error) {
        console.error('Fetch orders error:', error.response ? error.response.data : error.message);
        // Optionally handle 401/403 errors (e.g., clear token and redirect to login)
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]); // Dependency array ensures this runs when 'user' object is available

  // --- RENDER LOGIC ---

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please login to view orders</h2>
          <a
            href="/auth"
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
          >
            Login
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-medium">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">My Orders History</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-6">
              Start shopping to see your orders here.
            </p>
            <a
              href="/shop"
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition duration-150"
            >
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
                <div className="flex justify-between items-start mb-4 pb-3 border-b">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Order ID: {order._id.substring(0, 8)}...</h3>
                    <p className="text-sm text-gray-500">
                      Placed on **{new Date(order.createdAt).toLocaleDateString()}**
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-indigo-600">
                      ₹{order.totalAmount.toFixed(2)}
                    </p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium uppercase mt-1 inline-block ${
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'shipped'
                          ? 'bg-blue-100 text-blue-700'
                          : order.status === 'paid' || order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.products.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4"
                    >
                      <img
  src={item.product.images?.[0]?.url || "/placeholder.jpg"}
  alt={item.product.name}
  className="w-16 h-16 object-cover rounded-md border"
/>

                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.product.name}</p>
                        <p className="text-sm text-gray-500">
                          Qty: **{item.quantity}** @ ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-800">
                        ₹{(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;