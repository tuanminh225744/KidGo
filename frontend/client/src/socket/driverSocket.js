import { io } from "socket.io-client";
import { setupDriverSocketReceiver } from "./driverSocketReceiver.js";

let socket = null;
let intervalId = null;
let currentDriverId = null;
let getPositionRef = null;

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

  socket.emit("update_location", {
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

    setupDriverSocketReceiver(socket);

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
    socket.disconnect();
    socket = null;
  }

  currentDriverId = null;
};
