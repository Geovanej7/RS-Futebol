import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Usuario } from '@/entities/athlete';

interface AuthState {
  user: Usuario | null;
  token: string | null;
  login: (user: Usuario, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'bip-auth' },
  ),
);
