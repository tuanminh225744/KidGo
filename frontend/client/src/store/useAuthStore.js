import { create } from 'zustand';

const storedUser = localStorage.getItem('kidgo_user');
const initialState = storedUser ? JSON.parse(storedUser) : null;

export const useAuthStore = create((set) => ({
  user: initialState,
  setUser: (userData) => {
    if (userData) {
      localStorage.setItem('kidgo_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('kidgo_user');
    }
    set({ user: userData });
  },
  clearUser: () => {
    localStorage.removeItem('kidgo_user');
    set({ user: null });
  }
}));
