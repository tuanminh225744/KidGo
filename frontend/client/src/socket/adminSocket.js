import { io } from "socket.io-client";
import { setupAdminSocketReceiver } from "./adminSocketReceiver.js";

let socket = null;

const getSocketUrl = () =>
  import.meta.env.VITE_APP_BASE_URL || "http://localhost:5000";

export const connectAdminSocket = ({ adminId }) => {
  if (!adminId) {
    return;
  }

  if (socket) {
    return socket;
  }

  socket = io(`${getSocketUrl()}/admin`, {
    autoConnect: true,
  });

  setupAdminSocketReceiver(socket);

  socket.on("connect", () => {
    socket.emit("authenticate", { adminId });
  });

  socket.on("disconnect", (reason) => {
    console.warn("Admin socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("Không thể kết nối socket admin:", error);
  });

  return socket;
};

export const disconnectAdminSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
