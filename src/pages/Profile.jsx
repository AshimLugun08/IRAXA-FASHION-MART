// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "../hooks/use-toast";

// Address API
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../api/address";

// Modals
import AddAddressModal from "../components/AddAddressModal";
import EditAddressModal from "../components/EditAddressModal";

const Profile = ({ user, onLogout }) => {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("profile");

  // Orders
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Fetch Orders
  useEffect(() => {
    if (user && activeTab === "orders") {
      loadOrders();
    }
  }, [user, activeTab]);

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/orders/my-orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch Addresses
  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        const res = await getAddresses();
        setAddresses(res.data.addresses);
      } catch (err) {
        console.error("Failed to load addresses");
      } finally {
        setLoadingAddresses(false);
      }
    }

    fetchData();
  }, [user]);

  // Add Address
  const handleSaveAddress = async (formData) => {
    try {
      const res = await addAddress(formData);

      setAddresses((prev) => [...prev, res.data.address]);
      setShowAddModal(false);

      toast({ title: "Success", description: "Address added successfully!" });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to add address",
        variant: "destructive",
      });
    }
  };

  // Update Address
  const handleUpdateAddress = async (formData) => {
    try {
      const res = await updateAddress(formData._id, formData);

      setAddresses((prev) =>
        prev.map((addr) =>
          addr._id === formData._id ? res.data.address : addr
        )
      );

      setShowEditModal(false);

      toast({ title: "Updated", description: "Address updated successfully!" });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to update address",
        variant: "destructive",
      });
    }
  };

  // No user → show login page
  if (!user) {
    return (
      <div className="p-8 text-center text-gray-700 text-xl">
        Please log in to access your profile.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">

        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="bg-white rounded-lg shadow">

          {/* Tabs */}
          <div className="border-b">
            <nav className="flex -mb-px">

              {["profile", "orders", "addresses"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 font-medium ${
                    activeTab === tab
                      ? "border-b-2 border-black text-black"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "profile" && "Profile"}
                  {tab === "orders" && "My Orders"}
                  {tab === "addresses" && "Addresses"}
                </button>
              ))}

            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Personal Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{user.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Order History</h2>

                {loadingOrders ? (
                  <p>Loading orders...</p>
                ) : orders.length === 0 ? (
                  <p className="text-gray-500">No orders yet.</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="border rounded p-4">
                        <p className="font-semibold">Order #{order.orderId}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p>Status: {order.status}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === "addresses" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">My Addresses</h2>

                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded mb-4"
                  onClick={() => setShowAddModal(true)}
                >
                  + Add New Address
                </button>

                {loadingAddresses ? (
                  <p>Loading addresses...</p>
                ) : addresses.length === 0 ? (
                  <p className="text-gray-500">No addresses added.</p>
                ) : (
                  <div className="space-y-4">

                    {addresses.map((addr) => (
                      <div
                        key={addr._id}
                        className="border rounded p-4 shadow-sm"
                      >
                        <p className="font-semibold">{addr.fullName}</p>
                        <p>{addr.addressLine1}</p>
                        <p>
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p>Phone: {addr.phone}</p>

                        <div className="flex gap-4 mt-3">
                          <button
                            className="px-4 py-1 border rounded"
                            onClick={() => {
                              setEditingAddress(addr);
                              setShowEditModal(true);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            className="px-4 py-1 bg-red-600 text-white rounded"
                            onClick={async () => {
                              await deleteAddress(addr._id);
                              setAddresses(addresses.filter((a) => a._id !== addr._id));
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}

                  </div>
                )}

                <AddAddressModal
                  isOpen={showAddModal}
                  onClose={() => setShowAddModal(false)}
                  onSave={handleSaveAddress}
                />

                <EditAddressModal
                  isOpen={showEditModal}
                  onClose={() => setShowEditModal(false)}
                  existing={editingAddress}
                  onSave={handleUpdateAddress}
                />
              </div>
            )}
          </div>
        </div>

        <button
          className="mt-6 bg-red-600 text-white px-6 py-2 rounded"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
