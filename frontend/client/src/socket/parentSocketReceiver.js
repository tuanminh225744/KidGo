import { useSocketStore } from '../store/useSocketStore.js';

/**
 * Hàm nhận instance socket của Parent và đẩy event vào Zustand Store
 */
export const setupParentSocketReceiver = (socket) => {
  if (!socket) return;
  
  socket.onAny((eventName, ...args) => {
    const payload = args.length === 1 ? args[0] : args;
    useSocketStore.getState().addEvent('parent', eventName, payload);
  });
};
