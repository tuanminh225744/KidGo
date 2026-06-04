import { motion } from 'motion/react';
import { Wallet } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const SummaryScreen = () => {
   const navigate = useNavigate();
   const location = useLocation();
   const data = location.state?.tripData || {};
   const fare = data.fare ? `${data.fare.toLocaleString()}đ` : 'A đ';

   return (
      <div className="bg-[#fbfcff] min-h-screen flex flex-col items-center justify-center px-8 pb-10">
         <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center mb-16 w-full">

            <h1 className="text-3xl font-black text-primary mb-12 italic tracking-tight">Chuyến hoàn thành!</h1>
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] w-full max-w-sm mx-auto">
               <div className="text-center">
                  <Wallet size={32} className="mx-auto text-primary mb-4" />
                  <div className="text-xs text-gray-400 mb-2 font-medium">Thu nhập chuyến này</div>
                  <div className="font-black text-primary text-3xl">{fare}</div>
               </div>
            </div>
         </motion.div>

         <button
            onClick={() => navigate('/driver/home')}
            className="w-full bg-primary text-white font-black py-5 rounded-2xl hover:scale-[1.01] active:scale-[0.99] shadow-2xl shadow-primary/30 transition-all text-lg mt-8">
            Về trang chủ
         </button>
      </div>
   );
};