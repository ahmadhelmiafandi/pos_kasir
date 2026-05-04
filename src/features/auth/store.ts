import { create } from 'zustand';
import { User } from '../../types/index';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    const saved = localStorage.getItem('agmal_pos_user');
    return saved ? JSON.parse(saved) : null;
  })(),
  isAuthenticated: !!localStorage.getItem('agmal_pos_user'),
  
  login: (user) => {
    localStorage.setItem('agmal_pos_user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('agmal_pos_user');
    set({ user: null, isAuthenticated: false });
  },
}));
