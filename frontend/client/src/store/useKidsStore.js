import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const initialState = {
  kids: [],
};

export const useKidStore = create(
  persist(
    (set) => ({
      ...initialState,

      setKids: (kids) =>
        set({
          kids,
        }),

      addKid: (kid) =>
        set((state) => ({
          kids: [...state.kids, kid],
        })),

      updateKid: (kidId, payload) =>
        set((state) => ({
          kids: state.kids.map((kid) =>
            kid._id === kidId
              ? {
                ...kid,
                ...payload,
              }
              : kid,
          ),
        })),

      removeKid: (kidId) =>
        set((state) => ({
          kids: state.kids.filter((kid) => kid._id !== kidId),
        })),

      resetKids: () =>
        set({
          ...initialState,
        }),
    }),
    {
      name: "kid-storage",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
