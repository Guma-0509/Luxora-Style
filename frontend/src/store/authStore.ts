import { create } from 'zustand';
import { User } from '../types';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: (user, accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wally_access_token', accessToken);
      localStorage.setItem('wally_refresh_token', refreshToken);
      localStorage.setItem('wally_user', JSON.stringify(user));
    }
    set({ user, accessToken, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wally_access_token');
      localStorage.removeItem('wally_refresh_token');
      localStorage.removeItem('wally_user');
    }
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  initAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('wally_access_token');
      const userJson = localStorage.getItem('wally_user');
      if (token && userJson) {
        try {
          const user = JSON.parse(userJson);
          set({ user, accessToken: token, isAuthenticated: true });
        } catch (e) {
          localStorage.removeItem('wally_user');
        }
      }
    }
  },
}));
