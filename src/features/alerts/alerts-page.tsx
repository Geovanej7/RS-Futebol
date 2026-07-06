import { Bell, HeartPulse, Star, TrendingDown } from 'lucide-react';
import { useAlerts } from '@/hooks/use-alerts';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { useUiStore } from '@/store/ui-store';
import { cn } from '@/lib/cn';

const ICONS = { queda: TrendingDown, medico: HeartPulse, destaque: Star };
const COLORS = {
  queda: 'bg-accent-red/15 text-accent-red',
  medico: 'bg-accent-yellow/15 text-accent-yellow',
  destaque: 'bg-accent-purple/15 text-accent-purple',
};

export function AlertsPage() {
  const alertas = useAlerts();
  const setSelectedAthleteId = useUiStore((s) => s.setSelectedAthleteId);

  if (alertas.length === 0) {
    return <EmptyState icon={Bell} title="Nenhum alerta no momento" description="Tudo certo com o elenco." />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-text-primary">Alertas</h2>
      <ul className="space-y-2">
        {alertas.map((alerta) => {
          const Icon = ICONS[alerta.tipo];
          return (
            <li key={alerta.id}>
              <button
                type="button"
                onClick={() => setSelectedAthleteId(alerta.atleta.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left hover:bg-surface-alt"
              >
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', COLORS[alerta.tipo])}>
                  <Icon size={16} />
                </span>
                <Avatar name={alerta.atleta.nome} src={alerta.atleta.avatarUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">{alerta.atleta.nome}</p>
                  <p className="truncate text-xs text-text-muted">{alerta.mensagem}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
