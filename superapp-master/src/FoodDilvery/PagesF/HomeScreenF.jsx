import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BsArrowRight, BsFire } from 'react-icons/bs';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Star, TrendingUp, Clock, MapPin, Filter as FilterIcon } from 'lucide-react';
import HeaderF from '../ComponentsF/HeaderF';
import FooterFood from '../ComponentsF/FooterFood';
import FoodFilters from '../ComponentsF/FoodFilters';

// Import our new food delivery service
import {
  restaurantService,
  dishService,
  formatImageUrl,
  formatCurrency,
  formatTime
} from '../../services/foodDeliveryService';

// Keep static banner images for now
import promoBanner1 from "../ImagesF/indian-banner1.jpg";
import promoBanner2 from "../ImagesF/indian-banner2.jpg";
import promoBanner3 from "../ImagesF/indian-banner3.jpg";
import mainBanner1 from "../ImagesF/main-banner1.jpg";
import mainBanner2 from "../ImagesF/main-banner2.jpg";
import mainBanner3 from "../ImagesF/main-banner3.jpg";

// Banners Data
const promoBanners = [
  { id: 1, imageF: promoBanner1, alt: "Weekend Special Offer" },
  { id: 2, imageF: promoBanner2, alt: "Family Combo Deal" },
  { id: 3, imageF: promoBanner3, alt: "Festival Discount" }
];

const mainBanners = [
  {
    id: 1,
    title: "BIG",
    subtitle: "Home delivery",
    offers: [
      { type: "Flat", discount: "25% off", description: "No packaging charges" },
      { type: "Flat", discount: "35% off", description: "CakeZone Patisserie" }
    ],
    image: mainBanner1,
    overlay: "rgba(0,0,0,0.3)"
  },
  {
    id: 2,
    title: "SPECIAL",
    subtitle: "Weekend offer",
    offers: [
      { type: "Flat", discount: "30% off", description: "On all orders" },
      { type: "Extra", discount: "Free item", description: "With every purchase" }
    ],
    image: mainBanner2,
    overlay: "rgba(0,0,0,0.25)"
  },
  {
    id: 3,
    title: "NEW",
    subtitle: "Try our specials",
    offers: [
      { type: "Combo", discount: "40% off", description: "Family meal deal" },
      { type: "Free", discount: "Delivery", description: "On orders above $20" }
    ],
    image: mainBanner3,
    overlay: "rgba(0,0,0,0.35)"
  }
];

// Components
const CategoryItem = ({ category }) => {
  const navigate = useNavigate();
  return (
    <div
      className="flex flex-col items-center cursor-pointer px-1 group"
      onClick={() => navigate(`/home-food/restaurent-list-based-on-category/${encodeURIComponent(category.name)}`)}
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-50 flex items-center justify-center rounded-full mb-3 border-2 border-orange-100 overflow-hidden group-hover:border-orange-400 transition-colors shadow-sm">
        {category.image ? (
          <img
            src={formatImageUrl(category.image)}
            alt={category.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-orange-600 font-bold text-lg">
            {category.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <p className="text-sm text-center font-semibold text-gray-700 truncate w-full group-hover:text-orange-600 transition-colors">
        {category.name}
      </p>
    </div>
  );
};

const RestaurantItem = ({ restaurant }) => {
  const navigate = useNavigate();

  // Helper to safely get offer text
  const getOfferText = (offer) => {
    if (!offer) return null;
    if (typeof offer === 'string') return offer;
    if (offer.title) return offer.title;
    if (offer.discount_percentage) return `${offer.discount_percentage}% OFF`;
    if (offer.discount) return offer.discount;
    return 'Special Offer';
  };

  const offerText = getOfferText(restaurant.offers);

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group h-full flex flex-col"
      onClick={() => navigate(`/home-food/restaurent-list-based-on-category/All/restaurant/${restaurant._id}`)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={formatImageUrl(restaurant.image)}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

        {/* Offers Badge */}
        {offerText && (
          <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-orange-600 text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
            <BsFire size={12} /> {offerText}
          </span>
        )}

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center shadow-md">
          <span className="mr-1">{restaurant.rating || 4.2}</span>
          <Star size={10} className="fill-current" />
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-800 mb-1 leading-tight group-hover:text-orange-600 transition-colors">{restaurant.name}</h3>

        <p className="text-sm text-gray-500 mb-3 truncate">
          {restaurant.cuisines?.join(', ') || 'Fast Food, Beverages'}
        </p>

        <div className="mt-auto flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
            <Clock size={12} className="mr-1.5 text-gray-400" />
            <span className="font-medium text-gray-700">{restaurant.delivery_time || '35 mins'}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-700">{restaurant.price_tier === 'expensive' ? '₹₹₹' : restaurant.price_tier === 'medium' ? '₹₹' : '₹'}</span>
            <span className="mx-1">•</span>
            <span className="truncate max-w-[80px]">{restaurant.location?.area || 'Nearby'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const BestsellerItem = ({ dish }) => {
  const navigate = useNavigate();
  return (
    <div
      className="w-60 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all group flex-shrink-0"
      onClick={() => navigate(`/home-food/product-details`, { state: { dish } })}
    >
      <div className="relative h-32">
        {dish.image ? (
          <img
            src={formatImageUrl(dish.image)}
            alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-orange-50 flex items-center justify-center">
            <span className="text-orange-300 font-bold text-2xl">{dish.name.charAt(0)}</span>
          </div>
        )}
        {dish.is_veg ? (
          <span className="absolute top-2 left-2 bg-green-50 rounded px-1.5 py-0.5 border border-green-200">
            <div className="w-2 h-2 rounded-full bg-green-600"></div>
          </span>
        ) : (
          <span className="absolute top-2 left-2 bg-red-50 rounded px-1.5 py-0.5 border border-red-200">
            <div className="w-2 h-2 rounded-full bg-red-600"></div>
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-bold text-gray-800 truncate text-sm mb-1">{dish.name}</h3>
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-900">{formatCurrency(dish.price)}</span>
          <button className="text-orange-600 font-bold text-xs uppercase hover:bg-orange-50 px-2 py-1 rounded transition-colors">
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

function HomeScreenF() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: 'relevance',
    cuisines: [],
    priceRange: [],
    deliveryTime: null,
    rating: null,
    dietary: []
  });

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [restaurantsRes, categoriesRes, bestSellersRes] = await Promise.all([
          restaurantService.getAllRestaurants().catch(e => ({ success: false, message: e.message })),
          restaurantService.getRestaurantCategories().catch(e => ({ success: false, message: e.message })),
          dishService.getBestsellerDishes().catch(e => ({ success: false, message: e.message }))
        ]);

        if (restaurantsRes.success) {
          // Augment with mock data if needed for filtering
          const augmentedRestaurants = restaurantsRes.data.map(r => ({
            ...r,
            price_tier: r.price_tier || ['cheap', 'medium', 'expensive'][Math.floor(Math.random() * 3)],
            delivery_time_min: parseInt(r.delivery_time) || 30 + Math.floor(Math.random() * 30),
            is_veg_friendly: Math.random() > 0.3,
            is_vegan_friendly: Math.random() > 0.7,
            is_gluten_free: Math.random() > 0.8
          }));
          setRestaurants(augmentedRestaurants);
        }
        if (categoriesRes.success) setCategories(categoriesRes.data);
        if (bestSellersRes.success) setBestSellers(bestSellersRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtering Logic
  const filteredRestaurants = useMemo(() => {
    let result = [...restaurants];

    // Filter: Cuisines
    if (filters.cuisines.length > 0) {
      result = result.filter(r =>
        r.cuisines?.some(c => filters.cuisines.some(filterC => c.toLowerCase().includes(filterC.toLowerCase()))) ||
        filters.cuisines.includes('All')
      );
    }

    // Filter: Price Range
    if (filters.priceRange.length > 0) {
      result = result.filter(r => filters.priceRange.includes(r.price_tier));
    }

    // Filter: Rating
    if (filters.rating) {
      result = result.filter(r => (r.rating || 0) >= filters.rating);
    }

    // Filter: Delivery Time
    if (filters.deliveryTime) {
      result = result.filter(r => (r.delivery_time_min || 30) <= filters.deliveryTime);
    }

    // Filter: Dietary
    if (filters.dietary.length > 0) {
      if (filters.dietary.includes('veg')) result = result.filter(r => r.is_veg_friendly);
      if (filters.dietary.includes('vegan')) result = result.filter(r => r.is_vegan_friendly);
      if (filters.dietary.includes('gluten-free')) result = result.filter(r => r.is_gluten_free);
    }

    // Sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'rating_desc':
          result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'delivery_time':
          result.sort((a, b) => (a.delivery_time_min || 0) - (b.delivery_time_min || 0));
          break;
        case 'cost_asc':
          const tierMap = { 'cheap': 1, 'medium': 2, 'expensive': 3 };
          result.sort((a, b) => (tierMap[a.price_tier] || 2) - (tierMap[b.price_tier] || 2));
          break;
        case 'cost_desc':
          const tierMapDesc = { 'cheap': 1, 'medium': 2, 'expensive': 3 };
          result.sort((a, b) => (tierMapDesc[b.price_tier] || 2) - (tierMapDesc[a.price_tier] || 2));
          break;
        default:
          break;
      }
    }

    return result;
  }, [restaurants, filters]);

  const handleFilterChange = (category, value) => {
    setFilters(prev => ({ ...prev, [category]: value }));
  };

  const clearFilters = () => {
    setFilters({
      sortBy: 'relevance',
      cuisines: [],
      priceRange: [],
      deliveryTime: null,
      rating: null,
      dietary: []
    });
  };

  const hasActiveFilters =
    filters.cuisines.length > 0 ||
    filters.priceRange.length > 0 ||
    filters.deliveryTime ||
    filters.rating ||
    filters.dietary.length > 0;

  // Slider settings
  const categorySliderSettings = {
    dots: false, infinite: false, speed: 500, slidesToShow: 6, slidesToScroll: 2,
    responsive: [{ breakpoint: 1024, settings: { slidesToShow: 5 } }, { breakpoint: 768, settings: { slidesToShow: 4 } }, { breakpoint: 480, settings: { slidesToShow: 3.5 } }]
  };

  const bestSellerSliderSettings = {
    dots: false, infinite: false, speed: 500, slidesToShow: 4.5, slidesToScroll: 2,
    responsive: [{ breakpoint: 1024, settings: { slidesToShow: 3.5 } }, { breakpoint: 768, settings: { slidesToShow: 2.2 } }, { breakpoint: 480, settings: { slidesToShow: 1.5 } }]
  };

  if (loading) return <div className="min-h-screen bg-gray-50 pt-20 flex justify-center"><div className="animate-spin h-10 w-10 border-4 border-orange-500 rounded-full border-t-transparent"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <HeaderF />

      {/* 
          Main Content Container 
          - pt-28 (7rem/112px): Ensures enough space below fixed header (h-16/64px) + margin
      */}
      <div className="pt-28 px-4 pb-20 max-w-[1440px] mx-auto flex gap-8">

        {/* Sidebar Filters (Desktop) 
            - Sticky: Sticks to the viewport top (adjusted by top-28 to account for header) 
            - h-[calc...] to prevent scrolling issues
        */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-2">
            <FoodFilters
              isOpen={true}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              availableCuisines={categories}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {!hasActiveFilters && (
            <>
              {/* Banners */}
              <div className="mb-8 rounded-2xl overflow-hidden shadow-sm">
                <Swiper modules={[Autoplay]} autoplay={{ delay: 4000 }} loop={true} className="h-48 md:h-64 lg:h-72 w-full">
                  {mainBanners.map(banner => (
                    <SwiperSlide key={banner.id}>
                      <div className="relative w-full h-full">
                        <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 flex flex-col justify-center px-8 md:px-16 text-white">
                          <h2 className="text-3xl md:text-5xl font-black mb-2">{banner.title}</h2>
                          <p className="text-xl md:text-2xl font-medium mb-4">{banner.subtitle}</p>
                          <button className="bg-white text-orange-600 px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform w-max">Order Now</button>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">What's on your mind?</h2>
                  <Slider {...categorySliderSettings}>
                    {categories.map(cat => (
                      <CategoryItem key={cat._id} category={cat} />
                    ))}
                  </Slider>
                </div>
              )}

              {/* Best Sellers */}
              {bestSellers.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 px-1 flex items-center gap-2"><BsFire className="text-orange-500" /> Best Sellers</h2>
                  <Slider {...bestSellerSliderSettings}>
                    {bestSellers.map(dish => (
                      <div key={dish._id} className="px-2 py-2">
                        <BestsellerItem dish={dish} />
                      </div>
                    ))}
                  </Slider>
                </div>
              )}
            </>
          )}

          {/* Restaurants Section */}
          <div id="restaurants-section" className="scroll-mt-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {hasActiveFilters ? `Filtered Restaurants (${filteredRestaurants.length})` : 'All Restaurants'}
              </h2>

              {/* Mobile Filter Toggle Button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 active:scale-95 transition-all"
              >
                <FilterIcon size={18} /> Filters
                {hasActiveFilters && <span className="bg-white text-orange-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">!</span>}
              </button>
            </div>

            {/* Results Grid */}
            {filteredRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRestaurants.map(restaurant => (
                  <RestaurantItem key={restaurant._id} restaurant={restaurant} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 dark:bg-zinc-900/50">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No restaurants found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters to find what you're looking for.</p>
                <button onClick={clearFilters} className="text-orange-600 font-bold hover:underline">Clear all filters</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal (Drawer) */}
      <div className="lg:hidden">
        <FoodFilters
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          availableCuisines={categories}
        />
      </div>

      <FooterFood />
    </div>
  );
}

export default HomeScreenF;