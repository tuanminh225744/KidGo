import {
  Bell,
  Phone,
  Map,
  History,
  CalendarDays,
  MoreVertical,
  AlertTriangle,
  ChevronRight,
  Car,
  Info,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { getKidsByParent } from "../../services/kid.service.js";
import { getCurrentProfile } from "../../services/user.service.js";
import { getActiveTripsList } from "../../services/trip.service.js";
import { getUnreadCount } from "../../services/notification.service.js";
import { getParentAlerts } from "../../services/alert.service.js";
import { useAuthStore } from "../../store/useAuthStore.js";

export default function Home() {
  const navigate = useNavigate();
  const [kids, setKids] = useState([]);
  const [profile, setProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTrips, setActiveTrips] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadKids(),
      loadProfile(),
      loadUnreadCount(),
      loadActiveTrips(),
      loadAlerts()
    ]);
    setLoading(false);
  };

  const loadKids = async () => {
    const result = await getKidsByParent();
    if (result.success) {
      setKids(result.data || result);
    } else {
      setKids([]);
    }
  };

  const loadProfile = async () => {
    const result = await getCurrentProfile();
    if (result.success) {
      setProfile(result.data);
      // Cập nhật lại zustand store để đồng bộ trạng thái mới nhất
      setUser(result.data);
    }
  };

  const loadUnreadCount = async () => {
    const result = await getUnreadCount();
    if (result.success) {
      setUnreadCount(result.data?.count || 0);
    }
  };

  const loadActiveTrips = async () => {
    const result = await getActiveTripsList();
    if (result.success) {
      setActiveTrips(result.data || []);
    }
  };

  const loadAlerts = async () => {
    const result = await getParentAlerts({ status: "active" });
    if (result.success) {
      setAlerts(result.data?.alerts || result.data || []);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-24">
      {/* Header */}
      <header className="px-5 py-4 flex justify-between items-center bg-white sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-primary-fixed overflow-hidden bg-surface-container">
            <img
              src={profile?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Parent"}
              alt="Parent profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant">Xin chào,</p>
            <h1 className="text-xl font-bold text-primary leading-tight">
              {profile ? profile.fullName : (user ? user.fullName : "Phụ huynh")} 👋
            </h1>
          </div>
        </div>
        <div className="relative">
          <div className="p-2 bg-surface-container-low rounded-full cursor-pointer" onClick={() => navigate("/notifications")}>
            <Bell size={24} className="text-primary" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-error text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="px-5 pt-6 space-y-6">
        {/* Active Trip Card */}
        {activeTrips.length > 0 && activeTrips.map((trip) => (
          <section key={trip._id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-2 border-primary-container rounded-[24px] p-5 shadow-xl active-shadow relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-surface-variant">
                    <img
                      src={trip.kid?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${trip.kid?.fullName || "Kid"}`}
                      alt={trip.kid?.fullName || "Kid"}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface">
                      Bé {trip.kid?.fullName || "của bạn"} đang trên đường
                    </h3>
                    <div className="flex items-center gap-1.5 py-0.5 px-2 bg-green-50 text-green-700 text-[10px] font-bold rounded-full w-fit mt-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      {trip.status === "in_progress" ? "ĐANG CHẠY" : "SẮP ĐÓN"}
                    </div>
                  </div>
                </div>
                <button>
                  <MoreVertical size={20} className="text-on-surface-variant" />
                </button>
              </div>

              <div className="bg-surface-container-low p-3 rounded-2xl flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={trip.driver?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${trip.driver?.fullName || "Driver"}`}
                    alt="Driver"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-on-surface">
                    {trip.driver?.fullName || "Tài xế"} <span className="text-orange-500 ml-1">★ {trip.driver?.rating || "4.8"}</span>
                  </p>
                  <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded font-bold">
                    Tài xế
                  </span>
                </div>
                <button
                  onClick={() => navigate("/tracking")}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm"
                >
                  <Phone size={18} fill="currentColor" />
                </button>
              </div>

              {/* Simulated Progress - In real app, calculate ETA based on trip logs */}
              <div className="relative pt-2 pb-6 px-4">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-variant -translate-y-1/2 rounded-full" />
                <div className="absolute top-1/2 left-0 w-3/5 h-1 bg-primary-container -translate-y-1/2 rounded-full" />
                <div className="relative flex justify-between">
                  <div className="w-4 h-4 bg-primary-container rounded-full ring-4 ring-white" />
                  <div className="relative -top-3">
                    <div className="w-8 h-8 bg-primary-container text-white rounded-full flex items-center justify-center shadow-lg ring-4 ring-white animate-bounce-slow">
                      <Car size={16} fill="currentColor" />
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-surface-variant rounded-full ring-4 ring-white" />
                </div>
                <div className="flex justify-between mt-3 text-[10px] font-bold text-on-surface-variant">
                  <span>Nhà</span>
                  <span>Trường</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => navigate("/tracking")}
                  className="bg-primary-container text-white rounded-xl py-3 flex items-center justify-center gap-2 font-bold active:scale-95 transition-transform"
                >
                  <Map size={18} /> Xem bản đồ
                </button>
                <button className="border-2 border-outline-variant text-on-surface rounded-xl py-3 flex items-center justify-center gap-2 font-bold active:scale-95 transition-transform">
                  <Phone size={18} /> Gọi tài xế
                </button>
              </div>
            </motion.div>
          </section>
        ))}

        {/* Alert Card */}
        {alerts.length > 0 && alerts.slice(0, 1).map((alert) => (
          <section key={alert._id}>
            <div className="bg-[#FEF3C7] border-l-4 border-orange-400 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex gap-3">
                <span className="text-orange-600">⚠️</span>
                <div>
                  <p className="font-bold text-[#92400E] text-sm">
                    {alert.type === 'speeding' ? 'Xe chạy quá tốc độ' : alert.type === 'detour' ? 'Xe lệch lộ trình' : alert.type === 'unplanned_stop' ? 'Dừng xe không đúng lịch' : 'Cảnh báo chuyến đi'}
                  </p>
                  <p className="text-[#92400E]/80 text-xs">
                    {alert.message || "Bấm để xem chi tiết và xác nhận"}
                  </p>
                </div>
              </div>
              <button onClick={() => navigate(`/alerts/${alert._id}`)} className="bg-white/50 px-4 py-1.5 rounded-xl text-[#92400E] font-bold text-sm shadow-sm">
                Xem
              </button>
            </div>
          </section>
        ))}

        {/* Kids Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-on-background">
              Con của bạn
            </h2>
            <button
              onClick={() => navigate("/client/kid-profile")}
              className="text-primary font-bold text-sm hover:underline"
            >
              Thêm bé +
            </button>
          </div>
          {loading ? (
            <div className="text-center text-on-surface-variant">
              Đang tải...
            </div>
          ) : kids.length === 0 ? (
            <div className="bg-surface-container rounded-3xl p-6 text-center">
              <p className="text-on-surface-variant font-medium">
                Chưa có bé nào. Hãy thêm một bé.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {kids.map((kid) => (
                <button
                  key={kid._id}
                  onClick={() => navigate(`/client/kid-profile?kidId=${kid._id}`)}
                  className="bg-white p-4 rounded-3xl soft-shadow flex flex-col items-center text-center border border-outline-variant/30 hover:shadow-lg active:scale-95 transition-all"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-primary-fixed">
                    <img
                      src={
                        kid.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${kid.fullName}`
                      }
                      alt={kid.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-on-surface text-sm">
                    {kid.fullName}
                  </h3>
                  <p className="text-[10px] text-on-surface-variant">
                    {kid.school || "Chưa cập nhật"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Today's Schedule */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-on-background">
              Lịch trình hôm nay
            </h2>
            <button className="text-primary font-bold text-sm hover:underline">
              Xem chi tiết
            </button>
          </div>
          <div className="bg-secondary-container rounded-3xl p-5 text-white flex flex-col justify-between h-36 shadow-lg shadow-secondary/20 active:scale-95 transition-transform cursor-pointer w-full">
            <CalendarDays size={32} strokeWidth={1.5} />
            <div>
              <h3 className="font-bold text-lg">Hôm nay</h3>
              <p className="text-white/80 text-sm">Chưa có lịch trình nào</p>
            </div>
          </div>
        </section>

        {/* Trip History */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-on-background">
              Lịch sử di chuyển
            </h2>
            <button className="text-primary font-bold text-sm hover:underline">
              Xem tất cả
            </button>
          </div>
          <div className="bg-tertiary-container rounded-3xl p-5 text-white flex flex-col justify-between h-36 shadow-lg shadow-tertiary/20 active:scale-95 transition-transform cursor-pointer w-full">
            <History size={32} strokeWidth={1.5} />
            <div>
              <h3 className="font-bold text-lg">Chuyến đi gần nhất</h3>
              <p className="text-white/80 text-sm">Xem lại các chuyến đi trước đó</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
