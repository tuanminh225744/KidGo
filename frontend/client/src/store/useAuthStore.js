import { create } from 'zustand';
import { useDriverStore } from './useDriverStore.js';

const storedUser = localStorage.getItem('kidgo_user');
const initialState = storedUser ? JSON.parse(storedUser) : null;

export const useAuthStore = create((set) => ({
  user: initialState,
  setUser: (userData) => {
    if (userData) {
      localStorage.setItem('kidgo_user', JSON.stringify(userData));
      if (userData.role !== 'driver') {
        useDriverStore.getState().clearDriverData();
      }
    } else {
      localStorage.removeItem('kidgo_user');
      useDriverStore.getState().clearDriverData();
    }
    set({ user: userData });
  },
  logout: () => {
    localStorage.clear();
    useDriverStore.getState().clearDriverData();
    set({ user: null });
  }
}));
