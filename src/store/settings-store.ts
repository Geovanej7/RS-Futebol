import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Categoria } from '@/entities/athlete';

interface SettingsState {
  nomePlataforma: string;
  categoriaPadrao: Categoria;
  setNomePlataforma: (nome: string) => void;
  setCategoriaPadrao: (categoria: Categoria) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      nomePlataforma: 'RS Futebol Club',
      categoriaPadrao: 'Sub-17',
      setNomePlataforma: (nomePlataforma) => set({ nomePlataforma }),
      setCategoriaPadrao: (categoriaPadrao) => set({ categoriaPadrao }),
    }),
    { name: 'bip-settings' },
  ),
);
