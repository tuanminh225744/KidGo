import { io } from "socket.io-client";

let socket = null;
let intervalId = null;
let currentDriverId = null;
let getPositionRef = null;
let bookingAssignedHandler = null;

const getSocketUrl = () =>
  import.meta.env.VITE_APP_BASE_URL || "http://localhost:5000";

const stopLocationUpdates = () => {
  if (intervalId) {
    window.clearInterval(intervalId);
    intervalId = null;
  }
};

const sendLocation = () => {
  if (!socket || !currentDriverId || typeof getPositionRef !== "function") {
    return;
  }

  const position = getPositionRef();
  if (!position) {
    return;
  }

  socket.emit("update-location", {
    driverId: currentDriverId,
    lat: position.lat,
    lng: position.lng,
  });
};

const startLocationUpdates = () => {
  if (intervalId || typeof getPositionRef !== "function") {
    return;
  }

  sendLocation();
  intervalId = window.setInterval(sendLocation, 10000);
};

export const connectDriverSocket = ({
  driverId,
  getPosition,
  onBookingAssigned,
}) => {
  if (!driverId) {
    return;
  }

  if (typeof getPosition === "function") {
    getPositionRef = getPosition;
  }

  if (socket && currentDriverId && currentDriverId !== driverId) {
    disconnectDriverSocket();
  }

  if (!socket) {
    currentDriverId = driverId;

    socket = io(`${getSocketUrl()}/driver`, {
      autoConnect: true,
    });

    socket.on("connect", () => {
      socket.emit("authenticate", { driverId: currentDriverId });
      sendLocation();
    });

    socket.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("Không thể kết nối socket tài xế:", error);
    });
  } else {
    currentDriverId = driverId;

    if (socket.connected) {
      socket.emit("authenticate", { driverId: currentDriverId });
    }
  }

  if (typeof onBookingAssigned === "function") {
    if (bookingAssignedHandler) {
      socket.off("booking_assigned", bookingAssignedHandler);
    }

    bookingAssignedHandler = (payload) => {
      onBookingAssigned(payload);
    };

    socket.on("booking_assigned", bookingAssignedHandler);
  }

  startLocationUpdates();
};

export const clearDriverLocationProvider = () => {
  getPositionRef = null;
  stopLocationUpdates();
};

export const disconnectDriverSocket = () => {
  stopLocationUpdates();
  getPositionRef = null;

  if (socket) {
    if (bookingAssignedHandler) {
      socket.off("booking_assigned", bookingAssignedHandler);
    }
    socket.disconnect();
    socket = null;
  }

  currentDriverId = null;
  bookingAssignedHandler = null;
};
