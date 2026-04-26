// ProductDetails.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

const ProductDetails = ({ onAddToCart, onRequireAuth }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/products/${id}`
        );
        const data = await res.json();
        setProduct(data);

        // Set the first image as selected by default
        const firstImage =
          data.images?.[0]?.url || data.images?.[0] || data.image || null;
        setSelectedImage(firstImage);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading product...</p>
      </div>
    );
  }

  // Normalize images array to always be an array of URL strings
  const images = (product.images || []).map((img) =>
    typeof img === "string" ? img : img.url
  );
  if (!images.length && product.image) images.push(product.image);

  const handleAddToCart = async () => {
    if (!token) {
      alert("Please log in or sign up to continue.");
      onRequireAuth && onRequireAuth();
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity,
          priceAtTimeOfAddition: product.price,
          size: "M",
          color: "Red",
          image: images[0] || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("❌ " + (data.message || "Could not add to cart."));
        return;
      }

      alert("✅ Added to cart!");
      window.dispatchEvent(new Event("cartUpdated"));
      navigate("/cart");
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="container mx-auto p-8 flex flex-col md:flex-row gap-8">

      {/* ── LEFT: Image Gallery ── */}
      <div className="w-full md:w-1/2 flex flex-col gap-3">

        {/* Main Image */}
        <div className="w-full aspect-square rounded-lg overflow-hidden border border-gray-200">
          <img
            src={selectedImage || "/placeholder.png"}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-300"
          />
        </div>

        {/* Thumbnails — only render if more than 1 image */}
        {images.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {images.map((url, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(url)}
                className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all duration-200 ${selectedImage === url
                    ? "border-purple-600 opacity-100"
                    : "border-transparent opacity-60 hover:opacity-90"
                  }`}
              >
                <img
                  src={url}
                  alt={`${product.name} view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── RIGHT: Product Details ── */}
      <div className="flex-1">
        <h1 className="text-3xl font-semibold mb-4">{product.name}</h1>
        <p className="text-gray-600 mb-2">{product.description}</p>
        <p className="text-xl font-bold mb-6">
          ₹{product.price?.toLocaleString()}
        </p>

        {/* Quantity Selector */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-1 border rounded"
          >
            -
          </button>
          <span className="text-lg">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-3 py-1 border rounded"
          >
            +
          </button>
        </div>

        {/* Add to Cart */}
        <Button
          onClick={handleAddToCart}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductDetails;