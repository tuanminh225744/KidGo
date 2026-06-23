import {
  Check,
  Star,
  ArrowRight,
  ArrowLeft,
  Bot,
  Wifi,
  WifiOff,
  Users,
  Shield,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { getPreferredDrivers } from "../../../services/preferredDriver.service.js";
import { useBookingStore } from "../../../store/useBookingStore.js";

export default function SelectDriver() {
  const navigate = useNavigate();
  const { setBookingData } = useBookingStore();

  const [allDrivers, setAllDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useAutoMatch, setUseAutoMatch] = useState(false);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await getPreferredDrivers();
        if (response.success && response.data) {
          // Lọc chỉ lấy tài xế đang Online VÀ Free (isAvailable = true)
          // Sắp xếp theo độ ưu tiên (priority tăng dần: 1 = cao nhất)
          const available = response.data
            .filter((item) => item.isAvailable)
            .sort((a, b) => (a.priority || 1) - (b.priority || 1));
          setAllDrivers(available);
        }
      } catch (error) {
        console.error("Lỗi tải danh sách tài xế ưu tiên:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const handleContinue = () => {
    if (useAutoMatch) {
      setBookingData({ selectedDriverId: null });
    } else {
      setBookingData({ selectedDriverId });
    }
    navigate("/client/booking/confirm");
  };

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-screen">
      <header className="px-5 py-4 flex justify-between items-center sticky top-0 bg-white z-20 shadow-sm">
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
          <p className="text-sm text-on-surface-variant mt-1">
            Phụ phí +10.000đ khi chọn tài xế ưu tiên
          </p>
        </div>

        {/* Auto Match Card */}
        <section className="mb-8">
          <button
            onClick={() => {
              setUseAutoMatch(true);
              setSelectedDriverId(null);
            }}
            className={`w-full bg-surface-container-low border-2 rounded-[32px] p-6 shadow-xl relative overflow-hidden active-shadow transition-all text-left ${useAutoMatch
                ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                : "border-primary-container"
              }`}
          >
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
              {useAutoMatch && (
                <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white">
                  <Check size={16} strokeWidth={4} />
                </div>
              )}
            </div>
          </button>
        </section>

        {/* Priority Drivers */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5 px-1">
            <div>
              <h3 className="font-bold text-on-surface">
                Tài xế ưu tiên của bạn
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Chỉ hiển thị tài xế đang rảnh
              </p>
            </div>
            <button
              onClick={() => navigate("/client/preferred-drivers")}
              className="text-xs font-bold text-primary-container"
            >
              Quản lý
            </button>
          </div>

          {isLoading ? (
            <div className="flex gap-4 overflow-x-auto scroll-hide -mx-5 px-5 py-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="min-w-[130px] h-48 bg-surface-container-low rounded-3xl animate-pulse"
                />
              ))}
            </div>
          ) : allDrivers.length === 0 ? (
            <div className="bg-surface-container-low rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
                <Users size={22} className="text-outline" />
              </div>
              <div>
                <p className="font-bold text-sm text-on-surface">
                  Không có tài xế rảnh
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Các tài xế ưu tiên đang offline hoặc đang bận
                </p>
              </div>
              <button
                onClick={() => navigate("/client/preferred-drivers")}
                className="text-xs font-bold text-primary-container underline"
              >
                Thêm tài xế ưu tiên mới
              </button>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto scroll-hide -mx-5 px-5 py-2">
              {allDrivers.map((item, index) => {
                const isSelected = selectedDriverId === item.driverId;
                return (
                  <motion.div
                    key={item.driverId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.07 }}
                    onClick={() => {
                      setSelectedDriverId(item.driverId);
                      setUseAutoMatch(false);
                    }}
                    className={`min-w-[130px] bg-white rounded-3xl shadow-md border p-4 flex flex-col items-center gap-2.5 transition-all cursor-pointer ${isSelected
                        ? "border-primary ring-2 ring-primary bg-primary/5 scale-105"
                        : "border-outline-variant/10 active:scale-95"
                      }`}
                  >
                    {/* Priority badge */}
                    <div className="self-end">
                      <span className="text-[9px] font-extrabold bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded-md">
                        P{item.priority}
                      </span>
                    </div>

                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-container-low">
                        <img
                          src={
                            item.driver?.avatar ||
                            `/images/anh-avatar-trang.jpg`
                          }
                          alt={item.driver?.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white bg-green-500" />
                    </div>

                    {/* Name */}
                    <div className="text-center w-full">
                      <p className="font-bold text-xs truncate w-full text-center">
                        {item.nickname || item.driver?.fullName || "Tài xế"}
                      </p>
                      {item.driver?.certificationLevel !== undefined && (
                        <div className="flex items-center justify-center gap-0.5 text-orange-500 mt-0.5">
                          <Star size={10} fill="currentColor" />
                          <span className="text-[10px] font-bold">
                            {item.driver.certificationLevel.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Available status */}
                    <div className="flex items-center gap-1 text-green-600 text-[9px] font-bold bg-green-50 px-2 py-0.5 rounded-full">
                      <Wifi size={8} />
                      Sẵn sàng
                    </div>

                    {/* Chọn button */}
                    <button
                      className={`w-full py-2 rounded-xl text-[10px] font-bold transition-all ${isSelected
                          ? "bg-primary text-white"
                          : "bg-surface-container-high text-on-surface active:bg-outline-variant/30"
                        }`}
                    >
                      {isSelected ? "Đã chọn ✓" : "Chọn"}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <footer className="fixed bottom-20 left-0 right-0 p-5 pb-8 bg-white shadow-[0px_-4px_20px_0px_rgba(79,70,200,0.06)] z-30 max-w-[430px] mx-auto space-y-3">
        {/* Hiển thị lựa chọn hiện tại */}
        {(selectedDriverId || useAutoMatch) && (
          <div className="flex items-center gap-2 px-1">
            <div
              className={`w-2 h-2 rounded-full ${useAutoMatch ? "bg-primary" : "bg-green-500"
                }`}
            />
            <p className="text-xs font-bold text-on-surface-variant">
              {useAutoMatch
                ? "Hệ thống tự ghép tài xế"
                : `Tài xế ưu tiên đã chọn · +10.000đ phụ phí`}
            </p>
          </div>
        )}
        <button
          onClick={handleContinue}
          disabled={!selectedDriverId && !useAutoMatch}
          className="w-full h-14 bg-primary-container text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          Tiếp tục <ArrowRight size={20} />
        </button>
      </footer>
    </div>
  );
}
