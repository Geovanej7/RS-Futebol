import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Atleta } from '@/entities/athlete';
import {
  calcularIda,
  calcularIdade,
  calcularImc,
  calcularTendencia,
  mediaFisica,
  mediaPsico,
  mediaTatica,
  mediaTecnica,
} from '@/lib/calculations';

export function ProfileTab({ atleta }: { atleta: Atleta }) {
  const mTec = mediaTecnica(atleta.ratings);
  const mFis = mediaFisica(atleta.ratings);
  const mTat = mediaTatica(atleta.ratings);
  const mPsi = mediaPsico(atleta.ratings);
  const ida = calcularIda(atleta.ratings);
  const tendencia = calcularTendencia(atleta.historico);
  const regularidade = Math.max(0, 10 - Math.abs(tendencia) * 5);
  const potencial = Math.min(10, ida + Math.max(0, tendencia));

  const radarData = [
    { atributo: 'Técnica', valor: mTec },
    { atributo: 'Física', valor: mFis },
    { atributo: 'Tática', valor: mTat },
    { atributo: 'Psicológica', valor: mPsi },
    { atributo: 'Regularidade', valor: regularidade },
    { atributo: 'Potencial', valor: potencial },
  ];

  const historicoData = atleta.historico.map((h) => ({
    mes: format(new Date(h.data), 'MMM', { locale: ptBR }),
    media: h.media,
  }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Técnica', mTec],
          ['Física', mFis],
          ['Tática', mTat],
          ['Psicológica', mPsi],
        ].map(([label, valor]) => (
          <div key={label as string} className="rounded-xl border border-border bg-surface p-3 text-center">
            <p className="text-lg font-semibold text-text-primary">{Number(valor).toFixed(1)}</p>
            <p className="text-xs text-text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold text-text-primary">Radar de Atributos</h3>
          <ResponsiveContainer width="100%" height={230}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis dataKey="atributo" tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
              <Radar dataKey="valor" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold text-text-primary">Evolução histórica</h3>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={historicoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="mes" stroke="var(--color-text-muted)" fontSize={11} />
              <YAxis domain={[0, 10]} stroke="var(--color-text-muted)" fontSize={11} width={24} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="media" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <h3 className="mb-3 text-sm font-semibold text-text-primary">Dados pessoais</h3>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <Info label="Idade" value={`${calcularIdade(atleta.dataNascimento)} anos`} />
          <Info label="Altura" value={`${atleta.altura} cm`} />
          <Info label="Peso" value={`${atleta.peso} kg`} />
          <Info label="IMC" value={calcularImc(atleta.peso, atleta.altura).toFixed(1)} />
          <Info label="Pé dominante" value={atleta.peDominante} />
          <Info label="Cidade" value={atleta.cidade} />
          <Info label="Escola" value={atleta.escola} />
          <Info label="Responsável" value={atleta.responsavel} />
          <Info label="Contato" value={atleta.contato} />
        </dl>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">Zona de atuação em campo</h3>
        <PositionHeatmap posicao={atleta.posicao} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd className="font-medium text-text-primary">{value}</dd>
    </div>
  );
}

const POSITION_ZONES: Record<string, { x: number; y: number }[]> = {
  Goleiro: [{ x: 50, y: 92 }],
  Zagueiro: [{ x: 35, y: 75 }, { x: 65, y: 75 }],
  Lateral: [{ x: 15, y: 60 }, { x: 85, y: 60 }],
  Volante: [{ x: 50, y: 58 }],
  Meia: [{ x: 35, y: 40 }, { x: 65, y: 40 }],
  Atacante: [{ x: 50, y: 18 }],
};

function PositionHeatmap({ posicao }: { posicao: string }) {
  const zones = POSITION_ZONES[posicao] ?? [];
  return (
    <div className="relative mx-auto aspect-[2/3] max-w-[220px] rounded-lg border border-border bg-surface-alt">
      <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
      {zones.map((z, i) => (
        <span
          key={i}
          className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-blue/40 blur-md"
          style={{ left: `${z.x}%`, top: `${z.y}%` }}
        />
      ))}
    </div>
  );
}
