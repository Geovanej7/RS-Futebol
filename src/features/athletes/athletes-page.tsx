import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowUpDown, ChevronRight, Download, LayoutGrid, Plus, Rows3, Search, SlidersHorizontal, X } from 'lucide-react';
import { useAthletes } from '@/hooks/use-athletes';
import { Avatar } from '@/components/ui/avatar';
import { Badge, idaTone, statusTone } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayerCard } from '@/components/player-card/player-card';
import { PlayerCardSkeleton } from '@/components/player-card/player-card-skeleton';
import { EmptyFieldState } from './empty-field-state';
import { AthletesFiltersSheet } from './athletes-filters-sheet';
import { calcularIda, calcularIdade, calcularIndicador, classificarIda, mediaGeral } from '@/lib/calculations';
import { calcularRaridade, type Raridade } from '@/lib/rarity';
import { exportarBaseExcel } from '@/lib/exports';
import { type Categoria, type Posicao, type StatusAtleta } from '@/entities/athlete';
import { useUiStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { useEffectivePermissions } from '@/store/permissions-store';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { hasAccess } from '@/lib/permissions';
import { cn } from '@/lib/cn';
import { NewAthleteDialog } from './new-athlete-dialog';

type Ordenacao = 'ida' | 'nome' | 'idade' | 'media';
type Visualizacao = 'grade' | 'tabela';

const ORDENACAO_OPTIONS: { value: Ordenacao; label: string }[] = [
  { value: 'ida', label: 'Ordenar: IDA' },
  { value: 'nome', label: 'Ordenar: Nome' },
  { value: 'idade', label: 'Ordenar: Idade' },
  { value: 'media', label: 'Ordenar: Média' },
];

const CATEGORIA_PADRAO = 'Todas';
const POSICAO_PADRAO = 'Todas';
const STATUS_PADRAO = 'Todos';
const RARIDADE_PADRAO = 'Todas';

export function AthletesPage() {
  const { data: atletas, isLoading } = useAthletes();
  const setSelectedAthleteId = useUiStore((s) => s.setSelectedAthleteId);
  const user = useAuthStore((s) => s.user);
  const permissoes = useEffectivePermissions();
  const podeEscrever = !!user && hasAccess(permissoes, user.perfil, 'atletas', 'escrita');
  const [novoAtletaOpen, setNovoAtletaOpen] = useState(false);
  const [filtrosOpen, setFiltrosOpen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const [visualizacao, setVisualizacao] = useState<Visualizacao>('tabela');
  const [busca, setBusca] = useState(() => new URLSearchParams(window.location.search).get('busca') ?? '');
  const [categoria, setCategoria] = useState<Categoria | 'Todas'>(CATEGORIA_PADRAO);
  const [posicao, setPosicao] = useState<Posicao | 'Todas'>(POSICAO_PADRAO);
  const [status, setStatus] = useState<StatusAtleta | 'Todos'>(STATUS_PADRAO);
  const [raridade, setRaridade] = useState<Raridade | 'Todas'>(RARIDADE_PADRAO);
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('ida');

  const filtrosAtivos: { chave: string; rotulo: string; limpar: () => void }[] = [
    categoria !== CATEGORIA_PADRAO && { chave: 'categoria', rotulo: categoria as string, limpar: () => setCategoria(CATEGORIA_PADRAO) },
    posicao !== POSICAO_PADRAO && { chave: 'posicao', rotulo: posicao as string, limpar: () => setPosicao(POSICAO_PADRAO) },
    status !== STATUS_PADRAO && { chave: 'status', rotulo: status as string, limpar: () => setStatus(STATUS_PADRAO) },
    raridade !== RARIDADE_PADRAO && { chave: 'raridade', rotulo: raridade as string, limpar: () => setRaridade(RARIDADE_PADRAO) },
  ].filter((f): f is { chave: string; rotulo: string; limpar: () => void } => !!f);

  const limparTodosFiltros = () => {
    setCategoria(CATEGORIA_PADRAO);
    setPosicao(POSICAO_PADRAO);
    setStatus(STATUS_PADRAO);
    setRaridade(RARIDADE_PADRAO);
  };

  // Decoração (cálculos de negócio) só recalcula quando os dados dos atletas mudam de verdade —
  // não a cada tecla digitada na busca ou troca de ordenação/filtro.
  const decorados = useMemo(() => {
    if (!atletas) return [];
    return atletas.map((atleta) => ({
      atleta,
      idade: calcularIdade(atleta.dataNascimento),
      media: mediaGeral(atleta.ratings),
      ida: calcularIda(atleta.ratings),
      indicador: calcularIndicador(atleta),
      raridade: calcularRaridade(atleta),
    }));
  }, [atletas]);

  const linhas = useMemo(() => {
    let lista = decorados;

    if (busca.trim()) {
      const termo = busca.trim().toLowerCase();
      lista = lista.filter((l) => l.atleta.nome.toLowerCase().includes(termo));
    }
    if (categoria !== 'Todas') lista = lista.filter((l) => l.atleta.categoria === categoria);
    if (posicao !== 'Todas') lista = lista.filter((l) => l.atleta.posicao === posicao);
    if (status !== 'Todos') lista = lista.filter((l) => l.atleta.status === status);
    if (raridade !== 'Todas') lista = lista.filter((l) => l.raridade === raridade);

    return [...lista].sort((a, b) => {
      switch (ordenacao) {
        case 'nome':
          return a.atleta.nome.localeCompare(b.atleta.nome);
        case 'idade':
          return b.idade - a.idade;
        case 'media':
          return b.media - a.media;
        default:
          return b.ida - a.ida;
      }
    });
  }, [decorados, busca, categoria, posicao, status, raridade, ordenacao]);

  const handleActivate = useCallback((atletaId: string) => setSelectedAthleteId(atletaId), [setSelectedAthleteId]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Elenco</h2>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Exportar"
            onClick={async () => {
              await exportarBaseExcel(atletas ?? []);
              toast.success('Base exportada com sucesso');
            }}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary hover:bg-surface-alt"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Exportar</span>
          </button>
          {podeEscrever && (
            <button
              type="button"
              onClick={() => setNovoAtletaOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-accent-blue px-3 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              <Plus size={16} />
              Novo atleta
            </button>
          )}
        </div>
      </div>

      <NewAthleteDialog open={novoAtletaOpen} onOpenChange={setNovoAtletaOpen} />
      <AthletesFiltersSheet
        open={filtrosOpen}
        onOpenChange={setFiltrosOpen}
        categoria={categoria}
        setCategoria={setCategoria}
        posicao={posicao}
        setPosicao={setPosicao}
        status={status}
        setStatus={setStatus}
        raridade={raridade}
        setRaridade={setRaridade}
        onLimpar={limparTodosFiltros}
        totalAtivos={filtrosAtivos.length}
      />

      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome..."
          aria-label="Buscar por nome"
          className="w-full rounded-lg border border-border bg-surface-alt py-2 pl-8 pr-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFiltrosOpen(true)}
          className="relative flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm font-medium text-text-primary hover:bg-surface"
        >
          <SlidersHorizontal size={14} />
          Filtros
          {filtrosAtivos.length > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-blue px-1 text-[10px] font-semibold text-white">
              {filtrosAtivos.length}
            </span>
          )}
        </button>

        <div className="relative min-w-0 flex-1">
          <ArrowUpDown size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
            aria-label="Ordenar por"
            className="w-full rounded-lg border border-border bg-surface-alt py-2 pl-7 pr-2 text-xs font-medium text-text-primary sm:text-sm"
          >
            {ORDENACAO_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex shrink-0 rounded-lg border border-border bg-surface-alt p-0.5">
          <button
            type="button"
            onClick={() => setVisualizacao('tabela')}
            aria-pressed={visualizacao === 'tabela'}
            aria-label="Visualização em tabela"
            className={cn(
              'flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium',
              visualizacao === 'tabela' ? 'bg-accent-blue text-white' : 'text-text-secondary',
            )}
          >
            <Rows3 size={14} />
          </button>
          <button
            type="button"
            onClick={() => setVisualizacao('grade')}
            aria-pressed={visualizacao === 'grade'}
            aria-label="Visualização em grade de cards"
            className={cn(
              'flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium',
              visualizacao === 'grade' ? 'bg-accent-blue text-white' : 'text-text-secondary',
            )}
          >
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

      {filtrosAtivos.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {filtrosAtivos.map((f) => (
            <button
              key={f.chave}
              type="button"
              onClick={f.limpar}
              aria-label={`Remover filtro ${f.rotulo}`}
              className="flex items-center gap-1 rounded-full border border-accent-blue/30 bg-accent-blue/10 py-1 pl-2.5 pr-1.5 text-xs font-medium text-accent-blue"
            >
              {f.rotulo}
              <X size={12} />
            </button>
          ))}
          <button type="button" onClick={limparTodosFiltros} className="text-xs text-text-muted underline hover:text-text-secondary">
            Limpar tudo
          </button>
        </div>
      )}

      {isLoading ? (
        visualizacao === 'grade' ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <PlayerCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        )
      ) : linhas.length === 0 ? (
        <EmptyFieldState title="Nenhum atleta encontrado" description="Ajuste a busca ou os filtros para ver resultados." />
      ) : visualizacao === 'grade' ? (
        <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
          {linhas.map(({ atleta, raridade: raridadeAtleta }, i) => {
            const destacar = ordenacao === 'ida' && raridadeAtleta === 'Elite';
            return (
              <motion.div
                key={atleta.id}
                initial={reducedMotion ? false : { opacity: 0, y: 30, rotate: -3 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: reducedMotion ? 0 : Math.min(i, 12) * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={destacar ? 'scale-[1.07]' : undefined}
              >
                <PlayerCard atleta={atleta} onActivate={handleActivate} />
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <ul role="list" className="divide-y divide-border">
            {linhas.map(({ atleta, idade, media, ida, indicador }) => (
              <li key={atleta.id}>
                <button
                  type="button"
                  onClick={() => handleActivate(atleta.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-alt"
                >
                  <Avatar name={atleta.nome} src={atleta.avatarUrl} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{atleta.nome}</p>
                    <p className="truncate text-xs text-text-muted">
                      {atleta.cidade} · {atleta.categoria} · {atleta.posicao} · {idade} anos
                    </p>
                  </div>
                  <div className="hidden flex-col items-end gap-1 sm:flex">
                    <span className="text-sm font-semibold text-text-primary">{media.toFixed(1)}</span>
                    <span className="text-[11px] text-text-muted">média</span>
                  </div>
                  <div className="hidden flex-wrap justify-end gap-1 md:flex">
                    <Badge tone={idaTone(classificarIda(ida))}>{classificarIda(ida)}</Badge>
                    <Badge tone={statusTone(atleta.status)}>{atleta.status}</Badge>
                  </div>
                  <span className="hidden text-xs sm:inline">{indicador.emoji}</span>
                  <ChevronRight size={18} className="shrink-0 text-text-muted" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
