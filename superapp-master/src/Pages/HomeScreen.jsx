import React, { useState, useEffect } from "react";
import bannerClothes from "../Images/HomeScreen/bannerClothes.jpg";
import bannerHotel from "../Images/HomeScreen/bannerHotel.jpg";
import bannerFood from "../Images/HomeScreen/bannerFood.jpg";
import bannerTaxi from "../Images/HomeScreen/bannerTaxi.jpg";
import bannerGroceries from "../Images/HomeScreen/bannerGroceries.jpg";
import bannerUrban from "../Images/HomeScreen/bannerUrban.jpg";
import bannerCityMove from "../Images/HomeScreen/cityMoveBanner.jpg";
import bellIcon from "../Images/HomeScreen/bellIcon.svg";
import { useNavigate } from "react-router-dom";
import { HiOutlineUser, HiOutlineLocationMarker, HiLockClosed } from "react-icons/hi";
import { motion } from "framer-motion";

const ComingSoonOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="absolute inset-0 z-40 flex items-center justify-center bg-black/10 backdrop-blur-[1px]"
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className="bg-black/40 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex items-center gap-2"
    >
      <HiLockClosed size={12} className="text-gray-300" />
      <span className="text-gray-200/90 text-[10px] font-medium tracking-[0.2em] uppercase">Coming Soon</span>
    </motion.div>
  </motion.div>
);

const HomeScreen = () => {
  const navigate = useNavigate();

  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [city, setCity] = useState({
    road: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [loadingCity, setLoadingCity] = useState(false);
  const lastFetchedCoords = React.useRef(null);

  useEffect(() => {
    let watchId;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ latitude, longitude });
          setLoadingLocation(false);
          setLocationError("");
        },
        (error) => {
          console.error("Location error:", error);
          if (error.code === 1) { // PERMISSION_DENIED
            setLocationError("Location access denied");
          }
          // Only stop loading if we don't have a location yet
          if (!location) {
            setLoadingLocation(false);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 5000,
        }
      );
    } else {
      setLocationError("Geolocation not supported");
      setLoadingLocation(false);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    if (location && !locationError) {
      const hasMovedSignificantly = !lastFetchedCoords.current ||
        Math.abs(location.latitude - lastFetchedCoords.current.latitude) > 0.0005 ||
        Math.abs(location.longitude - lastFetchedCoords.current.longitude) > 0.0005;

      if (hasMovedSignificantly) {
        setLoadingCity(true);
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${location.latitude}&lon=${location.longitude}&format=json`
        )
          .then((res) => res.json())
          .then((data) => {
            const address = data.address || {};

            const road = address.road || "";
            const area = address.suburb || address.neighbourhood || "";
            const cityName = address.city || address.town || address.village || "";
            const state = address.state || "";
            const pincode = address.postcode || "";

            setCity({ road, area, city: cityName, state, pincode });
            setLoadingCity(false);
            lastFetchedCoords.current = location;
          })
          .catch((err) => {
            console.error("Error fetching address:", err);
            setLoadingCity(false);
          });
      }
    }
  }, [location, locationError]);

  return (
    <div className="min-h-screen flex flex-col pb-24 bg-gradient-to-br from-purple-100 via-white to-blue-100 relative">
      <header className="w-full flex flex-col items-center px-4 py-3 bg-white/60 backdrop-blur-md shadow-sm sticky top-0 z-20">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center">
            <img src={bellIcon} alt='City Bell' className="w-8 h-8 ml-10" />
            <h1 className="text-xl font-extrabold tracking-wide text-purple-700 drop-shadow-sm uppercase">City Bell</h1>
          </div>
        </div>

        <div className="w-full flex items-center gap-2 mt-1 px-10">
          <HiOutlineLocationMarker className="w-5 h-5 text-purple-400" />
          {(loadingLocation || loadingCity) && !city.city ? (
            <span className="text-xs text-gray-500">Detecting location...</span>
          ) : locationError ? (
            <span className="text-xs text-red-500">{locationError}</span>
          ) : (
            <span className="text-xs text-gray-700 font-medium">
              {city.road && `${city.road}, `}
              {city.area && `${city.area}, `}
              {city.city && `${city.city}, `}
              {city.pincode}
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-4 auto-rows-[140px]">
          {/* Hero Banner: Grocery (Now at the top) */}
          <div
            className="col-span-2 row-span-2 relative rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.01] active:scale-95 cursor-pointer bg-white group border-4 border-white/50"
            onClick={() => navigate("/home-grocery")}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-green-700/80 via-transparent to-green-700/20 z-10" />
            <img src={bannerGroceries} alt="Grocery" loading="eager" className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute bottom-0 left-0 right-0 z-20 p-8">
              <h2 className="text-white text-4xl font-black tracking-tighter uppercase drop-shadow-lg leading-none">Grocery</h2>
              <p className="text-white/80 text-xs font-medium uppercase tracking-widest mt-2">Fresh & Local delivered fast</p>
            </div>
          </div>

          {/* Clothes (Square) */}
          <div
            className="col-span-1 row-span-1 relative rounded-[2rem] overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer bg-white group border-2 border-white/30"
            onClick={() => navigate("/home-clothes")}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
            <img src={bannerClothes} alt="E-commerce" loading="lazy" className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute bottom-4 left-4 z-20">
              <h2 className="text-white text-lg font-black tracking-tight uppercase">E-commerce</h2>
            </div>
          </div>

          {/* Food (Square) */}
          <div
            className="col-span-1 row-span-1 relative rounded-[2rem] overflow-hidden shadow-xl bg-white border-2 border-white/30 cursor-not-allowed"
          >
            <ComingSoonOverlay />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10 opacity-60" />
            <img src={bannerFood} alt="Food" loading="lazy" className="w-full h-full object-cover opacity-60 blur-[1px]" />
            <div className="absolute bottom-4 left-4 z-20">
              <h2 className="text-white text-lg font-black tracking-tight uppercase opacity-60">Food</h2>
            </div>
          </div>

          <div
            className="col-span-2 row-span-1 relative rounded-[2rem] overflow-hidden shadow-xl bg-white border-2 border-white/30 cursor-not-allowed"
          >
            <ComingSoonOverlay />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-blue-600/40 to-transparent z-10 opacity-60" />
            <img src={bannerCityMove} alt="City Move" loading="lazy" className="w-full h-full object-cover opacity-60 blur-[1px]" />
            <div className="absolute inset-y-0 left-0 z-20 flex flex-col justify-center p-8">
              <h2 className="text-white text-3xl font-black tracking-tighter uppercase leading-none opacity-60">City Move</h2>
              <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60">Instant Delivery</p>
            </div>
          </div>

          {/* Hotel (Square) */}
          <div
            className="col-span-1 row-span-1 relative rounded-[2rem] overflow-hidden shadow-xl bg-white border-2 border-white/30 cursor-not-allowed"
          >
            <ComingSoonOverlay />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10 opacity-60" />
            <img src={bannerHotel} alt="Hotel" loading="lazy" className="w-full h-full object-cover opacity-60 blur-[1px]" />
            <div className="absolute bottom-4 left-4 z-20">
              <h2 className="text-white text-lg font-black tracking-tight uppercase opacity-60">Hotel</h2>
            </div>
          </div>

          {/* Taxi (Square) */}
          <div
            className="col-span-1 row-span-1 relative rounded-[2rem] overflow-hidden shadow-xl bg-white border-2 border-white/30 cursor-not-allowed"
          >
            <ComingSoonOverlay />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10 opacity-60" />
            <img src={bannerTaxi} alt="Taxi" loading="lazy" className="w-full h-full object-cover opacity-60 blur-[1px]" />
            <div className="absolute bottom-4 left-4 z-20">
              <h2 className="text-white text-lg font-black tracking-tight uppercase opacity-60">Taxi</h2>
            </div>
          </div>

          {/* City Serve (Bottom - Wide Rectangle) */}
          <div
            className="col-span-2 row-span-1 border-2 border-white/30 relative rounded-[2rem] overflow-hidden shadow-xl bg-white cursor-not-allowed"
          >
            <ComingSoonOverlay />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10 opacity-60" />
            <img src={bannerUrban} alt="City Serve" loading="lazy" className="w-full h-full object-cover opacity-60 blur-[1px]" />
            <div className="absolute inset-y-0 left-0 z-20 flex flex-col justify-center p-8">
              <h2 className="text-white text-3xl font-black tracking-tighter uppercase leading-none opacity-60">City Serve</h2>
              <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60">Experts at your door</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomeScreen;
