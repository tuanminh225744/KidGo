import { motion } from "motion/react";
import { Calendar, GraduationCap } from "lucide-react";
import { acceptBooking, rejectBooking } from "../../services/driver.service";
import { useState } from "react";

export const NewTripModal = ({ tripRequest, onAccept, onSkip }) => {
  const [loading, setLoading] = useState(false);
  const data = tripRequest || {};
  const bookingId = data._id || data.bookingId;
  const title = data.name || data.kidName || data.kidId?.fullName || "Khách mới";
  const subtitle = data.message || "Bạn có một chuyến mới đang chờ phản hồi.";
  const pickupAddress =
    data.pickupLocation?.address ||
    data.routeId?.pickupAddress ||
    data.pickupAddress ||
    "Điểm đón sẽ được cập nhật";
  const dropoffAddress =
    data.dropoffLocation?.address ||
    data.routeId?.dropoffAddress ||
    data.destination ||
    "Điểm đến sẽ được cập nhật";

  console.log("[DRIVER_BOOKING_DEBUG][modal] render", {
    tripRequest,
    bookingId,
    title,
    subtitle,
    pickupAddress,
    dropoffAddress,
  });

  const handleAccept = async () => {
    console.log("[DRIVER_BOOKING_DEBUG][modal] click_accept", {
      bookingId,
      tripRequest,
    });

    if (!bookingId) {
      console.log("[DRIVER_BOOKING_DEBUG][modal] accept_no_booking_id_close_only");
      onAccept();
      return;
    }

    try {
      setLoading(true);
      console.log("[DRIVER_BOOKING_DEBUG][modal] call_accept_api", {
        bookingId,
      });
      const response = await acceptBooking(bookingId);
      console.log("[DRIVER_BOOKING_DEBUG][modal] accept_api_success", {
        status: response?.status,
        data: response?.data,
      });
      onAccept();
    } catch (error) {
      console.log("[DRIVER_BOOKING_DEBUG][modal] accept_api_error", {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      console.error("Lỗi khi nhận chuyến:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    console.log("[DRIVER_BOOKING_DEBUG][modal] click_reject", {
      bookingId,
      tripRequest,
    });

    if (!bookingId) {
      console.log("[DRIVER_BOOKING_DEBUG][modal] reject_no_booking_id_close_only");
      onSkip();
      return;
    }

    try {
      setLoading(true);
      console.log("[DRIVER_BOOKING_DEBUG][modal] call_reject_api", {
        bookingId,
      });
      const response = await rejectBooking(bookingId);
      console.log("[DRIVER_BOOKING_DEBUG][modal] reject_api_success", {
        status: response?.status,
        data: response?.data,
      });
      onSkip();
    } catch (error) {
      console.log("[DRIVER_BOOKING_DEBUG][modal] reject_api_error", {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      console.error("Lỗi khi từ chối chuyến:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
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
            13
          </div>
        </div>

        <div className="bg-[#f0f4f8] rounded-[32px] p-5 mb-6 border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center overflow-hidden text-primary text-xs font-black">
                {data.avatar || data.kidId?.avatar ? (
                  <img
                    src={data.avatar || data.kidId?.avatar}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "NEW"
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">
                  {title}
                </h3>
                <div className="text-xs text-gray-500">{subtitle}</div>
              </div>
            </div>
            <div className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1.5 rounded-full border border-green-200">
              Gia đình quen
            </div>
          </div>

          <div className="space-y-4 relative mb-6">
            <div className="absolute left-[11px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-gray-300"></div>

            <div className="flex gap-4">
              <div className="w-6 h-6 bg-green-500 rounded-full border-4 border-green-100 flex-shrink-0 z-10"></div>
              <div className="flex-1 -mt-1">
                <div className="text-xs text-gray-500 leading-none mb-1">
                  {pickupAddress}
                </div>
                <div className="font-bold text-sm">
                  {data.distFromDriver
                    ? `Cách bạn ${data.distFromDriver}`
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
                  {dropoffAddress}
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200 my-4"></div>

          <div className="flex items-center gap-2 text-gray-600 text-xs font-semibold mb-4">
            <Calendar size={14} className="text-gray-400" />
            <span>
              {data.plannedStartTime
                ? new Date(data.plannedStartTime).toLocaleString()
                : "Chờ tài xế phản hồi"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <div className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1.5 rounded-lg border border-blue-100">
                ~{data.estTime || "N/A"}
              </div>
              <div className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-1.5 rounded-lg border border-gray-200">
                {data.distance ? `${data.distance}km` : "N/A"}
              </div>
            </div>
            <div className="text-2xl font-black text-primary leading-none">
              {data.fare ? `${data.fare.toLocaleString()}đ` : "Mới"}
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
