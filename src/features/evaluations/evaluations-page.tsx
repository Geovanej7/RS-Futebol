import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ClipboardList, Plus, Search } from 'lucide-react';
import { useAthletes, useEvaluations } from '@/hooks/use-athletes';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { RarityUpCelebration } from '@/components/player-card/rarity-up-celebration';
import { NewEvaluationDialog } from './new-evaluation-dialog';
import { useAuthStore } from '@/store/auth-store';
import { useEffectivePermissions } from '@/store/permissions-store';
import { hasAccess } from '@/lib/permissions';
import type { Raridade } from '@/lib/rarity';
import type { Atleta, Avaliacao } from '@/entities/athlete';

const PAGE_SIZE = 15;

function mediaGeralDaAvaliacao(av: Avaliacao): number {
  return (av.mediaTecnica + av.mediaFisica + av.mediaTatica + av.mediaPsico) / 4;
}

export function EvaluationsPage() {
  const { data: avaliacoes, isLoading } = useEvaluations();
  const { data: atletas } = useAthletes();
  const user = useAuthStore((s) => s.user);
  const permissoes = useEffectivePermissions();
  const podeEscrever = !!user && hasAccess(permissoes, user.perfil, 'avaliacoes', 'escrita');

  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState('');
  const [novaAvaliacaoOpen, setNovaAvaliacaoOpen] = useState(false);
  const [celebracao, setCelebracao] = useState<{ atleta: Atleta; raridade: Raridade } | null>(null);

  const atletaById = useMemo(() => {
    const map = new Map<string, Atleta>();
    for (const a of atletas ?? []) map.set(a.id, a);
    return map;
  }, [atletas]);

  const filtradas = useMemo(() => {
    if (!avaliacoes) return [];
    const termo = busca.trim().toLowerCase();
    if (!termo) return avaliacoes;
    return avaliacoes.filter((av) => atletaById.get(av.atletaId)?.nome.toLowerCase().includes(termo));
  }, [avaliacoes, busca, atletaById]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE));
  const pagina = filtradas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const onBuscaChange = (valor: string) => {
    setBusca(valor);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-text-primary">Avaliações</h2>
        {podeEscrever && (
          <button
            type="button"
            onClick={() => setNovaAvaliacaoOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-accent-blue px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus size={16} />
            Nova avaliação
          </button>
        )}
      </div>

      <NewEvaluationDialog
        open={novaAvaliacaoOpen}
        onOpenChange={setNovaAvaliacaoOpen}
        onRarityUp={(atleta, raridade) => setCelebracao({ atleta, raridade })}
      />
      {celebracao && (
        <RarityUpCelebration
          atleta={celebracao.atleta}
          raridade={celebracao.raridade}
          onDone={() => setCelebracao(null)}
        />
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : !avaliacoes || avaliacoes.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Nenhuma avaliação registrada" />
      ) : (
        <>
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={busca}
              onChange={(e) => onBuscaChange(e.target.value)}
              placeholder="Buscar por nome do atleta..."
              aria-label="Buscar avaliações por nome do atleta"
              className="w-full rounded-lg border border-border bg-surface-alt py-2 pl-8 pr-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none"
            />
          </div>

          {filtradas.length === 0 ? (
            <EmptyState icon={Search} title="Nenhuma avaliação encontrada" description="Ajuste a busca para ver resultados." />
          ) : (
            <>
              {/* Mobile / tablet: lista de cards — a tabela densa não cabe numa tela pequena */}
              <ul className="space-y-2.5 md:hidden">
                {pagina.map((av) => {
                  const atleta = atletaById.get(av.atletaId);
                  const geral = mediaGeralDaAvaliacao(av);
                  return (
                    <li key={av.id} className="rounded-xl border border-border bg-surface p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <Avatar name={atleta?.nome ?? '?'} src={atleta?.avatarUrl} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-text-primary">{atleta?.nome ?? '—'}</p>
                            <p className="truncate text-xs text-text-muted">{av.avaliador}</p>
                          </div>
                        </div>
                        <span className="shrink-0 text-xs text-text-muted">
                          {format(new Date(av.data), 'dd/MM/yy', { locale: ptBR })}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-4 gap-1 text-center">
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{av.mediaTecnica.toFixed(1)}</p>
                          <p className="text-[10px] text-text-muted">Técnica</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{av.mediaFisica.toFixed(1)}</p>
                          <p className="text-[10px] text-text-muted">Física</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{av.mediaTatica.toFixed(1)}</p>
                          <p className="text-[10px] text-text-muted">Tática</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{av.mediaPsico.toFixed(1)}</p>
                          <p className="text-[10px] text-text-muted">Psico</p>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2">
                        <span className="text-xs text-text-muted">Média geral</span>
                        <span className="text-base font-bold text-accent-blue">{geral.toFixed(1)}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Desktop: tabela densa */}
              <div className="hidden overflow-x-auto rounded-2xl border border-border bg-surface md:block">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-border text-xs uppercase text-text-muted">
                    <tr>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3">Atleta</th>
                      <th className="px-4 py-3">Avaliador</th>
                      <th className="px-4 py-3">Técnica</th>
                      <th className="px-4 py-3">Física</th>
                      <th className="px-4 py-3">Tática</th>
                      <th className="px-4 py-3">Psico</th>
                      <th className="px-4 py-3">Geral</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pagina.map((av) => {
                      const geral = mediaGeralDaAvaliacao(av);
                      return (
                        <tr key={av.id} className="hover:bg-surface-alt">
                          <td className="whitespace-nowrap px-4 py-2.5 text-text-secondary">
                            {format(new Date(av.data), 'dd/MM/yyyy')}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5 font-medium text-text-primary">
                            {atletaById.get(av.atletaId)?.nome ?? '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-text-secondary">{av.avaliador}</td>
                          <td className="px-4 py-2.5">{av.mediaTecnica.toFixed(1)}</td>
                          <td className="px-4 py-2.5">{av.mediaFisica.toFixed(1)}</td>
                          <td className="px-4 py-2.5">{av.mediaTatica.toFixed(1)}</td>
                          <td className="px-4 py-2.5">{av.mediaPsico.toFixed(1)}</td>
                          <td className="px-4 py-2.5 font-semibold text-text-primary">{geral.toFixed(1)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-sm text-text-secondary">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
                >
                  Anterior
                </button>
                <span>
                  Página {page} de {totalPaginas}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPaginas}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
                >
                  Próxima
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
