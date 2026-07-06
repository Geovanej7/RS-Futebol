import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface UiState {
  theme: Theme;
  sidebarOpen: boolean;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  selectedAthleteId: string | null;
  setSelectedAthleteId: (id: string | null) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      sidebarOpen: false,
      selectedAthleteId: null,
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSelectedAthleteId: (id) => set({ selectedAthleteId: id }),
    }),
    { name: 'bip-ui', partialize: (state) => ({ theme: state.theme }) },
  ),
);
