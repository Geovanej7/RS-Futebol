import { useMemo } from 'react';
import { useAthletes } from './use-athletes';
import { calcularIda, calcularTendencia } from '@/lib/calculations';
import type { Atleta } from '@/entities/athlete';

export type AlertaTipo = 'queda' | 'medico' | 'destaque';

export interface Alerta {
  id: string;
  tipo: AlertaTipo;
  atleta: Atleta;
  mensagem: string;
}

export function computeAlerts(atletas: Atleta[]): Alerta[] {
  const alertas: Alerta[] = [];
  for (const atleta of atletas) {
    const tendencia = calcularTendencia(atleta.historico);
    const ida = calcularIda(atleta.ratings);

    if (tendencia < -0.4) {
      alertas.push({
        id: `${atleta.id}-queda`,
        tipo: 'queda',
        atleta,
        mensagem: `Queda de desempenho de ${Math.abs(tendencia).toFixed(2)} pts na última avaliação.`,
      });
    }
    if (atleta.status === 'Lesionado') {
      alertas.push({
        id: `${atleta.id}-medico`,
        tipo: 'medico',
        atleta,
        mensagem: 'Atleta lesionado — acompanhamento médico necessário.',
      });
    }
    if (ida >= 8.8) {
      alertas.push({
        id: `${atleta.id}-destaque`,
        tipo: 'destaque',
        atleta,
        mensagem: `IDA de ${ida.toFixed(1)} — recomenda-se observação profissional.`,
      });
    }
  }
  return alertas;
}

export function useAlerts() {
  const { data: atletas } = useAthletes();
  return useMemo(() => computeAlerts(atletas ?? []), [atletas]);
}
