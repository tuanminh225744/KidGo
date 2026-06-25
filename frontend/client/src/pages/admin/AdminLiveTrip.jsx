import React, { useEffect, useState } from "react";
import { ArrowLeft, Phone, Navigation } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ClientLiveMap from "../client/current-trip/ClientLiveMap.jsx";
import { getDriverLocation } from "../../services/driver.service.js";
import { getTripDetails } from "../../services/trip.service.js";
import { useSocketStore } from "../../store/useSocketStore.js";

export default function AdminLiveTrip() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("tripId");

  const [driverPos, setDriverPos] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [trip, setTrip] = useState(null);
  const events = useSocketStore((s) => s.events);
  const markAsRead = useSocketStore((s) => s.markAsRead);

  // Load trip by tripId
  const loadTrip = async () => {
    if (!tripId) return;
    try {
      const res = await getTripDetails(tripId);
      if (res && res.data) {
        setTrip(res.data);
        const drv = res.data.driverId;
        setDriverInfo(drv?.user ? drv : null);
      }
    } catch (err) {
      console.error("Error loading trip:", err);
    }
  };

  useEffect(() => {
    if (!tripId) return;
    loadTrip();
  }, [tripId]);

  // Poll driver location when trip.driverId is available
  useEffect(() => {
    if (!trip || !trip.driverId) return;
    const driverIdLocal = trip.driverId._id || trip.driverId;
    let mounted = true;
    const fetchPos = async () => {
      try {
        const res = await getDriverLocation(driverIdLocal);
        if (res && res.data && mounted) {
          const geo = res.data;
          if (geo.coordinates && geo.coordinates.length >= 2) {
            setDriverPos({ lat: geo.coordinates[1], lng: geo.coordinates[0] });
          }
        }
      } catch (e) {
        console.error("Error fetching driver location:", e);
      }
    };

    fetchPos();
    const id = setInterval(fetchPos, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [trip]);

  // Listen to socket events and refresh trip on kid_picked_up
  useEffect(() => {
    if (!tripId || !events || events.length === 0) return;
    events.forEach((ev) => {
      if (
        ev.type === "kid_picked_up" &&
        ev.payload?.tripId === tripId &&
        !ev.isRead
      ) {
        loadTrip();
        markAsRead(ev.id);
      }
    });
  }, [events, tripId]);

  // Determine destination based on trip state: before pickup => pickup point, after pickup => dropoff
  let destination = null;
  if (trip && trip.routeId) {
    const r = trip.routeId;
    const pickup =
      r.actualPickupCoords &&
      r.actualPickupCoords.coordinates &&
      r.actualPickupCoords.coordinates.length === 2
        ? r.actualPickupCoords.coordinates
        : r.estimatedPickupCoords && r.estimatedPickupCoords.coordinates
          ? r.estimatedPickupCoords.coordinates
          : null;

    const dropoff =
      r.actualDropoffCoords &&
      r.actualDropoffCoords.coordinates &&
      r.actualDropoffCoords.coordinates.length === 2
        ? r.actualDropoffCoords.coordinates
        : r.estimatedDropoffCoords && r.estimatedDropoffCoords.coordinates
          ? r.estimatedDropoffCoords.coordinates
          : null;

    if (trip.status === "in_progress") {
      if (dropoff) destination = { lat: dropoff[1], lng: dropoff[0] };
    } else {
      if (pickup) destination = { lat: pickup[1], lng: pickup[0] };
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden p-4 md:p-8">
      <div className="max-w-5xl mx-auto w-full h-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Navigation className="text-blue-600" /> Giám sát chuyến xe trực tiếp
            </h1>
            <p className="text-sm text-gray-500">ID: {tripId}</p>
          </div>
          
          {trip && (
            <div className="ml-auto">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                trip.status === "picking_up" ? "bg-yellow-100 text-yellow-800" :
                trip.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                trip.status === "completed" ? "bg-green-100 text-green-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {trip.status === "picking_up" ? "Đang đi đón khách" :
                 trip.status === "in_progress" ? "Đang trên đường (đã đón khách)" :
                 trip.status === "completed" ? "Đã hoàn thành" : trip.status}
              </span>
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[400px]">
          <ClientLiveMap
            className="w-full h-full"
            startPointProp={driverPos}
            endPointProp={destination}
          />
        </div>

        {/* Info Card */}
        {driverInfo && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-100 flex-shrink-0">
              <img
                src={driverInfo?.user?.avatar || "/images/anh-avatar-trang.jpg"}
                alt={driverInfo?.user?.fullName || "Tài xế"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-900 text-lg">
                {driverInfo?.user?.fullName || "Tài xế"}
              </div>
              <div className="text-sm text-gray-500">
                SĐT: {driverInfo?.phone || driverInfo?.user?.phone || "N/A"}
                {driverInfo?.licenseNumber && ` • Bằng lái: ${driverInfo.licenseNumber}`}
              </div>
            </div>
            <a
              href={`tel:${driverInfo?.phone || driverInfo?.user?.phone || ""}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2"
            >
              <Phone size={18} /> Gọi tài xế
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
