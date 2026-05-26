import {
  X,
  ArrowRight,
  CalendarCheck,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const WEEK_DAYS = [
  { key: "mon", label: "T2" },
  { key: "tue", label: "T3" },
  { key: "wed", label: "T4" },
  { key: "thu", label: "T5" },
  { key: "fri", label: "T6" },
  { key: "sat", label: "T7" },
  { key: "sun", label: "CN" },
];

const formatDateInput = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function SetDateTime() {
  const navigate = useNavigate();
  const location = useLocation();
  const { kidId, tripType, startPoint, endPoint, pickupText, dropoffText, routeInfo } =
    location.state || {};

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [localTripType, setLocalTripType] = useState(tripType || "one-time");
  const [selectedWeekDays, setSelectedWeekDays] = useState([]);
  const [recurringStartDate, setRecurringStartDate] = useState(
    formatDateInput(new Date()),
  );
  const [recurringEndDate, setRecurringEndDate] = useState(
    formatDateInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
  );

  const days = useMemo(() => {
    const list = [];
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      list.push({
        dateObj: d,
        name: i === 0 ? "Hôm nay" : dayNames[d.getDay()],
        date: d.getDate(),
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        fullDateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      });
    }
    return list;
  }, []);

  const selectedDayItem =
    days.find(
      (d) =>
        d.dateObj.getDate() === selectedDate.getDate() &&
        d.dateObj.getMonth() === selectedDate.getMonth(),
    ) || days[0];

  const selectedWeekDaysText =
    WEEK_DAYS.filter((day) => selectedWeekDays.includes(day.key))
      .map((day) => day.label)
      .join(", ") || "Chưa chọn ngày trong tuần";

  const handleHourChange = (delta) => {
    setHour((prev) => {
      let newHour = prev + delta;
      if (newHour > 23) newHour = 0;
      if (newHour < 0) newHour = 23;
      return newHour;
    });
  };

  const handleMinuteChange = (delta) => {
    setMinute((prev) => {
      let newMin = prev + delta;
      if (newMin >= 60) newMin = 0;
      if (newMin < 0) newMin = 59;
      return newMin;
    });
  };

  const handleWeekDayToggle = (key) => {
    setSelectedWeekDays((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const handleStartDateChange = (value) => {
    setRecurringStartDate(value);
    if (new Date(value) > new Date(recurringEndDate)) {
      setRecurringEndDate(value);
    }
  };

  const handleEndDateChange = (value) => {
    setRecurringEndDate(value);
  };

  const handleContinue = () => {
    const finalDateTime = new Date(selectedDate);
    finalDateTime.setHours(hour, minute, 0, 0);

    navigate("/booking/driver", {
      state: {
        kidId,
        tripType: localTripType,
        startPoint,
        endPoint,
        pickupText,
        dropoffText,
        routeInfo,
        bookingDateTime: finalDateTime.toISOString(),
        recurringDays:
          localTripType === "recurring" ? selectedWeekDays : undefined,
        recurringStartDate:
          localTripType === "recurring" ? recurringStartDate : undefined,
        recurringEndDate:
          localTripType === "recurring" ? recurringEndDate : undefined,
      },
    });
  };

  const handleBookNow = () => {
    const now = new Date();
    navigate("/booking/driver", {
      state: {
        kidId,
        tripType: "one-time",
        startPoint,
        endPoint,
        pickupText,
        dropoffText,
        routeInfo,
        bookingDateTime: now.toISOString(),
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-screen">
      <header className="px-5 py-4 flex justify-between items-center sticky top-0 bg-white z-20">
        <button
          onClick={() => navigate("/client/booking/location")}
          className="flex items-center gap-1 text-on-surface-variant p-2 rounded-xl hover:bg-surface-container-low transition-colors"
        >
          <X size={20} />
          <span className="text-sm font-bold">Huỷ</span>
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">Đặt xe</h1>
        </div>
        <span className="text-sm font-bold text-primary mx-4">3/4</span>
      </header>

      <div className="px-5 mt-2">
        <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div className="bg-primary-container h-full w-3/4 rounded-full transition-all duration-500" />
        </div>
      </div>

      <main className="px-5 pt-8 pb-52 space-y-8">
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">
          Khi nào?
        </h2>

        <div className="flex p-1 bg-surface-container rounded-2xl">
          <button
            onClick={() => setLocalTripType("one-time")}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${localTripType === "one-time" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container-low"}`}
          >
            Một lần
          </button>
          <button
            onClick={() => setLocalTripType("recurring")}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${localTripType === "recurring" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container-low"}`}
          >
            Định kỳ
          </button>
        </div>

        {localTripType === "one-time" ? (
          <section>
            <label className="block text-sm font-bold text-on-surface-variant mb-4 px-1">
              Chọn ngày
            </label>
            <div className="flex gap-4 overflow-x-auto scroll-hide py-2">
              {days.map((day) => {
                const isSelected =
                  selectedDayItem.fullDateStr === day.fullDateStr;
                return (
                  <div
                    key={day.fullDateStr}
                    onClick={() => setSelectedDate(day.dateObj)}
                    className={`flex-shrink-0 w-16 h-20 flex flex-col items-center justify-center rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? "bg-primary-container border-primary-container text-white shadow-xl scale-110" : "bg-white border-outline-variant/30 text-on-surface-variant hover:border-primary-container/30"}`}
                  >
                    <span
                      className={`text-[10px] font-bold uppercase mb-1 ${isSelected ? "opacity-90" : "opacity-60"}`}
                    >
                      {day.name}
                    </span>
                    <span className="text-xl font-extrabold">{day.date}</span>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-4 px-1">
                Chọn ngày trong tuần
              </label>
              <div className="grid grid-cols-7 gap-2">
                {WEEK_DAYS.map((day) => {
                  const isSelected = selectedWeekDays.includes(day.key);
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => handleWeekDayToggle(day.key)}
                      className={`py-3 rounded-2xl text-sm font-bold transition-all ${isSelected ? "bg-primary text-white" : "bg-white text-on-surface-variant border border-surface-variant hover:border-primary"}`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block text-sm font-bold text-on-surface-variant">
                Ngày bắt đầu
                <input
                  type="date"
                  value={recurringStartDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-outline px-4 py-3 text-sm text-on-surface"
                />
              </label>
              <label className="block text-sm font-bold text-on-surface-variant">
                Ngày kết thúc
                <input
                  type="date"
                  min={recurringStartDate}
                  value={recurringEndDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-outline px-4 py-3 text-sm text-on-surface"
                />
              </label>
            </div>
          </section>
        )}

        <section className="bg-white rounded-[16px] p-5 soft-shadow border border-surface-container-high text-center">
          <label className="text-sm font-bold text-on-surface-variant mb-3 block text-left">
            Chọn thời gian bắt đầu
          </label>

          <div className="flex items-center justify-center gap-5 py-1 relative">
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => handleHourChange(1)}
                className="p-1 text-on-surface-variant/40 hover:text-primary transition-colors active:scale-95"
              >
                <ChevronUp size={20} />
              </button>

              <div className="px-3 py-1 bg-primary/5 rounded-xl border-y-2 border-primary/20">
                <span className="text-3xl font-extrabold text-primary">
                  {String(hour).padStart(2, "0")}
                </span>
              </div>

              <button
                onClick={() => handleHourChange(-1)}
                className="p-1 text-on-surface-variant/40 hover:text-primary transition-colors active:scale-95"
              >
                <ChevronDown size={20} />
              </button>
            </div>

            <span className="text-4xl font-extrabold text-on-surface-variant/40">
              :
            </span>

            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => handleMinuteChange(5)}
                className="p-1 text-on-surface-variant/40 hover:text-primary transition-colors active:scale-95"
              >
                <ChevronUp size={20} />
              </button>

              <div className="px-3 py-1 bg-primary/5 rounded-xl border-y-2 border-primary/20">
                <span className="text-3xl font-extrabold text-primary">
                  {String(minute).padStart(2, "0")}
                </span>
              </div>

              <button
                onClick={() => handleMinuteChange(-5)}
                className="p-1 text-on-surface-variant/40 hover:text-primary transition-colors active:scale-95"
              >
                <ChevronDown size={20} />
              </button>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-4 bg-[#8A4CFC]/5 border border-[#8A4CFC]/10 p-5 rounded-3xl shadow-sm">
          <div className="p-3 bg-white rounded-2xl shadow-sm text-secondary">
            <CalendarCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest leading-loose">
              Thời gian đã chọn
            </p>
            {localTripType === "one-time" ? (
              <p className="text-sm font-extrabold text-on-surface">
                {selectedDayItem.name},{" "}
                {String(selectedDayItem.date).padStart(2, "0")}/
                {String(selectedDayItem.month).padStart(2, "0")}/
                {selectedDayItem.year} lúc {String(hour).padStart(2, "0")}:
                {String(minute).padStart(2, "0")}
              </p>
            ) : (
              <div className="space-y-1 text-left">
                <p className="text-sm font-extrabold text-on-surface">
                  {selectedWeekDaysText} lúc {String(hour).padStart(2, "0")}:
                  {String(minute).padStart(2, "0")}
                </p>
                <p className="text-sm text-on-surface-variant">
                  Từ {recurringStartDate} đến {recurringEndDate}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-22 left-0 right-0 p-5 bg-white shadow-[0px_-4px_20px_0px_rgba(79,70,200,0.06)] z-30 max-w-[430px] mx-auto space-y-3">
        <button
          onClick={handleBookNow}
          className="w-full bg-secondary-container text-white text-secondary-foreground py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all"
        >
          Đặt ngay bây giờ
        </button>
        <button
          onClick={handleContinue}
          className="w-full bg-primary-container text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
        >
          Tiếp tục <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
