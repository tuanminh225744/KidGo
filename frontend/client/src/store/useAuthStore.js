import { create } from 'zustand';
import { useDriverStore } from './useDriverStore.js';
import { logoutApi } from '../services/auth.service.js';

const storedUser = sessionStorage.getItem('kidgo_user');
const initialState = storedUser ? JSON.parse(storedUser) : null;

export const useAuthStore = create((set) => ({
  user: initialState,
  setUser: (userData) => {
    if (userData) {
      sessionStorage.setItem('kidgo_user', JSON.stringify(userData));
      if (userData.role !== 'driver') {
        useDriverStore.getState().clearDriverData();
      }
    } else {
      sessionStorage.removeItem('kidgo_user');
      useDriverStore.getState().clearDriverData();
    }
    set({ user: userData });
  },
  logout: async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Lỗi khi gọi API đăng xuất:", error);
    } finally {
      sessionStorage.clear();
      useDriverStore.getState().clearDriverData();
      set({ user: null });
    }
  }
}));
