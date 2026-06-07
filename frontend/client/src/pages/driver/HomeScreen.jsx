import { useState, useEffect } from "react";
import { Bell, Search, MapPin, ChevronRight } from "lucide-react";
import {
  getDriverProfile,
  getDriverTrips,
} from "../../services/driver.service";
import { useNavigate } from "react-router-dom";
import DriverLiveMap from "../../components/DriverLiveMap";

export const HomeScreen = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [upcomingTrips, setUpcomingTrips] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, tripsRes] = await Promise.all([
          getDriverProfile(),
          getDriverTrips({ status: "scheduled" }),
        ]);

        if (profRes?.data) {
          setProfile(profRes.data);
        }

        if (tripsRes?.data.data) {
          // console.log("tripRes", tripsRes);
          setUpcomingTrips(tripsRes.data.data.trips.slice(0, 2));
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", error);
      }
    };
    fetchData();
  }, []);

  const displayData = profile;
  const isAvailable = displayData?.isAvailable ?? true;

  return (
    <div className="pb-24 pt-6 px-1 h-screen overflow-y-auto">
      <div className="px-6 flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="text-primary text-xl font-black italic">KidGo</span>
          {isAvailable ? (
            <div className="bg-primary-light text-primary text-[10px] flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              Đang nhận chuyến
            </div>
          ) : (
            <div className="bg-gray-100 text-gray-500 text-[10px] flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-200">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              Ngưng nhận chuyến
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            className="relative"
            onClick={() => navigate("/driver/notifications")}
          >
            <Bell size={22} className="text-gray-600" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
          </button>
          <button onClick={() => navigate("/driver/profile")}>
            <img
              src={displayData?.avatar}
              className="w-9 h-9 rounded-full object-cover border border-gray-100"
            />
          </button>
        </div>
      </div>

      <div className="px-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
          Xin chào, {displayData?.name || displayData?.fullName}
        </h2>
        <p className="text-gray-500 text-sm">
          Chúc bạn một ngày lái xe an toàn!
        </p>
      </div>

      <div className="relative h-[240px] bg-gray-50 mb-6 overflow-hidden rounded-3xl mx-2">
        <DriverLiveMap className="h-full w-full" />

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white rounded-2xl p-3 shadow-xl border border-gray-100 flex items-center gap-4 cursor-pointer">
            <div
              className={`p-3 rounded-full ${isAvailable ? "bg-primary-light" : "bg-gray-100"}`}
            >
              <Search
                className={isAvailable ? "text-primary" : "text-gray-400"}
                size={24}
              />
            </div>
            <div>
              <div className="font-bold text-sm text-gray-800">
                {isAvailable ? "Đang chờ chuyến..." : "Đang ngoại tuyến"}
              </div>
              <div className="text-[10px] text-gray-400">
                Bán kính tìm kiếm: 5km
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 text-center">
          <span className="text-[10px] text-gray-500 block mb-1">Chuyến</span>
          <div className="text-base font-bold text-primary">
            {displayData?.totalTrips || "Đang tải"}
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 text-center">
          <span className="text-[10px] text-gray-500 block mb-1">
            Quãng đường
          </span>
          <div className="text-base font-bold text-primary text-[#0d9488]">
            Đang tải
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 text-center">
          <span className="text-[10px] text-gray-500 block mb-1">Thu nhập</span>
          <div className="text-base font-bold text-primary text-[#0d9488]">
            Đang tải
          </div>
        </div>
      </div>

      <div className="px-6 mb-3 flex justify-between items-center">
        <h3 className="text-lg font-bold">Lịch sắp tới</h3>
        <button
          className="text-primary text-xs font-bold"
          onClick={() => navigate("/driver/schedule")}
        >
          Xem tất cả
        </button>
      </div>

      <div className="px-5 space-y-3">
        {upcomingTrips.length > 0 ? (
          upcomingTrips.map((trip) => {
            const time = new Date(trip.plannedStartTime || trip.createdAt);
            return (
              <div
                key={trip._id}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center px-3 py-2 bg-primary-light rounded-xl border-l-4 border-primary">
                    <div className="text-xs font-bold text-primary">
                      {time.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-[8px] text-gray-500">Hôm nay</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">
                        {trip.kid?.name || "Bé Gia Bảo"}
                      </span>
                    </div>
                    <div className="text-[9px] text-gray-400 flex items-center gap-1 mt-0.5 line-clamp-1 max-w-[150px]">
                      <MapPin size={10} className="flex-shrink-0" />{" "}
                      {trip.pickupLocation?.address || "123 Lê Lợi"}
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </div>
            );
          })
        ) : (
          <>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between opacity-60">
              <div className="flex items-center gap-4">
                <div className="text-center px-3 py-2 bg-primary-light rounded-xl border-l-4 border-primary">
                  <div className="text-xs font-bold text-primary">14:00</div>
                  <div className="text-[8px] text-gray-500">Hôm nay</div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">Bé Gia Bảo</span>
                    <span className="bg-orange-50 text-orange-600 text-[8px] px-2 py-0.5 rounded font-black border border-orange-100">
                      VIP
                    </span>
                  </div>
                  <div className="text-[9px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> 123 Lê Lợi, P. Bến Thàn...
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between opacity-60">
              <div className="flex items-center gap-4">
                <div className="text-center px-3 py-2 bg-gray-50 rounded-xl border-l-4 border-gray-200">
                  <div className="text-xs font-bold text-gray-600">16:30</div>
                  <div className="text-[8px] text-gray-500">Hôm nay</div>
                </div>
                <div>
                  <span className="font-bold text-sm">Bé Minh Anh</span>
                  <div className="text-[9px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> 456 Nguyễn Huệ, Quận 1
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
