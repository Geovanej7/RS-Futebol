import { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAthletes } from '@/hooks/use-athletes';
import { useAuthStore } from '@/store/auth-store';
import { SliderField } from '@/components/ui/slider-field';
import { Select } from '@/components/ui/select';
import { mediaFisica, mediaPsico, mediaTatica, mediaTecnica } from '@/lib/calculations';
import { podeEditarGrupo } from '@/lib/permissions';
import { RARIDADES_ORDEM, type Raridade } from '@/lib/rarity';
import type { Atleta } from '@/entities/athlete';

type Grupo = 'tecnica' | 'fisica' | 'tatica' | 'psico';

interface NovaAvaliacaoResponse {
  atleta: Atleta;
  avaliacao: { id: string };
  raridadeAntes: Raridade;
  raridadeDepois: Raridade;
}

const GRUPOS: { grupo: Grupo; label: string; media: (r: Atleta['ratings']) => number }[] = [
  { grupo: 'tecnica', label: 'Técnica', media: mediaTecnica },
  { grupo: 'fisica', label: 'Física', media: mediaFisica },
  { grupo: 'tatica', label: 'Tática', media: mediaTatica },
  { grupo: 'psico', label: 'Psicológica', media: mediaPsico },
];

export function NewEvaluationDialog({
  open,
  onOpenChange,
  onRarityUp,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRarityUp: (atleta: Atleta, raridade: Raridade) => void;
}) {
  const { data: atletas } = useAthletes();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [atletaId, setAtletaId] = useState('');
  const [notas, setNotas] = useState<Partial<Record<Grupo, number>>>({});

  const atletaSelecionado = useMemo(() => atletas?.find((a) => a.id === atletaId), [atletas, atletaId]);

  // ao abrir o dialog sem atleta escolhido ainda, seleciona o primeiro da lista
  useEffect(() => {
    if (open && !atletaId && atletas && atletas.length > 0) {
      setAtletaId(atletas[0].id);
    }
  }, [open, atletas, atletaId]);

  // ao trocar de atleta, os sliders voltam a nascer nos valores atuais das dimensões dele —
  // não tocar num slider significa "não avaliar essa dimensão" (a nota vira a mesma nota atual).
  useEffect(() => {
    if (!atletaSelecionado) return;
    setNotas({
      tecnica: mediaTecnica(atletaSelecionado.ratings),
      fisica: mediaFisica(atletaSelecionado.ratings),
      tatica: mediaTatica(atletaSelecionado.ratings),
      psico: mediaPsico(atletaSelecionado.ratings),
    });
  }, [atletaSelecionado]);

  const mutation = useMutation({
    mutationFn: () =>
      apiClient.post<NovaAvaliacaoResponse>('/api/evaluations', {
        atletaId,
        avaliador: user?.nome ?? 'Avaliador',
        notas,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      onOpenChange(false);
      setAtletaId('');
      setNotas({});

      const subiu = RARIDADES_ORDEM.indexOf(res.raridadeDepois) > RARIDADES_ORDEM.indexOf(res.raridadeAntes);
      if (subiu) {
        onRarityUp(res.atleta, res.raridadeDepois);
      } else {
        toast.success('Avaliação registrada com sucesso');
      }
    },
    onError: () => toast.error('Não foi possível registrar a avaliação'),
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-bg p-5 outline-none sm:p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-text-primary">Nova avaliação</Dialog.Title>
            <Dialog.Close aria-label="Fechar" className="rounded-lg p-1 text-text-secondary hover:bg-surface-alt">
              <X size={18} />
            </Dialog.Close>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            className="space-y-4"
          >
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium text-text-secondary">Atleta</span>
              <Select
                value={atletaId}
                onValueChange={setAtletaId}
                ariaLabel="Selecionar atleta"
                placeholder="Selecione um atleta"
                options={(atletas ?? []).map((a) => ({ value: a.id, label: a.nome }))}
              />
            </label>

            <p className="text-xs text-text-muted">
              Avaliador: <span className="font-medium text-text-secondary">{user?.nome ?? '—'}</span>
            </p>

            <div className="space-y-4 rounded-xl border border-border bg-surface p-3">
              {GRUPOS.map(({ grupo, label, media }) => {
                const podeEditar = !!user && podeEditarGrupo(grupo, user.perfil);
                const valorAtual = atletaSelecionado ? media(atletaSelecionado.ratings) : 0;
                return (
                  <SliderField
                    key={grupo}
                    label={label}
                    value={notas[grupo] ?? valorAtual}
                    disabled={!podeEditar}
                    onChange={(v) => setNotas((prev) => ({ ...prev, [grupo]: v }))}
                  />
                );
              })}
            </div>

            <button
              type="submit"
              disabled={!atletaId || mutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-blue py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
              Salvar avaliação
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
