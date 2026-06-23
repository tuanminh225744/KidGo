import { History, CalendarDays, Star } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { getKidsByParent } from "../../../services/kid.service.js";
import { getCurrentProfile } from "../../../services/user.service.js";
import {
  getActiveTripsList,
  getTrips,
} from "../../../services/trip.service.js";
import { getUnreadCount } from "../../../services/notification.service.js";
import { getTripSchedulesByDate } from "../../../services/booking.service.js";
import { useAuthStore } from "../../../store/useAuthStore.js";
import { useSocketStore } from "../../../store/useSocketStore.js";
import TripCard from "./TripCard.jsx";
import KidCard from "./KidCard.jsx";
import TripSuccessCard from "./TripSuccessCard.jsx";

export default function Home() {
  const navigate = useNavigate();
  const [kids, setKids] = useState([]);
  const [profile, setProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTrips, setActiveTrips] = useState([]);
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [historyTrips, setHistoryTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dismissedEvents, setDismissedEvents] = useState(new Set());
  const { user, setUser, logout } = useAuthStore();
  const displayProfile = profile || user;
  const events = useSocketStore((s) => s.events);

  // Lọc các event chuyến xe thành công chưa đọc và chưa dismiss
  const successEvents = events.filter(
    (e) =>
      e.namespace === "parent" &&
      e.type === "trip_completed" &&
      !e.isRead &&
      !dismissedEvents.has(e.id)
  );

  const dismissSuccessEvent = (id) => {
    setDismissedEvents((prev) => new Set([...prev, id]));
  };

  // Load data lần đầu khi mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Khi có socket event ảnh hưởng đến trạng thái chuyến → refresh activeTrips
  const TRIP_STATUS_EVENTS = [
    "driver_is_coming",  // picking_up
    "kid_picked_up",     // in_progress
    "trip_completed",    // completed → ẩn TripCard
    "trip_cancelled",    // cancelled → ẩn TripCard
  ];
  useEffect(() => {
    const hasTripEvent = events.some(
      (e) => e.namespace === "parent" && TRIP_STATUS_EVENTS.includes(e.type) && !e.isRead
    );
    if (hasTripEvent) {
      loadActiveTrips();
    }
  }, [events]);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadKids(),
      loadProfile(),
      loadUnreadCount(),
      loadActiveTrips(),
      loadTodaySchedules(),
      loadHistoryTrips(),
    ]);
    setLoading(false);
  };

  const loadKids = async () => {
    const result = await getKidsByParent();
    if (result.success) {
      setKids(result.data);
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
    console.log("Active trips:", result);
  };

  const loadTodaySchedules = async () => {
    const today = new Date();
    const dateParam = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");
    const result = await getTripSchedulesByDate(dateParam);
    if (result.success) {
      console.log(result);
      setTodaySchedules(result.data.data || []);
    } else {
      setTodaySchedules([]);
    }
  };

  const loadHistoryTrips = async () => {
    const result = await getTrips({ status: "completed", limit: 3 });
    if (result.success) {
      const tripsData = result.data?.trips || [];
      const formatted = tripsData.map((t) => ({
        id: t._id,
        time: new Date(t.createdAt).toLocaleString(),
        status:
          t.status === "completed"
            ? "HOÀN THÀNH"
            : t.status === "cancelled"
              ? "HUỶ"
              : t.status,
        name: t.kidId?.fullName || "Unknown",
        from:
          t.routeId?.estimatedPickupAddress ||
          t.routeId?.actualPickupAddress ||
          "N/A",
        to:
          t.routeId?.estimatedDropoffAddress ||
          t.routeId?.actualDropoffAddress ||
          "N/A",
        price: t.paymentId?.amount
          ? `${t.paymentId.amount.toLocaleString()}đ`
          : "0đ",
        dist: t.routeId?.estimatedDistance
          ? `${t.routeId.estimatedDistance}km`
          : t.routeId?.actualDistance
            ? `${t.routeId.actualDistance}km`
            : "0.0km",
        duration: t.routeId?.estimatedDuration
          ? `${t.routeId.estimatedDuration} phút`
          : t.routeId?.actualDuration
            ? `${t.routeId.actualDuration} phút`
            : "0 phút",
        driver: t.driverId,
      }));
      setHistoryTrips(formatted);
    } else {
      setHistoryTrips([]);
    }
  };

  const formatPickupTime = (pickupTime) => pickupTime || "--:--";

  const formatScheduleDate = (date) =>
    new Intl.DateTimeFormat("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    }).format(new Date(date));

  return (
    <div className="flex-1 flex flex-col pb-24">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between bg-white sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/client/home")}
            className="flex items-center gap-2 active:scale-95 transition-transform"
          >
            <div className="w-20 h-11 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20">
              <span className="text-lg font-black tracking-tight">KidGo</span>
            </div>
          </button>

          {/* Nút tài xế ưu tiên */}

        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 active:scale-95 transition-transform"
            aria-label="Tài khoản"
          >
            <div className="text-right">
              <p className="text-xs text-on-surface-variant leading-none mb-1">
                Xin chào
              </p>
              <h2 className="text-base font-bold text-on-surface leading-tight">
                {displayProfile?.fullName || "Phụ huynh"}
              </h2>
            </div>
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-fixed bg-surface-container">
                <img
                  src={
                    displayProfile?.avatar ||
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=Parent"
                  }
                  alt={displayProfile?.fullName || "Parent profile"}
                  className="w-full h-full object-cover"
                />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
          </button>

          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/client/profile");
                }}
                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Thông tin cá nhân
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/client/report-list");
                }}
                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Phản hồi
              </button>
              <button
                type="button"
                onClick={() => navigate("/client/preferred-drivers")}
                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                aria-label="Tài xế ưu tiên"
              >

                Tài xế ưu tiên
              </button>
              <div className="h-px bg-gray-100 w-full" />
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  logout();
                  navigate("/client/login");
                }}
                className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Đăng xuất
              </button>

            </div>
          )}
        </div>
      </header>

      <main className="px-5 pt-6 space-y-6">
        {/* Trip Success Cards - hiển thị khi nhận socket trip_completed */}
        <AnimatePresence>
          {successEvents.map((event) => (
            <TripSuccessCard
              key={event.id}
              event={event}
              onDismiss={() => dismissSuccessEvent(event.id)}
            />
          ))}
        </AnimatePresence>

        {/* Active Trip Card */}
        {activeTrips.length > 0 &&
          activeTrips.map((trip) => (
            <TripCard key={trip._id} trip={trip} navigate={navigate} />
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
          ) : kids?.length === 0 ? (
            <div className="bg-surface-container rounded-3xl p-6 text-center">
              <p className="text-on-surface-variant font-medium">
                Chưa có bé nào. Hãy thêm một bé.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {kids?.map((kid) => (
                <KidCard key={kid._id} kid={kid} navigate={navigate} />
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
            <button
              onClick={() => navigate("/client/schedules")}
              className="text-primary font-bold text-sm hover:underline"
            >
              Xem chi tiết
            </button>
          </div>
          {todaySchedules.length === 0 ? (
            <div className="bg-secondary-container rounded-3xl p-5 text-white flex flex-col justify-between h-36 shadow-lg shadow-secondary/20 w-full">
              <CalendarDays size={32} strokeWidth={1.5} />
              <div>
                <h3 className="font-bold text-lg">Hôm nay</h3>
                <p className="text-white/80 text-sm">
                  Chưa có lịch trình nào cho hôm nay
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedules.slice(0, 3).map((schedule) => (
                <button
                  key={schedule._id}
                  onClick={() => navigate("/client/schedules")}
                  className="w-full bg-secondary-container text-white rounded-3xl p-4 shadow-lg shadow-secondary/20 active:scale-[0.99] transition-transform text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/70 font-semibold">
                        {schedule.startDate
                          ? formatScheduleDate(schedule.startDate)
                          : "Hôm nay"}
                      </p>
                      <h3 className="font-bold text-lg mt-1">
                        {schedule.kidId?.fullName || "Bé của bạn"}
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 text-white font-black">
                        {formatPickupTime(schedule.pickupTime)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

      </main>

    </div>
  );
}
