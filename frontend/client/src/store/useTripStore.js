import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const initialState = {
  _id: null,

  bookingId: null,
  driverId: null,
  kidId: null,
  parentId: null,
  vehicleId: null,
  routeId: null,

  status: "scheduled",

  otp: {
    required: false,
    status: "not_required",
    data: null,
    verifiedAt: null,
  },

  pickupPhoto: {
    required: false,
    status: "not_required",
    data: null,
    verifiedAt: null,
  },

  dropoffPhoto: {
    required: false,
    status: "not_required",
    data: null,
    verifiedAt: null,
  },

  securityQuestion: {
    required: false,
    status: "not_required",
    data: null,
    verifiedAt: null,
  },

  createdAt: null,
};

export const useTripStore = create(
  persist(
    (set) => ({
      ...initialState,

      setTrip: (trip) =>
        set(() => ({
          ...initialState,
          ...trip,
        })),

      updateTrip: (payload) =>
        set((state) => ({
          ...state,
          ...payload,
        })),

      updateOtp: (payload) =>
        set((state) => ({
          otp: {
            ...state.otp,
            ...payload,
          },
        })),

      updatePickupPhoto: (payload) =>
        set((state) => ({
          pickupPhoto: {
            ...state.pickupPhoto,
            ...payload,
          },
        })),

      updateDropoffPhoto: (payload) =>
        set((state) => ({
          dropoffPhoto: {
            ...state.dropoffPhoto,
            ...payload,
          },
        })),

      updateSecurityQuestion: (payload) =>
        set((state) => ({
          securityQuestion: {
            ...state.securityQuestion,
            ...payload,
          },
        })),

      resetTrip: () =>
        set(() => ({
          ...initialState,
        })),
    }),
    {
      name: "trip-storage",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
