import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const initialState = {
  _id: null,
  driverId: null,
  kidId: null,
  bookingId: null,
  status: null,
  pickupLocation: null,
  dropoffLocation: null,
  routeId: null,
  plannedStartTime: null,
  actualStartTime: null,
  actualEndTime: null,
  createdAt: null,
  updatedAt: null,
};

export const useTripStore = create(
  persist(
    (set) => ({
      ...initialState,
      setTripData: (tripData) => set((state) => ({ ...state, ...tripData })),
      resetTrip: () => set(initialState),
    }),
    {
      name: "kidgo_trip",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => state,
    },
  ),
);
