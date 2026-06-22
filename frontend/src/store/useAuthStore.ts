import { create } from 'zustand';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { UserSession } from '@/types';

interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: (token: string) => {
    Cookies.set('token', token, { expires: 1, path: '/' });
    try {
      const decoded = jwtDecode<UserSession>(token);
      set({ user: decoded, isAuthenticated: true });
    } catch (error) {
      console.error(error);
    }
  },

  logout: () => {
    Cookies.remove('token', { path: '/' });
    set({ user: null, isAuthenticated: false });
  },
}));
