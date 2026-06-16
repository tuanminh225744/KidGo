import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const initialRouteState = {
  _id: null,

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

  estimatedDuration: null,
  estimatedDistance: null,

  actualDuration: null,
  actualDistance: null,

  scheduledPickupTime: null,
  actualPickupTime: null,

  scheduledDropoffTime: null,
  actualDropoffTime: null,
};

export const useRouteStore = create(
  persist(
    (set) => ({
      ...initialRouteState,

      setRoute: (route) =>
        set(() => ({
          ...initialRouteState,
          ...route,
        })),

      updateRoute: (payload) =>
        set((state) => ({
          ...state,
          ...payload,
        })),

      updateEstimatedPickup: ({ address, coords }) =>
        set((state) => ({
          estimatedPickupAddress: address ?? state.estimatedPickupAddress,
          estimatedPickupCoords: coords ?? state.estimatedPickupCoords,
        })),

      updateEstimatedDropoff: ({ address, coords }) =>
        set((state) => ({
          estimatedDropoffAddress: address ?? state.estimatedDropoffAddress,
          estimatedDropoffCoords: coords ?? state.estimatedDropoffCoords,
        })),

      updateActualPickup: ({ address, coords }) =>
        set((state) => ({
          actualPickupAddress: address ?? state.actualPickupAddress,
          actualPickupCoords: coords ?? state.actualPickupCoords,
        })),

      updateActualDropoff: ({ address, coords }) =>
        set((state) => ({
          actualDropoffAddress: address ?? state.actualDropoffAddress,
          actualDropoffCoords: coords ?? state.actualDropoffCoords,
        })),

      resetRoute: () =>
        set(() => ({
          ...initialRouteState,
        })),
    }),
    {
      name: "route-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
