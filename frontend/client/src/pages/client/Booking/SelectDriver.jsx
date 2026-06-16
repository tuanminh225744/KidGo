import {
  X,
  Check,
  Star,
  Shield,
  ArrowRight,
  ArrowLeft,
  Bot,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPreferredDrivers } from "../../../services/preferredDriver.service.js";
import { useBookingStore } from "../../../store/useBookingStore.js";

export default function SelectDriver() {
  const navigate = useNavigate();
  const { setBookingData } = useBookingStore();

  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await getPreferredDrivers();
        if (response.success && response.data) {
          const mappedDrivers = response.data.map((item) => ({
            id: item.driverId._id,
            name: item.nickname || item.driverId.user?.fullName || "Tài xế",
            rating: item.driverId.rating || 4.8,
            level: item.driverId.level || 1,
            avatar: item.driverId.user?.avatar,
            emoji: "🧑",
          }));
          setDrivers(mappedDrivers);
        }
      } catch (error) {
        console.error("Failed to fetch preferred drivers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-screen">
      <header className="px-5 py-4 flex justify-between items-center sticky top-0 bg-white z-20">
        <button
          onClick={() => navigate("/client/booking/datetime")}
          className="flex items-center gap-1 text-on-surface-variant p-2 rounded-xl hover:bg-surface-container-low transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-bold">Quay lại</span>
        </button>
        <h1 className="text-2xl font-bold text-primary">Đặt xe</h1>
        <span className="text-sm font-bold text-on-surface-variant mx-8">
          4/4
        </span>
      </header>

      {/* Progress Bar */}
      <div className="px-5 mt-2">
        <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div className="bg-primary-container h-full w-full rounded-full transition-all duration-500" />
        </div>
      </div>

      <main className="px-5 pt-8 pb-60 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">
            Chọn tài xế
          </h2>
        </div>

        {/* Auto Match Card */}
        <section className="mb-10">
          <div className="bg-surface-container-low border-2 border-primary-container rounded-[32px] p-6 shadow-xl relative overflow-hidden active-shadow cursor-pointer transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center text-white shadow-lg">
                  <Bot size={36} fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">
                    Hệ thống tự ghép
                  </h3>
                  <p className="text-xs text-primary-container/80 font-bold">
                    Tối ưu thời gian chờ nhất
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 bg-primary-container rounded-full flex items-center justify-center text-white">
                <Check size={16} strokeWidth={4} />
              </div>
            </div>
          </div>
        </section>

        {/* Priority Drivers */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5 px-1">
            <h3 className="font-bold text-on-surface">
              Tài xế ưu tiên của bạn
            </h3>
          </div>
          <div className="flex gap-4 overflow-x-auto scroll-hide -mx-5 px-5 py-2">
            {drivers.map((driver) => (
              <div
                key={driver.id}
                onClick={() => setSelectedDriverId(driver.id)}
                className={`min-w-[130px] bg-white rounded-3xl shadow-md border p-4 flex flex-col items-center justify-between gap-3 transition-transform cursor-pointer ${selectedDriverId === driver.id ? "border-primary ring-2 ring-primary bg-primary/5 scale-105" : "border-outline-variant/10 active:scale-95"}`}
              >
                <div className="text-4xl mb-1">{driver.emoji}</div>
                <div className="text-center">
                  <p className="font-bold text-sm truncate w-full">
                    {driver.name}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-orange-500 mt-0.5">
                    <Star size={12} fill="currentColor" />
                    <span className="text-[10px] font-bold">
                      {driver.rating}
                    </span>
                  </div>
                </div>
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-lg text-[9px] font-extrabold">
                    <Shield size={10} fill="currentColor" />
                    CẤP {driver.level}
                  </div>
                  <button
                    className={`w-full py-2 rounded-xl text-[10px] font-bold transition-all ${selectedDriverId === driver.id ? "bg-primary text-white" : "bg-surface-container-high text-on-surface active:bg-outline-variant/30"}`}
                  >
                    {selectedDriverId === driver.id ? "Đã chọn" : "Chọn"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Search by Number */}
        {/* <section>
          <h3 className="font-bold text-on-surface mb-4 px-1">
            Tìm tài xế theo số điện thoại
          </h3>
          <div className="relative">
            <input
              type="tel"
              placeholder="Nhập số điện thoại..."
              className="w-full h-14 bg-surface-container-low border border-outline-variant focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 rounded-2xl px-5 py-2 font-medium outline-none transition-all pr-20"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-container text-white px-5 py-2 rounded-xl text-xs font-bold active:scale-90 transition-transform shadow-md">
              Tìm
            </button>
          </div>
        </section> */}
      </main>

      <footer className="fixed bottom-20 left-0 right-0 p-5 pb-8 bg-white shadow-[0px_-4px_20px_0px_rgba(79,70,200,0.06)] z-30 max-w-[430px] mx-auto space-y-4">
        <button
          onClick={() => {
            setBookingData({ selectedDriverId });
            navigate("/client/booking/confirm");
          }}
          className="w-full h-14 bg-primary-container text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
        >
          Tiếp tục <ArrowRight size={20} />
        </button>
        {/* <button
          onClick={() =>
            navigate("/client/booking/confirm", {
              state: { ...previousState, selectedDriverId: null },
            })
          }
          className="w-full text-center text-primary font-bold text-sm hover:underline underline-offset-4"
        >
          Bỏ qua, tự ghép
        </button> */}
      </footer>
    </div>
  );
}
