import { useMemo } from 'react';
import { Activity, CalendarCheck, Clock, Gauge } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { format, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTrainings } from '@/hooks/use-trainings';
import { KpiCard } from '@/components/ui/kpi-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export function TrainingsPage() {
  const { data: sessoes, isLoading } = useTrainings();

  const stats = useMemo(() => {
    if (!sessoes || sessoes.length === 0) return null;

    const hoje = new Date();
    const sessoesDoMes = sessoes.filter((s) => {
      const d = new Date(s.data);
      return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
    });

    const todasPresencas = sessoes.flatMap((s) => s.presencas);
    const frequenciaMedia =
      (todasPresencas.filter((p) => p.presente).length / Math.max(1, todasPresencas.length)) * 100;

    const presentes = todasPresencas.filter((p) => p.presente);
    const cargaMedia = presentes.reduce((sum, p) => sum + p.rpe, 0) / Math.max(1, presentes.length);

    const minutosPorAtleta = new Map<string, number>();
    for (const sessao of sessoes) {
      for (const p of sessao.presencas) {
        if (!p.presente) continue;
        minutosPorAtleta.set(p.atletaId, (minutosPorAtleta.get(p.atletaId) ?? 0) + sessao.duracaoMinutos);
      }
    }
    const totalAtletas = minutosPorAtleta.size || 1;
    const horasPorAtleta =
      Array.from(minutosPorAtleta.values()).reduce((sum, m) => sum + m, 0) / totalAtletas / 60;

    const semanas = new Map<string, { rpe: number[]; recuperacao: number[] }>();
    for (const sessao of sessoes) {
      const inicioSemana = startOfWeek(new Date(sessao.data), { weekStartsOn: 1 });
      const chave = inicioSemana.toISOString();
      if (!semanas.has(chave)) semanas.set(chave, { rpe: [], recuperacao: [] });
      const bucket = semanas.get(chave)!;
      for (const p of sessao.presencas) {
        if (!p.presente) continue;
        bucket.rpe.push(p.rpe);
        bucket.recuperacao.push(p.recuperacao);
      }
    }

    const semanal = Array.from(semanas.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([chave, valores]) => ({
        semana: format(new Date(chave), "dd/MM", { locale: ptBR }),
        carga: Math.round((valores.rpe.reduce((s, v) => s + v, 0) / Math.max(1, valores.rpe.length)) * 10) / 10,
        recuperacao:
          Math.round((valores.recuperacao.reduce((s, v) => s + v, 0) / Math.max(1, valores.recuperacao.length)) * 10) / 10,
      }));

    return {
      sessoesNoMes: sessoesDoMes.length,
      frequenciaMedia,
      cargaMedia,
      horasPorAtleta,
      semanal,
    };
  }, [sessoes]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return <EmptyState icon={Activity} title="Nenhuma sessão de treino registrada" />;
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-text-primary">Treinos</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <KpiCard label="Sessões/mês" value={String(stats.sessoesNoMes)} icon={CalendarCheck} tone="blue" />
        <KpiCard label="Frequência média" value={`${stats.frequenciaMedia.toFixed(0)}%`} icon={Activity} tone="green" />
        <KpiCard label="Carga média (RPE)" value={stats.cargaMedia.toFixed(1)} icon={Gauge} tone="purple" />
        <KpiCard label="Horas/atleta" value={`${stats.horasPorAtleta.toFixed(1)}h`} icon={Clock} tone="yellow" />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <h3 className="mb-3 text-sm font-semibold text-text-primary">Carga (RPE) vs Recuperação — últimas 8 semanas</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stats.semanal}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="semana" stroke="var(--color-text-muted)" fontSize={11} />
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
            <Bar dataKey="carga" name="Carga (RPE)" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="recuperacao" name="Recuperação" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
