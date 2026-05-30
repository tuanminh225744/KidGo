import { io } from "socket.io-client";

let socket = null;
let intervalId = null;

export const connectDriverSocket = ({ driverId, getPosition }) => {
  if (!driverId || typeof getPosition !== "function") {
    return;
  }

  const socketUrl =
    import.meta.env.VITE_APP_BASE_URL || "http://localhost:5000";

  socket = io(`${socketUrl}/driver`, {
    autoConnect: true,
  });

  const sendLocation = () => {
    const position = getPosition();
    if (!position) return;

    socket.emit("update-location", {
      driverId,
      lat: position.lat,
      lng: position.lng,
    });
  };

  socket.on("connect", () => {
    socket.emit("authenticate", { driverId });
    sendLocation();
  });

  socket.on("connect_error", (error) => {
    console.error("Không thể kết nối socket tài xế:", error);
  });

  intervalId = window.setInterval(sendLocation, 10000);
};

export const disconnectDriverSocket = () => {
  if (intervalId) {
    window.clearInterval(intervalId);
    intervalId = null;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
