import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const initialState = {
  driverInfo: null,
  vehicles: [],
  activeVehicle: null,
};

export const useDriverStore = create(
  persist(
    (set) => ({
      ...initialState,
      setDriverData: ({ driverInfo, vehicles, activeVehicle } = {}) =>
        set((state) => ({
          driverInfo: driverInfo ?? state.driverInfo,
          vehicles: vehicles ?? state.vehicles,
          activeVehicle: activeVehicle ?? state.activeVehicle,
        })),
      clearDriverData: () => set(initialState),
    }),
    {
      name: "kidgo_driver",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => state,
    },
  ),
);
