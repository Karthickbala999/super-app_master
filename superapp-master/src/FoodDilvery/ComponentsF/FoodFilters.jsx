import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Check, Star } from 'lucide-react';

const FilterSection = ({ title, isOpen, onToggle, children }) => (
    <div className="border-b border-gray-100 py-4">
        <button
            className="flex items-center justify-between w-full text-base font-semibold text-gray-800 mb-2"
            onClick={onToggle}
        >
            {title}
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {isOpen && <div className="mt-2 space-y-2">{children}</div>}
    </div>
);

const FoodFilters = ({ isOpen, onClose, filters, onFilterChange, onClearFilters, availableCuisines = [] }) => {
    const [openSections, setOpenSections] = useState({
        cuisine: true,
        price: true,
        rating: true,
        delivery: true,
        dietary: true
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleCheckboxChange = (category, value) => {
        const currentValues = filters[category] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];

        onFilterChange(category, newValues);
    };

    const handleRadioChange = (category, value) => {
        onFilterChange(category, value === filters[category] ? null : value);
    };

    // Cuisine Options
    const cuisineOptions = availableCuisines.length > 0
        ? availableCuisines.map(c => c.name)
        : ['Indian', 'Chinese', 'Italian', 'South Indian', 'Fast Food', 'Desserts', 'Beverages', 'Healthy Food'];

    // Price Options
    const priceOptions = [
        { label: '₹ (Budget)', value: 'cheap' },
        { label: '₹₹ (Mid-range)', value: 'medium' },
        { label: '₹₹₹ (Premium)', value: 'expensive' }
    ];

    // Dietary Options
    const dietaryOptions = [
        { label: 'Vegetarian', value: 'veg' },
        { label: 'Non-Vegetarian', value: 'non-veg' },
        { label: 'Vegan', value: 'vegan' },
        { label: 'Gluten Free', value: 'gluten-free' }
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[49] lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Panel 
          Mobile: Fixed drawer
          Desktop: Static block in sidebar
      */}
            <div className={`
        fixed inset-y-0 left-0 z-[50] w-[280px] bg-white shadow-2xl 
        transform transition-transform duration-300 ease-in-out 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:transform-none lg:transition-none lg:translate-x-0 lg:static lg:z-auto lg:shadow-none lg:w-full lg:h-auto lg:bg-transparent lg:block
      `}>
                <div className="flex flex-col h-full lg:h-auto bg-white lg:bg-transparent">
                    {/* Header - Mobile */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 lg:hidden">
                        <div className="flex items-center gap-2 text-gray-800">
                            <Filter size={20} />
                            <h2 className="text-lg font-bold">Filters</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Header - Desktop */}
                    <div className="hidden lg:flex items-center justify-between py-4 mb-2">
                        <div className="flex items-center gap-2 text-gray-800">
                            <Filter size={20} />
                            <h2 className="text-lg font-bold">Filters</h2>
                        </div>
                        <button
                            onClick={onClearFilters}
                            className="text-orange-500 text-sm font-semibold hover:underline"
                        >
                            Clear All
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar lg:p-0 lg:overflow-visible">
                        {/* Sort By */}
                        <FilterSection
                            title="Sort By"
                            isOpen={openSections.sort}
                            onToggle={() => toggleSection('sort')}
                        >
                            <div className="space-y-2">
                                {[
                                    { label: 'Relevance', value: 'relevance' },
                                    { label: 'Rating: High to Low', value: 'rating_desc' },
                                    { label: 'Delivery Time', value: 'delivery_time' },
                                    { label: 'Cost: Low to High', value: 'cost_asc' },
                                    { label: 'Cost: High to Low', value: 'cost_desc' }
                                ].map((option) => (
                                    <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${filters.sortBy === option.value ? 'border-orange-500' : 'border-gray-300'}`}>
                                            {filters.sortBy === option.value && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                                        </div>
                                        <input
                                            type="radio"
                                            name="sortBy"
                                            className="hidden"
                                            checked={filters.sortBy === option.value}
                                            onChange={() => onFilterChange('sortBy', option.value)}
                                        />
                                        <span className={`text-sm ${filters.sortBy === option.value ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                            {option.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </FilterSection>

                        {/* Cuisines */}
                        <FilterSection
                            title="Cuisines"
                            isOpen={openSections.cuisine}
                            onToggle={() => toggleSection('cuisine')}
                        >
                            <div className="max-h-48 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                {cuisineOptions.map((cuisine) => (
                                    <label key={cuisine} className="flex items-center gap-3 cursor-pointer">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${filters.cuisines?.includes(cuisine) ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}>
                                            {filters.cuisines?.includes(cuisine) && <Check size={12} className="text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={filters.cuisines?.includes(cuisine)}
                                            onChange={() => handleCheckboxChange('cuisines', cuisine)}
                                        />
                                        <span className="text-sm text-gray-600 hover:text-gray-900">{cuisine}</span>
                                    </label>
                                ))}
                            </div>
                        </FilterSection>

                        {/* Price Range */}
                        <FilterSection
                            title="Price Range"
                            isOpen={openSections.price}
                            onToggle={() => toggleSection('price')}
                        >
                            {priceOptions.map((option) => (
                                <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${filters.priceRange?.includes(option.value) ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}>
                                        {filters.priceRange?.includes(option.value) && <Check size={12} className="text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={filters.priceRange?.includes(option.value)}
                                        onChange={() => handleCheckboxChange('priceRange', option.value)}
                                    />
                                    <span className="text-sm text-gray-600">{option.label}</span>
                                </label>
                            ))}
                        </FilterSection>

                        {/* Ratings */}
                        <FilterSection
                            title="Ratings"
                            isOpen={openSections.rating}
                            onToggle={() => toggleSection('rating')}
                        >
                            {[4.5, 4.0, 3.5].map((rating) => (
                                <label key={rating} className="flex items-center gap-3 cursor-pointer">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${filters.rating === rating ? 'border-orange-500' : 'border-gray-300'}`}>
                                        {filters.rating === rating && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name="rating"
                                        className="hidden"
                                        checked={filters.rating === rating}
                                        onChange={() => handleRadioChange('rating', rating)}
                                    />
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span>{rating}+ </span>
                                        <Star size={12} className="text-yellow-400 fill-current ml-1" />
                                    </div>
                                </label>
                            ))}
                        </FilterSection>

                        {/* Delivery Time */}
                        <FilterSection
                            title="Delivery Time"
                            isOpen={openSections.delivery}
                            onToggle={() => toggleSection('delivery')}
                        >
                            {[
                                { label: 'Under 30 mins', value: 30 },
                                { label: 'Under 45 mins', value: 45 },
                                { label: 'Under 60 mins', value: 60 },
                            ].map((option) => (
                                <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${filters.deliveryTime === option.value ? 'border-orange-500' : 'border-gray-300'}`}>
                                        {filters.deliveryTime === option.value && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name="deliveryTime"
                                        className="hidden"
                                        checked={filters.deliveryTime === option.value}
                                        onChange={() => handleRadioChange('deliveryTime', option.value)}
                                    />
                                    <span className="text-sm text-gray-600">{option.label}</span>
                                </label>
                            ))}
                        </FilterSection>

                        {/* Dietary */}
                        <FilterSection
                            title="Dietary"
                            isOpen={openSections.dietary}
                            onToggle={() => toggleSection('dietary')}
                        >
                            {dietaryOptions.map((option) => (
                                <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${filters.dietary?.includes(option.value) ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}>
                                        {filters.dietary?.includes(option.value) && <Check size={12} className="text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={filters.dietary?.includes(option.value)}
                                        onChange={() => handleCheckboxChange('dietary', option.value)}
                                    />
                                    <span className="text-sm text-gray-600">{option.label}</span>
                                </label>
                            ))}
                        </FilterSection>

                    </div>

                    {/* Footer for Mobile - Clear/Apply */}
                    <div className="p-4 border-t border-gray-100 lg:hidden flex gap-3 bg-white mt-auto">
                        <button
                            onClick={onClearFilters}
                            className="flex-1 py-2 text-orange-500 font-medium border border-orange-500 rounded-lg hover:bg-orange-50"
                        >
                            Clear
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FoodFilters;
