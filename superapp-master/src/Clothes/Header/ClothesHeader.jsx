import React from "react";
import { useNavigate } from "react-router-dom";
import bellIcon from "../../Images/HomeScreen/bellIcon.svg";
import { LocationDisplay } from "../../Grocery/SubPages/Header";
import { ChevronLeft } from 'lucide-react';

const ClothesHeaderComponent = () => {
    const navigate = useNavigate();
    return (
        <div className="fixed top-0 left-0 w-full bg-white border-b border-gray-50 flex flex-row items-center justify-between h-16 px-4 z-[100] antialiased">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 mr-1 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center outline-none focus:bg-gray-100 touch-manipulation"
                    aria-label="Go Back"
                >
                    <ChevronLeft size={24} className="text-gray-900" />
                </button>
                <div className="flex items-center gap-2">
                    <img src={bellIcon} alt='CityBell' className="w-7 h-7 object-contain" />
                    <span className="font-black text-gray-900 tracking-tight text-lg">CityBell</span>
                </div>
            </div>
            <div className="hidden sm:block">
                <LocationDisplay />
            </div>
        </div>
    );
};

export default ClothesHeaderComponent;
