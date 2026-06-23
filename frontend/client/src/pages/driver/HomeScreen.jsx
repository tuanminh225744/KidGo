import { useState, useEffect } from "react";
import { Bell, Search, MapPin, ChevronRight } from "lucide-react";
import {
  getDriverProfile,
  getDriverTrips,
  getDriverEarningsStats,
  getDriverTripsStats,
} from "../../services/driver.service";
import { useNavigate } from "react-router-dom";
import DriverLiveMap from "../../components/DriverLiveMap";
import { useAuthStore } from "../../store/useAuthStore";

export const HomeScreen = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stats, setStats] = useState({ totalTrips: null, actualEarnings: null });
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, tripsRes] = await Promise.all([
          getDriverProfile(),
          getDriverTrips({ status: "scheduled" }),
        ]);

        let driverId = null;
        if (profRes?.data) {
          setProfile(profRes.data);
          driverId = profRes.data._id;
        }

        if (tripsRes?.data?.data) {
          setUpcomingTrips(tripsRes.data.data.trips.slice(0, 2));
        }

        if (driverId) {
          const [earningsRes, tripsStatsRes] = await Promise.all([
            getDriverEarningsStats(driverId),
            getDriverTripsStats(driverId)
          ]);
          setStats({
            totalTrips: tripsStatsRes?.data?.totalTrips || 0,
            actualEarnings: earningsRes?.data?.actualEarnings || 0,
          });
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
    <div className="flex-1 flex flex-col pb-24 h-screen overflow-y-auto bg-gray-50/30">
      {/* Header */}
      <header className="z-500 px-5 py-4 flex items-center justify-between bg-white sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 active:scale-95 transition-transform"
          >
            <div className="w-20 h-11 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20">
              <span className="text-lg font-black tracking-tight">KidGo</span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* <button
            className="relative"
            onClick={() => navigate("/driver/notifications")}
          >
            <Bell size={24} className="text-gray-600" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
          </button> */}

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
                  {user?.fullName || user?.name || "Tài xế"}
                </h2>
              </div>
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-fixed bg-surface-container">
                  <img
                    src={
                      user?.avatar ||
                      "/images/anh-avatar-trang.jpg"
                    }
                    alt={user?.fullName || "Driver profile"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </button>

            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate("/driver/profile");
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Thông tin cá nhân
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate("/driver/notifications");
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Thông báo
                </button>
                <div className="h-px bg-gray-100 w-full" />
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                    navigate("/driver/login");
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="px-5 pt-6 space-y-6">
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            Sẵn sàng làm việc!
          </h2>
          <p className="text-gray-500 text-sm">
            Chúc bạn một ngày lái xe an toàn!
          </p>
        </div>

        <div className="relative h-[240px] bg-gray-50 overflow-hidden rounded-3xl mx-2 shadow-sm border border-gray-100">
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

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 text-center">
            <span className="text-[10px] text-gray-500 block mb-1">Tổng Chuyến</span>
            <div className="text-base font-bold text-primary">
              {stats.totalTrips !== null ? stats.totalTrips : "Đang tải"}
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 text-center">
            <span className="text-[10px] text-gray-500 block mb-1">Thu nhập</span>
            <div className="text-base font-bold text-[#0d9488]">
              {stats.actualEarnings !== null ? `${stats.actualEarnings.toLocaleString()}đ` : "Đang tải"}
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Lịch sắp tới</h3>
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
                            {trip.kid?.name || trip.kidId?.fullName || "Bé Gia Bảo"}
                          </span>
                        </div>
                        <div className="text-[9px] text-gray-400 flex items-center gap-1 mt-0.5 line-clamp-1 max-w-[150px]">
                          <MapPin size={10} className="flex-shrink-0" />{" "}
                          {trip.pickupLocation?.address || trip.routeId?.actualPickupAddress || trip.routeId?.estimatedPickupAddress || "Đang lấy địa chỉ..."}
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
        </section>
      </main>
    </div>
  );
};
