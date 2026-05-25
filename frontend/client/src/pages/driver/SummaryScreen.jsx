import { motion } from 'motion/react';
import { Clock, MapPin, Wallet, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SummaryScreen = ({ tripData }) => {
   const navigate = useNavigate();
   const data = tripData || {};
   const duration = data.duration ? `${data.duration} phút` : 'A phút';
   const distance = data.distance ? `${data.distance} km` : 'A km';
   const fare = data.fare ? `${data.fare.toLocaleString()}đ` : 'A đ';

   return (
      <div className="bg-[#fbfcff] min-h-screen flex flex-col items-center justify-center px-8 pb-10">
         <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center mb-16 w-full">

            <h1 className="text-3xl font-black text-primary mb-12 italic tracking-tight">Chuyến hoàn thành!</h1>
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] w-full max-w-sm mx-auto">
               <div className="grid grid-cols-3 divide-x divide-gray-100">
                  <div className="px-1 text-center">
                     <Clock size={22} className="mx-auto text-primary mb-3" />
                     <div className="text-[10px] text-gray-400 mb-1 font-medium">Thời gian</div>
                     <div className="font-bold text-gray-800 text-sm">{duration}</div>
                  </div>
                  <div className="px-1 text-center">
                     <MapPin size={22} className="mx-auto text-primary mb-3" />
                     <div className="text-[10px] text-gray-400 mb-1 font-medium">Quãng đường</div>
                     <div className="font-bold text-gray-800 text-sm">{distance}</div>
                  </div>
                  <div className="px-1 text-center">
                     <Wallet size={22} className="mx-auto text-primary mb-3" />
                     <div className="text-[10px] text-gray-400 mb-1 font-medium">Thu nhập</div>
                     <div className="font-bold text-gray-800 text-sm">{fare}</div>
                  </div>
               </div>
            </div>
         </motion.div>

         <div className="text-center mb-20">
            <p className="text-gray-600 text-sm font-bold mb-8">Chuyến đi thế nào?</p>
            <div className="flex gap-4">
               {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} className="hover:scale-125 transition-transform active:scale-95">
                     <Star size={38} className="text-gray-200 hover:text-accent hover:fill-accent transition-all duration-300" strokeWidth={2.5} />
                  </button>
               ))}
            </div>
         </div>

         <button
            onClick={() => navigate('/driver/home')}
            className="w-full bg-primary text-white font-black py-5 rounded-2xl hover:scale-[1.01] active:scale-[0.99] shadow-2xl shadow-primary/30 transition-all text-lg">
            Về trang chủ
         </button>
      </div>
   );
};