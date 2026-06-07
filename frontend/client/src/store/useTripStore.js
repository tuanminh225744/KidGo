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

  routeId: {
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

const sanitizeRoute = (route) => {
  if (!route || typeof route !== "object") {
    return route;
  }

  const sanitized = {
    ...route,
    estimatedPickupAddress: route.estimatedPickupAddress ?? null,
    estimatedPickupCoords: route.estimatedPickupCoords ?? {
      type: "Point",
      coordinates: [],
    },
    estimatedDropoffAddress: route.estimatedDropoffAddress ?? null,
    estimatedDropoffCoords: route.estimatedDropoffCoords ?? {
      type: "Point",
      coordinates: [],
    },
    estimatedWaypoints: route.estimatedWaypoints ?? [],
    actualPickupAddress: route.actualPickupAddress ?? null,
    actualPickupCoords: route.actualPickupCoords ?? {
      type: "Point",
      coordinates: [],
    },
    actualDropoffAddress: route.actualDropoffAddress ?? null,
    actualDropoffCoords: route.actualDropoffCoords ?? {
      type: "Point",
      coordinates: [],
    },
    actualWaypoints: route.actualWaypoints ?? [],
    estimatedDuration: route.estimatedDuration ?? null,
    estimatedDistance: route.estimatedDistance ?? null,
    actualDuration: route.actualDuration ?? null,
    actualDistance: route.actualDistance ?? null,
    scheduledPickupTime: route.scheduledPickupTime ?? null,
    actualPickupTime: route.actualPickupTime ?? null,
    scheduledDropoffTime: route.scheduledDropoffTime ?? null,
    actualDropoffTime: route.actualDropoffTime ?? null,
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
  delete sanitized.plannedRoute;
  return {
    ...sanitized,
    routeId: sanitizeRoute(sanitized.routeId),
  };
};

export const useTripStore = create(
  persist(
    (set) => ({
      ...initialState,

      setTripData: (tripData) =>
        set((state) => {
          const stateRest = { ...state };
          delete stateRest.plannedRoute;

          return {
            ...stateRest,
            ...sanitizeTripData(tripData),
            routeId: sanitizeRoute(
              tripData?.routeId ?? state.routeId,
            ),
          };
        }),

      resetTrip: () => set(initialState),
    }),
    {
      name: "kidgo_trip",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState) => {
        const nextState = { ...(persistedState || {}) };

        if (!nextState.routeId && nextState.plannedRoute) {
          nextState.routeId = sanitizeRoute(nextState.plannedRoute);
        }

        delete nextState.plannedRoute;
        return nextState;
      },

      partialize: (state) => ({
        _id: state._id,

        bookingId: state.bookingId,
        driverId: state.driverId,
        kidId: state.kidId,
        parentId: state.parentId,
        vehicleId: state.vehicleId,

        status: state.status,

        routeId: state.routeId,

        otp: state.otp,
        pickupPhoto: state.pickupPhoto,
        dropoffPhoto: state.dropoffPhoto,
        securityQuestion: state.securityQuestion,

        createdAt: state.createdAt,
      }),
    },
  ),
);
