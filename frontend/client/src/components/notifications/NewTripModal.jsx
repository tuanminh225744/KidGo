import { motion } from "motion/react";
import { Calendar, GraduationCap } from "lucide-react";
import { acceptBooking, rejectBooking, getBookingRequestDetail } from "../../services/driver.service";
import { useState, useEffect } from "react";
import { useTripStore } from "../../store/useTripStore";
import { useBookingStoreDriver } from "../../store/useBookingStoreDriver";
import { useRouteStore } from "../../store/useRouteStore";
import { useNavigate } from "react-router-dom";

export const NewTripModal = ({ tripRequest, onAccept, onSkip }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const data = tripRequest || {};
  const bookingId = data._id || data.bookingId;
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    if (bookingId) {
      getBookingRequestDetail(bookingId)
        .then((res) => {
          if (res.success && res.data) {
            setBookingData(res.data);
          }
        })
        .catch((err) => console.error("Lỗi khi tải thông tin chuyến đi:", err));
    }
  }, [bookingId]);

  const mergedData = bookingData || data;

  const title =
    mergedData.name || mergedData.kidName || mergedData.kidId?.fullName || "Khách mới";
  const subtitle = mergedData.message || "Bạn có một chuyến mới đang chờ phản hồi.";
  const pickupText =
    mergedData.pickupLocation?.address ||
    mergedData.routeId?.estimatedPickupAddress ||
    mergedData.routeId?.actualPickupAddress ||
    "Điểm đón sẽ được cập nhật";
  const dropoffText =
    mergedData.dropoffLocation?.address ||
    mergedData.routeId?.estimatedDropoffAddress ||
    mergedData.routeId?.actualDropoffAddress ||
    "Điểm đến sẽ được cập nhật";

  const [timeLeft, setTimeLeft] = useState(13);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSkip();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAccept = async () => {
    if (!bookingId) {
      onAccept();
      return;
    }

    try {
      setLoading(true);
      const response = await acceptBooking(bookingId);
      if (response.success) {
        console.log("Booking accepted:", response);
        useTripStore.getState().setTrip(response.data.trip);
        useBookingStoreDriver.getState().setBooking(response.data.booking);
        useRouteStore.getState().setRoute(response.data.route);
        navigate("/driver/in-trip");
      }
      onAccept();
    } catch (error) {
      console.error("Lỗi khi nhận chuyến:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    onSkip(); // Ẩn modal ngay lập tức
    if (bookingId) {
      rejectBooking(bookingId).catch((error) => {
        console.error("Lỗi khi từ chối chuyến:", error);
      });
    }
  };

  return (
    <div className="absolute inset-0 z-[9999] flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={loading ? undefined : handleSkip}
      ></div>
      <motion.div
        initial={{ y: 500 }}
        animate={{ y: 0 }}
        className="bg-white rounded-t-[40px] px-6 pt-10 pb-12 relative z-10"
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full absolute top-4 left-1/2 -translate-x-1/2"></div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black italic text-gray-900 leading-none">
            Chuyến mới!
          </h2>
          <div className="w-10 h-10 rounded-full border-2 border-primary-light flex items-center justify-center text-primary font-bold">
            {timeLeft}
          </div>
        </div>

        <div className="bg-[#f0f4f8] rounded-[32px] p-5 mb-6 border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center overflow-hidden text-primary text-xs font-black">
                {mergedData.avatar || mergedData.kidId?.avatar ? (
                  <img
                    src={mergedData.avatar || mergedData.kidId?.avatar}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "NEW"
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">{title}</h3>
                <div className="text-xs text-gray-500">{subtitle}</div>
              </div>
            </div>
            {/* <div className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1.5 rounded-full border border-green-200">
              Gia đình quen
            </div> */}
          </div>

          <div className="space-y-4 relative mb-6">
            <div className="absolute left-[11px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-gray-300"></div>

            <div className="flex gap-4">
              <div className="w-6 h-6 bg-green-500 rounded-full border-4 border-green-100 flex-shrink-0 z-10"></div>
              <div className="flex-1 -mt-1">
                <div className="text-xs text-gray-500 leading-none mb-1">
                  {pickupText}
                </div>
                <div className="font-bold text-sm">
                  {mergedData.distFromDriver
                    ? `Cách bạn ${mergedData.distFromDriver}`
                    : "Có khách mới đang tìm tài xế"}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-6 h-6 bg-[#854d0e] rounded-full border-4 border-orange-100 flex items-center justify-center flex-shrink-0 z-10 text-white">
                <GraduationCap size={10} />
              </div>
              <div className="flex-1 -mt-1">
                <div className="font-bold text-sm leading-tight line-clamp-2">
                  {dropoffText}
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200 my-4"></div>

          <div className="flex items-center gap-2 text-gray-600 text-xs font-semibold mb-4">
            <Calendar size={14} className="text-gray-400" />
            <span>
              {mergedData.scheduledTime || mergedData.plannedStartTime
                ? new Date(mergedData.scheduledTime || mergedData.plannedStartTime).toLocaleString()
                : "Chờ tài xế phản hồi"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <div className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1.5 rounded-lg border border-blue-100">
                ~{mergedData.estTime || mergedData.routeId?.estimatedDuration || "N/A"}
              </div>
              <div className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-1.5 rounded-lg border border-gray-200">
                {mergedData.routeId?.estimatedDistance || mergedData.routeId?.actualDistance
                  ? `${mergedData.routeId?.estimatedDistance || mergedData.routeId?.actualDistance}km`
                  : "N/A"}
              </div>
            </div>
            <div className="text-2xl font-black text-primary leading-none">
              {mergedData.fare ? `${mergedData.fare.toLocaleString()}đ` : "Mới"}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            disabled={loading}
            onClick={handleAccept}
            className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70"
          >
            {loading ? "Đang xử lý..." : "Nhận chuyến"}
          </button>
          <button
            disabled={loading}
            onClick={handleSkip}
            className="w-full border-2 border-gray-100 text-gray-400 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-colors disabled:opacity-70"
          >
            Từ chối
          </button>
        </div>
      </motion.div>
    </div>
  );
};
