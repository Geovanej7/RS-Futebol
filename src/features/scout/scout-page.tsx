import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Eye, Search, Send } from 'lucide-react';
import { useAthletes } from '@/hooks/use-athletes';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PlayerCard } from '@/components/player-card/player-card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { calcularIda, calcularTendencia } from '@/lib/calculations';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { useEffectivePermissions } from '@/store/permissions-store';
import { hasAccess } from '@/lib/permissions';
import { CATEGORIAS, POSICOES, type Atleta, type Categoria, type Posicao } from '@/entities/athlete';

export function ScoutPage() {
  const { data: atletas, isLoading } = useAthletes();
  const user = useAuthStore((s) => s.user);
  const permissoes = useEffectivePermissions();
  const podeEscrever = !!user && hasAccess(permissoes, user.perfil, 'scout', 'escrita');

  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState<Categoria | 'Todas'>('Todas');
  const [posicao, setPosicao] = useState<Posicao | 'Todas'>('Todas');

  const filtrados = useMemo(() => {
    let lista = atletas ?? [];
    if (busca.trim()) {
      const termo = busca.trim().toLowerCase();
      lista = lista.filter((a) => a.nome.toLowerCase().includes(termo));
    }
    if (categoria !== 'Todas') lista = lista.filter((a) => a.categoria === categoria);
    if (posicao !== 'Todas') lista = lista.filter((a) => a.posicao === posicao);
    return lista;
  }, [atletas, busca, categoria, posicao]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-text-primary">Scout</h2>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="relative col-span-2 sm:col-span-2">
          <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar atleta..."
            aria-label="Buscar atleta no scout"
            className="w-full rounded-lg border border-border bg-surface-alt py-2 pl-8 pr-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none"
          />
        </div>
        <Select
          value={categoria}
          onValueChange={(v) => setCategoria(v as Categoria | 'Todas')}
          ariaLabel="Filtrar por categoria"
          options={[{ value: 'Todas', label: 'Categoria' }, ...CATEGORIAS.map((c) => ({ value: c, label: c }))]}
        />
        <Select
          value={posicao}
          onValueChange={(v) => setPosicao(v as Posicao | 'Todas')}
          ariaLabel="Filtrar por posição"
          options={[{ value: 'Todas', label: 'Posição' }, ...POSICOES.map((p) => ({ value: p, label: p }))]}
        />
      </div>

      {filtrados.length === 0 ? (
        <EmptyState icon={Eye} title="Nenhum atleta encontrado" description="Ajuste a busca ou os filtros." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((atleta) => (
            <ScoutCard key={atleta.id} atleta={atleta} podeEscrever={podeEscrever} />
          ))}
        </div>
      )}
    </div>
  );
}

function ScoutCard({ atleta, podeEscrever }: { atleta: Atleta; podeEscrever: boolean }) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      apiClient.post(`/api/athletes/${atleta.id}/scout-notes`, { texto, autor: user?.nome ?? 'Scout' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      toast.success('Observação registrada');
      setTexto('');
      setAberto(false);
    },
    onError: () => toast.error('Não foi possível registrar a observação'),
  });

  const ida = calcularIda(atleta.ratings);
  const tendencia = calcularTendencia(atleta.historico);

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-4">
      <div className="flex justify-center">
        <PlayerCard atleta={atleta} size="md" />
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-1">
        {ida >= 8 && <Badge tone="purple">Alto Potencial</Badge>}
        {tendencia > 0.05 && <Badge tone="green">Evoluindo</Badge>}
      </div>

      {atleta.notasScout.length === 0 ? (
        <p className="mt-3 text-xs text-text-muted">Nenhuma observação registrada ainda.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {atleta.notasScout.map((nota) => (
            <blockquote key={nota.id} className="border-l-2 border-accent-blue/40 pl-3 text-xs italic text-text-secondary">
              “{nota.texto}”
              <footer className="mt-0.5 not-italic text-[10px] text-text-muted">
                {nota.autor} · {new Date(nota.data).toLocaleDateString('pt-BR')}
              </footer>
            </blockquote>
          ))}
        </div>
      )}

      {podeEscrever && (
        <div className="mt-3">
          {aberto ? (
            <div className="space-y-2">
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escreva sua observação..."
                rows={3}
                className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-xs text-text-primary focus:border-accent-blue focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!texto.trim() || mutation.isPending}
                  onClick={() => mutation.mutate()}
                  className="flex items-center gap-1.5 rounded-lg bg-accent-blue px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                >
                  <Send size={12} />
                  Enviar
                </button>
                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-alt"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAberto(true)}
              className="text-xs font-medium text-accent-blue hover:underline"
            >
              + Nova observação
            </button>
          )}
        </div>
      )}
    </div>
  );
}
