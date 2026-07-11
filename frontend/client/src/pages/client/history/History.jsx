import React, { useState, useEffect } from "react";
import { History as HistoryIcon, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getTrips } from "../../../services/trip.service.js";
import { TripDetailsModal } from "../../../components/modal/TripDetailsModal.jsx";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [historyTrips, setHistoryTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);

  useEffect(() => {
    loadHistoryTrips();
  }, []);

  const loadHistoryTrips = async () => {
    setLoading(true);
    const result = await getTrips({ status: "completed" });
    if (result.success) {
      const tripsData = result.data?.trips || [];
      const formatted = tripsData.map((t) => ({
        id: t._id,
        time: new Date(t.createdAt).toLocaleString(),
        status:
          t.status === "completed"
            ? "HOÀN THÀNH"
            : t.status === "cancelled"
              ? "HUỶ"
              : t.status,
        name: t.kidId?.fullName || "Unknown",
        from:
          t.routeId?.estimatedPickupAddress ||
          t.routeId?.actualPickupAddress ||
          "N/A",
        to:
          t.routeId?.estimatedDropoffAddress ||
          t.routeId?.actualDropoffAddress ||
          "N/A",
        price: t.paymentId?.amount
          ? `${t.paymentId.amount.toLocaleString()}đ`
          : "0đ",
        dist: t.routeId?.estimatedDistance
          ? `${t.routeId.estimatedDistance}km`
          : t.routeId?.actualDistance
            ? `${t.routeId.actualDistance}km`
            : "0.0km",
        duration: t.routeId?.estimatedDuration
          ? `${t.routeId.estimatedDuration} phút`
          : t.routeId?.actualDuration
            ? `${t.routeId.actualDuration} phút`
            : "0 phút",
        driver: t.driverId,
      }));
      setHistoryTrips(formatted);
    } else {
      setHistoryTrips([]);
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col pb-24 bg-surface min-h-screen">
      {/* Header */}
      <header className="px-5 py-4 flex items-center gap-4 bg-white sticky top-0 z-40 shadow-sm">
        {/* <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} className="text-on-surface" />
        </button> */}
        <h1 className="text-xl font-bold text-on-surface">
          Lịch sử di chuyển
        </h1>
      </header>

      <main className="px-5 pt-6 space-y-4">
        {loading ? (
          <div className="text-center text-on-surface-variant py-4">
            Đang tải...
          </div>
        ) : historyTrips.length === 0 ? (
          <div className="bg-secondary-container rounded-3xl p-5 text-white flex flex-col justify-between h-36 shadow-lg shadow-tertiary/20 w-full mt-4">
            <HistoryIcon size={32} strokeWidth={1.5} />
            <div>
              <h3 className="font-bold text-lg">Chưa có chuyến đi</h3>
              <p className="text-white/80 text-sm">
                Bạn chưa có chuyến đi nào đã hoàn thành
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {historyTrips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => setSelectedTrip(trip)}
                className="bg-white p-4 rounded-3xl shadow-sm border border-outline-variant/30 active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500 font-medium">
                      {trip.time}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-100 text-green-700">
                      {trip.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{trip.price}</p>
                  </div>
                </div>

                <div className="mb-2">
                  <h3 className="font-bold text-gray-800 truncate">
                    Bé {trip.name}
                  </h3>
                  <h3 className="font-bold text-gray-800 truncate">
                    Từ: {trip.from}
                  </h3>
                  <h3 className="font-bold text-gray-800 truncate">
                    Đến: {trip.to}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <TripDetailsModal
        isOpen={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
        trip={selectedTrip}
        role="client"
      />
    </div>
  );
}
