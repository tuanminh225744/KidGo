import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock3,
  Info,
  Loader2,
  MapPin,
  Route as RouteIcon,
  Car,
} from "lucide-react";
import { getKidById } from "../../../services/kid.service.js";
import { createRoute } from "../../../services/route.service.js";
import {
  createBooking,
  createTripSchedule,
} from "../../../services/booking.service.js";
import { createSubscription } from "../../../services/subscription.service.js";
import { useBookingStore } from "../../../store/useBookingStore.js";
import { countRecurringTrips } from "../../../utils/bookingPricing.js";

const WEEK_DAYS = [
  { key: "mon", label: "T2", full: "Thứ 2" },
  { key: "tue", label: "T3", full: "Thứ 3" },
  { key: "wed", label: "T4", full: "Thứ 4" },
  { key: "thu", label: "T5", full: "Thứ 5" },
  { key: "fri", label: "T6", full: "Thứ 6" },
  { key: "sat", label: "T7", full: "Thứ 7" },
  { key: "sun", label: "CN", full: "Chủ nhật" },
];

const DAY_MAP = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

const formatDate = (value) => {
  if (!value) return "Chưa chọn";
  const date = new Date(value);
  return date.toLocaleDateString("vi-VN", {
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatTime = (value) => {
  if (!value) return "Chưa chọn";
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateInput = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export default function ConfirmBooking() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [kid, setKid] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    kidId,
    tripType,
    startPoint,
    endPoint,
    pickupText,
    dropoffText,
    routeInfo,
    bookingPlan,
    bookingDateTime,
    recurringDays,
    recurringStartDate,
    recurringEndDate,
    selectedDriverId,
    resetBooking,
    setBookingData,
  } = useBookingStore();

  useEffect(() => {
    if (kidId) {
      getKidById(kidId).then((res) => {
        if (res.success) setKid(res.data);
      });
    }
  }, [kidId]);

  const recurringDayLabels = useMemo(() => {
    return (recurringDays || [])
      .map((day) => WEEK_DAYS.find((item) => item.key === day)?.full)
      .filter(Boolean);
  }, [recurringDays]);

  const recurringTripCount = useMemo(
    () =>
      countRecurringTrips(
        recurringStartDate,
        recurringEndDate,
        recurringDays,
        DAY_MAP,
      ),
    [recurringStartDate, recurringEndDate, recurringDays],
  );


  const scheduledTimeLabel = bookingDateTime
    ? formatTime(bookingDateTime)
    : "Chưa chọn";

  const scheduledDateTimeLabel = bookingDateTime
    ? new Date(bookingDateTime).toLocaleString("vi-VN", {
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "Chưa chọn thời gian";

  const formatDuration = (minutes) => {
    if (!minutes || minutes <= 0) return "0 phút";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0 && mins > 0) {
      return `${hours} giờ ${mins} phút`;
    }

    if (hours > 0) {
      return `${hours} giờ`;
    }

    return `${mins} phút`;
  };

  const isWithinTwentyMinutes = (scheduledValue) => {
    if (!scheduledValue) return false;

    const scheduledTime = new Date(scheduledValue).getTime();
    const now = Date.now();
    const diffMinutes = Math.abs((scheduledTime - now) / (1000 * 60));

    return diffMinutes <= 20;
  };

  const handleConfirm = async () => {
    if (!startPoint || !endPoint || !kidId) {
      alert("Thiếu thông tin đặt xe. Vui lòng thử lại.");
      return;
    }

    setIsSubmitting(true);
    try {
      const routePayload = {
        estimatedPickupAddress: pickupText || "Điểm đón",
        estimatedPickupCoords: {
          type: "Point",
          coordinates: [startPoint.lng, startPoint.lat],
        },
        estimatedDropoffAddress: dropoffText || "Điểm trả",
        estimatedDropoffCoords: {
          type: "Point",
          coordinates: [endPoint.lng, endPoint.lat],
        },
        estimatedDistance: parseFloat(routeInfo?.distance) || 0,
        estimatedDuration: parseInt(routeInfo?.duration) || 0,
        ...(bookingDateTime ? { scheduledPickupTime: bookingDateTime } : {}),
      };

      const routeRes = await createRoute(routePayload);

      if (!routeRes.success)
        throw new Error(routeRes.message || "Lỗi tạo lộ trình");
      const routeId = routeRes.data._id;
      
      // Lưu routeId vào store
      setBookingData({ routeId });

      const d = new Date(bookingDateTime);
      const pickupTime = `${String(d.getHours()).padStart(2, "0")}:${String(
        d.getMinutes(),
      ).padStart(2, "0")}`;

      let subscriptionId = undefined;
      if (bookingPlan === "monthly" || bookingPlan === "yearly") {
        const subRes = await createSubscription({
          plan: bookingPlan,
          startDate: recurringStartDate,
          endDate: recurringEndDate
        });
        if (!subRes.data.success) {
          // Xử lý Axios response wrapper
          if (subRes.data && subRes.data._id) {
            subscriptionId = subRes.data._id;
          } else if (subRes.data && subRes.data.data && subRes.data.data._id) {
            subscriptionId = subRes.data.data._id;
          }
        }
      }

      const schedulePayload =
        tripType === "one-time"
          ? {
            kidId,
            routeId,
            repeatDays: [],
            pickupTime,
            startDate: formatDateInput(bookingDateTime),
            endDate: formatDateInput(bookingDateTime),
            preferredDriverId: selectedDriverId || undefined,
            subscriptionId
          }
          : {
            kidId,
            routeId,
            repeatDays: (recurringDays || [])
              .map((day) => DAY_MAP[day])
              .filter((day) => day !== undefined),
            pickupTime,
            startDate: recurringStartDate,
            endDate: recurringEndDate,
            preferredDriverId: selectedDriverId || undefined,
            subscriptionId
          };

      const schedRes = await createTripSchedule(schedulePayload);
      if (!schedRes.success)
        throw new Error(schedRes.message || "Lỗi tạo lịch trình");

      const isImmediate = tripType === "one-time" && isWithinTwentyMinutes(bookingDateTime);

      // Navigate sang trang thanh toán thay vì tạo booking ở đây
      navigate("/client/booking/payment", {
        state: {
          tripScheduleId: schedRes.data._id,
          isImmediate,
          kidName: kid?.fullName
        }
      });

    } catch (error) {
      alert("Lỗi: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-surface">
      <header className="sticky top-0 z-20 flex items-center justify-between bg-white px-5 py-4">
        <button
          onClick={() => navigate("/client/booking/driver")}
          className="rounded-full p-2 transition-transform active:scale-90 hover:bg-surface-container-low"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">Xác nhận đặt xe</h1>
          <p className="text-[10px] font-bold text-on-surface-variant">
            Bước cuối cùng
          </p>
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-1 space-y-6 overflow-y-auto px-5 pb-40 pt-6">
        <section className="rounded-[32px] border border-outline-variant/10 bg-white p-6 soft-shadow">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary-fixed shadow-inner">
                <img
                  src={
                    kid?.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${kid?.fullName || "Kid"}`
                  }
                  alt={kid?.fullName || "Bé"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface">
                  {kid?.fullName || "Đang tải..."}
                </h3>
                <p className="text-xs font-semibold text-on-surface-variant">
                  {tripType === "one-time"
                    ? "Chuyến một lần"
                    : "Chuyến định kỳ"}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-orange-50 px-4 py-1 text-xs font-bold text-orange-600 ring-1 ring-orange-100">
              {tripType === "one-time" ? "Một lần" : "Định kỳ"}
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl bg-surface-container-low p-4">
              <div className="mb-2 flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Điểm đi
                </span>
              </div>
              <p className="text-sm font-bold text-on-surface">
                {pickupText || "Chưa chọn điểm đi"}
              </p>
            </div>

            <div className="rounded-3xl bg-surface-container-low p-4">
              <div className="mb-2 flex items-center gap-2">
                <MapPin size={18} className="text-error" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Điểm đến
                </span>
              </div>
              <p className="text-sm font-bold text-on-surface">
                {dropoffText || "Chưa chọn điểm đến"}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="flex items-start gap-4 rounded-3xl bg-primary/5 p-4">
              <div className="rounded-2xl bg-white p-2 text-primary">
                <RouteIcon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Quãng đường dự kiến
                </p>
                <p className="text-sm font-bold text-on-surface">
                  {routeInfo?.distance || 0} km · ~
                  {formatDuration(routeInfo?.duration || 0)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-3xl bg-primary/5 p-4">
              <div className="rounded-2xl bg-white p-2 text-primary">
                <Clock3 size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Thời gian đón
                </p>
                <p className="text-sm font-bold text-on-surface">
                  {tripType === "one-time"
                    ? scheduledDateTimeLabel
                    : scheduledTimeLabel}
                </p>
              </div>
            </div>
          </div>

          {tripType !== "one-time" && (
            <div className="mt-5 rounded-[28px] border border-dashed border-primary/25 bg-surface-container-low p-4">
              <div className="mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                <p className="text-sm font-extrabold text-on-surface">
                  Thông tin định kỳ
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Ngày bắt đầu
                  </p>
                  <p className="mt-1 text-sm font-bold text-on-surface">
                    {formatDate(recurringStartDate)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Ngày kết thúc
                  </p>
                  <p className="mt-1 text-sm font-bold text-on-surface">
                    {formatDate(recurringEndDate)}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-2xl bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Các thứ đã đăng ký
                </p>
                <p className="mt-1 text-sm font-bold text-on-surface">
                  {recurringDayLabels.length > 0
                    ? recurringDayLabels.join(", ")
                    : "Chưa chọn ngày trong tuần"}
                </p>
              </div>

              <div className="mt-3 rounded-2xl bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Số chuyến dự kiến
                </p>
                <p className="mt-1 text-2xl font-extrabold text-primary">
                  {recurringTripCount} chuyến
                </p>
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between rounded-3xl bg-surface-container-low p-4">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-primary/5 p-2 text-primary">
                <Car size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">
                  {selectedDriverId ? "Tài xế đã chọn" : "Hệ thống tự ghép"}
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-green-50 p-1.5 text-green-600">
              <Check size={18} strokeWidth={3} />
            </div>
          </div>
        </section>

        {/* <div className="flex items-center justify-center gap-2 py-1 opacity-80">
          <Info size={16} className="shrink-0 text-on-surface-variant" />
          <p className="text-xs font-bold text-on-surface-variant">
            Tài xế sẽ liên hệ trước 15 phút
          </p>
        </div> */}

        {/* <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-outline-variant bg-surface-container-low p-6">
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
              Tổng dự kiến
            </span>
            <span className="text-3xl font-extrabold text-primary">
              {pricing.totalPrice.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <div className="pointer-events-none absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-primary/5" />
        </div> */}

      </main>

      <footer className="fixed bottom-20 left-0 right-0 z-30 mx-auto max-w-[430px] bg-white/80 p-5 backdrop-blur-md">
        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="flex h-16 w-full items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-primary-container to-[#6366F1] text-xl font-bold text-white shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] disabled:scale-100 disabled:opacity-70"
        >
          {isSubmitting ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            "Xác nhận đặt xe"
          )}
        </button>
        {/* <button
          onClick={() => navigate("/client/booking/driver")}
          className="mt-4 flex w-full items-center justify-center gap-2 text-sm font-bold text-primary"
        >
          <ArrowLeft size={16} /> Chỉnh sửa
        </button> */}
      </footer>


    </div>
  );
}
