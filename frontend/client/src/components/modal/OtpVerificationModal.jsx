import { motion } from 'motion/react';

export const OtpVerificationModal = ({ otpInput, setOtpInput, submitOtp, errorMsg, loading }) => (
  <motion.div
    initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
    className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[44px] px-8 pt-8 pb-10 shadow-[0_-15px_50px_rgba(0,0,0,0.06)] z-30">
    <h3 className="text-2xl font-black text-primary mb-2">Xác thực OTP</h3>
    <p className="text-gray-500 text-sm mb-6">Nhập mã OTP 6 số từ ứng dụng của phụ huynh.</p>
    
    <input 
      type="number" 
      maxLength={6}
      value={otpInput}
      onChange={(e) => setOtpInput(e.target.value)}
      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-4 text-center text-2xl font-black tracking-[0.2em] mb-4 focus:outline-none focus:border-primary"
      placeholder="------"
    />
    {errorMsg && <p className="text-red-500 text-sm text-center mb-4">{errorMsg}</p>}

    <button
      disabled={loading}
      onClick={submitOtp}
      className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-md disabled:opacity-70">
      {loading ? "Đang xử lý..." : "Xác nhận OTP"}
    </button>
  </motion.div>
);
