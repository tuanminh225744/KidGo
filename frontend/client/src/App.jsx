import { Home, Calendar, History, Bell, Settings, Car } from "lucide-react";
import React from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import HomeView from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import OTP from "./pages/OTP.jsx";
import KidProfile from "./pages/KidProfile.jsx";
import Booking from "./pages/Booking/index.jsx";
import Tracking from "./pages/Tracking.jsx";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const hideNav = ["/login", "/register", "/otp"].includes(location.pathname);

  return (
    <div className="max-w-[430px] mx-auto min-h-screen relative bg-surface flex flex-col shadow-2xl overflow-hidden">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<HomeView />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/kid-profile" element={<KidProfile />} />
        <Route path="/booking/*" element={<Booking />} />
        <Route path="/tracking" element={<Tracking />} />
      </Routes>

      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white/80 backdrop-blur-md border-t border-outline-variant/30 flex justify-around py-3 px-6 z-50 rounded-t-3xl shadow-lg">
          <button
            onClick={() => navigate("/home")}
            className={`flex flex-col items-center gap-1 ${location.pathname === "/" ? "text-primary" : "text-on-surface-variant"}`}
          >
            <Home size={24} />
            <span className="text-[10px] font-bold">Trang chủ</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-on-surface-variant">
            <Calendar size={24} />
            <span className="text-[10px] font-bold">Lịch trình</span>
          </button>
          <div className="relative -top-8">
            <button
              onClick={() => navigate("/booking")}
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
      )}
    </div>
  );
}

export default App;
