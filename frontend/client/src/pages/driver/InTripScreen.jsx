import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Navigation, Home, GraduationCap, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DriverLiveMap from '../../components/DriverLiveMap';
import { useTripStore } from "../../store/useTripStore";

export const InTripScreen = () => {
  const navigate = useNavigate();
  const [tripStatus, setTripStatus] = useState("picking_up");
  const plannedRoute = useTripStore((state) => state.plannedRoute);
  const rawCoords = plannedRoute?.pickupCoords?.coordinates;
  const formattedPickupLocation = rawCoords && rawCoords.length === 2
    ? { lat: rawCoords[1], lng: rawCoords[0] }
    : undefined;

  return (
    <div className="bg-[#f0f4f8] min-h-screen relative overflow-hidden">
      {/* Map Header */}
      <div className="absolute top-10 left-6 right-6 z-10 flex justify-between items-center">
        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md"><ChevronLeft size={24} className="text-gray-400" /></button>
        <div className="bg-white/95 backdrop-blur px-6 py-2.5 rounded-full shadow-md border border-gray-100">
          <h2 className="font-bold text-sm">Đang chở</h2>
        </div>
        <button className="px-5 py-2.5 bg-white rounded-full font-black text-red-500 shadow-md border-2 border-red-50">SOS</button>
      </div>

      <div className="absolute inset-0 z-0">
        <DriverLiveMap
          className="h-full w-full"
          startPointProp={tripStatus === "picking_up" ? "current" : undefined}
          endPointProp={tripStatus === "picking_up" ? formattedPickupLocation : undefined}
        />
      </div>


      {/* <div className="absolute bottom-44 right-6 z-10">
        <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl border border-gray-100"><Navigation size={28} className="text-primary" /></button>
      </div> */}

      {/* Trip Info Modal */}
      <motion.div
        initial={{ y: 200 }} animate={{ y: 0 }}
        className="fixed bottom-0 left-1/2 -translate-x-1/2  w-full  w-full max-w-[430px] bg-white rounded-t-[44px] px-8 pt-8 pb-10 shadow-[0_-15px_50px_rgba(0,0,0,0.06)] z-20">

        <h3 className="text-2xl font-black text-primary mb-1">Đến nơi sau 14 phút</h3>


        <div className="relative h-1.5 bg-gray-100 rounded-full mb-10">
          <div className="absolute top-0 left-0 w-2/3 h-full bg-primary rounded-full"></div>
          <div className="absolute top-1/2 left-2/3 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-4 border-primary rounded-full shadow-md z-10"></div>
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-7 h-7 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-sm">
            <Home size={12} className="text-gray-300" />
          </div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-7 h-7 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-sm">
            <GraduationCap size={12} className="text-primary font-black" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-semibold mb-8">
          <Eye size={16} />
          Phụ huynh đang theo dõi hành trình
        </div>

        <button
          onClick={() => navigate('/driver/drop-off')}
          className="w-full bg-[#a7f3d0] text-primary font-black py-4 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm">
          Đã đến điểm trả
        </button>
      </motion.div>
    </div>
  );
};