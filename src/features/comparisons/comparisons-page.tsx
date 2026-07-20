import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, X, GitCompare } from 'lucide-react';
import { PlayerCard } from '@/components/player-card/player-card';
import { Select } from '@/components/ui/select';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useAthletes } from '@/hooks/use-athletes';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  calcularIda,
  mediaFisica,
  mediaPsico,
  mediaTatica,
  mediaTecnica,
} from '@/lib/calculations';
import type { Atleta } from '@/entities/athlete';

const CORES = ['#3b82f6', '#8b5cf6', '#22c55e', '#facc15'];
const ATRIBUTOS_DETALHE: { chave: string; grupo: 'tecnica' | 'fisica' }[] = [
  { chave: 'Passe', grupo: 'tecnica' },
  { chave: 'Finalização', grupo: 'tecnica' },
  { chave: 'Velocidade', grupo: 'fisica' },
  { chave: 'Força', grupo: 'fisica' },
  { chave: 'Resistência', grupo: 'fisica' },
  { chave: 'Visão de jogo', grupo: 'tecnica' },
];

export function ComparisonsPage() {
  const { data: atletas, isLoading } = useAthletes();
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [atletaFromQuery] = useState(() => new URLSearchParams(window.location.search).get('atleta'));
  const aplicouQueryRef = useRef(false);

  useEffect(() => {
    if (aplicouQueryRef.current || !atletaFromQuery || !atletas) return;
    aplicouQueryRef.current = true;
    if (!atletas.some((a) => a.id === atletaFromQuery)) return;
    const outro = atletas.find((a) => a.id !== atletaFromQuery)?.id;
    setSelecionados(outro ? [atletaFromQuery, outro] : [atletaFromQuery]);
  }, [atletaFromQuery, atletas]);

  const listaInicial = useMemo(() => (atletas ?? []).slice(0, 2).map((a) => a.id), [atletas]);
  const ids = selecionados.length > 0 ? selecionados : listaInicial;

  const atletasSelecionados = useMemo(
    () => ids.map((id) => atletas?.find((a) => a.id === id)).filter((a): a is Atleta => !!a),
    [ids, atletas],
  );

  const radarData = useMemo(() => {
    const categorias: { chave: string; calc: (a: Atleta) => number }[] = [
      { chave: 'Técnica', calc: (a) => mediaTecnica(a.ratings) },
      { chave: 'Física', calc: (a) => mediaFisica(a.ratings) },
      { chave: 'Tática', calc: (a) => mediaTatica(a.ratings) },
      { chave: 'Psicológica', calc: (a) => mediaPsico(a.ratings) },
      { chave: 'IDA', calc: (a) => calcularIda(a.ratings) },
    ];
    return categorias.map(({ chave, calc }) => {
      const linha: Record<string, string | number> = { atributo: chave };
      for (const atleta of atletasSelecionados) linha[atleta.nome] = Math.round(calc(atleta) * 10) / 10;
      return linha;
    });
  }, [atletasSelecionados]);

  const barData = useMemo(
    () =>
      ATRIBUTOS_DETALHE.map(({ chave, grupo }) => {
        const linha: Record<string, string | number> = { atributo: chave };
        for (const atleta of atletasSelecionados) {
          linha[atleta.nome] = atleta.ratings[grupo][chave] ?? 0;
        }
        return linha;
      }),
    [atletasSelecionados],
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (!atletas || atletas.length < 2) {
    return <EmptyState icon={GitCompare} title="É necessário ao menos 2 atletas para comparar" />;
  }

  const atualizarSelecao = (index: number, novoId: string) => {
    const atual = [...ids];
    atual[index] = novoId;
    setSelecionados(atual);
  };

  const adicionarSlot = () => {
    if (ids.length >= 4) return;
    const proximo = atletas.find((a) => !ids.includes(a.id));
    if (proximo) setSelecionados([...ids, proximo.id]);
  };

  const removerSlot = (index: number) => {
    if (ids.length <= 2) return;
    setSelecionados(ids.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Comparativos</h2>
        {ids.length < 4 && (
          <button
            type="button"
            onClick={adicionarSlot}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-surface-alt"
          >
            <Plus size={15} />
            Adicionar atleta
          </button>
        )}
      </div>

      {atletasSelecionados.length === 2 ? (
        <div className="relative flex items-center justify-center gap-0 overflow-x-auto py-4">
          <div className="rotate-[-4deg] transition-transform duration-300 hover:rotate-0">
            <PlayerCard atleta={atletasSelecionados[0]} size="lg" />
          </div>
          <div aria-hidden="true" className="mx-3 h-56 w-px shrink-0 bg-border sm:h-72" />
          <div className="rotate-[4deg] transition-transform duration-300 hover:rotate-0">
            <PlayerCard atleta={atletasSelecionados[1]} size="lg" />
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-4 py-4">
          {atletasSelecionados.map((atleta) => (
            <PlayerCard key={atleta.id} atleta={atleta} size="lg" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {ids.map((id, index) => (
          <div key={index} className="flex items-center gap-2">
            <Select
              value={id}
              onValueChange={(v) => atualizarSelecao(index, v)}
              ariaLabel={`Atleta ${index + 1}`}
              options={atletas
                .filter((a) => a.id === id || !ids.includes(a.id))
                .map((a) => ({ value: a.id, label: a.nome }))}
            />
            {ids.length > 2 && (
              <button
                type="button"
                aria-label="Remover atleta"
                onClick={() => removerSlot(index)}
                className="shrink-0 rounded-lg border border-border p-2 text-text-secondary hover:bg-surface-alt hover:text-accent-red"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Radar comparativo</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis dataKey="atributo" tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
              {atletasSelecionados.map((atleta, i) => (
                <Radar
                  key={atleta.id}
                  name={atleta.nome}
                  dataKey={atleta.nome}
                  stroke={CORES[i % CORES.length]}
                  fill={CORES[i % CORES.length]}
                  fillOpacity={0.25}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Atributos detalhados</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="atributo" stroke="var(--color-text-muted)" fontSize={10} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis domain={[0, 10]} stroke="var(--color-text-muted)" fontSize={11} width={28} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {atletasSelecionados.map((atleta, i) => (
                <Bar key={atleta.id} dataKey={atleta.nome} fill={CORES[i % CORES.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
