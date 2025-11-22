// src/App.js

import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { Toaster } from "./components/ui/toaster";
import { useToast } from "./hooks/use-toast";
import axios from "axios";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import NewArrivals from "./pages/NewArrivals";
import InfluencerPicks from "./pages/InfluencerPicks";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import CartPage from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails";
import AuthCallback from "./pages/AuthCallback";

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}`;

const AppContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  const openAuthModal = () => setIsAuthModalOpen(true);

  // ---------------- LOGOUT ----------------
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setCart([]);

    // 🔥 Notify Header + App instantly
    window.dispatchEvent(new Event("userLoggedOut"));

    toast({
      title: "Logged out 👋",
      description: "You have been successfully logged out.",
    });
  }, [toast]);

  // ---------------- FETCH USER PROFILE ----------------
  const fetchUserProfile = useCallback(
    async (token) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const realUser = response.data.user;

        setUser(realUser); // update state
        localStorage.setItem("user", JSON.stringify(realUser));

        toast({
          title: "Welcome 🎉",
          description: realUser.name,
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        handleLogout();
      }
    },
    [handleLogout, toast]
  );

  // ---------------- RESTORE USER ON REFRESH ----------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    console.log("Restoring user:", storedUser, "Token:", token);

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      fetchUserProfile(token);
    }

    setLoadingUser(false);
  }, [fetchUserProfile]);

  // ---------------- LISTEN FOR LOGIN / LOGOUT EVENTS ----------------
  useEffect(() => {
    function updateUser() {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed); // 🔥 update immediately after login
      } else {
        setUser(null); // logout case
      }
    }

    window.addEventListener("userLoggedIn", updateUser);
    window.addEventListener("userLoggedOut", updateUser);

    return () => {
      window.removeEventListener("userLoggedIn", updateUser);
      window.removeEventListener("userLoggedOut", updateUser);
    };
  }, []);

  // ---------------- AXIOS INTERCEPTORS ----------------
  useEffect(() => {
    const req = axios.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    const res = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(req);
      axios.interceptors.response.eject(res);
    };
  }, [handleLogout]);

  // ---------------- LOAD CART WHEN USER CHANGES ----------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && user) {
      axios
        .get(`${API_BASE_URL}/cart`)
        .then((res) => setCart(res.data.items || []))
        .catch(() => {});
    }
  }, [user]);

  const commonProps = {
    cart,
    wishlist,
    onLogout: handleLogout,
    user,
    onRequireAuth: openAuthModal,
  };

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-700">
        Loading user...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        user={user}
        onLogout={handleLogout}
        isAuthModalOpen={isAuthModalOpen}
        setIsAuthModalOpen={setIsAuthModalOpen}
      />

      <main>
        <Routes>
          <Route path="/" element={<Home {...commonProps} />} />
          <Route path="/shop" element={<Shop {...commonProps} />} />
          <Route path="/new-arrivals" element={<NewArrivals {...commonProps} />} />
          <Route path="/influencer-picks" element={<InfluencerPicks {...commonProps} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<CartPage {...commonProps} />} />

          <Route path="/auth-callback" element={<AuthCallback />} />

          <Route
            path="/product/:id"
            element={<ProductDetails onRequireAuth={openAuthModal} />}
          />

          <Route
            path="/profile"
            element={user ? <Profile {...commonProps} /> : <Navigate to="/" />}
          />

          <Route
            path="/checkout"
            element={user ? <Checkout cart={cart} user={user} /> : <Navigate to="/" />}
          />

          <Route path="/orders" element={<Orders user={user} />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
