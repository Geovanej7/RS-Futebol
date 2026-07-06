import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_PERMISSOES, type Modulo, type NivelAcesso } from '@/lib/permissions';
import type { PerfilAcesso } from '@/entities/athlete';

type Overrides = Partial<Record<PerfilAcesso, Partial<Record<Modulo, NivelAcesso>>>>;

interface PermissionsState {
  overrides: Overrides;
  setPermissao: (perfil: PerfilAcesso, modulo: Modulo, nivel: NivelAcesso) => void;
}

export const usePermissionsStore = create<PermissionsState>()(
  persist(
    (set) => ({
      overrides: {},
      setPermissao: (perfil, modulo, nivel) =>
        set((state) => ({
          overrides: {
            ...state.overrides,
            [perfil]: { ...state.overrides[perfil], [modulo]: nivel },
          },
        })),
    }),
    { name: 'bip-permissions' },
  ),
);

export function useEffectivePermissions(): Record<PerfilAcesso, Record<Modulo, NivelAcesso>> {
  const overrides = usePermissionsStore((s) => s.overrides);

  const merged = {} as Record<PerfilAcesso, Record<Modulo, NivelAcesso>>;
  for (const perfil of Object.keys(DEFAULT_PERMISSOES) as PerfilAcesso[]) {
    merged[perfil] = { ...DEFAULT_PERMISSOES[perfil], ...overrides[perfil] };
  }
  return merged;
}
