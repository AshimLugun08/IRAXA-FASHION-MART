import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Star,
  ShoppingCart,
  ChevronRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Heart,
  Plus,
  Minus
} from "lucide-react";
import { Button } from "../components/ui/button";

const ProductDetails = ({ onRequireAuth }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("Black");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/products/${id}`);
        const data = await res.json();
        setProduct(data);
        const firstImage = data.images?.[0]?.url || data.images?.[0] || data.image || null;
        setSelectedImage(firstImage);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading premium product...</p>
        </div>
      </div>
    );
  }

  const images = (product.images || []).map((img) => (typeof img === "string" ? img : img.url));
  if (!images.length && product.image) images.push(product.image);

  const handleAddToCart = async () => {
    if (!token) {
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
          size: selectedSize,
          color: selectedColor,
          image: images[0] || "",
        }),
      });

      if (!res.ok) throw new Error("Failed to add");
      window.dispatchEvent(new Event("cartUpdated"));
      navigate("/cart");
    } catch (err) {
      alert("Something went wrong!");
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* ── BREADCRUMBS ── */}
      <nav className="container mx-auto px-6 py-4">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li><Link to="/" className="hover:text-purple-600">Home</Link></li>
          <ChevronRight size={14} />
          <li><Link to="/shop" className="hover:text-purple-600">Shop</Link></li>
          <ChevronRight size={14} />
          <li className="text-gray-900 font-medium truncate">{product.name}</li>
        </ol>
      </nav>

      <main className="container mx-auto px-6 pb-20">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* ── LEFT: IMAGE GALLERY ── */}
          <div className="w-full lg:w-[55%] space-y-4">
            <div className="relative group aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 border border-gray-100">
              <img
                src={selectedImage || "/placeholder.png"}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <button className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors">
                <Heart size={20} className="text-gray-600 hover:text-red-500" />
              </button>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(url)}
                    className={`relative min-w-[100px] h-28 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === url ? "border-purple-600 ring-2 ring-purple-100" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                  >
                    <img src={url} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: PRODUCT INFO ── */}
          <div className="flex-1 lg:sticky lg:top-24 h-fit">
            <div className="space-y-6">
              <div>
                <span className="text-purple-600 text-sm font-bold tracking-widest uppercase">Premium Collection</span>
                <h1 className="text-4xl font-bold text-gray-900 mt-2">{product.name}</h1>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center bg-yellow-400/10 px-2 py-1 rounded">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < 4 ? "#facc15" : "none"} className={i < 4 ? "text-yellow-400" : "text-gray-300"} />
                    ))}
                    <span className="ml-2 text-sm font-semibold text-yellow-700">4.8</span>
                  </div>
                  <span className="text-sm text-gray-500 border-l pl-4 border-gray-200">120 Reviews</span>
                  <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded">In Stock</span>
                </div>
              </div>

              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
                {product.oldPrice && (
                  <span className="text-xl text-gray-400 line-through">₹{product.oldPrice.toLocaleString()}</span>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed ring-1 ring-gray-100 p-4 rounded-xl bg-gray-50/50">
                {product.description || "Elevate your daily style with this premium piece. Crafted with the finest materials for durability and comfort."}
              </p>

              {/* Color Selector */}
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-700">Color: {selectedColor}</label>
                <div className="flex gap-3">
                  {["Black", "Navy", "Gray"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color ? "border-purple-600 ring-2 ring-purple-100 scale-110" : "border-transparent"
                        }`}
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-700">Select Size</label>
                  <button className="text-sm text-purple-600 hover:underline">Size Guide</button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {["S", "M", "L", "XL"].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 rounded-lg font-medium border transition-all ${selectedSize === size
                          ? "bg-purple-600 border-purple-600 text-white shadow-md"
                          : "bg-white border-gray-200 text-gray-600 hover:border-purple-400"
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex gap-4 pt-4">
                <div className="flex items-center border-2 border-gray-100 rounded-xl px-2">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:text-purple-600 transition-colors">
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:text-purple-600 transition-colors">
                    <Plus size={18} />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gray-900 hover:bg-black text-white h-14 rounded-xl text-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  Add to Bag
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Truck size={20} /></div>
                  <span className="text-xs font-medium text-gray-600">Free Shipping</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg text-green-600"><ShieldCheck size={20} /></div>
                  <span className="text-xs font-medium text-gray-600">2 Year Warranty</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><RotateCcw size={20} /></div>
                  <span className="text-xs font-medium text-gray-600">30-Day Returns</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetails;