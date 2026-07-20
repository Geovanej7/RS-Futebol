import { useMemo, useState } from 'react';
import { Users, Gauge, TrendingUp, Star, FileDown } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { KpiCard } from '@/components/ui/kpi-card';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PlayerCardCompact } from '@/components/player-card/player-card-compact';
import { useAthletes, useEvaluations } from '@/hooks/use-athletes';
import { calcularIda, classificarIda, calcularTendencia, mediaGeral } from '@/lib/calculations';
import { CATEGORIAS, type Categoria, type Atleta } from '@/entities/athlete';
import { useUiStore } from '@/store/ui-store';
import { useSettingsStore } from '@/store/settings-store';
import { exportarRelatorioExecutivoPDF } from '@/lib/exports';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const IDA_COLORS: Record<string, string> = {
  Elite: '#8b5cf6',
  'Alto Potencial': '#3b82f6',
  'Em Desenvolvimento': '#06b6d4',
  'Necessita Desenvolvimento': '#facc15',
  'Acompanhamento Intensivo': '#ef4444',
};

export function DashboardPage() {
  const { data: atletas, isLoading } = useAthletes();
  const { data: avaliacoes } = useEvaluations();
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria | 'Todas'>('Todas');
  const setSelectedAthleteId = useUiStore((s) => s.setSelectedAthleteId);
  const nomePlataforma = useSettingsStore((s) => s.nomePlataforma);

  const atletasFiltrados = useMemo(() => {
    if (!atletas) return [];
    return categoriaFiltro === 'Todas' ? atletas : atletas.filter((a) => a.categoria === categoriaFiltro);
  }, [atletas, categoriaFiltro]);

  const stats = useMemo(() => {
    if (atletasFiltrados.length === 0) {
      return { total: 0, mediaGeral: 0, idaMedio: 0, destaque: null as null | { nome: string; ida: number } };
    }
    const medias = atletasFiltrados.map((a) => mediaGeral(a.ratings));
    const idas = atletasFiltrados.map((a) => ({ atleta: a, ida: calcularIda(a.ratings) }));
    const destaque = idas.reduce((max, cur) => (cur.ida > max.ida ? cur : max), idas[0]);
    return {
      total: atletasFiltrados.length,
      mediaGeral: medias.reduce((s, v) => s + v, 0) / medias.length,
      idaMedio: idas.reduce((s, v) => s + v.ida, 0) / idas.length,
      destaque: { nome: destaque.atleta.nome, ida: destaque.ida },
    };
  }, [atletasFiltrados]);

  const evolucaoMensal = useMemo(() => {
    if (atletasFiltrados.length === 0) return [];
    const meses = atletasFiltrados[0]?.historico.map((h) => h.data) ?? [];
    return meses.map((data, idx) => {
      const mediasNoMes = atletasFiltrados.map((a) => a.historico[idx]?.media ?? 0);
      return {
        mes: format(new Date(data), 'MMM', { locale: ptBR }),
        media: Math.round((mediasNoMes.reduce((s, v) => s + v, 0) / mediasNoMes.length) * 100) / 100,
      };
    });
  }, [atletasFiltrados]);

  const distribuicaoIda = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of atletasFiltrados) {
      const classe = classificarIda(calcularIda(a.ratings));
      counts[classe] = (counts[classe] ?? 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [atletasFiltrados]);

  const emEvolucao = useMemo(
    () =>
      [...atletasFiltrados]
        .map((a) => ({ atleta: a, tendencia: calcularTendencia(a.historico) }))
        .sort((a, b) => b.tendencia - a.tendencia)
        .slice(0, 4),
    [atletasFiltrados],
  );

  const emQueda = useMemo(
    () =>
      [...atletasFiltrados]
        .map((a) => ({ atleta: a, tendencia: calcularTendencia(a.historico) }))
        .sort((a, b) => a.tendencia - b.tendencia)
        .slice(0, 4),
    [atletasFiltrados],
  );

  const ultimasAvaliacoes = useMemo(() => (avaliacoes ?? []).slice(0, 5), [avaliacoes]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={categoriaFiltro}
          onValueChange={(v) => setCategoriaFiltro(v as Categoria | 'Todas')}
          ariaLabel="Filtrar por categoria"
          triggerClassName="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue sm:w-56"
          options={[{ value: 'Todas', label: 'Todas as categorias' }, ...CATEGORIAS.map((c) => ({ value: c, label: c }))]}
        />

        <button
          type="button"
          onClick={async () => {
            await exportarRelatorioExecutivoPDF(atletasFiltrados, nomePlataforma);
            toast.success('Relatório executivo gerado com sucesso');
          }}
          className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-alt"
        >
          <FileDown size={16} />
          Relatório
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <KpiCard label="Total de Atletas" value={String(stats.total)} icon={Users} tone="blue" />
        <KpiCard label="Média Geral" value={stats.mediaGeral.toFixed(1)} icon={Gauge} tone="purple" />
        <KpiCard label="IDA Médio" value={stats.idaMedio.toFixed(1)} icon={TrendingUp} tone="green" />
        <KpiCard
          label="Destaque do Mês"
          value={stats.destaque?.nome.split(' ')[0] ?? '—'}
          icon={Star}
          tone="yellow"
          trend={stats.destaque ? `IDA ${stats.destaque.ida.toFixed(1)}` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">Evolução da média geral</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={evolucaoMensal}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="mes" stroke="var(--color-text-muted)" fontSize={12} />
              <YAxis domain={[0, 10]} stroke="var(--color-text-muted)" fontSize={12} width={28} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="media" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">Distribuição por IDA</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={distribuicaoIda} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {distribuicaoIda.map((entry) => (
                  <Cell key={entry.name} fill={IDA_COLORS[entry.name] ?? '#6b7280'} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AthleteMiniList
          title="Em Evolução"
          items={emEvolucao.map((e) => ({
            atleta: e.atleta,
            valor: `+${e.tendencia.toFixed(2)}`,
            tone: 'green' as const,
          }))}
          onSelect={setSelectedAthleteId}
        />
        <AthleteMiniList
          title="Em Queda"
          items={emQueda.map((e) => ({
            atleta: e.atleta,
            valor: e.tendencia.toFixed(2),
            tone: 'red' as const,
          }))}
          onSelect={setSelectedAthleteId}
        />
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">Últimas Avaliações</h2>
          {ultimasAvaliacoes.length === 0 ? (
            <EmptyState icon={Gauge} title="Sem avaliações recentes" />
          ) : (
            <ul className="space-y-2">
              {ultimasAvaliacoes.map((av) => (
                <li key={av.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm">
                  <span className="text-text-secondary">{av.avaliador}</span>
                  <span className="text-text-muted">{format(new Date(av.data), 'dd/MM/yy')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function AthleteMiniList({
  title,
  items,
  onSelect,
}: {
  title: string;
  items: { atleta: Atleta; valor: string; tone: 'green' | 'red' }[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <h2 className="mb-3 text-sm font-semibold text-text-primary">{title}</h2>
      {items.length === 0 ? (
        <EmptyState icon={TrendingUp} title="Nada por aqui" />
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.atleta.id}>
              <PlayerCardCompact
                atleta={item.atleta}
                onClick={() => onSelect(item.atleta.id)}
                rightSlot={
                  <span className={item.tone === 'green' ? 'text-accent-green text-sm' : 'text-accent-red text-sm'}>
                    {item.valor}
                  </span>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
