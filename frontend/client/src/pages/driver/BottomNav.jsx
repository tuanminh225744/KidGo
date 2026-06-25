import { Calendar, CalendarDays, Wallet, Bell, User, Home } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract the current path from the URL, e.g., '/driver/home' -> 'home'
  const pathParts = location.pathname.split("/");
  const currentView = pathParts[pathParts.length - 1];

  const items = [
    { id: "home", label: "Trang chủ", icon: <Home className="w-6 h-6" /> },
    {
      id: "schedule",
      label: "Lịch trình",
      icon: <Calendar className="w-6 h-6" />,
    },
    {
      id: "history",
      label: "Lịch sử",
      icon: <CalendarDays className="w-6 h-6" />,
    },
    { id: "income", label: "Thu nhập", icon: <Wallet className="w-6 h-6" /> },
    { id: "account", label: "Tài khoản", icon: <User className="w-6 h-6" /> },
  ];

  // Hide BottomNav on detail screens
  const hideOnScreens = [
    "login",
    "register",
    "otp",
    "in-trip",
    "pin",
    "drop-off",
    "summary",
    "deviation",
    "registered",
  ];
  if (hideOnScreens.includes(currentView)) return null;

  return (
    <nav className="bg-white border-t border-gray-100 px-6 py-3 pb-8 flex justify-between items-center fixed bottom-0 left-0 right-0  mx-auto z-20 max-w-[430px]">
      {items.map((item) => {
        const isActive =
          currentView === item.id ||
          (item.id === "account" && currentView === "profile");
        return (
          <button
            key={item.id}
            onClick={() => navigate(`/driver/${item.id}`)}
            className={`flex flex-col items-center gap-1 transition-all relative ${isActive ? "text-[#1D7C45]" : "text-gray-400"}`}
          >
            {isActive && (
              <motion.div
                layoutId="active-nav"
                className="absolute -top-1 px-4 py-3 bg-green-50 rounded-xl -z-10"
              />
            )}
            {item.icon}
            <span className="text-[10px] font-bold whitespace-nowrap">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
