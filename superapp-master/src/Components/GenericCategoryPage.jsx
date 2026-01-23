import API_CONFIG from "../config/api.config.js";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { useCart } from '../Utility/CartContext';
import MyntraClothesHeader from '../Clothes/Header/MyntraClothesHeader';
import Footer from '../Utility/Footer';
import { fetchAllProducts, transformProductForFrontend } from '../services/productService';

const GenericCategoryPage = () => {
  const { categorySlug, subcategorySlug, parentSlug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all products for filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [pendingQuantity, setPendingQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const stored = localStorage.getItem('clothesRecentSearches');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // Convert slug to display name
  const getCategoryDisplayName = (slug) => {
    if (!slug || typeof slug !== 'string') {
      return 'Unknown Category';
    }
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Custom toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Get token
        let token = localStorage.getItem('token') ||
          localStorage.getItem('authToken') ||
          localStorage.getItem('adminToken') ||
          'demo-token';

        console.log('🚀 === ENHANCED DEBUG - GenericCategoryPage ===');
        console.log('📍 Current URL:', window.location.pathname);
        console.log('📊 URL Params:', { parentSlug, categorySlug, subcategorySlug });
        console.log('🔑 Token:', token ? 'Present' : 'Missing');

        const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.PRODUCTS), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();

        // Extract products array
        let products = [];
        if (Array.isArray(data)) {
          products = data;
        } else if (data.data && Array.isArray(data.data)) {
          products = data.data;
        } else if (data.products && Array.isArray(data.products)) {
          products = data.products;
        }

        console.log('📦 Total Products Fetched:', products.length);

        // Show sample product structure
        if (products.length > 0) {
          console.log('📋 Sample Product Structure:', {
            name: products[0].name,
            category_id: products[0].category_id,
            sub_category_id: products[0].sub_category_id
          });
        }

        // ✅ ENHANCED FILTERING LOGIC
        console.log('🔍 === FILTERING PRODUCTS ===');

        let filteredProducts = [];

        // Check what we're filtering by
        if (subcategorySlug) {
          console.log('🎯 FILTERING BY SUBCATEGORY:', subcategorySlug);

          filteredProducts = products.filter(product => {
            console.log(`\n🔍 Checking Product: ${product.name}`);

            if (!product.sub_category_id) {
              console.log('❌ No sub_category_id');
              return false;
            }

            const subCatData = product.sub_category_id;
            console.log('📂 Product subcategory data:', subCatData);

            // Get subcategory slug from product
            let productSubSlug = null;
            if (typeof subCatData === 'object' && subCatData.slug) {
              productSubSlug = subCatData.slug;
            } else if (typeof subCatData === 'object' && subCatData.name) {
              productSubSlug = subCatData.name.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');
            }

            console.log('🏷️ Product subcategory slug:', productSubSlug);
            console.log('🎯 Looking for slug:', subcategorySlug);

            const matches = productSubSlug && productSubSlug.toLowerCase() === subcategorySlug.toLowerCase();
            console.log('✅ Matches:', matches);

            return matches;
          });

        } else if (categorySlug) {
          console.log('🎯 FILTERING BY MAIN CATEGORY:', categorySlug);

          filteredProducts = products.filter(product => {
            if (!product.category_id) return false;

            const catData = product.category_id;
            let productCatSlug = null;

            if (typeof catData === 'object' && catData.slug) {
              productCatSlug = catData.slug;
            } else if (typeof catData === 'object' && catData.name) {
              productCatSlug = catData.name.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');
            }

            return productCatSlug && productCatSlug.toLowerCase() === categorySlug.toLowerCase();
          });
        }

        console.log('📊 === FILTERING RESULTS ===');
        console.log('📦 Total products:', products.length);
        console.log('✅ Filtered products:', filteredProducts.length);
        console.log('📋 Filtered product names:', filteredProducts.map(p => p.name));

        setProducts(filteredProducts);
        setAllProducts(filteredProducts); // Store for filtering
        setFilteredProducts(filteredProducts); // Initialize filtered products
        setError(null);

      } catch (error) {
        console.error('🚨 Error fetching products:', error);
        setError(error.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug, subcategorySlug, parentSlug]);

  const handleAddToCart = (product) => {
    if (!product) return;
    setPendingProduct(product);
    setPendingQuantity(1);
    setShowConfirmModal(true);
  };

  const executeAddToCart = async () => {
    if (!pendingProduct) return;
    const product = pendingProduct;
    const quantity = pendingQuantity;
    setShowConfirmModal(false);

    try {
      setAdding(true);
      const productId = product._id || product.id;
      await addToCart(productId, quantity);
      showToast(`${product.name} added to cart!`, 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast(`Failed to add ${product.name} to cart`, 'error');
    } finally {
      setAdding(false);
      setPendingProduct(null);
    }
  };

  // Filter and search products
  useEffect(() => {
    let filtered = [...allProducts];

    // Apply search filter
    if (searchQuery?.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand_id?.name && product.brand_id.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply selected filters
    if (selectedFilters.length > 0) {
      // Filter by price ranges
      const priceFilters = selectedFilters.filter(f => f.includes('₹') || f.includes('Under'));
      if (priceFilters.length > 0) {
        filtered = filtered.filter(product => {
          const price = product.sale_price || product.price || 0;
          return priceFilters.some(filter => {
            if (filter.includes('Under')) {
              const max = parseInt(filter.match(/\d+/)?.[0] || '0');
              return price <= max;
            }
            if (filter.includes('-')) {
              const [min, max] = filter.match(/\d+/g) || [];
              return price >= parseInt(min) && price <= parseInt(max);
            }
            return true;
          });
        });
      }

      // Filter by discount/offers
      const discountFilters = selectedFilters.filter(f => f.includes('%'));
      if (discountFilters.length > 0) {
        filtered = filtered.filter(product => {
          if (product.sale_price && product.price) {
            const discount = ((product.price - product.sale_price) / product.price) * 100;
            return discountFilters.some(filter => {
              const minDiscount = parseInt(filter.match(/\d+/)?.[0] || '0');
              return discount >= minDiscount;
            });
          }
          return false;
        });
      }
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedFilters, allProducts]);

  // Search results for the header dropdown and mobile modal
  const headerSearchResults = useMemo(() => {
    if (!searchQuery?.trim()) return [];
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand_id?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 6).map(p => ({
      ...p,
      image: p.photo || p.featured_image || p.image,
      discountedPrice: p.sale_price || p.price
    }));
  }, [searchQuery, allProducts]);

  const toggleFilters = () => setShowFilters(!showFilters);

  const applyFilters = (filters) => {
    setSelectedFilters(filters);
    setShowFilters(false);
  };

  const removeFilter = (filterToRemove) => {
    setSelectedFilters(selectedFilters.filter(filter => filter !== filterToRemove));
  };

  // Dynamic filter options based on available products
  const filterOptions = useMemo(() => {
    const options = {
      price: ["Under ₹500", "₹500 - ₹1000", "₹1000 - ₹2000", "₹2000 - ₹3000", "₹3000 - ₹5000", "Above ₹5000"],
      discount: ["10% and above", "20% and above", "30% and above", "40% and above", "50% and above"],
      brand: [],
      category: [],
      gender: ["Men", "Women", "Unisex"],
      rating: ["4★ & above", "3★ & above", "2★ & above"],
      offers: ["Best Seller", "New Arrival", "On Sale"]
    };

    if (allProducts.length > 0) {
      // Extract unique brands
      options.brand = [...new Set(allProducts.map(p => p.brand_id?.name).filter(Boolean))].sort();

      // Extract unique subcategories
      options.category = [...new Set(allProducts.map(p => p.sub_category_id?.name).filter(Boolean))].sort();

      // Clean up empty categories
      if (options.brand.length === 0) delete options.brand;
      if (options.category.length === 0) delete options.category;
    }

    return options;
  }, [allProducts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MyntraClothesHeader
          searchQuery={""}
          setSearchQuery={() => { }}
          showBackButton={true}
        />
        <div className="pt-24 px-4">
          <div className="text-center py-8">
            <div className="text-lg text-gray-600">Loading products...</div>
            <div className="text-sm text-gray-500 mt-2">
              Subcategory: {subcategorySlug || 'None'} | Category: {categorySlug || 'None'}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MyntraClothesHeader
          searchQuery={""}
          setSearchQuery={() => { }}
          showBackButton={true}
        />
        <div className="pt-24 px-4">
          <div className="text-center py-8">
            <div className="text-lg text-red-600 mb-4">Error: {error}</div>
            <div className="text-sm text-gray-500 mb-4">
              URL: {window.location.pathname}<br />
              Params: parent={parentSlug}, category={categorySlug}, sub={subcategorySlug}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const displayName = subcategorySlug
    ? getCategoryDisplayName(subcategorySlug)
    : getCategoryDisplayName(categorySlug || parentSlug);

  return (
    <div className="min-h-screen bg-white">
      {/* Custom Toast Notification */}
      {toast.show && (
        <div className={`fixed top-24 right-4 z-[200] px-6 py-3 rounded-lg shadow-xl transform transition-all duration-300 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm tracking-tight">{toast.message}</span>
            <button
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
              className="ml-4 text-white hover:opacity-75 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <MyntraClothesHeader
        showBackButton={true} // Enabled back button in header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={headerSearchResults}
        showSearchDropdown={searchQuery?.trim().length > 0}
        handleSearchFocus={() => { }}
        handleProductNavigate={(p) => navigate(`/product/${p.id || p._id}`)}
        searchLoading={false}
        searchMessage={headerSearchResults.length === 0 ? "No products found" : ""}
        recentSearches={recentSearches}
        handleClearRecentSearches={() => { setRecentSearches([]); localStorage.removeItem('clothesRecentSearches'); }}
        handleRecentSearchClick={(term) => setSearchQuery(term)}
        toggleFilter={() => setShowFilters(true)}
      />

      <main className="pt-28 pb-20 px-4">
        <div className="max-w-[1248px] mx-auto text-left">

          {/* Breadcrumbs */}
          <div className="text-[10px] sm:text-xs text-gray-500 mb-4 flex items-center gap-2 uppercase tracking-widest font-bold">
            <span className="cursor-pointer hover:text-pink-500 transition-colors" onClick={() => navigate('/home-clothes')}>Home</span>
            <span className="text-gray-300">/</span>
            <span className="cursor-pointer hover:text-pink-500 transition-colors" onClick={() => navigate(`/categories/${parentSlug}`)}>
              {getCategoryDisplayName(parentSlug)}
            </span>
            {categorySlug && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900 font-black">{getCategoryDisplayName(categorySlug)}</span>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-4 mb-8">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tighter">
              {getCategoryDisplayName(subcategorySlug || categorySlug || parentSlug)}
              <span className="ml-3 text-xs sm:text-sm font-bold text-gray-400 capitalize normal-case tracking-normal">
                - {filteredProducts.length} items
              </span>
            </h1>

            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center justify-center gap-2 px-6 py-2 border-2 border-gray-100 rounded-sm hover:border-pink-500 hover:text-pink-500 transition-all text-xs font-black uppercase tracking-widest bg-white"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>

          {/* Active Filters Display */}
          {selectedFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Applied:</span>
              {selectedFilters.map((filter, index) => (
                <button
                  key={index}
                  onClick={() => removeFilter(filter)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black text-gray-600 hover:bg-white hover:border-pink-500 group transition-all"
                >
                  {filter} <X size={12} className="text-gray-300 group-hover:text-pink-500" />
                </button>
              ))}
              <button
                onClick={() => setSelectedFilters([])}
                className="text-[10px] font-black text-pink-500 px-4 py-1.5 hover:underline uppercase tracking-widest"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-10 gap-x-4 sm:gap-x-8">
              {filteredProducts.map((product) => (
                <div
                  key={product._id || product.id}
                  className="group cursor-pointer flex flex-col"
                  onClick={() => navigate(`/product/${product.id || product._id}`)}
                >
                  <div className="aspect-[3/4] relative bg-[#f9f9f9] overflow-hidden mb-4">
                    <img
                      src={product.photo || product.featured_image || product.image || '/placeholder-image.png'}
                      alt={product.name}
                      className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    {product.sale_price && product.sale_price < product.price && (
                      <div className="absolute top-3 left-3 bg-pink-500 text-white text-[9px] font-black px-2 py-1 shadow-sm uppercase">
                        SALE
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md p-3 translate-y-full group-hover:translate-y-0 transition-transform flex flex-col gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="w-full bg-pink-600 text-white text-[10px] font-black py-2 rounded-sm active:scale-95 transition-all uppercase tracking-widest"
                      >
                        Add to Cart
                      </button>
                      <span className="text-[10px] font-black text-gray-900 tracking-tighter uppercase text-center">View Details</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-black text-gray-800 line-clamp-1 group-hover:text-pink-600 transition-colors uppercase tracking-tight">
                      {product.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                      {product.brand_id?.name || 'Essential'}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="font-black text-gray-900 text-sm italic">
                        ₹{product.sale_price || product.price}
                      </span>
                      {product.sale_price && product.sale_price < product.price && (
                        <span className="text-[11px] text-gray-400 line-through">
                          ₹{product.price}
                        </span>
                      )}
                      {product.sale_price && product.sale_price < product.price && (
                        <span className="text-[10px] text-pink-500 font-black">
                          ({Math.round(((product.price - product.sale_price) / product.price) * 100)}% OFF)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 flex flex-col items-center max-w-sm mx-auto">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Search size={32} className="text-gray-200" />
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-2">No items found</h3>
              <p className="text-sm text-gray-400 font-medium mb-10">We couldn't find any products matching your current selection. Try broader filters or keywords.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedFilters([]); }}
                className="w-full py-4 bg-gray-900 text-white font-black rounded-sm shadow-xl active:scale-[0.98] transition-all uppercase tracking-widest text-[10px]"
              >
                Clear All Search & Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Filter Modal */}
      {showFilters && (
        <FilterModal
          onClose={() => setShowFilters(false)}
          onApply={applyFilters}
          filterOptions={filterOptions}
          selectedFilters={selectedFilters}
        />
      )}
      {/* Add To Cart Confirmation Modal */}
      <Dialog open={showConfirmModal} onClose={() => setShowConfirmModal(false)} className="z-[301] fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="p-8 text-center text-left">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShoppingCart size={32} className="text-pink-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-2">Confirm Add</h3>
            <p className="text-gray-500 font-medium mb-6">Do you want to add <span className="text-gray-900 font-bold">{pendingProduct?.name}</span> to your cart?</p>

            {/* Quantity Selector in Modal */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span>Quantity</span>
                <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-gray-100">
                  <button
                    onClick={() => setPendingQuantity(Math.max(1, pendingQuantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-pink-600 hover:bg-pink-50 rounded-lg transition-colors border border-pink-50"
                  >
                    -
                  </button>
                  <span className="text-gray-900 w-4 text-center font-black">{pendingQuantity}</span>
                  <button
                    onClick={() => setPendingQuantity(Math.min(20, pendingQuantity + 1))}
                    className="w-8 h-8 flex items-center justify-center text-pink-600 hover:bg-pink-50 rounded-lg transition-colors border border-pink-50"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Cost</span>
                <span className="text-xl font-black text-pink-600 italic">₹{(pendingProduct?.sale_price || pendingProduct?.price || 0) * pendingQuantity}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingProduct(null);
                }}
                className="py-4 px-6 border-2 border-gray-100 rounded-2xl text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={executeAddToCart}
                className="py-4 px-6 bg-pink-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-pink-100 active:scale-95 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      <Footer />
    </div>
  );
};

// Filter Modal Component - Collapsible (Accordion) Style for Mobile
function FilterModal({ onClose, onApply, filterOptions, selectedFilters: initialFilters }) {
  const [selectedSubFilters, setSelectedSubFilters] = useState(initialFilters);
  const [expandedCategories, setExpandedCategories] = useState(['price', 'discount']); // Default expanded

  const categories = Object.keys(filterOptions);

  const toggleCategory = (cat) => {
    setExpandedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleFilter = (filter) => {
    setSelectedSubFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const handleApply = () => {
    onApply(selectedSubFilters);
  };

  const handleClear = () => {
    setSelectedSubFilters([]);
  };

  return (
    <div className="z-[300] fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center sm:items-center">
      <div className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} className="text-gray-900" />
            </button>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Filters</h2>
          </div>
          <button
            onClick={handleClear}
            className="text-pink-600 text-sm font-black uppercase tracking-widest hover:bg-pink-50 px-3 py-1 rounded"
          >
            Clear All
          </button>
        </div>

        {/* Collapsible Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {categories.map((cat) => (
            <div key={cat} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleCategory(cat)}
                className={`w-full flex items-center justify-between p-4 text-left transition-colors ${expandedCategories.includes(cat) ? 'bg-pink-50/50' : 'bg-white'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-black uppercase tracking-tight ${expandedCategories.includes(cat) ? 'text-pink-600' : 'text-gray-800'
                    }`}>
                    {cat}
                  </span>
                  {selectedSubFilters.some(f => filterOptions[cat]?.includes(f)) && (
                    <span className="bg-pink-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {selectedSubFilters.filter(f => filterOptions[cat]?.includes(f)).length}
                    </span>
                  )}
                </div>
                {expandedCategories.includes(cat) ? (
                  <ChevronUp size={20} className="text-pink-600" />
                ) : (
                  <ChevronDown size={20} className="text-gray-400" />
                )}
              </button>

              {expandedCategories.includes(cat) && (
                <div className="p-4 bg-white grid grid-cols-2 gap-3 animate-in fade-in zoom-in-95 duration-200">
                  {filterOptions[cat]?.map((option) => (
                    <button
                      key={option}
                      onClick={() => toggleFilter(option)}
                      className={`text-[11px] font-bold py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center text-center leading-tight ${selectedSubFilters.includes(option)
                        ? 'bg-pink-600 border-pink-600 text-white shadow-lg shadow-pink-100'
                        : 'bg-white border-gray-100 text-gray-600 hover:border-pink-200'
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50/30 grid grid-cols-2 gap-4">
          <button
            onClick={onClose}
            className="w-full py-4 px-6 border-2 border-gray-200 rounded-2xl text-gray-700 font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all bg-white"
          >
            Discard
          </button>
          <button
            onClick={handleApply}
            className="w-full py-4 px-6 bg-pink-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl shadow-pink-100"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenericCategoryPage; 