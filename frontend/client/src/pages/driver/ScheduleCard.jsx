import { MapPin, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ScheduleCard = ({ trips = [] }) => {
  const navigate = useNavigate();

  // Lọc chỉ hiện các chuyến đi từ giờ đến cuối ngày
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  const upcomingTrips = trips.filter((trip) => {
    if (!trip.pickupTime) return false;
    const [h, m] = trip.pickupTime.split(":").map(Number);
    const tripTotalMinutes = h * 60 + m;
    return tripTotalMinutes >= currentTotalMinutes;
  });

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Lịch trình sắp tới hôm nay</h3>
        <button
          className="text-primary text-xs font-bold"
          onClick={() => navigate("/driver/schedule")}
        >
          Xem tất cả
        </button>
      </div>

      <div className="space-y-3">
        {upcomingTrips.length > 0 ? (
          upcomingTrips.map((trip) => {
            return (
              <div
                key={trip._id}
                onClick={() => navigate("/driver/schedule")}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center px-3 py-2 bg-primary-light rounded-xl border-l-4 border-primary">
                    <div className="text-xs font-bold text-primary">
                      {trip.pickupTime || "--:--"}
                    </div>
                    <div className="text-[8px] text-gray-500">Hôm nay</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">
                        {trip.kidId?.fullName || "Bé Gia Bảo"}
                      </span>
                    </div>
                    <div className="text-[9px] text-gray-400 flex items-center gap-1 mt-0.5 line-clamp-1 max-w-[150px]">
                      <MapPin size={10} className="flex-shrink-0" />{" "}
                      {trip.routeId?.actualPickupAddress ||
                        trip.routeId?.estimatedPickupAddress ||
                        "Đang lấy địa chỉ..."}
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </div>
            );
          })
        ) : (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center opacity-80">
            <p className="text-gray-500 text-sm">Không còn chuyến nào trong hôm nay</p>
          </div>
        )}
      </div>
    </section>
  );
};
