import { motion } from 'motion/react';

export const WaitingModal = ({ onMetKid }) => (
  <motion.div
    initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
    className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[44px] px-8 pt-8 pb-10 shadow-[0_-15px_50px_rgba(0,0,0,0.06)] z-20">
    <h3 className="text-2xl font-black text-primary mb-2">Chờ bé</h3>
    <p className="text-gray-500 text-sm mb-6">Vui lòng chờ bé tại điểm đón. Nhấn nút bên dưới khi bạn đã gặp bé.</p>
    <button
      onClick={onMetKid}
      className="w-full bg-primary text-white font-black py-4 rounded-2xl hover:scale-[1.01] transition-all shadow-md">
      Đã gặp bé
    </button>
  </motion.div>
);
