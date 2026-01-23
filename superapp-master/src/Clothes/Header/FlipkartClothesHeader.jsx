import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bellIcon from "../../Images/HomeScreen/bellIcon.svg";
import { Search, ShoppingCart, User, Menu, ChevronDown, SlidersHorizontal, ChevronLeft } from 'lucide-react';

const FlipkartClothesHeader = ({
    searchQuery = "", // Default to empty string
    setSearchQuery = () => { },
    handleSearchKeyDown = () => { },
    handleSearchFocus = () => { },
    showSearchDropdown = false,
    searchResults = [],
    searchLoading = false,
    searchMessage = "",
    handleProductNavigate = () => { },
    recentSearches = [], // Default to empty array
    handleClearRecentSearches = () => { },
    handleRecentSearchClick = () => { },
    searchContainerRef,
    toggleFilter,
    showBackButton
}) => {
    const navigate = useNavigate();

    return (
        <header className="fixed top-0 left-0 right-0 bg-[#2874F0] z-[100] h-14 md:h-16 flex items-center shadow-md font-sans">
            <div className="max-w-[1248px] mx-auto w-full px-2 md:px-4 flex items-center justify-between gap-4">
                {/* Logo & Back Section */}
                <div className="flex items-center gap-2 cursor-pointer shrink-0">
                    {showBackButton && (
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 mr-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center outline-none touch-manipulation"
                            aria-label="Go Back"
                        >
                            <ChevronLeft size={24} className="text-white" />
                        </button>
                    )}
                    <div className="flex items-center gap-2" onClick={() => navigate('/home-clothes')}>
                        <img src={bellIcon} alt="CityBell" className="h-8 md:h-10 w-auto brightness-0 invert" />
                        <div className="hidden md:flex flex-col italic">
                            <span className="text-white font-bold leading-none text-[18px]">CityBell</span>
                            <span className="text-[#FFE500] text-[10px] font-medium leading-none flex items-center">
                                Explore <span className="text-white font-bold mx-0.5">Plus</span>
                                <img src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/plus-grad-e8e31d.svg" alt="plus" className="h-2.5 w-2.5 ml-0.5" />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-[600px] relative" ref={searchContainerRef}>
                    <div className="bg-white flex items-center h-9 md:h-10 rounded-sm overflow-hidden pl-4 md:pl-5 pr-2 group shadow-sm">
                        <input
                            type="text"
                            placeholder="Search for products, brands and more"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={handleSearchFocus}
                            onKeyDown={handleSearchKeyDown}
                            className="w-full text-sm font-medium focus:outline-none placeholder-gray-500"
                        />
                        <div className="flex items-center">
                            <button
                                onClick={(e) => {
                                    handleSearchKeyDown({ key: 'Enter', preventDefault: () => { } });
                                }}
                                className="p-1.5 text-[#2874F0] hover:bg-blue-50 rounded-full transition-all active:scale-95"
                                aria-label="Search"
                            >
                                <Search size={20} />
                            </button>
                            <button
                                onClick={() => {
                                    if (toggleFilter) toggleFilter();
                                }}
                                className="p-1.5 text-gray-500 hover:text-[#2874F0] hover:bg-blue-50 rounded-full transition-all active:scale-95"
                                aria-label="Filter"
                            >
                                <SlidersHorizontal size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Search Dropdown Integration */}
                    {showSearchDropdown && (
                        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-sm shadow-xl z-30 max-h-80 overflow-y-auto p-3">
                            {searchQuery?.trim() ? (
                                <>
                                    {searchLoading && (
                                        <div className="text-center text-sm text-gray-500 py-2">Searching...</div>
                                    )}
                                    {!searchLoading && searchResults.map(product => (
                                        <button
                                            key={product.id || product._id}
                                            onClick={() => handleProductNavigate(product)}
                                            className="w-full flex items-center gap-3 py-2 px-2 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0"
                                        >
                                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                                                {product.image ? (
                                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[10px] text-gray-400">No img</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                                                <p className="text-xs text-gray-500">₹{product.discountedPrice || product.price}</p>
                                            </div>
                                        </button>
                                    ))}
                                    {!searchLoading && searchMessage && (
                                        <div className="text-center text-sm text-gray-500 py-2">{searchMessage}</div>
                                    )}
                                </>
                            ) : (
                                <div className="p-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold text-gray-500 uppercase">Recent</span>
                                        {recentSearches?.length > 0 && (
                                            <button onClick={handleClearRecentSearches} className="text-xs text-[#2874F0] hover:underline">Clear</button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {recentSearches.map((term, idx) => (
                                            <button key={idx} onClick={() => handleRecentSearchClick(term)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700">{term}</button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center gap-8 text-white font-bold whitespace-nowrap">
                    <div className="flex items-center gap-2 cursor-pointer text-sm font-semibold" onClick={() => navigate('/home-clothes/cart')}>
                        <ShoppingCart size={20} />
                        Cart
                    </div>
                    <div className="flex items-center gap-1 cursor-pointer text-sm font-semibold">
                        Become a Seller
                    </div>
                    <div className="flex items-center gap-1 cursor-pointer group text-sm font-semibold">
                        More <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
                    </div>
                    <button className="bg-white text-[#2874F0] px-8 py-1.5 rounded-sm text-sm hover:opacity-90 transition-opacity font-semibold">
                        Login
                    </button>
                </div>

                {/* Mobile Icons */}
                <div className="lg:hidden flex items-center gap-4 text-white">
                    <ShoppingCart size={22} onClick={() => navigate('/home-clothes/cart')} />
                    <User size={22} onClick={() => navigate('/home-clothes/account')} />
                    <Menu size={22} />
                </div>
            </div>
        </header>
    );
};

export default FlipkartClothesHeader;
