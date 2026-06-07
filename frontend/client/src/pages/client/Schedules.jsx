import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { CalendarDays, Clock3, MapPin, RefreshCw } from "lucide-react";
import { getTripSchedules } from "../../services/booking.service.js";

const formatDate = (value) =>
  new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

export default function Schedules() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const result = await getTripSchedules();
      setSchedules(result.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const sortedSchedules = useMemo(
    () =>
      [...schedules].sort((a, b) =>
        String(a.pickupTime || "").localeCompare(String(b.pickupTime || "")),
      ),
    [schedules],
  );

  return (
    <div className="flex-1 flex flex-col pb-24">
      <header className="px-5 py-4 flex items-center justify-between bg-white sticky top-0 z-40 shadow-sm">
        <div>
          {/* <p className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
            Lịch trình
          </p> */}
          <h1 className="text-xl font-black text-on-surface">Lịch trình</h1>
        </div>
        <button
          onClick={loadSchedules}
          className="w-11 h-11 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface"
        >
          <RefreshCw size={18} />
        </button>
      </header>

      <main className="px-5 pt-6 space-y-4">
        {/* <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary-container text-white rounded-3xl p-4">
            <CalendarDays size={28} />
            <p className="text-2xl font-black mt-3">{schedules.length}</p>
            <p className="text-sm text-white/80">Tổng lịch trình</p>
          </div>
          <div className="bg-tertiary-container text-white rounded-3xl p-4">
            <Clock3 size={28} />
            <p className="text-2xl font-black mt-3">
              {schedules.filter((item) => item.isActive).length}
            </p>
            <p className="text-sm text-white/80">Đang hoạt động</p>
          </div>
        </div> */}

        {loading ? (
          <div className="text-center text-on-surface-variant py-10">
            Đang tải...
          </div>
        ) : sortedSchedules.length === 0 ? (
          <div className="bg-surface-container rounded-3xl p-6 text-center">
            <p className="text-on-surface-variant font-medium">
              Chưa có lịch trình nào.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedSchedules.map((schedule) => (
              <motion.button
                key={schedule._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate("/client/home")}
                className="w-full bg-white rounded-3xl p-4 shadow-md border border-outline-variant/30 text-left active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] ${schedule.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-600"
                          }`}
                      >
                        {schedule.isActive ? "Đang bật" : "Đã tắt"}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        {schedule.repeatDays?.length || 0} ngày/tuần
                      </span>
                    </div>
                    <h3 className="font-bold text-on-surface">
                      {schedule.kidId?.fullName || "Bé của bạn"}
                    </h3>

                    <p className="text-sm text-on-surface-variant">
                      {schedule.routeId?.estimatedPickupAddress || schedule.routeId?.actualPickupAddress || "Chưa có điểm đón"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="w-24 h-14 rounded-2xl bg-primary-container text-white flex items-center justify-center font-black text-base">
                      {schedule.pickupTime || "--:--"}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-2">
                      {schedule.startDate ? formatDate(schedule.startDate) : ""}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
