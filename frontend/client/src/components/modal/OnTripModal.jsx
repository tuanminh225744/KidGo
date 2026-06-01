import { motion } from 'motion/react';
import { Home, GraduationCap, Eye } from 'lucide-react';

export const OnTripModal = ({ setTripStatus }) => (
  <motion.div
    initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
    className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[44px] px-8 pt-8 pb-10 shadow-[0_-15px_50px_rgba(0,0,0,0.06)] z-20">

    <h3 className="text-2xl font-black text-primary mb-1">Đến nơi sau 14 phút</h3>

    <div className="relative h-1.5 bg-gray-100 rounded-full mb-10 mt-4">
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
      onClick={() => setTripStatus('dropping_off')}
      className="w-full bg-[#a7f3d0] text-primary font-black py-4 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm">
      Đã đến điểm trả
    </button>
  </motion.div>
);
