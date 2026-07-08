import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GitCompare, Pencil, Trash2, X } from 'lucide-react';
import { useUiStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { useEffectivePermissions } from '@/store/permissions-store';
import { hasAccess } from '@/lib/permissions';
import { apiClient } from '@/lib/api-client';
import { useAthlete } from '@/hooks/use-athletes';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PlayerCard } from '@/components/player-card/player-card';
import { RarityUpCelebration } from '@/components/player-card/rarity-up-celebration';
import { calcularRaridade, RARIDADE_CONFIG, type Raridade } from '@/lib/rarity';
import { cn } from '@/lib/cn';
import type { Atleta } from '@/entities/athlete';
import {
  ATRIBUTOS_FISICA,
  ATRIBUTOS_PSICO,
  ATRIBUTOS_TATICA,
  ATRIBUTOS_TECNICA,
} from '@/entities/athlete';
import { ProfileTab } from './profile-tab';
import { RatingTab } from './rating-tab';
import { MedicalTab } from './medical-tab';
import { TimelineTab } from './timeline-tab';
import { EditAthleteDialog } from '@/features/athletes/edit-athlete-dialog';

const TABS = [
  { value: 'perfil', label: 'Perfil' },
  { value: 'tecnica', label: 'Técnica' },
  { value: 'fisica', label: 'Física' },
  { value: 'tatica', label: 'Tática' },
  { value: 'psico', label: 'Psicológica' },
  { value: 'medica', label: 'Médica' },
  { value: 'timeline', label: 'Timeline' },
];

export function AthleteDrawer() {
  const selectedAthleteId = useUiStore((s) => s.selectedAthleteId);
  const setSelectedAthleteId = useUiStore((s) => s.setSelectedAthleteId);
  const { data: atleta, isLoading } = useAthlete(selectedAthleteId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const permissoes = useEffectivePermissions();
  const podeEscrever = !!user && hasAccess(permissoes, user.perfil, 'atletas', 'escrita');
  const [celebracao, setCelebracao] = useState<{ atleta: Atleta; raridade: Raridade } | null>(null);
  const [editando, setEditando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const open = !!selectedAthleteId;
  const raridade = atleta ? calcularRaridade(atleta) : null;
  const config = raridade ? RARIDADE_CONFIG[raridade] : null;

  const onComparar = () => {
    if (!atleta) return;
    setSelectedAthleteId(null);
    navigate(`/comparativos?atleta=${atleta.id}`);
  };

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete(`/api/athletes/${atleta!.id}`),
    onSuccess: () => {
      // remove (em vez de invalidar) a query desse atleta específico — ele não existe mais,
      // então revalidá-la só geraria um GET /api/athletes/:id fadado a 404.
      queryClient.removeQueries({ queryKey: ['athletes', atleta!.id] });
      queryClient.invalidateQueries({ queryKey: ['athletes'], exact: true });
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      toast.success('Atleta excluído com sucesso');
      setExcluindo(false);
      setSelectedAthleteId(null);
    },
    onError: () => toast.error('Não foi possível excluir o atleta'),
  });

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && setSelectedAthleteId(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-bg outline-none"
        >
          {config && (
            <div
              aria-hidden="true"
              className="pointer-events-none fixed inset-0 opacity-60"
              style={{
                background: `radial-gradient(circle at 15% 10%, ${config.borda}26, transparent 45%), radial-gradient(circle at 85% 90%, ${config.gradiente[0]}26, transparent 45%)`,
              }}
            />
          )}

          {isLoading || !atleta ? (
            <div className="relative space-y-3 p-6">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-40" />
            </div>
          ) : (
            <>
              <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur sm:px-6">
                <div className="min-w-0 flex-1">
                  <Dialog.Title className="truncate text-base font-semibold text-text-primary">
                    {atleta.nome}
                  </Dialog.Title>
                  <p className="truncate text-xs text-text-muted">
                    {atleta.categoria} · {atleta.posicao} · {atleta.cidade}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onComparar}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-surface-alt"
                >
                  <GitCompare size={15} />
                  <span className="hidden sm:inline">Comparar</span>
                </button>
                {podeEscrever && (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditando(true)}
                      className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-surface-alt"
                    >
                      <Pencil size={15} />
                      <span className="hidden sm:inline">Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExcluindo(true)}
                      className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-accent-red hover:bg-surface-alt"
                    >
                      <Trash2 size={15} />
                      <span className="hidden sm:inline">Excluir</span>
                    </button>
                  </>
                )}
                <Dialog.Close
                  aria-label="Fechar perfil"
                  className="rounded-lg p-2 text-text-secondary hover:bg-surface-alt"
                >
                  <X size={20} />
                </Dialog.Close>
              </div>

              <div className="relative flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:flex-row">
                <div className="flex justify-center lg:sticky lg:top-24 lg:block lg:h-fit lg:shrink-0">
                  <PlayerCard atleta={atleta} size="lg" flippable />
                </div>

                <Tabs.Root defaultValue="perfil" className="flex min-w-0 flex-1 flex-col">
                  <Tabs.List className="flex gap-1 overflow-x-auto border-b border-border">
                    {TABS.map((tab) => (
                      <Tabs.Trigger
                        key={tab.value}
                        value={tab.value}
                        className={cn(
                          'shrink-0 border-b-2 border-transparent px-3 py-3 text-sm font-medium text-text-secondary transition-colors',
                          'data-[state=active]:border-accent-blue data-[state=active]:text-accent-blue',
                        )}
                      >
                        {tab.label}
                      </Tabs.Trigger>
                    ))}
                  </Tabs.List>

                  <div className="min-h-0 flex-1 pt-4 sm:pt-6">
                    <Tabs.Content value="perfil">
                      <ProfileTab atleta={atleta} />
                    </Tabs.Content>
                    <Tabs.Content value="tecnica">
                      <RatingTab
                        key={`${atleta.id}-tecnica`}
                        atleta={atleta}
                        grupo="tecnica"
                        atributos={ATRIBUTOS_TECNICA}
                        onRarityUp={(a, r) => setCelebracao({ atleta: a, raridade: r })}
                      />
                    </Tabs.Content>
                    <Tabs.Content value="fisica">
                      <RatingTab
                        key={`${atleta.id}-fisica`}
                        atleta={atleta}
                        grupo="fisica"
                        atributos={ATRIBUTOS_FISICA}
                        onRarityUp={(a, r) => setCelebracao({ atleta: a, raridade: r })}
                      />
                    </Tabs.Content>
                    <Tabs.Content value="tatica">
                      <RatingTab
                        key={`${atleta.id}-tatica`}
                        atleta={atleta}
                        grupo="tatica"
                        atributos={ATRIBUTOS_TATICA}
                        onRarityUp={(a, r) => setCelebracao({ atleta: a, raridade: r })}
                      />
                    </Tabs.Content>
                    <Tabs.Content value="psico">
                      <RatingTab
                        key={`${atleta.id}-psico`}
                        atleta={atleta}
                        grupo="psico"
                        atributos={ATRIBUTOS_PSICO}
                        onRarityUp={(a, r) => setCelebracao({ atleta: a, raridade: r })}
                      />
                    </Tabs.Content>
                    <Tabs.Content value="medica">
                      <MedicalTab atleta={atleta} />
                    </Tabs.Content>
                    <Tabs.Content value="timeline">
                      <TimelineTab atleta={atleta} />
                    </Tabs.Content>
                  </div>
                </Tabs.Root>
              </div>
            </>
          )}
        </Dialog.Content>
        {celebracao && (
          <RarityUpCelebration
            atleta={celebracao.atleta}
            raridade={celebracao.raridade}
            onDone={() => setCelebracao(null)}
          />
        )}
        {atleta && editando && (
          <EditAthleteDialog atleta={atleta} open={editando} onOpenChange={setEditando} />
        )}
        {atleta && (
          <ConfirmDialog
            open={excluindo}
            onOpenChange={setExcluindo}
            title={`Excluir ${atleta.nome}?`}
            description="Essa ação não pode ser desfeita. As avaliações registradas para esse atleta também serão removidas."
            confirmLabel="Excluir"
            isPending={deleteMutation.isPending}
            onConfirm={() => deleteMutation.mutate()}
          />
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
}
