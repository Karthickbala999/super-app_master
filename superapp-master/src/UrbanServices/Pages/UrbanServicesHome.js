import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_CONFIG from '../../config/api.config';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  ChevronRight,
  Star,
  ShieldCheck,
  Clock,
  Scissors,
  Shovel,
  Wrench,
  Tv,
  Sparkles,
  CheckCircle2,
  Menu,
  X,
  CreditCard,
  User,
  Home,
  Hammer,
  Droplets,
  Zap
} from 'lucide-react';
import CityBellLogo from '../../Images/Logo/CityBellLogo.png';
import DeepCleaningBanner from '../../Images/Banners/deep_cleaning.png';


const UrbanServicesHome = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('Delhi NCR');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Base URL for images
  const API_BASE_URL = API_CONFIG.BASE_URL;

  useEffect(() => {
    fetchCategories();
    detectLocation();
  }, []);

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.suburb || 'Delhi NCR';
            setLocation(city);
          } catch (error) {
            console.error("Error detecting location:", error);
          }
        },
        (error) => {
          console.error("Location access denied:", error);
        }
      );
    }
  };

  // 39 Categories as requested
  const all39Categories = [
    { _id: '1', name: 'AC & Appliance Repair', slug: 'appliance-repair', description: 'Expert repair services', minPrice: 199, estimatedDuration: 90, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80' },
    { _id: '2', name: 'AC Service & Repair', slug: 'ac-service', description: 'Professional AC installation & repair', minPrice: 299, estimatedDuration: 90, image: 'https://images.unsplash.com/photo-1599708146141-37dd5ad4f24c?auto=format&fit=crop&w=500&q=80' },
    { _id: '3', name: 'Bike Mechanic', slug: 'bike-repair', description: 'Bike repair and maintenance', minPrice: 199, estimatedDuration: 90, image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=500&q=80' },
    { _id: '4', name: 'CCTV Camera Installation', slug: 'cctv-service', description: 'CCTV installation and repair', minPrice: 499, estimatedDuration: 150, image: 'https://images.unsplash.com/photo-1557597774-9d2739f85a94?auto=format&fit=crop&w=500&q=80' },
    { _id: '5', name: 'Car Mechanic', slug: 'car-mechanic', description: 'Professional car repair and service', minPrice: 299, estimatedDuration: 120, image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=500&q=80' },
    { _id: '6', name: 'Car Washing', slug: 'car-washing', description: 'Professional car washing services', minPrice: 199, estimatedDuration: 60, image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=500&q=80' },
    { _id: '7', name: 'Cleaning & Pest Control', slug: 'cleaning', description: 'Deep cleaning & pest control', minPrice: 299, estimatedDuration: 120, image: 'https://images.unsplash.com/photo-1581578731548-c64695ce6958?auto=format&fit=crop&w=500&q=80' },
    { _id: '8', name: 'Computer / Laptop Service', slug: 'laptop-repair', description: 'Computer and laptop repair', minPrice: 199, estimatedDuration: 90, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=500&q=80' },
    { _id: '9', name: 'Electrician Services', slug: 'electrician', description: 'Complete electrical solutions', minPrice: 199, estimatedDuration: 60, image: 'https://images.unsplash.com/photo-1621905252507-b354bcadc030?auto=format&fit=crop&w=500&q=80' },
    { _id: '10', name: 'Washing Machine Repair', slug: 'washing-machine', description: 'Professional washing machine service', minPrice: 249, estimatedDuration: 90, image: 'https://images.unsplash.com/photo-1626806819282-2c1dc61a0e05?auto=format&fit=crop&w=500&q=80' },
    { _id: '11', name: 'Refrigerator Service', slug: 'refrigerator', description: 'Expert refrigerator repair', minPrice: 299, estimatedDuration: 120, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80' },
    { _id: '12', name: 'Plumbing Service', slug: 'plumbing', description: 'Expert plumbing solutions', minPrice: 199, estimatedDuration: 60, image: 'https://images.unsplash.com/photo-1585704032915-c3400ca1f963?auto=format&fit=crop&w=500&q=80' },
    { _id: '13', name: 'Water Purifier Service', slug: 'water-purifier', description: 'RO & water purifier maintenance', minPrice: 199, estimatedDuration: 60, image: 'https://images.unsplash.com/photo-1584483766114-2feefdb80f2d?auto=format&fit=crop&w=500&q=80' },
    { _id: '14', name: 'Geyser Service & Repair', slug: 'geyser', description: 'Water heater repair services', minPrice: 249, estimatedDuration: 90, image: 'https://images.unsplash.com/photo-1585144860106-998ca0f2920a?auto=format&fit=crop&w=500&q=80' },
    { _id: '15', name: 'Sofa Cleaning', slug: 'sofa-cleaning', description: 'Professional sofa deep cleaning', minPrice: 499, estimatedDuration: 180, image: 'https://images.unsplash.com/photo-1556911223-e47fe280f983?auto=format&fit=crop&w=500&q=80' },
    { _id: '16', name: 'Bathroom Cleaning', slug: 'bathroom-cleaning', description: 'Deep bathroom sanitization', minPrice: 299, estimatedDuration: 120, image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=500&q=80' },
    { _id: '17', name: 'Kitchen Deep Cleaning', slug: 'kitchen-cleaning', description: 'Intensive kitchen degreasing', minPrice: 399, estimatedDuration: 150, image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=500&q=80' },
    { _id: '18', name: 'Full Home Cleaning', slug: 'home-cleaning', description: 'Complete house deep cleaning', minPrice: 999, estimatedDuration: 360, image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=500&q=80' },
    { _id: '19', name: 'Cockroach Control', slug: 'cockroach-control', description: 'Herbal pest management', minPrice: 499, estimatedDuration: 60, image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=500&q=80' },
    { _id: '20', name: 'Termite Control', slug: 'termite-control', description: 'Anti-termite wood protection', minPrice: 999, estimatedDuration: 180, image: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&w=500&q=80' },
    { _id: '21', name: 'Men\'s Salon & Massage', slug: 'salon-for-men', description: 'Grooming & relaxation', minPrice: 249, estimatedDuration: 60, image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=500&q=80' },
    { _id: '22', name: 'Women\'s Salon & Spa', slug: 'salon-for-women', description: 'Beauty & wellness services', minPrice: 599, estimatedDuration: 120, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=500&q=80' },
    { _id: '23', name: 'Massage for Men', slug: 'massage-men', description: 'Deep tissue therapy', minPrice: 799, estimatedDuration: 90, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=500&q=80' },
    { _id: '24', name: 'Massage for Women', slug: 'massage-women', description: 'Relaxing spa at home', minPrice: 899, estimatedDuration: 90, image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=500&q=80' },
    { _id: '25', name: 'Wall Painting', slug: 'painting', description: 'Fresh coat for your walls', minPrice: 1999, estimatedDuration: 480, image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=80' },
    { _id: '26', name: 'Carpenter Services', slug: 'carpenter', description: 'Furniture repair & assembly', minPrice: 249, estimatedDuration: 90, image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=500&q=80' },
    { _id: '27', name: 'Packers & Movers', slug: 'packers-movers', description: 'Stress-free shifting service', minPrice: 2999, estimatedDuration: 360, image: 'https://images.unsplash.com/photo-1520038410233-7141be7e6f97?auto=format&fit=crop&w=500&q=80' },
    { _id: '28', name: 'TV Service & Installation', slug: 'tv-service', description: 'LED/LCD TV maintenance', minPrice: 299, estimatedDuration: 60, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=500&q=80' },
    { _id: '29', name: 'Microwave & Oven Repair', slug: 'microwave-repair', description: 'Kitchen appliance repair', minPrice: 249, estimatedDuration: 60, image: 'https://images.unsplash.com/photo-1584281722572-9133600570d1?auto=format&fit=crop&w=500&q=80' },
    { _id: '30', name: 'Chimney Cleaning', slug: 'chimney-cleaning', description: 'Kitchen chimney service', minPrice: 399, estimatedDuration: 90, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80' },
    { _id: '31', name: 'Water Leakage Repair', slug: 'water-leakage', description: 'Seepage & leakage solutions', minPrice: 499, estimatedDuration: 120, image: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=500&q=80' },
    { _id: '32', name: 'Garden Maintenance', slug: 'gardening', description: 'Lawn care & plant service', minPrice: 299, estimatedDuration: 120, image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=500&q=80' },
    { _id: '33', name: 'Pest Control (Termites)', slug: 'pest-termite', description: 'Long-term termite protection', minPrice: 1499, estimatedDuration: 180, image: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&w=500&q=80' },
    { _id: '34', name: 'Full House Sanitization', slug: 'sanitization', description: 'Germ & virus protection', minPrice: 499, estimatedDuration: 60, image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=500&q=80' },
    { _id: '35', name: 'Face Care at Home', slug: 'facial', description: 'Facials & clean-ups', minPrice: 499, estimatedDuration: 60, image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc2069?auto=format&fit=crop&w=500&q=80' },
    { _id: '36', name: 'Hair Cut for Men', slug: 'haircut-men', description: 'Professional home haircut', minPrice: 199, estimatedDuration: 45, image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=500&q=80' },
    { _id: '37', name: 'Physiotherapy at Home', slug: 'physiotherapy', description: 'Expert physical therapy', minPrice: 499, estimatedDuration: 60, image: 'https://images.unsplash.com/photo-1576091160550-217359f4b14c?auto=format&fit=crop&w=500&q=80' },
    { _id: '38', name: 'Bed Bug Control', slug: 'bed-bug', description: 'Eliminate bed bugs for good', minPrice: 699, estimatedDuration: 90, image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=500&q=80' },
    { _id: '39', name: 'Switch & Socket Repair', slug: 'switch-socket', description: 'Minor electrical repairs', minPrice: 99, estimatedDuration: 30, image: 'https://images.unsplash.com/photo-1621905252507-b354bcadc030?auto=format&fit=crop&w=500&q=80' }
  ];

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories from: /api/urban-services/categories?active=true');
      const response = await axios.get('/api/urban-services/categories?active=true');
      console.log('Categories API response:', response);
      if (response.data && response.data.data) {
        // Merge API data with 39 hardcoded categories
        const apiCategories = response.data.data;
        const merged = all39Categories.map(cat => {
          const apiMatch = apiCategories.find(a => a.slug === cat.slug);
          return apiMatch ? { ...cat, ...apiMatch } : cat;
        });
        setCategories(merged);
      } else {
        console.warn('Categories data is missing in response, using defaults');
        setCategories(all39Categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(all39Categories); // Fallback to our 39 categories on error
    } finally {
      setLoading(false);
    }
  };

  const mainCategories = [
    { name: 'Women\'s Salon & Spa', icon: <Scissors className="w-8 h-8" />, color: 'bg-rose-50 text-rose-600', slug: 'salon-for-women', description: 'Beauty & wellness services' },
    { name: 'Men\'s Salon & Massage', icon: <Scissors className="w-8 h-8" />, color: 'bg-blue-50 text-blue-600', slug: 'salon-for-men', description: 'Grooming & relaxation' },
    { name: 'AC & Appliance Repair', icon: <Tv className="w-8 h-8" />, color: 'bg-orange-50 text-orange-600', slug: 'appliance-repair', description: 'Expert repair services' },
    { name: 'Cleaning & Pest Control', icon: <Sparkles className="w-8 h-8" />, color: 'bg-emerald-50 text-emerald-600', slug: 'cleaning', description: 'Deep cleaning & pest control' },
    { name: 'Electrician, Plumber & Carpenter', icon: <Wrench className="w-8 h-8" />, color: 'bg-indigo-50 text-indigo-600', slug: 'home-repairs', description: 'Home repair experts' },
    { name: 'Painting & Wall Treatment', icon: <Droplets className="w-8 h-8" />, color: 'bg-amber-50 text-amber-600', slug: 'painting', description: 'Professional painting services' },
    { name: 'Water Purifier & RO Service', icon: <Droplets className="w-8 h-8" />, color: 'bg-cyan-50 text-cyan-600', slug: 'water-purifier', description: 'Water purification services' },
    { name: 'General Home Maintenance', icon: <Home className="w-8 h-8" />, color: 'bg-purple-50 text-purple-600', slug: 'home-maintenance', description: 'Complete home care' },
  ];

  const filteredCategories = (categories || []).filter(category =>
    category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategoryClick = (category) => {
    const serializedCategory = {
      _id: category._id,
      name: category.name,
      slug: category.slug,
      pricingType: category.pricingType,
      minPrice: category.minPrice,
      estimatedDuration: category.estimatedDuration,
      description: category.description,
      image: category.image
    };
    navigate(`/urban-services/category/${category.slug}`, { state: { category: serializedCategory } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium tracking-wide">City Bell</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Premium Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 md:gap-8">
            <div
              className="cursor-pointer"
              onClick={() => navigate('/urban-services')}
            >
              <img src={CityBellLogo} alt="City Bell" className="h-8 md:h-12 object-contain" />
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gray-50 rounded-full border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer text-xs md:text-sm font-semibold">
              <MapPin size={16} className="text-blue-600" />
              <span className="truncate max-w-[100px] md:max-w-none">{location}</span>
            </div>
          </div>

          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search for 'Salon', 'Plumber', 'AC Repair'..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-3 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 transition-all text-[15px] font-medium placeholder:text-gray-400 shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden lg:flex flex-col items-end mr-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">2,401 Pros Online</span>
              </div>
            </div>
            <div
              className="w-8 h-8 md:w-10 md:h-10 bg-gray-50 rounded-lg md:rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors group"
              onClick={() => navigate('/urban-services/settings')}
            >
              <User size={18} className="text-gray-600 md:size-[20px] group-hover:text-black" />
            </div>
            <button
              className="md:hidden w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-100 transition-all text-sm outline-none"
                  />
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl">
                  <MapPin size={18} className="text-blue-600" />
                  <span className="text-sm font-semibold">{location}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="pt-24 md:pt-32 pb-24">
        {/* Statistics & Trust Bar */}
        <div className="max-w-7xl mx-auto px-4 mb-12 md:mb-20 hidden sm:block">
          <div className="flex justify-center items-center gap-8 md:gap-16 py-6 md:py-8 border-y border-gray-100">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Star size={20} className="md:size-[24px] fill-blue-600" />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-black leading-tight">4.8</p>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Service Rating</p>
              </div>
            </div>
            <div className="w-px h-8 md:h-10 bg-gray-100"></div>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <User size={20} className="md:size-[24px] fill-purple-600" />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-black leading-tight">12M+</p>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Customers</p>
              </div>
            </div>
            <div className="w-px h-8 md:h-10 bg-gray-100"></div>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                <ShieldCheck size={20} className="md:size-[24px]" />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-black leading-tight">Verified</p>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Professionals</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 text-center mb-16 md:mb-24">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-4 md:mb-6 leading-[1.1]"
          >
            Home services,<br />on <span className="text-blue-600">demand.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-base md:text-xl mb-12 md:text-xl mb-16 max-w-2xl mx-auto font-medium px-4"
          >
            Experience premium household services with City Bell's trusted and verified professionals.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-1"
          >
            {mainCategories.map((item, idx) => {
              const apiCategory = categories.find(c => c.slug === item.slug);
              return (
                <div
                  key={idx}
                  className="group cursor-pointer p-3 md:p-4 hover:bg-gray-50 rounded-2xl md:rounded-3xl transition-all duration-300"
                  onClick={() => {
                    if (apiCategory) {
                      handleCategoryClick(apiCategory);
                    } else {
                      handleCategoryClick(item);
                    }
                  }}
                >
                  <div className={`${item.color} aspect-square rounded-[1.5rem] md:rounded-[2rem] mb-3 md:mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm border border-transparent overflow-hidden`}>
                    {apiCategory?.image ? (
                      <img
                        src={apiCategory.image.startsWith('http') ? apiCategory.image : `${API_BASE_URL}${apiCategory.image}`}
                        className="w-full h-full object-cover"
                        alt={item.name}
                      />
                    ) : (
                      React.cloneElement(item.icon, { className: 'w-8 h-8 md:w-10 md:h-10' })
                    )}
                  </div>
                  <p className="text-[11px] md:text-[13px] font-bold tracking-tight text-gray-900 leading-tight text-center">
                    {item.name}
                  </p>
                </div>
              );
            })}
          </motion.div>
        </section>

        {/* Promotional Banner Section - Premium */}
        <section className="max-w-7xl mx-auto px-4 mb-20 md:mb-32 overflow-hidden">
          <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar snap-x pb-8 px-2">
            {[
              {
                bg: 'from-blue-600 to-indigo-700',
                label: 'BEST OFFER',
                title: 'Deep Cleaning',
                desc: 'Professional equipment & chemicals',
                img: DeepCleaningBanner,
                price: '₹419',
                slug: 'cleaning'
              },
              {
                bg: 'from-rose-500 to-pink-600',
                label: 'LUXURY CARE',
                title: 'Salon at Home',
                desc: 'Packages starting from ₹599 onwards',
                img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
                price: '₹599',
                slug: 'salon-for-women'
              },
              {
                bg: 'from-orange-500 to-amber-600',
                label: 'SEASONAL SAVE',
                title: 'AC Repair',
                desc: 'Fix your cooling before summer hits',
                img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
                price: '₹249',
                slug: 'appliance-repair'
              }
            ].map((banner, i) => (
              <div key={i} className={`min-w-[280px] sm:min-w-[340px] md:min-w-[500px] aspect-[16/10] md:aspect-[16/8.5] rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden flex-shrink-0 snap-start shadow-xl md:shadow-2xl shadow-gray-200 group`}>
                <img src={banner.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-[0.7]" alt={banner.title} />
                <div className={`absolute inset-0 p-6 md:p-10 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent`}>
                  <p className="text-white/80 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] mb-2 md:mb-3">{banner.label}</p>
                  <h3 className="text-white text-xl md:text-3xl font-black mb-1 md:mb-2 tracking-tight">{banner.title}</h3>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-white/70 text-[11px] md:text-sm max-w-[180px] md:max-w-[240px] leading-relaxed line-clamp-2 md:line-clamp-none">{banner.desc}</p>
                    <div
                      onClick={() => {
                        const categoryData = categories.find(c => c.slug === banner.slug);
                        if (categoryData) {
                          handleCategoryClick(categoryData);
                        } else {
                          // Fallback to mainCategories mapping if API data hasn't loaded or doesn't match
                          const mainCat = mainCategories.find(c => c.slug === banner.slug);
                          if (mainCat) handleCategoryClick(mainCat);
                        }
                      }}
                      className="bg-white text-black px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl font-black text-[11px] md:text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Book at {banner.price}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dynamic Categories Section */}
        <section className="max-w-7xl mx-auto px-4 mb-20 md:mb-32">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 md:mb-12 gap-4">
            <div>
              <p className="text-blue-600 font-black text-[10px] md:text-xs uppercase tracking-[0.3em] mb-2 md:mb-3">Trending Now</p>
              <h2 className="text-2xl md:text-4xl font-black tracking-tighter">New and noteworthy</h2>
            </div>
            <button
              onClick={() => document.getElementById('all-services')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto h-11 md:h-12 px-5 md:px-6 rounded-xl md:rounded-2xl border border-gray-100 text-xs md:text-sm font-bold hover:bg-black hover:text-white hover:border-black transition-all group flex items-center justify-center"
            >
              View all services <ChevronRight className="inline-block ml-1 group-hover:translate-x-1 transition-transform" size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredCategories.slice(0, 12).map((category) => (
              <motion.div
                whileHover={{ y: -10 }}
                key={category._id}
                onClick={() => handleCategoryClick(category)}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/5] rounded-[1.5rem] md:rounded-[2.5rem] bg-gray-50 mb-4 md:mb-6 overflow-hidden relative shadow-sm border border-gray-50">
                  {category.image ? (
                    <img
                      src={category.image.startsWith('http') ? category.image : `${API_BASE_URL}${category.image}`}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-4xl md:text-6xl opacity-30 transform group-hover:scale-125 transition-transform duration-500">{category.icon || '🏠'}</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 md:top-6 md:left-6">
                    <div className="bg-white/90 backdrop-blur-md px-2 md:px-4 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-sm">
                      Starting ₹{category.minPrice}
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 md:bottom-6 md:right-6">
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-black text-white rounded-xl md:rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <ChevronRight size={18} className="md:size-[24px]" />
                    </div>
                  </div>
                </div>
                <h4 className="text-sm md:text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors mb-1 md:mb-2 leading-tight">{category.name}</h4>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded-lg">
                    <Star size={10} className="md:size-[12px] fill-blue-600 text-blue-600" />
                    <span className="text-[9px] md:text-[11px] font-black text-blue-600">4.8</span>
                  </div>
                  <span className="text-[9px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest">(120k+)</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* UC Promise Section - Modernized */}
        <section className="bg-black py-20 md:py-32 mb-20 md:mb-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-purple-600/10 blur-[120px] rounded-full"></div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
              <div>
                <p className="text-blue-500 font-black text-[10px] md:text-xs uppercase tracking-[0.4em] mb-4 md:mb-6">Our Commitment</p>
                <h2 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter mb-8 md:mb-12 text-white leading-tight">
                  The City Bell<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Promise.</span>
                </h2>
                <div className="space-y-8 md:space-y-10">
                  {[
                    {
                      icon: <ShieldCheck className="text-blue-500" />,
                      title: 'Verified Professionals',
                      desc: 'Every pro undergoes a 4-step background verification and identity check.'
                    },
                    {
                      icon: <CheckCircle2 className="text-blue-500" />,
                      title: 'Standardized Pricing',
                      desc: 'Experience pricing transparency with no hidden costs or surprise surcharges.'
                    },
                    {
                      icon: <Clock className="text-blue-500" />,
                      title: 'On-time Guarantee',
                      desc: 'If our professional is late by 30+ minutes, get 10% off on your service.'
                    }
                  ].map((promise, key) => (
                    <div key={key} className="flex gap-5 md:gap-8 group">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1rem] md:rounded-[1.25rem] bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600/20 group-hover:border-blue-600/30 transition-all duration-500">
                        {React.cloneElement(promise.icon, {
                          size: 28,
                          className: 'text-blue-500',
                          strokeWidth: 2.5
                        })}
                      </div>
                      <div>
                        <h4 className="font-black text-lg md:text-xl text-white mb-1 md:mb-2">{promise.title}</h4>
                        <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-sm">{promise.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative hidden md:block">
                <div className="aspect-[4/5] bg-neutral-900 rounded-[3rem] lg:rounded-[4rem] overflow-hidden relative p-4 border border-white/5">
                  <div className="absolute inset-4 rounded-[2.5rem] lg:rounded-[3.5rem] overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&w=800&q=80"
                      className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000"
                      alt="City Bell Professional Services"
                    />
                  </div>
                  {/* Floating Badge */}
                  <div className="absolute -bottom-6 -right-6 lg:-bottom-10 lg:-right-10 bg-blue-600 p-8 lg:p-12 rounded-full border-[8px] lg:border-[12px] border-black text-white shadow-2xl">
                    <div className="text-center">
                      <p className="text-2xl lg:text-3xl font-black">100%</p>
                      <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em]">Safe</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* More Categories Section */}
        <section id="all-services" className="max-w-7xl mx-auto px-4 mb-20 md:mb-32">
          <div className="flex flex-col items-center text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-black tracking-tighter mb-3 md:mb-4">Explore all services</h2>
            <div className="h-1 w-16 md:w-20 bg-blue-600 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredCategories.map((category) => (
              <motion.div
                key={category._id}
                onClick={() => handleCategoryClick(category)}
                whileHover={{ scale: 1.02 }}
                className="bg-white border border-gray-100 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer flex items-center gap-4 md:gap-6 group"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-[1.25rem] md:rounded-[1.5rem] flex items-center justify-center text-3xl md:text-4xl shrink-0 group-hover:bg-blue-50 transition-colors duration-500 overflow-hidden">
                  {category.image ? (
                    <img
                      src={category.image.startsWith('http') ? category.image : `${API_BASE_URL}${category.image}`}
                      className="w-full h-full object-cover"
                      alt={category.name}
                    />
                  ) : (
                    category.icon || '🛠️'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-lg md:text-xl mb-1 group-hover:text-blue-600 transition-colors truncate">{category.name}</h3>
                  <p className="text-[13px] text-gray-400 font-medium line-clamp-1 mb-3 md:mb-4">{category.description}</p>
                  <div className="flex items-center gap-3">
                    <div className="text-[11px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      Starting ₹{category.minPrice}
                    </div>
                    <div className="text-[9px] text-gray-300 flex items-center gap-1.5 uppercase tracking-widest font-black">
                      <Clock size={10} strokeWidth={3} /> {category.estimatedDuration}m
                    </div>
                  </div>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-black group-hover:text-white transition-all">
                  <ChevronRight size={18} className="md:size-[20px]" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>



      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        
        :root {
          --font-outfit: 'Outfit', sans-serif;
        }

        body {
          font-family: var(--font-outfit) !important;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        h1, h2, h3, h4, h5, h6 {
          font-family: var(--font-outfit) !important;
        }

        input::placeholder {
          font-family: var(--font-outfit) !important;
        }

        /* Smooth tab highlight for mobile */
        * {
          -webkit-tap-highlight-color: transparent;
        }

        /* Custom selection color */
        ::selection {
          background: rgba(59, 130, 246, 0.2);
          color: #2563eb;
        }

        /* Responsive adjustments for extra small screens */
        @media (max-width: 380px) {
          .xs\\:grid-cols-3 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}} />
    </div >
  );
};

export default UrbanServicesHome;
