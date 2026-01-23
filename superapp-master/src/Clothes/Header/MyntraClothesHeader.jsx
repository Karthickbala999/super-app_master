import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bellIcon from "../../Images/HomeScreen/bellIcon.svg";
import { Search, Heart, ShoppingBag, User, SlidersHorizontal, X, ArrowLeft, ChevronLeft } from 'lucide-react';
import { useCart } from '../../Utility/CartContext';

const MyntraClothesHeader = ({
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
    showBackButton // Added this
}) => {
    const navigate = useNavigate();
    const { cart } = useCart();
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    // Calculate total items in cart
    const cartCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

    const navLinks = [
        { name: 'MEN', route: '/categories/mens-wear' },
        { name: 'WOMEN', route: '/categories/womens-wear' },
        { name: 'KIDS', route: '/categories/kids' },
        { name: 'HOME & LIVING', route: '/categories/home-living' },
        { name: 'BEAUTY', route: '/categories/cosmetics' },
        { name: 'STUDIO', route: '/studio', isNew: true }
    ];

    return (
        <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-[100] h-20 flex items-center px-4 md:px-10 font-[Assistant,sans-serif]">
            <div className="flex items-center w-full max-w-[1440px] mx-auto gap-4 md:gap-8">
                {/* Back Button & Logo Section */}
                <div className="shrink-0 flex items-center gap-2">
                    {showBackButton && (
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 mr-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center outline-none focus:bg-gray-100 touch-manipulation"
                            aria-label="Go Back"
                        >
                            <ArrowLeft size={24} className="text-gray-900" />
                        </button>
                    )}
                    <div className="cursor-pointer flex items-center" onClick={() => navigate('/home-clothes')}>
                        <img src={bellIcon} alt="CityBell" className="h-10 md:h-12 w-auto" />
                        <span className="hidden md:block ml-2 text-xl font-black tracking-tighter text-gray-900 uppercase">CityBell</span>
                    </div>
                </div>

                {/* Desktop Navigation Links */}
                <nav className="hidden lg:flex items-center h-full gap-6 xl:gap-8 ml-4">
                    {navLinks.map((link) => (
                        <div
                            key={link.name}
                            className="relative h-full flex items-center cursor-pointer group pt-1"
                            onClick={() => navigate(link.route)}
                        >
                            <span className="text-[12px] xl:text-[14px] font-bold text-gray-800 tracking-tight group-hover:text-pink-600 transition-colors uppercase">
                                {link.name}
                            </span>
                            {link.isNew && (
                                <span className="absolute -top-1 -right-4 text-[8px] font-bold text-pink-500">NEW</span>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                        </div>
                    ))}
                </nav>

                {/* Search Bar - Myntra Style */}
                <div className="flex-1 max-w-[500px] relative hidden sm:block ml-auto" ref={searchContainerRef}>
                    <div className="bg-[#f5f5f6] flex items-center h-10 rounded-md border border-transparent focus-within:bg-white focus-within:border-[#eaeaec] pl-4 pr-2 transition-all overflow-hidden group">
                        <input
                            type="text"
                            placeholder="Search for products, brands and more"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={handleSearchFocus}
                            onKeyDown={handleSearchKeyDown}
                            className="w-full bg-transparent text-sm font-normal focus:outline-none placeholder-gray-500 text-gray-800"
                        />
                        <div className="flex items-center gap-1">
                            <button
                                onClick={(e) => {
                                    handleSearchKeyDown({ key: 'Enter', preventDefault: () => { } });
                                }}
                                className="text-gray-500 hover:text-pink-500 p-1.5 rounded-full hover:bg-gray-100 transition-all active:scale-90"
                                aria-label="Search"
                            >
                                <Search size={18} />
                            </button>
                            <button
                                onClick={() => {
                                    if (toggleFilter) toggleFilter();
                                }}
                                className="text-pink-600 hover:text-pink-700 p-1.5 rounded-full hover:bg-pink-50 transition-all active:scale-90"
                                aria-label="Filter"
                            >
                                <SlidersHorizontal size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Search Dropdown */}
                    {showSearchDropdown && (
                        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-sm shadow-2xl z-30 max-h-96 overflow-y-auto p-4">
                            {searchQuery?.trim() ? (
                                <>
                                    {searchLoading && (
                                        <div className="text-center text-sm text-gray-400 py-4">Searching stores...</div>
                                    )}
                                    <div className="space-y-1">
                                        {!searchLoading && searchResults.map(product => (
                                            <button
                                                key={product.id || product._id}
                                                onClick={() => handleProductNavigate(product)}
                                                className="w-full flex items-center gap-4 p-2 hover:bg-[#f5f5f6] rounded-md transition-colors text-left"
                                            >
                                                <div className="w-12 h-14 bg-gray-50 flex items-center justify-center overflow-hidden rounded">
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[10px] text-gray-400">IMG</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-800 truncate">{product.name}</p>
                                                    <p className="text-xs text-pink-500 font-medium mt-0.5">₹{product.discountedPrice || product.price}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    {!searchLoading && searchMessage && (
                                        <div className="text-center text-sm text-gray-500 py-4 font-medium">{searchMessage}</div>
                                    )}
                                </>
                            ) : (
                                <div className="">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Recent Searches</span>
                                        {recentSearches?.length > 0 && (
                                            <button onClick={handleClearRecentSearches} className="text-[11px] text-pink-500 font-bold hover:underline">CLEAR ALL</button>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {recentSearches.map((term, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleRecentSearchClick(term)}
                                                className="text-sm text-gray-600 py-2 hover:text-pink-500 text-left flex items-center gap-2"
                                            >
                                                <Search size={14} className="text-gray-300" /> {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Icons Section */}
                <div className="flex items-center gap-3 sm:gap-4 md:gap-8 ml-auto shrink-0">
                    {/* Mobile Only: Search and Filter Icons - Placed before Profile */}
                    <div className="flex sm:hidden items-center gap-3">
                        <div className="flex flex-col items-center group cursor-pointer" onClick={() => setIsSearchModalOpen(true)}>
                            <Search size={22} className="text-gray-700 active:text-pink-500" />
                            <span className="text-[9px] font-bold mt-1 text-gray-800">Search</span>
                        </div>
                        <div className="flex flex-col items-center group cursor-pointer" onClick={toggleFilter}>
                            <SlidersHorizontal size={22} className="text-gray-700 active:text-pink-500" />
                            <span className="text-[9px] font-bold mt-1 text-gray-800">Filter</span>
                        </div>
                    </div>

                    <div className="hidden sm:flex flex-col items-center group cursor-pointer relative" onClick={() => navigate('/home-clothes/cart')}>
                        <ShoppingBag size={20} className="text-gray-700 group-hover:text-pink-500 transition-colors" />
                        <span className="text-[9px] sm:text-[10px] font-bold mt-1 text-gray-800 group-hover:text-pink-500">Cart</span>
                        {cartCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-pink-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                                {cartCount}
                            </div>
                        )}
                    </div>
                    <div className="hidden md:flex flex-col items-center group cursor-pointer" onClick={() => navigate('/home-clothes/wishlist')}>
                        <Heart size={20} className="text-gray-700 group-hover:text-pink-500 transition-colors" />
                        <span className="text-[10px] font-bold mt-1 text-gray-800 group-hover:text-pink-500">Wishlist</span>
                    </div>
                    <div className="flex flex-col items-center group cursor-pointer" onClick={() => navigate('/home-clothes/account')}>
                        <User size={20} className="text-gray-700 group-hover:text-pink-500 transition-colors" />
                        <span className="text-[9px] sm:text-[10px] font-bold mt-1 text-gray-800 group-hover:text-pink-500">Profile</span>
                    </div>
                </div>

                {/* Mobile Search Modal Overlay */}
                {isSearchModalOpen && (
                    <div className="fixed inset-0 bg-white z-[200] flex flex-col sm:hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Modal Header */}
                        <div className="flex items-center gap-3 p-4 border-b">
                            <button onClick={() => setIsSearchModalOpen(false)} className="p-1">
                                <ArrowLeft size={24} className="text-gray-700" />
                            </button>
                            <div className="flex-1 relative">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search for clothes, brands..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearchKeyDown(e);
                                            setIsSearchModalOpen(false);
                                        }
                                    }}
                                    className="w-full bg-[#f5f5f6] h-10 px-4 pr-10 rounded-md text-sm focus:outline-none focus:bg-white border border-transparent focus:border-gray-200"
                                />
                                <button
                                    onClick={(e) => {
                                        handleSearchKeyDown({ key: 'Enter', preventDefault: () => { } });
                                        setIsSearchModalOpen(false);
                                    }}
                                    className="absolute right-10 top-1/2 -translate-y-1/2 text-pink-500 p-1 active:scale-95 transition-transform"
                                    aria-label="Search"
                                >
                                    <Search size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        setIsSearchModalOpen(false);
                                        if (toggleFilter) toggleFilter();
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-500 p-1 active:scale-95 transition-transform"
                                    aria-label="Filter"
                                >
                                    <SlidersHorizontal size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content - Scrollable Results */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                            {searchQuery?.trim() ? (
                                <>
                                    {searchLoading && (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                                            <p className="mt-4 text-sm text-gray-500">Searching...</p>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        {!searchLoading && searchResults.map(product => (
                                            <div
                                                key={product.id || product._id}
                                                onClick={() => {
                                                    handleProductNavigate(product);
                                                    setIsSearchModalOpen(false);
                                                }}
                                                className="flex flex-col group cursor-pointer"
                                            >
                                                <div className="aspect-[3/4] relative bg-white border border-gray-100 overflow-hidden mb-2 rounded-sm shadow-sm">
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">NO IMAGE</div>
                                                    )}
                                                    <div className="absolute top-2 left-2 bg-pink-500 text-white text-[8px] font-black px-1.5 py-0.5 shadow-sm">
                                                        POPULAR
                                                    </div>
                                                </div>
                                                <div className="text-left px-1">
                                                    <h4 className="text-[11px] font-bold text-gray-800 truncate uppercase tracking-tighter">{product.name}</h4>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <span className="text-gray-900 font-black text-xs italic font-sans">₹{product.discountedPrice || product.price}</span>
                                                        {(product.discountedPrice || product.price) < (product.originalPrice || 2000) && (
                                                            <span className="text-pink-500 text-[9px] font-black uppercase">OFFER</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {!searchLoading && searchMessage && (
                                        <div className="text-center text-sm text-gray-500 py-8 italic">{searchMessage}</div>
                                    )}
                                </>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Recent Searches</h3>
                                        {recentSearches?.length > 0 && (
                                            <button onClick={handleClearRecentSearches} className="text-xs text-pink-500 font-bold">CLEAR</button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {recentSearches?.map((term, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleRecentSearchClick(term)}
                                                className="px-4 py-2 bg-white border border-gray-100 rounded-full text-sm text-gray-600 shadow-sm active:bg-gray-50"
                                            >
                                                {term}
                                            </button>
                                        ))}
                                        {(!recentSearches || recentSearches.length === 0) && (
                                            <p className="text-sm text-gray-400 py-4">No recent searches yet</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default MyntraClothesHeader;
