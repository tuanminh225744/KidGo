import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const initialState = {
  _id: null,
  kidId: null,
  driverId: null,
  tripType: null,
  status: null,
  pickupLocation: null,
  dropoffLocation: null,
  routeId: null,
  plannedStartTime: null,
  fare: null,
  distance: null,
  estTime: null,
  createdAt: null,
  updatedAt: null,
};

export const useBookingStoreDriver = create(
  persist(
    (set) => ({
      ...initialState,
      setBooking: (bookingData) => set((state) => ({ ...state, ...bookingData })),
      resetBooking: () => set(initialState),
    }),
    {
      name: "kidgo_driver_booking",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => state,
    },
  ),
);
