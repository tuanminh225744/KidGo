import { useEffect, useState } from "react";
import { useDriverStore } from "../store/useDriverStore.js";
import {
  connectDriverSocket,
  disconnectDriverSocket,
} from "../socket/driverSocket.js";
import { NewTripModal } from "../pages/driver/NewTripModal.jsx";

export default function DriverBookingNotifier() {
  const driverInfo = useDriverStore((state) => state.driverInfo);
  const driverId = driverInfo?._id || null;
  const [tripRequest, setTripRequest] = useState(null);

  useEffect(() => {
    const handleBookingAssigned = (payload = {}) => {
      setTripRequest({
        _id: payload.bookingId,
        message: payload.message || "Bạn có một chuyến mới đang chờ phản hồi.",
      });
    };

    connectDriverSocket({
      driverId,
      onBookingAssigned: handleBookingAssigned,
    });

    return () => {
      disconnectDriverSocket();
    };
  }, [driverId]);

  if (!tripRequest) {
    return null;
  }

  return (
    <NewTripModal
      tripRequest={tripRequest}
      onAccept={() => {
        setTripRequest(null);
      }}
      onSkip={() => {
        setTripRequest(null);
      }}
    />
  );
}
