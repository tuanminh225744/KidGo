import { create } from "zustand";

export const useSocketStore = create((set, get) => ({
  events: [],

  // Hàm thêm event vào store
  addEvent: (namespace, type, payload) => {
    const id =
      Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const newEvent = {
      id,
      namespace,
      type,
      payload,
      isRead: false,
      timestamp: new Date(),
    };

    set((state) => ({
      events: [...state.events, newEvent],
    }));

    return newEvent;
  },

  // Hàm đánh dấu event đã được xử lý/đọc
  markAsRead: (id) => {
    set((state) => ({
      events: state.events.map((e) =>
        e.id === id ? { ...e, isRead: true } : e,
      ),
    }));
  },

  // Hàm lấy event theo type và trạng thái isRead (hàm lấy dữ liệu trực tiếp)
  getEventsByFilter: (type, isRead) => {
    const allEvents = get().events;
    return allEvents.filter((event) => {
      let match = true;
      if (type !== undefined && type !== null) {
        if (event.type !== type) match = false;
      }
      if (isRead !== undefined && isRead !== null) {
        if (event.isRead !== isRead) match = false;
      }
      return match;
    });
  },
}));
