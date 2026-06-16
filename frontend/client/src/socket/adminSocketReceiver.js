import { useSocketStore } from "../store/useSocketStore.js";

/**
 * Hàm nhận instance socket của Admin và đẩy event vào Zustand Store
 */
export const setupAdminSocketReceiver = (socket) => {
  if (!socket) return;

  socket.onAny((eventName, ...args) => {
    const payload = args.length === 1 ? args[0] : args;
    useSocketStore.getState().addEvent("admin", eventName, payload);
  });
};
