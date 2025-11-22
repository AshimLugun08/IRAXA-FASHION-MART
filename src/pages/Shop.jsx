import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Link } from 'react-router';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/products`;

const MOCK_CATEGORIES = [
  { id: 1, name: 'Co-ord Sets' },
  { id: 2, name: 'Dresses' },
  { id: 3, name: 'Vests' },
  { id: 4, name: 'Collections' },
];

const Shop = ({ onAddToCart }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState('all');

  // NEW: Track which product is loading for Add-to-Cart
  const [addingProductId, setAddingProductId] = useState(null);
  const [addedSuccessId, setAddedSuccessId] = useState(null);

  // ---- FETCH PRODUCTS ----
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setAllProducts(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please check server.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ---- HANDLE ADD TO CART ----
  const handleAddToCart = async (e, product) => {
    e.preventDefault();

    setAddingProductId(product._id);

    try {
      await onAddToCart(product);

      // Show Added ✓ success
      setAddedSuccessId(product._id);

      // 🔥 Real time update for Header/App
      window.dispatchEvent(new Event("cartUpdated"));

      setTimeout(() => setAddedSuccessId(null), 1200);
    } catch (err) {
      console.error("Add to cart failed:", err);
    } finally {
      setAddingProductId(null);
    }
  };

  // ---- FILTERING ----
  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      product.category?.toLowerCase() === selectedCategory;

    const matchesPrice = (() => {
      const price = product.price;
      switch (priceRange) {
        case 'under-5000': return price < 5000;
        case '5000-10000': return price >= 5000 && price <= 10000;
        case '10000-15000': return price > 10000 && price <= 15000;
        case 'above-15000': return price > 15000;
        default: return true;
      }
    })();

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // ---- SORTING ----
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'name': return a.name.localeCompare(b.name);
      case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
      default: return 0;
    }
  });

  // ---- LOADING SCREEN ----
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-gray-800" />
        <p className="ml-2 text-lg text-gray-800">Loading Products...</p>
      </div>
    );
  }

  // ---- ERROR SCREEN ----
  if (error) {
    return (
      <div className="min-h-screen text-center py-20">
        <h2 className="text-xl text-red-600 font-semibold">Error</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* HEADER */}
      <div className="bg-gray-50 py-16 text-center">
        <h1 className="text-4xl font-serif text-gray-800">Shop All</h1>
        <p className="text-gray-600">Discover our luxury collections</p>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* FILTER SIDEBAR */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-lg mb-6">Filters</h3>

              {/* Search */}
              <div className="mb-6">
                <label className="block mb-2 text-sm text-gray-600">Search</label>
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block mb-2 text-sm">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {MOCK_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name.toLowerCase()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block mb-2 text-sm">Price Range</label>

                {[
                  ['under-5000', 'Under ₹5,000'],
                  ['5000-10000', '₹5,000 - ₹10,000'],
                  ['10000-15000', '₹10,000 - ₹15,000'],
                  ['above-15000', 'Above ₹15,000'],
                ].map(([value, label]) => (
                  <label key={value} className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={priceRange === value}
                      onChange={() =>
                        setPriceRange(priceRange === value ? 'all' : value)
                      }
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* PRODUCT GRID */}
          <div className="lg:w-3/4">

            {/* Top Bar */}
            <div className="flex justify-between mb-6">
              <p className="text-gray-600">
                Showing {sortedProducts.length} of {allProducts.length} products
              </p>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name: A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* PRODUCT LIST */}
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                  : 'space-y-4'
              }
            >
              {sortedProducts.map((product) => {
                const image = product?.images?.[0]?.url || "/placeholder.jpg";

                return (
                  <Link to={`/product/${product._id}`} key={product._id}>
                    <div className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all">

                      {/* Product Image */}
                      <div className="relative overflow-hidden aspect-[3/4]">
                        <img
                          src={image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />

                        {/* ADD TO CART BUTTON */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition">
                          <Button
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={addingProductId === product._id}
                            className="w-32"
                          >
                            {addingProductId === product._id ? (
                              <Loader2 className="animate-spin h-4 w-4" />
                            ) : addedSuccessId === product._id ? (
                              "Added ✓"
                            ) : (
                              "Add to Cart"
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="p-3">
                        <p className="text-xs text-gray-500">{product.category}</p>
                        <h3 className="font-medium line-clamp-2">{product.name}</h3>
                        <p className="font-semibold">Rs. {product.price.toLocaleString()}</p>
                      </div>

                    </div>
                  </Link>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
