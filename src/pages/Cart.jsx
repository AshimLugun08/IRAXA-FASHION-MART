import { useEffect, useState } from "react";
import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import axios from "axios";

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);
   const [placingOrder, setPlacingOrder] = useState(false);

  // ---------------- FETCH CART ----------------
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch cart");

      const data = await res.json();
      setCart(data);
    } catch (error) {
      console.error(error);
      setCart({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FETCH ADDRESSES ----------------
  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/address`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setAddresses(data.addresses || []);
    } catch (err) {
      console.error("Address fetch error:", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, []);

  // ---------------- REMOVE ITEM ----------------
  const handleRemove = async (itemId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/cart/remove/${itemId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setCart(data);
    } catch (error) {
      console.error(error);
    }
  };

  // ---------------- UPDATE QUANTITY ----------------
  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty <= 0) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/cart/update/${itemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: newQty }),
        }
      );

      if (!res.ok) {
        fetchCart();
        return;
      }

      const data = await res.json();
      setCart(data);
    } catch (error) {
      console.error(error);
      fetchCart();
    }
  };

  // ---------------- PLACE ORDER ----------------
 const handlePlaceOrder = async () => {
  if (!selectedAddress) {
    alert("Please select a delivery address");
    return;
  }

  setPlacingOrder(true);

  try {
    const amount = subtotal + shipping;

    // 1️⃣ Create Razorpay order on backend
    const { data } = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/payment/create-order`,
      { amount },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: "INR",
      order_id: data.orderId,
      name: "IRAXA FASHION MART",
      description: "Order Payment",

      handler: async function (response) {
        // 2️⃣ Verify payment on backend
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/payment/verify`,
          {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            cart,
            addressId: selectedAddress._id,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert("Payment Successful! Order placed.");
        window.location.href = "/orders";
      },

      prefill: {
        name: selectedAddress.fullName,
        contact: selectedAddress.phone,
      },

      theme: { color: "#8b5cf6" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error("Payment error:", err);
    alert("Payment failed");
  } finally {
    setPlacingOrder(false);
  }
};



  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-gray-300 border-t-purple-600 rounded-full" />
      </div>
    );
  }

  const cartItems = cart?.items || [];
  if (!cartItems.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <ShoppingBag className="mx-auto w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-4">Start shopping to add items!</p>
          <a href="/shop" className="bg-purple-600 text-white px-6 py-2 rounded-lg">
            Shop Now
          </a>
        </div>
      </div>
    );
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = 50;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">

        {/* ADDRESS SELECTION */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="font-bold text-lg mb-4">Delivery Address</h2>

          {loadingAddresses ? (
            <p>Loading addresses...</p>
          ) : addresses.length === 0 ? (
            <p className="text-gray-500">
              No addresses found. Please add an address in your profile.
            </p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr._id}
                  className={`block p-4 border rounded-lg cursor-pointer ${
                    selectedAddress?._id === addr._id
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="selectedAddress"
                    checked={selectedAddress?._id === addr._id}
                    onChange={() => setSelectedAddress(addr)}
                    className="mr-2"
                  />
                  <span className="font-semibold">{addr.fullName}</span>
                  <p>{addr.addressLine1}</p>
                  <p>
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p>Phone: {addr.phone}</p>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* CART ITEMS */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="bg-white p-6 rounded-xl shadow hover:shadow-md"
            >
              <div className="flex gap-6">
                <img
                  src={item.image || item.product.images?.[0]}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-xl"
                />

                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-xl font-bold">₹{item.product.price}</p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <button
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          handleQuantityChange(item._id, item.quantity - 1)
                        }
                        className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          handleQuantityChange(item._id, item.quantity + 1)
                        }
                        className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item._id)}
                      className="flex items-center gap-2 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ORDER SUMMARY */}
        <div>
          <div className="bg-white p-6 rounded-xl shadow sticky top-8">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>

            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span>Shipping</span>
              <span>₹{shipping}</span>
            </div>

            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

           <button
  onClick={handlePlaceOrder}
  disabled={placingOrder}
  className={`w-full py-3 rounded-lg mt-4 text-white 
    ${placingOrder ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}
>
  {placingOrder ? (
    <div className="flex items-center justify-center gap-3">
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      Placing order...
    </div>
  ) : (
    "Place Order"
  )}
</button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
