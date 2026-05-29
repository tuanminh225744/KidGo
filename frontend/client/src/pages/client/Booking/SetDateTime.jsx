import {
  X,
  ArrowRight,
  ArrowLeft,
  CalendarCheck,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useBookingStore } from "../../../store/useBookingStore.js";
import {
  calculateTripPricing,
  countRecurringTrips,
  planLabels,
} from "../../../utils/bookingPricing.js";

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

const parseDateValue = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDisplayDate = (value) => {
  const date = parseDateValue(value);
  if (!date) return "";
  return date.toLocaleDateString("vi-VN");
};

export default function SetDateTime() {
  const navigate = useNavigate();
  const {
    kidId,
    tripType,
    startPoint,
    endPoint,
    pickupText,
    dropoffText,
    routeInfo,
    setBookingData,
  } = useBookingStore();

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

  const getPackageEndDate = (startDate, plan) => {
    if (!startDate || plan === "one-time") return recurringEndDate;

    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) return recurringEndDate;

    const end = new Date(start);
    if (plan === "monthly") {
      end.setMonth(end.getMonth() + 1);
    } else if (plan === "yearly") {
      end.setFullYear(end.getFullYear() + 1);
    }

    return formatDateInput(end);
  };

  const setPlanType = (plan) => {
    setLocalTripType(plan);
    if (plan === "monthly") {
      const start = recurringStartDate || formatDateInput(new Date());
      setRecurringEndDate(getPackageEndDate(start, "monthly"));
    }
    if (plan === "yearly") {
      const start = recurringStartDate || formatDateInput(new Date());
      setRecurringEndDate(getPackageEndDate(start, "yearly"));
    }
  };

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
    if (localTripType === "monthly") {
      setRecurringEndDate(getPackageEndDate(value, "monthly"));
      return;
    }
    if (localTripType === "yearly") {
      setRecurringEndDate(getPackageEndDate(value, "yearly"));
      return;
    }

    if (new Date(value) > new Date(recurringEndDate)) {
      setRecurringEndDate(value);
    }
  };

  const handleEndDateChange = (value) => {
    if (localTripType === "one-time") {
      setRecurringEndDate(value);
    }
  };

  const isContinueDisabled =
    localTripType !== "one-time" &&
    (selectedWeekDays.length === 0 || !recurringStartDate);

  const packageTripCount = useMemo(
    () =>
      localTripType === "one-time"
        ? 1
        : countRecurringTrips(
            recurringStartDate,
            recurringEndDate,
            selectedWeekDays,
            { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0 },
          ),
    [localTripType, recurringStartDate, recurringEndDate, selectedWeekDays],
  );

  const pricing = useMemo(
    () =>
      calculateTripPricing({
        tripType: localTripType,
        routeInfo,
        recurringTripCount: packageTripCount,
      }),
    [localTripType, routeInfo, packageTripCount],
  );

  const handleContinue = () => {
    const baseDate =
      localTripType === "one-time"
        ? selectedDate
        : new Date(recurringStartDate);
    const finalDateTime = new Date(baseDate);
    finalDateTime.setHours(hour, minute, 0, 0);

    const nextRecurringEndDate =
      localTripType === "monthly"
        ? new Date(
            new Date(recurringStartDate).setMonth(
              new Date(recurringStartDate).getMonth() + 1,
            ),
          )
            .toISOString()
            .slice(0, 10)
        : localTripType === "yearly"
          ? new Date(
              new Date(recurringStartDate).setFullYear(
                new Date(recurringStartDate).getFullYear() + 1,
              ),
            )
              .toISOString()
              .slice(0, 10)
          : recurringEndDate;

    setBookingData({
      kidId,
      tripType: localTripType,
      bookingPlan: localTripType,
      startPoint,
      endPoint,
      pickupText,
      dropoffText,
      routeInfo,
      bookingDateTime: finalDateTime.toISOString(),
      recurringDays: localTripType === "one-time" ? [] : selectedWeekDays,
      recurringStartDate:
        localTripType === "one-time" ? null : recurringStartDate,
      recurringEndDate:
        localTripType === "one-time" ? null : nextRecurringEndDate,
    });
    navigate("/client/booking/driver");
  };

  const handleBookNow = () => {
    const now = new Date();
    setBookingData({
      kidId,
      tripType: "one-time",
      bookingPlan: "one-time",
      startPoint,
      endPoint,
      pickupText,
      dropoffText,
      routeInfo,
      bookingDateTime: now.toISOString(),
      recurringDays: [],
      recurringStartDate: null,
      recurringEndDate: null,
    });
    navigate("/client/booking/driver");
  };

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-screen">
      <header className="px-5 py-4 flex justify-between items-center sticky top-0 bg-white z-20">
        <button
          onClick={() => navigate("/client/booking/location")}
          className="flex items-center gap-1 text-on-surface-variant p-2 rounded-xl hover:bg-surface-container-low transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-bold">Quay lại</span>
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">Đặt xe</h1>
        </div>
        <span className="text-sm font-bold text-primary mx-8">3/4</span>
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
            onClick={() => setPlanType("one-time")}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${localTripType === "one-time" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container-low"}`}
          >
            Một lần
          </button>
          <button
            onClick={() => setPlanType("monthly")}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${localTripType === "monthly" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container-low"}`}
          >
            Theo tháng
          </button>
          <button
            onClick={() => setPlanType("yearly")}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${localTripType === "yearly" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container-low"}`}
          >
            Theo năm
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
                <DatePicker
                  selected={parseDateValue(recurringStartDate)}
                  onChange={(date) =>
                    handleStartDateChange(formatDateInput(date))
                  }
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Chọn ngày bắt đầu"
                  wrapperClassName="w-full"
                  className="mt-2 w-full rounded-3xl border border-outline px-4 py-3 text-sm text-on-surface"
                />
              </label>
              <label className="block text-sm font-bold text-on-surface-variant">
                Ngày kết thúc
                <DatePicker
                  selected={parseDateValue(recurringEndDate)}
                  onChange={(date) =>
                    handleEndDateChange(formatDateInput(date))
                  }
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Ngày kết thúc"
                  disabled={localTripType !== "one-time"}
                  readOnly={localTripType !== "one-time"}
                  wrapperClassName="w-full"
                  className={`mt-2 w-full rounded-3xl border px-4 py-3 text-sm text-on-surface ${localTripType !== "one-time" ? "bg-surface-container-low text-on-surface-variant cursor-not-allowed" : "border-outline"}`}
                />
                {localTripType !== "one-time" && (
                  <p className="mt-2 text-xs font-medium text-on-surface-variant">
                    Ngày kết thúc được tự động tính theo ngày bắt đầu.
                  </p>
                )}
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
                  Từ {formatDisplayDate(recurringStartDate)} đến{" "}
                  {formatDisplayDate(recurringEndDate)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* <section className="rounded-[24px] border border-outline-variant/10 bg-white p-5 soft-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Giá dự kiến
              </p>
              <p className="text-lg font-extrabold text-on-surface">
                {planLabels[localTripType]}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-on-surface-variant">
                1 chuyến
              </p>
              <p className="text-xl font-extrabold text-primary">
                {pricing.baseTripPrice.toLocaleString("vi-VN")}đ
              </p>
            </div>
          </div>
          {localTripType !== "one-time" && (
            <div className="mt-4 grid gap-3 rounded-2xl bg-surface-container-low p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Số chuyến</span>
                <span className="font-bold text-on-surface">
                  {pricing.trips} chuyến
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Giảm giá</span>
                <span className="font-bold text-green-600">
                  {(pricing.discountRate * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Tổng sau giảm</span>
                <span className="font-extrabold text-primary">
                  {pricing.totalPrice.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          )}
        </section> */}
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
          disabled={isContinueDisabled}
          className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all
          ${isContinueDisabled ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-primary-container text-white shadow-xl shadow-primary/20 active:scale-[0.98]"}`}
        >
          Tiếp tục <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
