import { io } from "socket.io-client";
import { setupParentSocketReceiver } from "./parentSocketReceiver.js";

let socket = null;

const getSocketUrl = () =>
  import.meta.env.VITE_APP_BASE_URL || "http://localhost:5000";

export const connectParentSocket = ({ parentId }) => {
  if (!parentId) {
    return;
  }

  if (socket) {
    return socket; // Already connected
  }

  socket = io(`${getSocketUrl()}/parent`, {
    autoConnect: true,
  });

  setupParentSocketReceiver(socket);

  socket.on("connect", () => {
    socket.emit("authenticate", { parentId });
  });

  socket.on("disconnect", (reason) => {
    console.warn("Parent socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("Không thể kết nối socket phụ huynh:", error);
  });
  
  return socket;
};

export const disconnectParentSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
