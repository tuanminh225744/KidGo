import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, Bell, Settings, Car } from "lucide-react";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const hideNav = ["/client/login", "/client/register", "/client/otp"].includes(
    location.pathname,
  );

  if (hideNav) return null;

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-outline-variant/30 flex justify-around py-3 px-6 z-50 rounded-t-3xl shadow-lg">
      <button
        onClick={() => navigate("/client/home")}
        className={`flex flex-col items-center gap-1 ${isActive("/client/home") || location.pathname === "/client" ? "text-primary" : "text-on-surface-variant"}`}
      >
        <Home size={24} />
        <span className="text-[10px] font-bold">Trang chủ</span>
      </button>
      <button
        onClick={() => navigate("/client/schedules")}
        className={`flex flex-col items-center gap-1 ${isActive("/client/schedules") ? "text-primary" : "text-on-surface-variant"}`}
      >
        <Calendar size={24} />
        <span className="text-[10px] font-bold">Lịch trình</span>
      </button>
      <div className="relative -top-8">
        <button
          onClick={() => navigate("/client/booking")}
          className="w-16 h-16 bg-primary-container text-white rounded-full flex items-center justify-center shadow-xl shadow-primary/30 border-4 border-white active:scale-95 transition-transform"
        >
          <Car size={32} />
        </button>
      </div>
      <button className="flex flex-col items-center gap-1 text-on-surface-variant">
        <Bell size={24} />
        <span className="text-[10px] font-bold">Thông báo</span>
      </button>
      <button className="flex flex-col items-center gap-1 text-on-surface-variant">
        <Settings size={24} />
        <span className="text-[10px] font-bold">Cài đặt</span>
      </button>
    </nav>
  );
}
