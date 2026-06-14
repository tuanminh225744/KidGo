import React from "react";
import { motion } from "motion/react";
import { Phone, Map, MoreVertical, Car } from "lucide-react";
export default function TripCard({ trip, navigate }) {
  return (
    <section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-2 border-primary-container rounded-[24px] p-5 shadow-xl active-shadow relative overflow-hidden"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-surface-variant">
              <img
                src={trip.kidId?.avatar || "/images/anh-avatar-trang.jpg"}
                alt={trip.kidId?.fullName || "Kid"}
              />
            </div>
            <div>
              <h3 className="font-bold text-on-surface">
                Bé {trip.kidId?.fullName || "của bạn"} đang trên đường
              </h3>
              <div className="flex items-center gap-1.5 py-0.5 px-2 bg-green-50 text-green-700 text-[10px] font-bold rounded-full w-fit mt-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                {trip.status === "in_progress" ? "ĐANG CHẠY" : "SẮP ĐÓN"}
              </div>
            </div>
          </div>
          <button>
            <MoreVertical size={20} className="text-on-surface-variant" />
          </button>
        </div>

        <div className="bg-surface-container-low p-3 rounded-2xl flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img
              src={
                trip.driverId?.user?.avatar || "/images/anh-avatar-trang.jpg"
              }
              alt="Driver"
            />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-on-surface">
              {trip.driverId?.user?.fullName || "Tài xế"}{" "}
              {/* <span className="text-orange-500 ml-1">
                ★ {trip.driverId?.certificationLevel || "N/A"}
              </span> */}
            </p>
            <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded font-bold">
              Tài xế
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => {
              // Navigate to current-trip by tripId; CurrentTrip will fetch trip details and driver info
              const params = new URLSearchParams();
              if (trip._id) params.set("tripId", trip._id);
              navigate(`/client/current-trip?${params.toString()}`);
            }}
            className="bg-primary-container text-white rounded-xl py-3 flex items-center justify-center gap-2 font-bold active:scale-95 transition-transform"
          >
            <Map size={18} /> Xem bản đồ
          </button>
          <button className="border-2 border-outline-variant text-on-surface rounded-xl py-3 flex items-center justify-center gap-2 font-bold active:scale-95 transition-transform">
            <Phone size={18} /> Gọi tài xế
          </button>
        </div>
      </motion.div>
    </section>
  );
}
