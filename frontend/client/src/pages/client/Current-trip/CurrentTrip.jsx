import React, { useEffect, useState } from "react";
import { ArrowLeft, Phone } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ClientLiveMap from "./ClientLiveMap.jsx";
import { getDriverLocation } from "../../../services/driver.service.js";
import { getTripDetails } from "../../../services/trip.service.js";
import { useSocketStore } from "../../../store/useSocketStore.js";

export default function CurrentTrip() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("tripId");

  // Robust parsing: ensure we only keep finite numbers
  const parseNumber = (v) => {
    if (v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const destLatNum = null;
  const destLngNum = null;

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
        // driver info may be nested
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
      if (
        ev.type === "kid_dropped_off" &&
        ev.payload?.tripId === tripId &&
        !ev.isRead
      ) {
        navigate("/client/home");
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
    <div className="flex-1 flex flex-col bg-surface min-h-screen relative overflow-hidden pb-28">
      <header className="fixed top-0 left-0 right-0 z-[1200] px-4 py-3 flex items-center justify-between bg-white/90 backdrop-blur-md max-w-[430px] mx-auto shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="text-sm font-bold">Trực tiếp chuyến xe</div>
        <div style={{ width: 36 }} />
      </header>

      <div className="mt-14 px-4">
        <ClientLiveMap
          className="h-[60vh] rounded-2xl w-full"
          startPointProp={driverPos}
          endPointProp={destination}
        />
      </div>

      <div className="mt-4 bg-white  z-50 flex items-center gap-4 px-5 py-4 shadow-sm w-full  max-w-[430px] mx-auto">
        <div className="w-14 h-14 rounded-full overflow-hidden border-2">
          <img
            src={driverInfo?.user?.avatar || "/images/anh-avatar-trang.jpg"}
            alt={driverInfo?.user?.fullName || "Tài xế"}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="font-bold">
            {driverInfo?.user?.fullName || "Tài xế"}
          </div>
          <div className="text-xs text-on-surface-variant">
            {driverInfo?.phone || driverInfo?.user?.phone || ""}
          </div>
        </div>
        <a
          href={`tel:${driverInfo?.phone || driverInfo?.user?.phone || ""}`}
          className="bg-primary-container text-white px-4 py-2 rounded-2xl font-bold"
        >
          <Phone size={16} />
        </a>
      </div>
    </div>
  );
}
