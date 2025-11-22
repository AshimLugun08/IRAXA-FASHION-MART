// src/App.js

import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
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

const API_BASE_URL =`${import.meta.env.VITE_BACKEND_URL}`; ;

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
    toast({
      title: "Logged out 👋",
      description: "You have been successfully logged out.",
    });
  }, [toast]);

  // ---------------- FETCH LOGGED-IN USER ----------------
  const fetchUserProfile = useCallback(
    async (token) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const realUser = response.data.user;
        setUser(realUser);
        localStorage.setItem("user", JSON.stringify(realUser));

        toast({
          title: "Welcome 🎉",
          description: realUser.name || realUser.email,
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        handleLogout();
      }
    },
    [handleLogout, toast]
  );

  // ---------------- RESTORE USER ON PAGE REFRESH ----------------
 useEffect(() => {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  // console.log("Auth Restore Effect RUNNING",{user});

  console.log("Restoring user:", storedUser, "Token:", token);

  if (token && storedUser) {
    setUser(JSON.parse(storedUser));  // ✔ Restore actual user object
    fetchUserProfile(token);          // ✔ Verify token
  }

  setLoadingUser(false);
}, [fetchUserProfile]);


  // ---------------- AXIOS AUTH HEADER ----------------
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

  // ---------------- LOAD CART WHEN USER LOGS IN ----------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && user) {
      axios
        .get(`${API_BASE_URL}/cart`)
        .then((res) => setCart(res.data.items || []))
        .catch(() => {});
    }
  }, [user]);

  // ---------------- PLACEHOLDER ACTIONS ----------------
  const addToCart = (product) => console.log("Added:", product);
  const toggleWishlist = (id) => console.log("Wishlist:", id);
  const handleCartClick = () => console.log("Cart Clicked");

  // ---------------- COMMON PROPS ----------------
  const commonProps = {
    cart,
    wishlist,
    onAddToCart: addToCart,
    onToggleWishlist: toggleWishlist,
    onCartClick: handleCartClick,
    user,
    onLogout: handleLogout,
    onRequireAuth: openAuthModal,
  };

  // ---------------- LOADING ----------------
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
        onCartClick={handleCartClick}
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

          {/* Google OAuth Callback */}
          <Route path="/auth-callback" element={<AuthCallback />} />

          <Route
            path="/product/:id"
            element={<ProductDetails onRequireAuth={openAuthModal} />}
          />

          {/* Protected */}
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

// ---------------- MAIN APP ----------------
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
