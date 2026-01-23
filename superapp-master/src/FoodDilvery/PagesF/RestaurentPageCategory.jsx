import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Star,
  MapPin,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  TrendingUp,
  Menu
} from 'lucide-react';
import HeaderF from '../ComponentsF/HeaderF';
import FooterFood from '../ComponentsF/FooterFood';
import { restaurantService, dishService, foodCartService, formatImageUrl, formatCurrency } from '../../services/foodDeliveryService';
import { useFoodCart } from '../../Utility/FoodCartContext';

// Filter and sort options
const filterOptions = [
  { id: 'all', name: 'All' },
  { id: 'veg', name: 'Vegetarian' },
  { id: 'non-veg', name: 'Non-Vegetarian' },
  { id: 'vegan', name: 'Vegan' },
  { id: 'gluten-free', name: 'Gluten Free' },
  { id: 'bestseller', name: 'Bestsellers' },
  { id: 'trending', name: 'Trending' }
];

const sortOptions = [
  { id: 'default', name: 'Recommended' },
  { id: 'price-low', name: 'Price: Low to High' },
  { id: 'price-high', name: 'Price: High to Low' },
  { id: 'rating', name: 'Highest Rated' },
  { id: 'popular', name: 'Most Popular' }
];

// Dish Item Component
const DishItem = ({ dish, restaurant, onAddToCart, isAddingToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [showDescription, setShowDescription] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await onAddToCart(dish._id, quantity);
      setQuantity(1); // Reset quantity after adding
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const effectivePrice = dish.sale_price || dish.price;
  const hasDiscount = dish.price > effectivePrice;

  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="relative">
        <img
          src={formatImageUrl(dish.image)}
          alt={dish.name}
          className="w-full h-40 object-cover"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          {dish.is_bestseller && (
            <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shadow-sm">
              Bestseller
            </span>
          )}
          {dish.is_trending && (
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shadow-sm">
              Trending
            </span>
          )}
          {hasDiscount && (
            <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shadow-sm">
              {Math.round(((dish.price - effectivePrice) / dish.price) * 100)}% OFF
            </span>
          )}
        </div>

        {/* Dietary Indicators */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          <div className={`w-6 h-6 border-2 bg-white flex items-center justify-center ${dish.is_veg ? 'border-green-600' : 'border-red-600'} shadow-sm`}>
            <div className={`w-3 h-3 rounded-full ${dish.is_veg ? 'bg-green-600' : 'bg-red-600'}`}></div>
          </div>
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1">
        {/* Dish name and rating */}
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-gray-800 text-base leading-tight line-clamp-1">{dish.name}</h3>
          {dish.rating && (
            <div className="flex items-center bg-green-50 px-1.5 py-0.5 rounded text-green-700 text-xs font-bold flex-shrink-0 ml-2">
              <span className="mr-0.5">{dish.rating}</span>
              <Star size={10} className="fill-current" />
            </div>
          )}
        </div>

        {/* Restaurant name */}
        <p className="text-xs text-gray-500 mb-2 font-medium line-clamp-1">{restaurant?.name}</p>

        {/* Dietary Tags Row */}
        <div className="flex flex-wrap gap-1 mb-2">
          {dish.is_vegan && <span className="text-[10px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded border border-green-200">Vegan</span>}
          {dish.is_gluten_free && <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">Gluten-Free</span>}
        </div>

        {/* Description */}
        <div className="mb-3 flex-1">
          <p className={`text-xs text-gray-600 ${showDescription ? '' : 'line-clamp-2'}`}>
            {dish.description || 'No description available.'}
          </p>
          {dish.description && dish.description.length > 60 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDescription(!showDescription);
              }}
              className="text-orange-600 text-[10px] font-bold mt-0.5 hover:underline"
            >
              {showDescription ? 'Show Less' : 'More'}
            </button>
          )}
        </div>

        {/* Price and Add Action */}
        <div className="mt-auto">
          <div className="flex items-end justify-between mb-2">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-[10px] text-gray-400 font-medium line-through">
                  {formatCurrency(dish.price)}
                </span>
              )}
              <span className="text-lg font-black text-gray-900 leading-none">
                {formatCurrency(effectivePrice)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 h-8">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="px-2 h-full hover:bg-gray-100 disabled:opacity-30 transition-colors text-gray-600"
              >
                <Minus size={12} />
              </button>
              <span className="w-6 text-center font-bold text-gray-800 text-xs">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-2 h-full hover:bg-gray-100 transition-colors text-gray-600"
              >
                <Plus size={12} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAdding || isAddingToCart}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white h-8 rounded-lg font-bold text-xs hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md shadow-orange-200 flex items-center justify-center gap-1 active:scale-95"
            >
              {isAdding ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'ADD'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Restaurant Header Component
const RestaurantHeader = ({ restaurant }) => {
  if (!restaurant) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-3 opacity-10">
        <ShoppingBag size={120} />
      </div>
      <div className="flex flex-col md:flex-row gap-6 relative z-10">
        <img
          src={formatImageUrl(restaurant.image)}
          alt={restaurant.name}
          className="w-full md:w-48 h-48 rounded-xl object-cover shadow-md"
        />
        <div className="flex-1 py-1">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 tracking-tight">{restaurant.name}</h1>
              <p className="text-gray-500 mb-4 text-sm md:text-base max-w-2xl">{restaurant.description || 'Experience the authentic flavors prepared with love and care.'}</p>
            </div>
            {restaurant.rating && (
              <div className="bg-green-600 text-white px-3 py-1.5 rounded-lg flex flex-col items-center shadow-lg transform rotate-2">
                <span className="text-xl font-bold flex items-center gap-1">
                  {restaurant.rating} <Star size={16} className="fill-white" />
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">{restaurant.total_reviews || '500+'} reviews</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 mb-6 bg-gray-50/80 p-3 rounded-lg w-max border border-gray-100">
            <div className="flex items-center gap-1.5 font-medium">
              <div className="bg-orange-100 p-1 rounded-full text-orange-600"><MapPin size={14} /></div>
              {restaurant.location?.area || restaurant.address || 'Location unavailable'}
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-1.5 font-medium">
              <div className="bg-blue-100 p-1 rounded-full text-blue-600"><TrendingUp size={14} /></div>
              {restaurant.delivery_time || '30-40 mins'}
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="font-bold text-gray-900">
              {restaurant.price_tier === 'expensive' ? '₹₹₹' : restaurant.price_tier === 'medium' ? '₹₹' : '₹'}
            </div>
          </div>

          <div className="flex gap-2">
            {restaurant.cuisines?.map((c, i) => (
              <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 shadow-sm uppercase tracking-wide">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function RestaurentPageCategory() {
  const navigate = useNavigate();
  const { restaurentCategoryName, restaurant: restaurantParam } = useParams();

  // State
  const [restaurants, setRestaurants] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToFoodCart } = useFoodCart();
  const [addingToCartId, setAddingToCartId] = useState(null);

  // Filters and sorting
  const [selectedCategories, setSelectedCategories] = useState(['all']);
  const [selectedSort, setSelectedSort] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  // Active Category for scrolling
  const [activeCategory, setActiveCategory] = useState('');

  // Selected restaurant
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const memoizedCategoryName = useMemo(() => restaurentCategoryName, [restaurentCategoryName]);
  const memoizedRestaurantParam = useMemo(() => restaurantParam, [restaurantParam]);

  // Demo Section Categories
  const sectionCategories = ['Recommended', 'Starters', 'Main Course', 'Rice & Biryani', 'Fast Food', 'Beverages', 'Desserts'];

  // Fetch data on component mount
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setError(null);

        if (memoizedRestaurantParam) {
          // Fetch specific restaurant and its dishes
          const [restaurantRes, dishesRes, categoriesRes] = await Promise.all([
            restaurantService.getRestaurantById(memoizedRestaurantParam),
            dishService.getDishesByRestaurant(memoizedRestaurantParam),
            restaurantService.getRestaurantCategories()
          ]);

          if (isMounted && restaurantRes.success) {
            setSelectedRestaurant(restaurantRes.data);
          }

          if (isMounted && dishesRes.success) {
            // Augment dishes with mock details + CATEGORIES
            const augmentedDishes = dishesRes.data.map((d, index) => ({
              ...d,
              is_vegan: d.is_vegan || (!d.is_veg ? false : Math.random() > 0.5),
              is_gluten_free: d.is_gluten_free || Math.random() > 0.7,
              // Assign a mock category if missing
              category: d.category || sectionCategories[index % sectionCategories.length]
            }));
            setDishes(augmentedDishes);
            if (augmentedDishes.length > 0) setActiveCategory(augmentedDishes[0].category);
          }

          if (isMounted && categoriesRes.success) setCategories(categoriesRes.data);
        } else {
          // Fetch restaurants by category
          const categoryFilter = memoizedCategoryName && memoizedCategoryName !== ':restaurentCategoryName'
            ? { category: decodeURIComponent(memoizedCategoryName) }
            : {};

          const [restaurantsRes, dishesRes, categoriesRes] = await Promise.all([
            restaurantService.getAllRestaurants(categoryFilter),
            dishService.getAllDishes(categoryFilter),
            restaurantService.getRestaurantCategories()
          ]);

          if (isMounted && restaurantsRes.success) setRestaurants(restaurantsRes.data);

          if (isMounted && dishesRes.success) {
            const augmentedDishes = dishesRes.data.map((d, index) => ({
              ...d,
              is_vegan: d.is_vegan || (!d.is_veg ? false : Math.random() > 0.5),
              is_gluten_free: d.is_gluten_free || Math.random() > 0.7,
              category: d.category || sectionCategories[index % sectionCategories.length]
            }));
            setDishes(augmentedDishes);
            if (augmentedDishes.length > 0) setActiveCategory(augmentedDishes[0].category);
          }

          if (isMounted && categoriesRes.success) setCategories(categoriesRes.data);
        }

      } catch (err) {
        if (isMounted) {
          console.error('❌ Error fetching data:', err);
          setError(err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [memoizedCategoryName, memoizedRestaurantParam]);

  const toggleCategory = (categoryId) => {
    if (categoryId === 'all') {
      setSelectedCategories(['all']);
      return;
    }
    setSelectedCategories(prev => {
      let newSelection = prev.includes('all') ? [] : [...prev];
      if (newSelection.includes(categoryId)) {
        newSelection = newSelection.filter(id => id !== categoryId);
      } else {
        newSelection.push(categoryId);
      }
      if (newSelection.length === 0) return ['all'];
      return newSelection;
    });
  };

  // Add to cart function
  const handleAddToCart = async (dishId, quantity = 1) => {
    try {
      setAddingToCartId(dishId);
      const response = await addToFoodCart(dishId, quantity);
      if (!response.success) alert(response.message);
    } catch (error) {
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCartId(null);
    }
  };

  // 1. Filter and Sort Dishes FIRST
  const filteredAndSortedDishes = useMemo(() => {
    let filtered = dishes;

    // Search
    if (searchQuery.trim()) {
      filtered = filtered.filter(dish =>
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filters
    if (!selectedCategories.includes('all')) {
      filtered = filtered.filter(dish => {
        return selectedCategories.every(cat => {
          switch (cat) {
            case 'veg': return dish.is_veg;
            case 'non-veg': return !dish.is_veg;
            case 'vegan': return dish.is_vegan;
            case 'gluten-free': return dish.is_gluten_free;
            case 'bestseller': return dish.is_bestseller;
            case 'trending': return dish.is_trending;
            default:
              return dish.cuisines && dish.cuisines.some(c => c.toLowerCase().includes(cat.toLowerCase()));
          }
        });
      });
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (selectedSort) {
        case 'price-low': return (a.sale_price || a.price) - (b.sale_price || b.price);
        case 'price-high': return (b.sale_price || b.price) - (a.sale_price || a.price);
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        case 'popular': return (b.order_count || 0) - (a.order_count || 0);
        default: return 0;
      }
    });

    return sorted;
  }, [dishes, selectedCategories, selectedSort, searchQuery]);

  // 2. Group the FILTERED dishes by Category
  const groupedDishes = useMemo(() => {
    const groups = {};

    // Initialize groups in preferred order (optional)
    sectionCategories.forEach(cat => groups[cat] = []);
    groups['Other'] = [];

    filteredAndSortedDishes.forEach(dish => {
      const cat = dish.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(dish);
    });

    // Remove empty groups
    return Object.fromEntries(Object.entries(groups).filter(([_, items]) => items.length > 0));
  }, [filteredAndSortedDishes]);

  // Dynamic filter pills
  const dynamicCategories = useMemo(() => {
    const baseCategories = [...filterOptions];
    if (categories.length > 0) {
      categories.forEach(category => {
        if (!baseCategories.find(c => c.id === category.slug)) {
          baseCategories.push({
            id: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
            name: category.name
          });
        }
      });
    }
    return baseCategories;
  }, [categories]);

  // Scroll to section handler
  const scrollToSection = (category) => {
    setActiveCategory(category);
    const element = document.getElementById(`section-${category}`);
    if (element) {
      const yOffset = -220; // Adjust for sticky header height
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderF />

      <div className="pt-20 pb-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
          {/* Back Navigation */}
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-orange-600 font-medium mb-6 transition-colors group">
            <span className="bg-white p-2 rounded-full shadow-sm mr-2 group-hover:shadow-md transition-shadow">←</span> Back to Restaurants
          </button>

          {/* Restaurant Header */}
          {selectedRestaurant ? (
            <RestaurantHeader restaurant={selectedRestaurant} />
          ) : (
            <div className="mb-8 ml-2">
              <h1 className="text-3xl font-black text-gray-900">
                {memoizedCategoryName && memoizedCategoryName !== ':restaurentCategoryName' ? decodeURIComponent(memoizedCategoryName) : 'All'} Restaurants
              </h1>
              <p className="text-gray-500 mt-1 font-medium">Explore top rated dishes from the best places</p>
            </div>
          )}

          {/* Sticky UI Container for Search, Filters, and Menu Categories */}
          <div className="sticky top-20 z-30 space-y-4">

            {/* 1. Search & Top Filters */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-gray-100 transition-all">
              <div className="flex flex-col xl:flex-row gap-4 justify-between">
                {/* Left: Search */}
                <div className="relative flex-1 max-w-xl">
                  <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for dishes, cuisines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all text-sm font-medium"
                  />
                </div>

                {/* Right: Filters & Sort */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  {/* Categories Pills */}
                  <div className="flex flex-wrap gap-2 items-center flex-1">
                    {dynamicCategories.slice(0, 8).map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedCategories.includes(cat.id)
                          ? 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-200'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                          }`}
                      >
                        {cat.id === 'all' && selectedCategories.includes('all') && <Star size={10} className="inline mr-1 fill-current" />}
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

                  {/* Sort Dropdown */}
                  <div className="relative min-w-[150px]">
                    <select
                      value={selectedSort}
                      onChange={(e) => setSelectedSort(e.target.value)}
                      className="w-full appearance-none bg-gray-50 hover:bg-white pl-4 pr-10 py-2.5 rounded-xl text-sm font-bold text-gray-700 border border-transparent hover:border-gray-200 focus:ring-0 cursor-pointer transition-all"
                    >
                      {sortOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                      ))}
                    </select>
                    <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Menu Section Navigation (Horizontal Scroll) */}
            {Object.keys(groupedDishes).length > 0 && (
              <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex overflow-x-auto custom-scrollbar p-2 gap-4">
                  {Object.keys(groupedDishes).map(category => (
                    <button
                      key={category}
                      onClick={() => scrollToSection(category)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeCategory === category
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {category}
                      <span className="ml-2 text-xs opacity-60 font-normal">({groupedDishes[category].length})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dishes Grid by Section */}
          <div className="mt-8 space-y-12">
            {Object.entries(groupedDishes).length > 0 ? (
              Object.entries(groupedDishes).map(([category, items]) => (
                <div key={category} id={`section-${category}`} className="scroll-mt-64">
                  {/* Section Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">{category}</h2>
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="text-sm font-bold text-gray-400">{items.length} items</span>
                  </div>

                  {/* Items Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((dish) => (
                      <DishItem
                        key={dish._id}
                        dish={dish}
                        restaurant={selectedRestaurant || restaurants.find(r => r._id === dish.restaurant_id)}
                        onAddToCart={handleAddToCart}
                        isAddingToCart={addingToCartId === dish._id}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                <div className="text-6xl mb-4 opacity-50">🥗</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No dishes match your filters</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Try removing some filters or search for something else.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategories(['all']);
                    setSelectedSort('default');
                  }}
                  className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-1 transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      <FooterFood />
    </div>
  );
}

export default RestaurentPageCategory;