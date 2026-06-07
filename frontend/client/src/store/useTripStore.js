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
    estimatedPickupAddress: null,
    estimatedPickupCoords: {
      type: "Point",
      coordinates: [],
    },

    estimatedDropoffAddress: null,
    estimatedDropoffCoords: {
      type: "Point",
      coordinates: [],
    },

    estimatedWaypoints: [],
    actualPickupAddress: null,
    actualPickupCoords: {
      type: "Point",
      coordinates: [],
    },
    actualDropoffAddress: null,
    actualDropoffCoords: {
      type: "Point",
      coordinates: [],
    },
    actualWaypoints: [],

    estimatedDuration: null,
    estimatedDistance: null,
    actualDuration: null,
    actualDistance: null,
    scheduledPickupTime: null,
    actualPickupTime: null,
    scheduledDropoffTime: null,
    actualDropoffTime: null,
  },

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

const sanitizePlannedRoute = (plannedRoute) => {
  if (!plannedRoute || typeof plannedRoute !== "object") {
    return plannedRoute;
  }

  const sanitized = {
    ...plannedRoute,
    estimatedPickupAddress: plannedRoute.estimatedPickupAddress ?? null,
    estimatedPickupCoords: plannedRoute.estimatedPickupCoords ?? {
      type: "Point",
      coordinates: [],
    },
    estimatedDropoffAddress: plannedRoute.estimatedDropoffAddress ?? null,
    estimatedDropoffCoords: plannedRoute.estimatedDropoffCoords ?? {
      type: "Point",
      coordinates: [],
    },
    estimatedWaypoints: plannedRoute.estimatedWaypoints ?? [],
    actualPickupAddress: plannedRoute.actualPickupAddress ?? null,
    actualPickupCoords: plannedRoute.actualPickupCoords ?? {
      type: "Point",
      coordinates: [],
    },
    actualDropoffAddress: plannedRoute.actualDropoffAddress ?? null,
    actualDropoffCoords: plannedRoute.actualDropoffCoords ?? {
      type: "Point",
      coordinates: [],
    },
    actualWaypoints: plannedRoute.actualWaypoints ?? [],
    estimatedDuration: plannedRoute.estimatedDuration ?? null,
    estimatedDistance: plannedRoute.estimatedDistance ?? null,
    actualDuration: plannedRoute.actualDuration ?? null,
    actualDistance: plannedRoute.actualDistance ?? null,
    scheduledPickupTime: plannedRoute.scheduledPickupTime ?? null,
    actualPickupTime: plannedRoute.actualPickupTime ?? null,
    scheduledDropoffTime: plannedRoute.scheduledDropoffTime ?? null,
    actualDropoffTime: plannedRoute.actualDropoffTime ?? null,
  };

  delete sanitized.pickupAddress;
  delete sanitized.pickupCoords;
  delete sanitized.dropoffAddress;
  delete sanitized.dropoffCoords;
  delete sanitized.waypoints;

  return sanitized;
};

const sanitizeTripData = (tripData = {}) => {
  const sanitized = { ...tripData };
  delete sanitized.actualRoute;
  delete sanitized.scheduledPickupTime;
  delete sanitized.scheduledDropoffTime;
  delete sanitized.actualPickupTime;
  delete sanitized.actualDropoffTime;
  delete sanitized.distance;
  return {
    ...sanitized,
    plannedRoute: sanitizePlannedRoute(sanitized.plannedRoute),
  };
};

export const useTripStore = create(
  persist(
    (set) => ({
      ...initialState,

      setTripData: (tripData) =>
        set((state) => {
          const stateRest = { ...state };
          delete stateRest.actualRoute;
          delete stateRest.scheduledPickupTime;
          delete stateRest.scheduledDropoffTime;
          delete stateRest.actualPickupTime;
          delete stateRest.actualDropoffTime;
          delete stateRest.distance;

          return {
            ...stateRest,
            ...sanitizeTripData(tripData),
            plannedRoute: sanitizePlannedRoute(
              tripData?.plannedRoute ?? state.plannedRoute,
            ),
          };
        }),

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

        otp: state.otp,
        pickupPhoto: state.pickupPhoto,
        dropoffPhoto: state.dropoffPhoto,
        securityQuestion: state.securityQuestion,

        createdAt: state.createdAt,
      }),
    },
  ),
);
