import { motion } from 'motion/react';
import { Banknote, CheckCircle, XCircle } from 'lucide-react';
import { ClipLoader } from 'react-spinners';

export const CashPaymentModal = ({ amount, onConfirm, loading }) => {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 z-50 pb-10"
    >
      <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>

      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Banknote size={32} className="text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Thu tiền mặt</h3>
        <p className="text-gray-500 text-sm mb-4">Khách hàng thanh toán chuyến đi bằng tiền mặt.</p>
        <div className="bg-gray-50 rounded-2xl p-4 inline-block min-w-[200px]">
          <div className="text-xs text-gray-400 font-medium mb-1">Số tiền cần thu</div>
          <div className="text-3xl font-black text-primary">
            {amount?.toLocaleString()}đ
          </div>
        </div>
      </div>

      <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl mb-6 text-center border border-blue-100 font-medium">
        Vui lòng thu đúng số tiền hiển thị ở trên từ phụ huynh hoặc bé trước khi hoàn thành chuyến đi.
      </div>

      <button
        onClick={onConfirm}
        disabled={loading}
        className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform flex justify-center items-center gap-2"
      >
        {loading ? (
          <ClipLoader color="#ffffff" size={24} />
        ) : (
          <>
            <CheckCircle size={20} />
            <span>Xác nhận đã thu tiền</span>
          </>
        )}
      </button>
    </motion.div>
  );
};
