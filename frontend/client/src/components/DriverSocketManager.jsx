import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDriverStore } from "../store/useDriverStore.js";
import { useSocketStore } from "../store/useSocketStore.js";
import { connectDriverSocket, disconnectDriverSocket } from "../socket/driverSocket.js";
import { NewTripModal } from "./notifications/NewTripModal.jsx";

export default function DriverSocketManager() {
  const location = useLocation();
  const driverInfo = useDriverStore((state) => state.driverInfo);
  const driverId = driverInfo?._id || null;

  const unreadBookingEvent = useSocketStore((state) =>
    state.events.find((e) => e.type === "booking_assigned" && !e.isRead)
  );

  useEffect(() => {
    if (driverId) {
      connectDriverSocket({ driverId });
    }

    return () => {
      disconnectDriverSocket();
    };
  }, [driverId]);

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



  if (!unreadBookingEvent) {
    return null;
  }

  const tripRequest = {
    _id: unreadBookingEvent.payload.bookingId,
    message: unreadBookingEvent.payload.message,
  };

  return (
    <NewTripModal
      tripRequest={tripRequest}
      onAccept={() => {
        useSocketStore.getState().markAsRead(unreadBookingEvent.id);
      }}
      onSkip={() => {
        useSocketStore.getState().markAsRead(unreadBookingEvent.id);
      }}
    />
  );
}
