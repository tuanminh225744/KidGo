import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const initialState = {
  _id: null,

  bookingId: null,
  driverId: null,
  kidId: null,
  parentId: null,
  vehicleId: null,

  status: "scheduled",

  plannedRoute: {
    pickupAddress: null,

    pickupCoords: {
      type: "Point",
      coordinates: [],
    },

    dropoffAddress: null,

    dropoffCoords: {
      type: "Point",
      coordinates: [],
    },

    waypoints: [],

    estimatedDuration: null,
    estimatedDistance: null,
  },

  actualRoute: [],

  scheduledPickupTime: null,
  actualPickupTime: null,

  scheduledDropoffTime: null,
  actualDropoffTime: null,

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

  distance: null,

  createdAt: null,
};

export const useTripStore = create(
  persist(
    (set) => ({
      ...initialState,

      setTripData: (tripData) =>
        set((state) => ({
          ...state,
          ...tripData,
        })),

      resetTrip: () => set(initialState),
    }),
    {
      name: "kidgo_trip",
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        _id: state._id,

        bookingId: state.bookingId,
        driverId: state.driverId,
        kidId: state.kidId,
        parentId: state.parentId,
        vehicleId: state.vehicleId,

        status: state.status,

        plannedRoute: state.plannedRoute,
        actualRoute: state.actualRoute,

        scheduledPickupTime: state.scheduledPickupTime,
        actualPickupTime: state.actualPickupTime,

        scheduledDropoffTime: state.scheduledDropoffTime,
        actualDropoffTime: state.actualDropoffTime,

        otp: state.otp,
        pickupPhoto: state.pickupPhoto,
        dropoffPhoto: state.dropoffPhoto,
        securityQuestion: state.securityQuestion,

        distance: state.distance,

        createdAt: state.createdAt,
      }),
    },
  ),
);