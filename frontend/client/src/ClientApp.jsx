import React from "react";
import { Routes, Route } from "react-router-dom";

import HomeView from "./pages/client/Home.jsx";
import Login from "./pages/client/Login.jsx";
import Register from "./pages/client/Register.jsx";
import OTP from "./pages/client/OTP.jsx";
import KidProfile from "./pages/client/KidProfile.jsx";
import Booking from "./pages/client/Booking";
import Tracking from "./pages/client/Tracking.jsx";
import BottomNav from "./pages/client/BottomNav.jsx";

export default function ClientApp() {
  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="home" element={<HomeView />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="otp" element={<OTP />} />
          <Route path="kid-profile" element={<KidProfile />} />
          <Route path="booking/*" element={<Booking />} />
          <Route path="tracking" element={<Tracking />} />
        </Routes>
      </div>

      <BottomNav />
    </>
  );
}
