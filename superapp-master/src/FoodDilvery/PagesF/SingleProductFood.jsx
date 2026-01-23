import API_CONFIG from "../../config/api.config.js";
import React, { useState, useEffect } from 'react';
import search from "../../Icons/search.svg";
import cross from "../../Icons/close-circle.svg";
import mic from "../../Icons/Mic.svg";
import star from "../../Icons/Star.svg";
import { FaFilter } from 'react-icons/fa';
import HeaderInsideFood from '../ComponentsF/HeaderInsideFood';
import FooterFood from '../ComponentsF/FooterFood';
import { useNavigate, useParams } from 'react-router-dom';
import { restaurantService, dishService, foodCartService } from '../../services/foodDeliveryService';
import { useFoodCart } from '../../Utility/FoodCartContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dialog } from '@headlessui/react';
import { FaShoppingCart } from 'react-icons/fa';


// Food-specific filters
const foodFilters = {
  price: ["Under ₹100", "₹100-200", "₹200-500", "Above ₹500"],
  category: ["North Indian", "South Indian", "Chinese", "Desserts", "Beverages"],
  spice_level: ["Mild", "Medium", "Hot"],
  dietary: ["Vegetarian", "Non-Vegetarian", "Vegan"]
};

function SingleProductFood() {
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [pendingDish, setPendingDish] = useState(null);
  const [pendingQuantity, setPendingQuantity] = useState(1);
  const [addingDishId, setAddingDishId] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({}); // Track expanded state for each dish

  const toggleFilters = () => setShowFilters(!showFilters);

  const applyFilters = (filters) => {
    setSelectedFilters(filters);
    setShowFilters(false);
  };

  const removeFilter = (filterToRemove) => {
    setSelectedFilters(selectedFilters.filter(filter => filter !== filterToRemove));
  };

  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [allDishes, setAllDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);

  const { addToFoodCart, setFoodCart } = useFoodCart(); // <-- Use the context

  // Fetch restaurant and dishes data
  useEffect(() => {
    const fetchRestaurantAndDishes = async () => {
      try {
        setLoading(true);
        console.log('🍽️ Fetching restaurant and dishes for vendorId:', vendorId);

        // Fetch restaurant details
        const restaurantRes = await restaurantService.getRestaurantById(vendorId);
        console.log('✅ Restaurant response:', restaurantRes);

        // Fetch dishes for this restaurant
        const dishesRes = await dishService.getDishesByRestaurant(vendorId);
        console.log('✅ Dishes response:', dishesRes);

        if (restaurantRes.success) {
          setRestaurant(restaurantRes.data);
        }

        if (dishesRes.success) {
          setAllDishes(dishesRes.data);
          setFilteredDishes(dishesRes.data);
        }

      } catch (error) {
        console.error('❌ Error fetching restaurant and dishes:', error);
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) {
      fetchRestaurantAndDishes();
    }
  }, [vendorId]);

  // Filter and search dishes
  useEffect(() => {
    let filtered = [...allDishes];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(dish =>
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply selected filters
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(dish => {
        return selectedFilters.some(filter => {
          // Price filters
          if (filter === "Under ₹100" && dish.price < 100) return true;
          if (filter === "₹100-200" && dish.price >= 100 && dish.price <= 200) return true;
          if (filter === "₹200-500" && dish.price >= 200 && dish.price <= 500) return true;
          if (filter === "Above ₹500" && dish.price > 500) return true;

          // Category filters
          if (filter === "Vegetarian" && dish.is_veg) return true;
          if (filter === "Non-Vegetarian" && !dish.is_veg) return true;

          // Spice level filters
          if (filter === "Mild" && dish.spice_level === 'mild') return true;
          if (filter === "Medium" && dish.spice_level === 'medium') return true;
          if (filter === "Hot" && dish.spice_level === 'hot') return true;

          return false;
        });
      });
    }

    setFilteredDishes(filtered);
  }, [allDishes, searchQuery, selectedFilters]);

  // Fixed Add to Cart function with defensive checks and logging
  const handleAddToCart = (dish) => {
    if (!dish || !dish._id) {
      toast.error('Invalid dish. Please try again.');
      return;
    }
    setPendingDish(dish);
    setPendingQuantity(1);
    setShowAddConfirm(true);
  };

  const executeAddToCart = async () => {
    if (!pendingDish) return;
    const dish = pendingDish;
    const quantity = pendingQuantity;
    setShowAddConfirm(false);

    try {
      setAddingDishId(dish._id);
      const result = await addToFoodCart(dish._id, quantity);
      if (result.success) {
        toast.success(`Added ${dish.name} to cart!`);
        console.log('✅ Added to food cart successfully');
        // No need to manually refresh, context will update
      } else {
        if (result.message && result.message.includes('one restaurant at a time')) {
          setPendingDish(dish);
          setShowConfirmDialog(true);
        } else {
          toast.error(`Failed to add ${dish.name}: ${result.message}`);
        }
        console.error('❌ Failed to add to food cart:', result.message);
      }
    } catch (error) {
      console.error('❌ Error adding to food cart:', error);
      toast.error(`Error adding ${dish.name} to cart`);
    } finally {
      setAddingDishId(null);
    }
  };

  // Handle confirmation dialog
  const handleConfirmClearCart = async () => {
    if (!pendingDish) return;

    try {
      console.log('🔄 Clearing cart and retrying...');
      const clearResult = await foodCartService.clearFoodCart();

      if (clearResult.success) {
        // Re-fetch dishes to ensure fresh data
        const dishesRes = await dishService.getDishesByRestaurant(vendorId);
        if (dishesRes.success) {
          const freshDish = dishesRes.data.find(d => d._id === pendingDish._id);
          if (!freshDish) {
            toast.error('Dish is no longer available.');
            return;
          }
          // Now try adding again after clearing
          const retryResult = await foodCartService.addToFoodCart({ dish_id: freshDish._id, quantity: 1 });
          if (retryResult.success) {
            setFoodCart(retryResult.data); // <-- update cart context immediately
            toast.success(`Added ${freshDish.name} to cart!`);
            console.log('✅ Added to food cart after clearing');
          } else {
            toast.error(`Failed to add ${freshDish.name}: ${retryResult.message}`);
            console.error('❌ Failed to add after clearing:', retryResult.message);
          }
        } else {
          toast.error('Failed to reload dishes after clearing cart.');
        }
      } else {
        toast.error(`Failed to clear cart: ${clearResult.message}`);
        console.error('❌ Failed to clear cart:', clearResult.message);
      }
    } catch (error) {
      console.error('❌ Error in confirmation process:', error);
      toast.error('Error processing request');
    } finally {
      setShowConfirmDialog(false);
      setPendingDish(null);
    }
  };

  const handleCancelClearCart = () => {
    setShowConfirmDialog(false);
    setPendingDish(null);
  };

  // Add clear cart function
  const handleClearCart = async () => {
    try {
      const result = await foodCartService.clearFoodCart();
      if (result.success) {
        toast.success('Cart cleared successfully!');
        console.log('✅ Cart cleared');
      } else {
        toast.error(`Failed to clear cart: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      toast.error('Error clearing cart');
    }
  };

  // Add this function to check current cart
  const checkCurrentCart = async () => {
    try {
      const cartResult = await foodCartService.getFoodCart();
      console.log('🛒 Current cart:', cartResult);

      if (cartResult.success && cartResult.data) {
        console.log('🛒 Cart restaurant ID:', cartResult.data.restaurant_id);
        console.log('🛒 Current restaurant ID:', vendorId);
        console.log('📍 Match?', cartResult.data.restaurant_id === vendorId);
      }
    } catch (error) {
      console.error('❌ Error checking cart:', error);
    }
  };

  // Call this when component mounts
  useEffect(() => {
    if (vendorId) {
      checkCurrentCart();
    }
  }, [vendorId]);

  // Helper function to format image URLs
  const formatImageUrl = (imagePath) => {
    if (!imagePath) return '';

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    if (imagePath.startsWith('/')) {
      return API_CONFIG.getUrl(imagePath);
    }

    return API_CONFIG.getUploadUrl(imagePath);
  };

  return (
    <div className='min-h-screen'>
      {/* Toast Notification */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <HeaderInsideFood />
      <div className='mt-24 pb-32 px-4'>

        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading restaurant menu...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center w-full mt-2">
              <div className="font-medium text-base">{restaurant?.name}</div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClearCart}
                  className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                >
                  Clear Cart
                </button>
                <div className="flex items-center">
                  <img src={star} alt="Star" className="w-4 h-4" />
                  <span className="ml-1 text-[#242424] text-base font-medium">{restaurant?.rating || 0}</span>
                </div>
              </div>
            </div>

            {/* Restaurant image */}
            {restaurant?.image && (
              <div className="w-full mt-4">
                <img
                  src={formatImageUrl(restaurant.image)}
                  alt={restaurant.name}
                  className="w-full h-48 object-cover rounded-2xl"
                />
              </div>
            )}

            <div className="text-center font-medium text-base mt-4">Menu</div>

            {/* Search and filters */}
            <div className="flex justify-center mt-2 items-center bg-white">
              <div className="relative w-full max-w-md">
                <img
                  src={search}
                  alt="search"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-7 h-7"
                />
                <input
                  type="text"
                  placeholder="What do you want.."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-24 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF]"
                />
                <img
                  src={mic}
                  alt="mic"
                  className="absolute right-14 top-1/2 transform -translate-y-1/2 w-7 h-7 cursor-pointer"
                />
                <button
                  onClick={toggleFilters}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                  title="Filters"
                >
                  <FaFilter className="w-5 h-5 text-[#5C3FFF]" />
                  {selectedFilters.length > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold">
                      {selectedFilters.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Selected Filters Display */}
            {selectedFilters.length > 0 && (
              <div className="overflow-x-auto whitespace-nowrap mt-2 mb-3">
                <div className="flex gap-2">
                  {selectedFilters.map((filter, index) => (
                    <span
                      key={index}
                      className="text-[#484848] text-xs px-3 py-2 bg-[#F7F5FF] border border-[#5C3FFF] rounded-full cursor-pointer inline-block"
                      onClick={() => removeFilter(filter)}
                    >
                      {filter} ✕
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Dishes list */}
            {filteredDishes.length > 0 ? (
              filteredDishes.map((dish, index) => (
                <div key={dish._id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
                  <div className="flex items-center space-x-4">
                    {dish.image ? (
                      <img
                        src={formatImageUrl(dish.image)}
                        alt={dish.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-orange-100 flex items-center justify-center rounded-lg">
                        <span className="text-orange-600 font-bold text-lg">
                          {dish.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{dish.name}</h3>

                      {/* Description with Read More / Show Less */}
                      <div className="text-gray-600 text-sm mt-1">
                        {dish.description && (
                          <div>
                            <p className={expandedDescriptions[dish._id] ? '' : 'line-clamp-2'}>
                              {dish.description}
                            </p>
                            {dish.description && dish.description.length > 100 && (
                              <button
                                onClick={() => setExpandedDescriptions(prev => ({
                                  ...prev,
                                  [dish._id]: !prev[dish._id]
                                }))}
                                className="text-orange-500 text-sm font-medium mt-1 hover:text-orange-600 transition-colors"
                              >
                                {expandedDescriptions[dish._id] ? 'Show Less' : 'Read More'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-orange-600 font-bold">₹{dish.price}</span>
                        <button
                          onClick={() => handleAddToCart(dish)}
                          disabled={addingDishId === dish._id}
                          className={`px-4 py-2 rounded-lg transition-colors flex items-center ${addingDishId === dish._id
                            ? 'bg-orange-300 text-white cursor-not-allowed'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                            }`}
                        >
                          {addingDishId === dish._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Adding...
                            </>
                          ) : (
                            'Add'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 mt-8">
                {searchQuery || selectedFilters.length > 0
                  ? "No dishes match your search or filters."
                  : "No dishes available for this restaurant."}
              </div>
            )}

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                  <h3 className="text-lg font-semibold mb-4">Clear Cart?</h3>
                  <p className="text-gray-600 mb-6">
                    You can only order from one restaurant at a time. Would you like to clear your cart and add {pendingDish?.name}?
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCancelClearCart}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmClearCart}
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      Clear & Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Filter Modal */}
            {showFilters && (
              <FilterModal
                onClose={() => setShowFilters(false)}
                onApply={applyFilters}
                selectedFilters={selectedFilters}
              />
            )}
          </>
        )}
      </div>
      <FooterFood />

      {/* Add To Cart Confirmation Modal */}
      <Dialog open={showAddConfirm} onClose={() => setShowAddConfirm(false)} className="z-[101] fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="p-8 text-center text-left">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShoppingCart size={32} className="text-orange-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-2">Confirm Add</h3>
            <p className="text-gray-500 font-medium mb-6">Do you want to add <span className="text-gray-900 font-bold">{pendingDish?.name}</span> to your cart?</p>

            {/* Quantity Selector in Modal */}
            <div className="bg-orange-50/50 rounded-2xl p-4 mb-6 text-left border border-orange-100">
              <div className="flex items-center justify-between mb-3 text-[10px] font-black text-orange-400 uppercase tracking-widest">
                <span>Quantity</span>
                <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-orange-100">
                  <button
                    onClick={() => setPendingQuantity(Math.max(1, pendingQuantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-orange-50"
                  >
                    -
                  </button>
                  <span className="text-gray-900 w-4 text-center font-black">{pendingQuantity}</span>
                  <button
                    onClick={() => setPendingQuantity(Math.min(20, pendingQuantity + 1))}
                    className="w-8 h-8 flex items-center justify-center text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-orange-50"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-orange-100">
                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Subtotal</span>
                <span className="text-xl font-black text-orange-600 italic">₹{(pendingDish?.price || 0) * pendingQuantity}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowAddConfirm(false);
                  setPendingDish(null);
                }}
                className="py-4 px-6 border-2 border-gray-100 rounded-2xl text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={executeAddToCart}
                className="py-4 px-6 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-100 active:scale-95 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

// Updated Filter Modal with food-specific filters
function FilterModal({ onClose, onApply, selectedFilters }) {
  const [localFilters, setLocalFilters] = useState(selectedFilters);

  const toggleFilter = (filter) => {
    setLocalFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleClear = () => {
    setLocalFilters([]);
  };

  return (
    <div className="z-50 fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end">
      <div className="bg-[#F8F8F8] w-full p-6 rounded-t-[30px] max-h-[75vh] flex flex-col relative">

        {/* Fixed Header */}
        <div className="sticky top-0 left-0 right-0 bg-[#F8F8F8] z-10 flex justify-between items-center">
          <h2 className="text-sm py-3 font-medium bg-[#5C3FFF] rounded-[60px] px-8 text-white">
            Filters
          </h2>
          <img onClick={onClose} src={cross} alt="Close" className="cursor-pointer w-5 h-5" />
        </div>

        {/* Scrollable Filter Options */}
        <div className="flex-1 overflow-auto mt-4 mb-12">
          {Object.entries(foodFilters).map(([category, options]) => (
            <div key={category} className="mb-4">
              <h3 className="font-medium text-lg mt-4 text-[#242424]">{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {options.map((option) => (
                  <button
                    key={option}
                    className={`text-xs px-3 py-1 rounded-full border ${localFilters.includes(option) ? 'bg-[#5C3FFF] text-white' : 'bg-[#F8F8F8] border-[#CCCCCC] text-[#484848]'}`}
                    onClick={() => toggleFilter(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Fixed Bottom Buttons */}
        <div className="sticky bottom-16 left-0 right-0 bg-white flex flex-col gap-2 mt-6">
          <button
            onClick={handleApply}
            className="w-full px-4 py-2 bg-[#5C3FFF] text-white rounded-[50px]"
          >
            Apply
          </button>
          <button
            onClick={handleClear}
            className="text-[#242424] w-full px-4 py-2 border rounded-[50px] bg-[#EEEAFF]"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default SingleProductFood;