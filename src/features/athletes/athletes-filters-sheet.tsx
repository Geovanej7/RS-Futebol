import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { FilterChips } from '@/components/ui/filter-chips';
import { CATEGORIAS, POSICOES, STATUS_ATLETA, type Categoria, type Posicao, type StatusAtleta } from '@/entities/athlete';
import { RARIDADES_ORDEM, type Raridade } from '@/lib/rarity';

interface AthletesFiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoria: Categoria | 'Todas';
  setCategoria: (v: Categoria | 'Todas') => void;
  posicao: Posicao | 'Todas';
  setPosicao: (v: Posicao | 'Todas') => void;
  status: StatusAtleta | 'Todos';
  setStatus: (v: StatusAtleta | 'Todos') => void;
  raridade: Raridade | 'Todas';
  setRaridade: (v: Raridade | 'Todas') => void;
  onLimpar: () => void;
  totalAtivos: number;
}

export function AthletesFiltersSheet({
  open,
  onOpenChange,
  categoria,
  setCategoria,
  posicao,
  setPosicao,
  status,
  setStatus,
  raridade,
  setRaridade,
  onLimpar,
  totalAtivos,
}: AthletesFiltersSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 max-h-[82vh] overflow-y-auto rounded-t-2xl border-t border-border bg-bg p-4 outline-none sm:left-1/2 sm:bottom-auto sm:top-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border"
        >
          <div className="mb-3 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-text-primary">Filtros</Dialog.Title>
            <Dialog.Close aria-label="Fechar filtros" className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-alt">
              <X size={18} />
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <FilterChips
              label="Categoria"
              value={categoria}
              onChange={setCategoria}
              options={[{ value: 'Todas', label: 'Todas' }, ...CATEGORIAS.map((c) => ({ value: c, label: c }))]}
            />
            <FilterChips
              label="Posição"
              value={posicao}
              onChange={setPosicao}
              options={[{ value: 'Todas', label: 'Todas' }, ...POSICOES.map((p) => ({ value: p, label: p }))]}
            />
            <FilterChips
              label="Status"
              value={status}
              onChange={setStatus}
              options={[{ value: 'Todos', label: 'Todos' }, ...STATUS_ATLETA.map((s) => ({ value: s, label: s }))]}
            />
            <FilterChips
              label="Raridade"
              value={raridade}
              onChange={setRaridade}
              options={[{ value: 'Todas', label: 'Todas' }, ...RARIDADES_ORDEM.map((r) => ({ value: r, label: r }))]}
            />
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              disabled={totalAtivos === 0}
              onClick={onLimpar}
              className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-alt disabled:opacity-40"
            >
              Limpar filtros{totalAtivos > 0 ? ` (${totalAtivos})` : ''}
            </button>
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex-1 rounded-lg bg-accent-blue py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Ver resultados
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
