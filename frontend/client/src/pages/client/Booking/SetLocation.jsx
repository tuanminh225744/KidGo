import { X, Route as RouteIcon, MapPin, ArrowRight, ArrowUpDown, History, Home as HomeIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MapRouting from '../../../components/MapRouting';

export default function SetLocation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { kidId, tripType } = location.state || {};

  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [routeInfo, setRouteInfo] = useState({ distance: null, duration: null });

  const [pickupText, setPickupText] = useState("");
  const [dropoffText, setDropoffText] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);

  useEffect(() => {
    const fetchNominatim = async (query, isPickup) => {
      if (!query || query.length < 3) {
        isPickup ? setPickupSuggestions([]) : setDropoffSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn&limit=5`);
        const data = await res.json();
        isPickup ? setPickupSuggestions(data) : setDropoffSuggestions(data);
      } catch (err) {
        console.error("Nominatim error", err);
      }
    };

    const timer = setTimeout(() => {
      if (activeField === 'pickup') fetchNominatim(pickupText, true);
      if (activeField === 'dropoff') fetchNominatim(dropoffText, false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pickupText, dropoffText, activeField]);

  const handleSelectSuggestion = (place, isPickup) => {
    const location = { lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
    if (isPickup) {
      setStartPoint(location);
      setPickupText(place.display_name);
      setPickupSuggestions([]);
    } else {
      setEndPoint(location);
      setDropoffText(place.display_name);
      setDropoffSuggestions([]);
    }
    setActiveField(null);
  };

  const handleRouteInfo = (info) => {
    setRouteInfo(info);
  };

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-screen">
      <header className="px-5 py-4 flex justify-between items-center sticky top-0 bg-white z-20">
        <button onClick={() => navigate('/booking')} className="flex items-center gap-1 text-on-surface-variant p-2 rounded-xl hover:bg-surface-container-low transition-colors">
          <X size={20} />
          <span className="text-sm font-bold">Huỷ</span>
        </button>
        <h1 className="text-2xl font-bold text-primary">Đặt xe</h1>
        <span className="text-sm font-bold text-on-surface-variant mx-4">2/4</span>
      </header>

      {/* Progress Bar */}
      <div className="px-5 mt-2">
        <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div className="bg-primary-container h-full w-1/2 rounded-full transition-all duration-500" />
        </div>
      </div>

      <main className="px-5 pt-8 pb-52">
        <h2 className="text-3xl font-extrabold text-on-background mb-6 tracking-tight">Đi đâu?</h2>

        {/* Map Placeholder */}
        <section className="relative w-full h-64 map-bg rounded-3xl overflow-hidden border border-outline-variant/30 mb-4 soft-shadow z-0">
          <MapRouting
            startPoint={startPoint}
            endPoint={endPoint}
            onRouteInfo={handleRouteInfo}
            readOnly={true}
          />
        </section>

        <div className="flex items-center gap-2 mb-8 px-1">
          <RouteIcon size={16} className="text-outline" />
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
            {routeInfo.duration && routeInfo.distance
              ? `Lộ trình dự kiến: ~${routeInfo.duration} phút · ${routeInfo.distance} km`
              : "Vui lòng chọn điểm đón và điểm trả"}
          </span>
        </div>

        {/* <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px bg-outline-variant/30 flex-1" />
          <span className="text-[10px] font-bold text-outline uppercase tracking-[0.2em]">Hoặc nhập mới</span>
          <div className="h-px bg-outline-variant/30 flex-1" />
        </div> */}

        {/* Inputs Card */}
        <div className="bg-white rounded-3xl p-6 soft-shadow relative border border-outline-variant/10">
          <div className="flex gap-4">
            <div className="flex flex-col items-center py-2">
              <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/10" />
              <div className="flex-1 w-0.5 border-l-2 border-dashed border-outline-variant my-1" />
              <div className="w-3 h-3 rounded-full bg-error ring-4 ring-error/10" />
            </div>
            <div className="flex-1 space-y-8">
              <div className="relative">
                <label className="text-[10px] font-bold text-outline uppercase absolute -top-5 left-0">Điểm đón</label>
                <input
                  type="text"
                  value={pickupText}
                  onChange={(e) => {
                    setPickupText(e.target.value);
                    setActiveField('pickup');
                  }}
                  onFocus={() => setActiveField('pickup')}
                  placeholder="Nhập địa chỉ đón..."
                  className="w-full bg-transparent border-b border-outline-variant py-1 focus:border-primary outline-none text-sm font-bold"
                />
                {activeField === 'pickup' && pickupSuggestions.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 bg-white border border-outline-variant/20 shadow-lg rounded-xl mt-1 z-50 max-h-48 overflow-y-auto">
                    {pickupSuggestions.map(s => (
                      <li key={s.place_id} onClick={() => handleSelectSuggestion(s, true)} className="p-3 border-b border-outline-variant/10 text-xs hover:bg-surface-container-low cursor-pointer line-clamp-2 text-on-surface">
                        {s.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="relative">
                <label className="text-[10px] font-bold text-outline uppercase absolute -top-5 left-0">Điểm trả</label>
                <input
                  type="text"
                  value={dropoffText}
                  onChange={(e) => {
                    setDropoffText(e.target.value);
                    setActiveField('dropoff');
                  }}
                  onFocus={() => setActiveField('dropoff')}
                  placeholder="Nhập địa chỉ trả..."
                  className="w-full bg-transparent border-b border-outline-variant py-1 focus:border-primary outline-none text-sm font-medium"
                />
                {activeField === 'dropoff' && dropoffSuggestions.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 bg-white border border-outline-variant/20 shadow-lg rounded-xl mt-1 z-50 max-h-48 overflow-y-auto">
                    {dropoffSuggestions.map(s => (
                      <li key={s.place_id} onClick={() => handleSelectSuggestion(s, false)} className="p-3 border-b border-outline-variant/10 text-xs hover:bg-surface-container-low cursor-pointer line-clamp-2 text-on-surface">
                        {s.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center text-primary active:scale-90 transition-transform">
              <ArrowUpDown size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Recents */}
        {/* <div className="mt-10 space-y-4">
          <h3 className="text-xs font-bold text-outline uppercase tracking-widest px-1">Gần đây</h3>
          <div className="space-y-3">
            <div
              onClick={() => setEndPoint({ lat: 10.772622, lng: 106.670172 })}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-outline-variant/20 hover:bg-white transition-all cursor-pointer"
            >
              <History size={20} className="text-outline" />
              <div>
                <p className="text-sm font-bold text-on-surface">123 Đường Nguyễn Huệ</p>
                <p className="text-[10px] text-on-surface-variant font-bold">Quận 1, TP. Hồ Chí Minh</p>
              </div>
            </div>
            <div
              onClick={() => setEndPoint({ lat: 10.792622, lng: 106.720172 })}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-outline-variant/20 hover:bg-white transition-all cursor-pointer"
            >
              <HomeIcon size={20} className="text-outline" />
              <div>
                <p className="text-sm font-bold text-on-surface">Chung cư Vinhomes Central Park</p>
                <p className="text-[10px] text-on-surface-variant font-bold">Bình Thạnh, TP. Hồ Chí Minh</p>
              </div>
            </div>
          </div>
        </div> */}
      </main>

      <div className="fixed bottom-22 left-0 right-0 p-5 bg-white shadow-[0px_-4px_20px_0px_rgba(79,70,200,0.06)] z-30 max-w-[430px] mx-auto">
        <button
          onClick={() => {
            if (!startPoint || !endPoint) return;
            navigate('/client/booking/datetime', {
              state: {
                kidId,
                tripType,
                startPoint,
                endPoint,
                pickupText,
                dropoffText,
                routeInfo
              }
            });
          }}
          disabled={!startPoint || !endPoint}
          className="w-full bg-primary-container text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Tiếp tục <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
