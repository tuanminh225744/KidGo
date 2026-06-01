import { motion } from 'motion/react';
import { UserCheck } from 'lucide-react';

export const DroppingOffModal = ({ onConfirmDropoff, loading }) => (
  <motion.div
    initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
    className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[44px] px-8 pt-8 pb-10 shadow-[0_-15px_50px_rgba(0,0,0,0.06)] z-20">

    <div className="flex items-center justify-center mb-4">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
        <UserCheck size={32} className="text-primary" />
      </div>
    </div>

    <h3 className="text-2xl font-black text-center text-primary mb-2">Đã đến điểm trả</h3>
    <p className="text-gray-500 text-sm text-center mb-6">
      Vui lòng giao bé cho phụ huynh hoặc người được ủy quyền và xác nhận hoàn thành chuyến đi.
    </p>

    <button
      onClick={onConfirmDropoff}
      disabled={loading}
      className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-md disabled:opacity-70">
      {loading ? "Đang xử lý..." : "Xác nhận đã trả bé"}
    </button>
  </motion.div>
);
