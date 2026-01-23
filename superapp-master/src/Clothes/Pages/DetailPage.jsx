import React, { useState } from 'react';
import MyntraClothesHeader from "../Header/MyntraClothesHeader";
import { Search, SlidersHorizontal, Mic, X, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FaFilter } from 'react-icons/fa';
import Product from '../SubPages/AllProducts/Product';
import shirt from "../Images/shirt.svg";
import Footer from '../../Utility/Footer';

const products = [
  {
    id: 1,
    name: "Men Uniforms",
    image: shirt, // Replace with actual image URL
    price: 4000,
    originalPrice: 5000,
    discount: "30% Off",
    rating: 4.2,
    bestSeller: true,
  },
  {
    id: 2,
    name: "Men Uniforms",
    image: shirt,
    price: 4000,
    originalPrice: 5000,
    discount: "30% Off",
    rating: 4.2,
    bestSeller: true,
  },
  {
    id: 3,
    name: "Men Uniforms",
    image: shirt,
    price: 4000,
    originalPrice: 5000,
    discount: "30% Off",
    rating: 4.2,
    bestSeller: true,
  },
  {
    id: 4,
    name: "Men Uniforms",
    image: shirt,
    price: 4000,
    originalPrice: 5000,
    discount: "30% Off",
    rating: 4.2,
    bestSeller: true,
  },
  {
    id: 5,
    name: "Men Uniforms",
    image: shirt,
    price: 4000,
    originalPrice: 5000,
    discount: "30% Off",
    rating: 4.2,
    bestSeller: true,
  },
];

const filters = {
  price: ["Under 500 - 1000", "2000 - 3000", "4000 - 6000", "8000 - 12000"],
  offers: ["20% Offer", "35% Offer", "50% Offer"],
  categories: ["Cotton", "Normal Fabric"],
  discount: ["20%", "35%", "50%"],
  colors: ["Green", "Red"]
};

function DetailPage() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);

  const toggleFilters = () => setShowFilters(!showFilters);

  const applyFilters = (filters) => {
    setSelectedFilters(filters);
    setShowFilters(false);
  };

  const removeFilter = (filterToRemove) => {
    setSelectedFilters(selectedFilters.filter(filter => filter !== filterToRemove));
  };

  return (
    <div className='min-h-screen'>
      <MyntraClothesHeader
        showBackButton={true}
        searchQuery={""}
        setSearchQuery={() => { }}
        toggleFilter={() => setShowFilters(true)}
      />

      <main className='pt-28 pb-20 px-4 bg-white'>
        <div className="max-w-[1248px] mx-auto text-left">

          {/* Breadcrumbs */}
          <div className="text-[10px] sm:text-xs text-gray-500 mb-6 flex items-center gap-2 uppercase tracking-widest font-black">
            <span className="cursor-pointer hover:text-pink-500 transition-colors" onClick={() => navigate('/home-clothes')}>Home</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 tracking-tighter">Product List</span>
          </div>

          <div className="flex justify-between items-baseline mb-8">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tighter">
              Featured Products
              <span className="ml-3 text-xs sm:text-sm font-bold text-gray-400 capitalize normal-case tracking-normal font-sans">
                - {products.length} items
              </span>
            </h1>

            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-6 py-2 border-2 border-gray-100 rounded-sm hover:border-pink-500 hover:text-pink-500 transition-all text-[10px] font-black uppercase tracking-widest bg-white"
            >
              <SlidersHorizontal size={14} />
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

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-10 gap-x-4 sm:gap-x-8">
            {products.map((product) => (
              <Product key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>

      <Footer />

      {/* Filter Modal */}
      {showFilters && (
        <FilterModal
          onClose={() => setShowFilters(false)}
          onApply={applyFilters}
          selectedFilters={selectedFilters}
        />
      )}
    </div>
  );
}

// Filter Modal Component - Collapsible (Accordion) Style for Mobile
function FilterModal({ onClose, onApply, selectedFilters: initialFilters }) {
  const [selectedSubFilters, setSelectedSubFilters] = useState(initialFilters || []);
  const [expandedCategories, setExpandedCategories] = useState(['price', 'discount']); // Default expanded

  const categories = Object.keys(filters).filter(cat =>
    ['price', 'discount', 'rating', 'colors', 'offers'].includes(cat.toLowerCase())
  );

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
                  <span className={`text-xs font-black uppercase tracking-widest ${expandedCategories.includes(cat) ? 'text-pink-600' : 'text-gray-800'
                    }`}>
                    {cat}
                  </span>
                  {selectedSubFilters.some(f => filters[cat]?.includes(f)) && (
                    <span className="bg-pink-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {selectedSubFilters.filter(f => filters[cat]?.includes(f)).length}
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
                  {filters[cat]?.map((option) => (
                    <button
                      key={option}
                      onClick={() => toggleFilter(option)}
                      className={`text-[10px] font-bold py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center text-center leading-tight uppercase tracking-tight ${selectedSubFilters.includes(option)
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
            className="w-full py-4 px-6 border-2 border-gray-200 rounded-2xl text-gray-700 font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all bg-white"
          >
            Discard
          </button>
          <button
            onClick={handleApply}
            className="w-full py-4 px-6 bg-pink-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl shadow-pink-100"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailPage;
