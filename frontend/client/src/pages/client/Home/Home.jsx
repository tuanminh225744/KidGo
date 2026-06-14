import { History, CalendarDays } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getKidsByParent } from "../../../services/kid.service.js";
import { getCurrentProfile } from "../../../services/user.service.js";
import {
  getActiveTripsList,
  getTrips,
} from "../../../services/trip.service.js";
import { getUnreadCount } from "../../../services/notification.service.js";
import { getTripSchedulesByDate } from "../../../services/booking.service.js";
import { useAuthStore } from "../../../store/useAuthStore.js";
import { TripDetailsModal } from "../../../components/modal/TripDetailsModal.jsx";
import { useSocketStore } from "../../../store/useSocketStore.js";
import TripCard from "./TripCard.jsx";
import KidCard from "./KidCard.jsx";

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
  const { user, setUser } = useAuthStore();
  const displayProfile = profile || user;
  const events = useSocketStore((s) => s.events);

  useEffect(() => {
    loadAllData();
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
        <button
          type="button"
          onClick={() => navigate("/client/home")}
          className="flex items-center gap-3 active:scale-95 transition-transform"
        >
          <div className="w-20 h-11 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20">
            <span className="text-lg font-black tracking-tight">KidGo</span>
          </div>
          {/* <div className="text-left">
            <p className="text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">
              KidGo
            </p>
            <h1 className="text-base font-bold text-on-surface leading-tight">
              Home
            </h1>
          </div> */}
        </button>

        <button
          type="button"
          onClick={() => navigate("/client/profile")}
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
      </header>

      <main className="px-5 pt-6 space-y-6">
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
          {loading ? (
            <div className="text-center text-on-surface-variant py-4">
              Đang tải...
            </div>
          ) : historyTrips.length === 0 ? (
            <div className="bg-secondary-container rounded-3xl p-5 text-white flex flex-col justify-between h-36 shadow-lg shadow-tertiary/20 w-full">
              <History size={32} strokeWidth={1.5} />
              <div>
                <h3 className="font-bold text-lg">Chưa có chuyến đi</h3>
                <p className="text-white/80 text-sm">
                  Bạn chưa có chuyến đi nào đã hoàn thành
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {historyTrips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  className="bg-white p-4 rounded-3xl shadow-sm border border-outline-variant/30 active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500 font-medium">
                        {trip.time}
                      </p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-100 text-green-700">
                        {trip.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{trip.price}</p>
                    </div>
                  </div>

                  <div className="mb-2">
                    <h3 className="font-bold text-gray-800 truncate">
                      Bé {trip.name}
                    </h3>
                    <h3 className="font-bold text-gray-800 truncate">
                      Từ: {trip.from}
                    </h3>
                    <h3 className="font-bold text-gray-800 truncate">
                      Đến: {trip.to}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <TripDetailsModal
        isOpen={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
        trip={selectedTrip}
        role="client"
      />
    </div>
  );
}
