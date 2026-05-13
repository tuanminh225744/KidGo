import { X, MapPin, Calendar, Car, Shield, Check, Info, ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function ConfirmBooking() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-screen">
      <header className="px-5 py-4 flex justify-between items-center sticky top-0 bg-white z-20">
        <button onClick={() => navigate('/booking/driver')} className="p-2 rounded-full hover:bg-surface-container-low active:scale-90 transition-transform">
          <X size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">Xác nhận</h1>
          <p className="text-[10px] font-bold text-on-surface-variant">Bước cuối cùng</p>
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-1 pt-8 pb-40 px-5 space-y-8 overflow-y-auto">
        {/* Summary Card */}
        <section className="bg-white rounded-[32px] soft-shadow p-6 flex flex-col gap-6 border border-outline-variant/10">
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-fixed flex items-center justify-center shadow-inner">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Minh" alt="Minh" />
              </div>
              <h3 className="text-xl font-bold text-on-surface">Bé Minh</h3>
            </div>
            <span className="bg-orange-50 text-orange-600 px-4 py-1 rounded-full text-xs font-bold ring-1 ring-orange-100">Một lần</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/5 text-primary rounded-xl">
              <MapPin size={22} fill="currentColor" stroke="none" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-on-surface">Nhà → Trường TH Trần Phú</p>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">4.5km · ~20 phút</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/5 text-primary rounded-xl">
              <Calendar size={22} fill="currentColor" stroke="none" />
            </div>
            <p className="text-sm font-bold text-on-surface">Thứ 2, 24/06/2025 · 07:30</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/5 text-primary rounded-xl">
                <Car size={22} fill="currentColor" stroke="none" />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">Anh Tuấn (Tài xế ưu tiên)</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-orange-500 text-[10px] font-bold">★ 4.9</span>
                  <span className="text-on-surface-variant text-[10px] font-bold ml-1">· 500+ chuyến</span>
                </div>
              </div>
            </div>
            <div className="p-1.5 bg-green-50 text-green-600 rounded-lg">
              <Check size={18} strokeWidth={3} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/5 text-primary rounded-xl">
                <Shield size={22} fill="currentColor" stroke="none" />
              </div>
              <p className="text-sm font-bold text-on-surface">Mã PIN đã thiết lập</p>
            </div>
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
               <Check size={12} strokeWidth={3} /> Bảo mật
            </span>
          </div>
        </section>

        <div className="flex items-center gap-2 justify-center py-2 opacity-80">
          <Info size={16} className="text-on-surface-variant" />
          <p className="text-xs font-bold text-on-surface-variant">Tài xế sẽ liên hệ trước 15 phút</p>
        </div>

        {/* Pricing */}
        <div className="bg-surface-container-low p-6 rounded-3xl border-2 border-dashed border-outline-variant relative overflow-hidden group">
          <div className="flex justify-between items-center relative z-10">
            <span className="text-on-surface-variant font-bold text-sm uppercase tracking-widest">Tổng thanh toán</span>
            <span className="text-3xl font-extrabold text-primary">45.000đ</span>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full pointer-events-none transition-transform group-hover:scale-150" />
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-5 bg-white/80 backdrop-blur-md z-30 max-w-[430px] mx-auto">
        <button 
          onClick={() => setShowSuccess(true)}
          className="w-full h-16 bg-gradient-to-r from-primary-container to-[#6366F1] text-white rounded-3xl font-bold text-xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all"
        >
          ✓ Xác nhận đặt xe
        </button>
        <button 
          onClick={() => navigate('/booking/driver')}
          className="w-full mt-4 text-primary font-bold text-sm flex items-center justify-center gap-2"
        >
          <ArrowLeft size={16} /> Chỉnh sửa
        </button>
      </footer>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-sm rounded-[40px] p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
            >
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <div className="text-5xl animate-bounce">🎉</div>
              </div>
              <h2 className="text-2xl font-extrabold text-on-surface mb-3 tracking-tight">Đặt xe thành công!</h2>
              <p className="text-on-surface-variant text-sm font-medium mb-10 leading-relaxed">
                Hệ thống đang tìm tài xế phù hợp cho bé Minh<span className="animate-pulse">...</span>
              </p>
              
              <div className="w-full space-y-4">
                <button 
                  onClick={() => navigate('/tracking')}
                  className="w-full h-14 bg-primary-container text-white rounded-2xl font-bold text-lg hover:brightness-110 transition-all active:scale-95"
                >
                  Theo dõi chuyến đi
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="w-full h-14 bg-surface-container-high text-on-surface rounded-2xl font-bold text-lg hover:bg-outline-variant transitions-colors active:scale-95"
                >
                  Về trang chủ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
