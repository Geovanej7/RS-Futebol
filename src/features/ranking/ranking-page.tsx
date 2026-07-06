import { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { useAthletes } from '@/hooks/use-athletes';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayerCardCompact } from '@/components/player-card/player-card-compact';
import { calcularIda, calcularTendencia, mediaFisica, mediaGeral, mediaTecnica } from '@/lib/calculations';
import { useUiStore } from '@/store/ui-store';
import type { Atleta } from '@/entities/athlete';

function RankingList({
  title,
  items,
  onSelect,
}: {
  title: string;
  items: { atleta: Atleta; valor: number }[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Trophy size={15} className="text-accent-yellow" />
        {title}
      </h3>
      <ol className="space-y-1.5">
        {items.map((item, idx) => (
          <li key={item.atleta.id}>
            <PlayerCardCompact
              atleta={item.atleta}
              badge={idx + 1}
              onClick={() => onSelect(item.atleta.id)}
              rightSlot={<span className="text-sm font-semibold text-accent-blue">{item.valor.toFixed(1)}</span>}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}

export function RankingPage() {
  const { data: atletas, isLoading } = useAthletes();
  const setSelectedAthleteId = useUiStore((s) => s.setSelectedAthleteId);

  const rankings = useMemo(() => {
    if (!atletas) return null;
    const top = (fn: (a: Atleta) => number) =>
      [...atletas]
        .map((atleta) => ({ atleta, valor: fn(atleta) }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 10);

    return {
      velocidade: top((a) => a.ratings.fisica['Velocidade'] ?? 0),
      tecnica: top((a) => mediaTecnica(a.ratings)),
      fisico: top((a) => mediaFisica(a.ratings)),
      evolucao: top((a) => calcularTendencia(a.historico)),
      geral: top((a) => mediaGeral(a.ratings)),
      ida: top((a) => calcularIda(a.ratings)),
    };
  }, [atletas]);

  if (isLoading || !rankings) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-text-primary">Ranking</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RankingList title="Velocidade" items={rankings.velocidade} onSelect={setSelectedAthleteId} />
        <RankingList title="Técnica" items={rankings.tecnica} onSelect={setSelectedAthleteId} />
        <RankingList title="Físico" items={rankings.fisico} onSelect={setSelectedAthleteId} />
        <RankingList title="Maior Evolução" items={rankings.evolucao} onSelect={setSelectedAthleteId} />
        <RankingList title="Média Geral" items={rankings.geral} onSelect={setSelectedAthleteId} />
        <RankingList title="IDA" items={rankings.ida} onSelect={setSelectedAthleteId} />
      </div>
    </div>
  );
}
