import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useSocketStore = create(
  persist(
    (set, get) => ({
      events: [],

      addEvent: (namespace, type, payload) => {
        const id =
          Date.now().toString() +
          Math.random().toString(36).substring(2, 9);

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

      markAsRead: (id) => {
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, isRead: true } : e
          ),
        }));
      },

      getEventsByFilter: (type, isRead) => {
        const allEvents = get().events;

        return allEvents.filter((event) => {
          let match = true;

          if (type != null && event.type !== type) match = false;
          if (isRead != null && event.isRead !== isRead) match = false;

          return match;
        });
      },
    }),
    {
      name: "socket-store",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);