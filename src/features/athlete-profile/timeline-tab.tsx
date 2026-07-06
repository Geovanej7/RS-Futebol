import { format } from 'date-fns';
import { LogIn, ClipboardCheck, HeartPulse } from 'lucide-react';
import type { Atleta } from '@/entities/athlete';
import { cn } from '@/lib/cn';

interface TimelineEvent {
  data: string;
  tipo: 'entrada' | 'avaliacao' | 'lesao';
  titulo: string;
}

const ICONS = { entrada: LogIn, avaliacao: ClipboardCheck, lesao: HeartPulse };
const COLORS = {
  entrada: 'bg-accent-blue/15 text-accent-blue',
  avaliacao: 'bg-accent-green/15 text-accent-green',
  lesao: 'bg-accent-red/15 text-accent-red',
};

export function TimelineTab({ atleta }: { atleta: Atleta }) {
  const events: TimelineEvent[] = [
    { data: atleta.dataEntradaClube, tipo: 'entrada' as const, titulo: 'Entrada no clube' },
    ...atleta.historico.map((h) => ({
      data: h.data,
      tipo: 'avaliacao' as const,
      titulo: `Avaliação registrada — média ${h.media.toFixed(1)}`,
    })),
    ...atleta.registrosMedicos.map((r) => ({
      data: r.data,
      tipo: 'lesao' as const,
      titulo: r.tipo,
    })),
  ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  return (
    <ol className="relative space-y-5 border-l border-border pl-6">
      {events.map((event, idx) => {
        const Icon = ICONS[event.tipo];
        return (
          <li key={idx} className="relative">
            <span
              className={cn(
                'absolute -left-[calc(1.5rem+9px)] flex h-6 w-6 items-center justify-center rounded-full',
                COLORS[event.tipo],
              )}
            >
              <Icon size={13} />
            </span>
            <p className="text-sm font-medium text-text-primary">{event.titulo}</p>
            <p className="text-xs text-text-muted">{format(new Date(event.data), 'dd/MM/yyyy')}</p>
          </li>
        );
      })}
    </ol>
  );
}
