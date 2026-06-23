import { create } from 'zustand';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { UserSession } from '@/types';

interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Luôn khởi tạo null để khớp với HTML do Server render (SSR không có cookie),
  // tránh lỗi Hydration mismatch. Session thật được nạp lại qua hydrate() sau khi mount.
  user: null,
  isAuthenticated: false,

  hydrate: () => {
    const token = Cookies.get('token');
    if (!token) return;
    try {
      const decoded = jwtDecode<UserSession>(token);
      set({ user: decoded, isAuthenticated: true });
    } catch (error) {
      console.error(error);
    }
  },

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
