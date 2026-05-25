import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, AlertCircle, Navigation, Home, GraduationCap, Eye } from 'lucide-react';
import { getDriverTrips } from '../../services/driver.service';
import { useNavigate } from 'react-router-dom';

export const InTripScreen = ({ tripData }) => {
  const navigate = useNavigate();
  const [activeTrip, setActiveTrip] = useState(tripData || null);

  useEffect(() => {
    if (activeTrip) return; // Use provided trip data if available

    const fetchActiveTrip = async () => {
      try {
        // Find active trip if not passed via props
        const res = await getDriverTrips({ status: 'active' });
        if (res?.data?.data && res.data.data.length > 0) {
          setActiveTrip(res.data.data[0]);
        }
      } catch (error) {
        console.error('Lỗi lấy chuyến đi đang chạy:', error);
      }
    };
    fetchActiveTrip();
  }, [activeTrip]);

  const kidName = activeTrip?.kid?.name || 'Bé Minh';
  const destination = activeTrip?.dropoffLocation?.address || 'Trường Tiểu học Nguyễn Huệ – 456 Nguyễn Huệ, Quận 1';
  const hasDeviationAlert = activeTrip?.status === 'deviated';

  return (
    <div className="bg-[#f0f4f8] min-h-screen relative overflow-hidden">
      {/* Map Header */}
      <div className="absolute top-10 left-6 right-6 z-10 flex justify-between items-center">
        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md"><ChevronLeft size={24} className="text-gray-400" /></button>
        <div className="bg-white/95 backdrop-blur px-6 py-2.5 rounded-full shadow-md border border-gray-100">
          <h2 className="font-bold text-sm">Đang chở {kidName}</h2>
        </div>
        <button className="px-5 py-2.5 bg-white rounded-full font-black text-red-500 shadow-md border-2 border-red-50">SOS</button>
      </div>

      {/* Grid Pattern Placeholder for Map */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* Alert */}
      {hasDeviationAlert && (
        <div className="absolute top-28 left-6 right-6 z-10">
          <div className="bg-[#fffbeb] border border-[#fde68a] p-4 rounded-2xl flex items-center gap-3 shadow-lg">
            <div className="bg-[#fef3c7] p-2 rounded-xl text-orange-600">
              <AlertCircle size={20} />
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-black text-orange-900 leading-tight">Hệ thống phát hiện lệch lộ trình</div>
            </div>
            <button className="bg-white text-[10px] font-bold px-3 py-2 rounded-xl border border-[#fde68a] text-orange-800 shadow-sm leading-none flex-shrink-0">
              Xác nhận lý do
            </button>
          </div>
        </div>
      )}

      <div className="absolute bottom-44 right-6 z-10">
        <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl border border-gray-100"><Navigation size={28} className="text-primary" /></button>
      </div>

      {/* Trip Info Modal */}
      <motion.div
        initial={{ y: 200 }} animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[44px] px-8 pt-8 pb-10 shadow-[0_-15px_50px_rgba(0,0,0,0.06)] z-20">

        <h3 className="text-2xl font-black text-primary mb-1">Đến nơi sau 14 phút</h3>
        <p className="text-gray-400 text-[11px] font-medium mb-10 leading-tight line-clamp-2">{destination}</p>

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