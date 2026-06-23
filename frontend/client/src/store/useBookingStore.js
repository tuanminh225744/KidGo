import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const initialState = {
  kidId: null,
  tripType: "one-time",
  startPoint: null,
  endPoint: null,
  pickupText: "",
  dropoffText: "",
  routeInfo: {
    distance: null,
    duration: null,
  },
  routeId: null,
  bookingDateTime: null,
  recurringDays: [],
  recurringStartDate: null,
  recurringEndDate: null,
  bookingPlan: "one-time",
  selectedDriverId: null,
};

export const useBookingStore = create(
  persist(
    (set) => ({
      ...initialState,
      setBookingData: (data) => set((state) => ({ ...state, ...data })),
      resetBooking: () => set(initialState),
    }),
    {
      name: "kidgo_booking",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => state,
    },
  ),
);
