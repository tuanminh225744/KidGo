import React, { useState } from "react";
import { HomeScreen } from "./pages/driver/HomeScreen.jsx";
import ScheduleView from "./pages/driver/ScheduleView.jsx";
import HistoryView from "./pages/driver/HistoryView.jsx";
import NotificationsView from "./pages/driver/NotificationsView.jsx";
import { ProfileScreen } from "./pages/driver/ProfileScreen.jsx";
import BottomNav from "./pages/driver/BottomNav.jsx";

export default function DriverApp() {
  const [currentView, setCurrentView] = useState("schedule");

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case "schedule":
        return <HomeScreen onNavigate={handleNavigate} />;
      case "history":
        return <HistoryView onNavigate={handleNavigate} />;
      case "income":
        // Fallback for income if there's no income view yet
        return <div className="p-6 flex justify-center items-center h-full text-gray-500">Thu nhập đang được phát triển...</div>;
      case "notifications":
        return <NotificationsView onNavigate={handleNavigate} />;
      case "account":
      case "profile":
        return <ProfileScreen onNavigate={handleNavigate} />;
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        {renderView()}
      </div>
      <BottomNav currentView={currentView} onNavigate={handleNavigate} />
    </>
  );
}
