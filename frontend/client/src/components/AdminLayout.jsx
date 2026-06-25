import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Users, FileText, LogOut, Truck, UsersRound } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export default function AdminLayout() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const navItems = [
    { path: "/admin/driver-approval", label: "Duyệt tài xế", icon: <Users size={20} /> },
    { path: "/admin/drivers", label: "Quản lý Tài xế", icon: <Truck size={20} /> },
    { path: "/admin/parents", label: "Quản lý Phụ huynh", icon: <UsersRound size={20} /> },
    { path: "/admin/report", label: "Xử lý Report", icon: <FileText size={20} /> },
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col md:flex-row w-full overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 p-4 flex flex-col shrink-0 overflow-y-auto">
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-extrabold text-lg tracking-tighter">
              KG
            </span>
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">
            AdminPanel
          </span>
        </div>

        <nav className="flex-1 mt-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
