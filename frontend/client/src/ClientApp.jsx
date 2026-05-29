import React from "react";
import { Routes, Route } from "react-router-dom";

import HomeView from "./pages/client/Home.jsx";
import Login from "./pages/client/Login.jsx";
import Register from "./pages/client/Register.jsx";
import OTP from "./pages/client/OTP.jsx";
import KidProfile from "./pages/client/KidProfile.jsx";
import ClientProfile from "./pages/client/ClientProfile.jsx";
import Booking from "./pages/client/Booking";
import Tracking from "./pages/client/Tracking.jsx";
import Schedules from "./pages/client/Schedules.jsx";
import Notifications from "./pages/client/Notifications.jsx";
import BottomNav from "./pages/client/BottomNav.jsx";

export default function ClientApp() {
  return (
    <div className="max-w-[430px] mx-auto w-full h-screen bg-surface relative flex flex-col shadow-2xl overflow-hidden border-x border-gray-200">
      <div className="flex-1 overflow-y-auto scroll-hide pb-20">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="home" element={<HomeView />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="otp" element={<OTP />} />
          <Route path="kid-profile" element={<KidProfile />} />
          <Route path="profile" element={<ClientProfile />} />
          <Route path="booking/*" element={<Booking />} />
          <Route path="tracking" element={<Tracking />} />
          <Route path="schedules" element={<Schedules />} />
          <Route path="notifications" element={<Notifications />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}
