import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDriverStore } from "../store/useDriverStore.js";
import { useSocketStore } from "../store/useSocketStore.js";
import { connectDriverSocket, disconnectDriverSocket } from "../socket/driverSocket.js";
import { NewTripModal } from "./notifications/NewTripModal.jsx";

export default function DriverSocketManager() {
  const location = useLocation();
  const driverInfo = useDriverStore((state) => state.driverInfo);
  const driverId = driverInfo?._id || null;
  const events = useSocketStore((s) => s.events);
  const markAsRead = useSocketStore((s) => s.markAsRead);

  const [toastEvent, setToastEvent] = useState(null);

  useEffect(() => {
    if (driverId) {
      connectDriverSocket({ driverId });
    }

    return () => {
      disconnectDriverSocket();
    };
  }, [driverId]);

  // show toast when a new driver event arrives that is not new_booking_available or booking_assigned
  useEffect(() => {
    if (!events || events.length === 0) return;
    const last = events[events.length - 1];
    if (last.namespace !== "driver" || last.isRead) return;

    if (["new_booking_available", "booking_assigned"].includes(last.type)) return;

    setToastEvent(last);
    const timer = setTimeout(() => {
      setToastEvent(null);
      markAsRead(last.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [events]);

  const pathParts = location.pathname.split("/");
  const currentView = pathParts[pathParts.length - 1];

  const hideOnScreens = [
    "login",
    "register",
    "otp",
    "in-trip",
    "pin",
    "drop-off",
    "summary",
    "deviation",
    "registered",
  ];

  if (hideOnScreens.includes(currentView)) {
    return null;
  }

  const unreadBookingEvent = events.find(
    (e) => e.namespace === "driver" && ["new_booking_available", "booking_assigned"].includes(e.type) && !e.isRead
  );

  let toastUi = null;
  if (toastEvent) {
    const { type, payload } = toastEvent;
    const title = payload?.title || (type && type.replace(/_/g, " ")) || "Thông báo";
    const message = payload?.message || JSON.stringify(payload).slice(0, 120);

    toastUi = (
      <div className="fixed left-5 right-5 z-[500] top-5 max-w-[420px] mx-auto">
        <div className="bg-white border-2 border-outline-variant rounded-3xl p-4 flex items-start gap-3 shadow-lg">
          <div className="flex-1">
            <p className="text-sm font-bold text-on-surface">{title}</p>
            <p className="text-xs text-on-surface-variant mt-1">{message}</p>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => {
                markAsRead(toastEvent.id);
                setToastEvent(null);
              }}
              className="bg-primary-container text-white px-4 py-2 rounded-xl font-bold"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  let modalUi = null;
  if (unreadBookingEvent) {
    const tripRequest = {
      _id: unreadBookingEvent.payload.bookingId,
      message: unreadBookingEvent.payload.message,
      ...(unreadBookingEvent.payload.booking || {}),
    };

    modalUi = (
      <NewTripModal
        tripRequest={tripRequest}
        onAccept={() => markAsRead(unreadBookingEvent.id)}
        onSkip={() => markAsRead(unreadBookingEvent.id)}
      />
    );
  }

  return (
    <>
      {toastUi}
      {modalUi}
    </>
  );
}
