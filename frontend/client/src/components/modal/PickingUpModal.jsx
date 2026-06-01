import { motion } from 'motion/react';

export const PickingUpModal = ({ onArrived }) => (
  <motion.div
    initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
    className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[44px] px-8 pt-8 pb-10 shadow-[0_-15px_50px_rgba(0,0,0,0.06)] z-20">
    <h3 className="text-2xl font-black text-primary mb-6">Đang di chuyển đến điểm đón</h3>
    <button
      onClick={onArrived}
      className="w-full bg-[#a7f3d0] text-primary font-black py-4 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm">
      Đã đến điểm đón
    </button>
  </motion.div>
);
