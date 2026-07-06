import { HeartPulse } from 'lucide-react';
import { format } from 'date-fns';
import { EmptyState } from '@/components/ui/empty-state';
import type { Atleta } from '@/entities/athlete';

export function MedicalTab({ atleta }: { atleta: Atleta }) {
  if (atleta.registrosMedicos.length === 0) {
    return (
      <EmptyState
        icon={HeartPulse}
        title="Nenhum histórico médico"
        description="Este atleta não possui registros de lesões ou afastamentos."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {atleta.registrosMedicos.map((registro) => (
        <li key={registro.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-text-primary">{registro.tipo}</p>
            <span className="text-xs text-text-muted">{format(new Date(registro.data), 'dd/MM/yyyy')}</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            <p><span className="text-text-muted">Dias afastado:</span> {registro.diasAfastado}</p>
            <p><span className="text-text-muted">Retorno:</span> {registro.retorno}</p>
            <p><span className="text-text-muted">Limitações:</span> {registro.limitacoes}</p>
          </div>
          <p className="mt-2 text-xs text-text-secondary">{registro.observacao}</p>
        </li>
      ))}
    </ul>
  );
}
