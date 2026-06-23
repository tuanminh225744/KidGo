import {
  ArrowLeft,
  Phone,
  Map as MapIcon,
  Star,
  ShieldCheck,
  Car,
  School,
  Home as HomeIcon,
  AlertTriangle,
} from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Tracking() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-screen relative overflow-hidden pb-28">
      {/* 1. MAP BACKGROUND (Simulated) */}
      <div className="absolute inset-0 bg-[#E8EDF5] map-bg">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 800">
          {/* Paths */}
          <polyline
            points="100,200 150,230 200,320 280,450 320,600"
            fill="none"
            stroke="#A5B4FC"
            strokeWidth="4"
            strokeDasharray="8 4"
            strokeLinecap="round"
          />
          <polyline
            points="100,200 150,230 185,290"
            fill="none"
            stroke="#474554"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>

        {/* Pins */}
        <div
          className="absolute flex flex-col items-center"
          style={{ top: "180px", left: "80px" }}
        >
          <div className="bg-white p-2 rounded-full shadow-lg border border-outline-variant/30 mb-1">
            <HomeIcon
              size={20}
              className="text-primary"
              fill="currentColor"
              stroke="none"
            />
          </div>
          <span className="bg-white/80 backdrop-blur-md px-3 py-0.5 rounded-full text-[10px] font-bold shadow-sm border border-outline-variant">
            Nhà
          </span>
        </div>

        <div
          className="absolute flex flex-col items-center"
          style={{ bottom: "180px", right: "60px" }}
        >
          <div className="bg-white p-2 rounded-full shadow-lg border border-outline-variant/30 mb-1">
            <School
              size={20}
              className="text-secondary"
              fill="currentColor"
              stroke="none"
            />
          </div>
          <span className="bg-white/80 backdrop-blur-md px-3 py-0.5 rounded-full text-[10px] font-bold shadow-sm border border-outline-variant">
            Trường TH Trần Phú
          </span>
        </div>

        {/* Car Animated Pin */}
        <div
          className="absolute flex items-center justify-center"
          style={{ top: "270px", left: "165px" }}
        >
          <div className="w-16 h-16 absolute rounded-full bg-primary/20 animate-ping" />
          <div className="bg-primary-container p-4 rounded-full shadow-2xl relative z-10 border-4 border-white">
            <Car size={32} className="text-white" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* 2. OVERLAY HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 px-5 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md max-w-[430px] mx-auto shadow-sm">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-on-surface-variant font-bold text-sm active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <h1 className="text-base font-bold text-on-surface">
          Theo dõi Bé Minh
        </h1>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-container/10 text-primary active:scale-90 transition-transform">
          <Phone size={20} fill="currentColor" stroke="none" />
        </button>
      </header>

      {/* 3. ALERT TOAST */}
      <div className="fixed left-5 right-5 z-30 bottom-[240px] max-w-[390px] mx-auto animate-bounce">
        <div className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-4 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-orange-500" strokeWidth={3} />
            <div>
              <p className="text-sm font-bold text-orange-900 leading-tight">
                Xe đang lệch lộ trình 260m
              </p>
              <p className="text-[10px] font-bold text-orange-700/70 uppercase mt-0.5">
                Vui lòng kiểm tra
              </p>
            </div>
          </div>
          <button className="bg-white px-4 py-2 rounded-xl text-orange-900 font-bold text-xs shadow-sm hover:bg-orange-100 active:scale-95 transition-all">
            OK, hiểu
          </button>
        </div>
      </div>

      {/* 4. BOTTOM SHEET */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] shadow-[0px_-8px_40px_rgba(79,70,200,0.15)] z-50 flex flex-col px-6 pt-4 pb-12 max-w-[430px] mx-auto border-t border-outline-variant/20">
        <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mb-6" />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary-fixed shadow-md">
              <img
                src="/images/anh-avatar-trang.jpg"
                alt="Driver"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-on-surface leading-tight">
                Anh Tuấn
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Star
                  size={14}
                  className="text-orange-500"
                  fill="currentColor"
                  stroke="none"
                />
                <span className="text-xs font-bold text-on-surface-variant">
                  4.8 (500+)
                </span>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-primary-container px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all">
            <Phone size={18} fill="currentColor" stroke="none" />
            Gọi
          </button>
        </div>

        <div className="mb-6">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2 opacity-60">
            Thời gian dự kiến
          </p>
          <h2 className="text-3xl font-extrabold text-primary leading-none tracking-tight">
            Đến nơi sau 12 phút
          </h2>
        </div>

        <div className="w-full h-2.5 bg-surface-container rounded-full mb-8 overflow-hidden">
          <div className="h-full w-1/2 bg-primary rounded-full relative shadow-sm">
            <div className="absolute right-0 top-0 w-2.5 h-full bg-white/30 skew-x-12" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="py-4 rounded-[20px] border-2 border-outline-variant text-on-surface-variant font-bold text-sm hover:bg-surface-container-low transition-colors active:scale-95">
            Xem chi tiết
          </button>
          <button className="py-4 rounded-[20px] bg-primary-container text-white font-bold text-sm shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95">
            OK, đã hiểu ✓
          </button>
        </div>
      </div>
    </div>
  );
}
