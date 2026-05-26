import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { HomeScreen } from "./pages/driver/HomeScreen.jsx";
import ScheduleView from "./pages/driver/ScheduleView.jsx";
import HistoryView from "./pages/driver/HistoryView.jsx";
import NotificationsView from "./pages/driver/NotificationsView.jsx";
import { ProfileScreen } from "./pages/driver/ProfileScreen.jsx";
import BottomNav from "./pages/driver/BottomNav.jsx";
import DeviationView from "./pages/driver/DeviationView.jsx";
import { InTripScreen } from "./pages/driver/InTripScreen.jsx";
import { PinEntryScreen } from "./pages/driver/PinEntryScreen.jsx";
import { DropOffScreen } from "./pages/driver/DropOffScreen.jsx";
import { SummaryScreen } from "./pages/driver/SummaryScreen.jsx";
import Login from "./pages/driver/Login.jsx";
import Register from "./pages/driver/Register.jsx";

export default function DriverApp() {
  return (
    <>
      <div className="max-w-[430px] flex-1 overflow-y-auto relative pb-20">
        <Routes>
          <Route path="/" element={<Navigate to="home" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="home" element={<HomeScreen />} />
          <Route path="schedule" element={<ScheduleView />} />
          <Route path="history" element={<HistoryView />} />
          <Route path="income" element={<div className="p-6 flex justify-center items-center h-full text-gray-500">Thu nhập đang được phát triển...</div>} />
          <Route path="notifications" element={<NotificationsView />} />
          <Route path="account" element={<ProfileScreen />} />
          <Route path="profile" element={<ProfileScreen />} />

          <Route path="deviation" element={<DeviationView />} />
          <Route path="in-trip" element={<InTripScreen />} />
          <Route path="pin" element={<PinEntryScreen />} />
          <Route path="drop-off" element={<DropOffScreen />} />
          <Route path="summary" element={<SummaryScreen />} />
        </Routes>
      </div>
      <BottomNav />
    </>
  );
}
