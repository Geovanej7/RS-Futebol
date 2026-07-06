import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import type { Atleta } from '@/entities/athlete';
import { mediaFisica, mediaPsico, mediaTatica, mediaTecnica } from '@/lib/calculations';

export function CardBack({ atleta, ida }: { atleta: Atleta; ida: number }) {
  const radarData = [
    { atributo: 'TEC', valor: mediaTecnica(atleta.ratings) },
    { atributo: 'FIS', valor: mediaFisica(atleta.ratings) },
    { atributo: 'TAT', valor: mediaTatica(atleta.ratings) },
    { atributo: 'PSI', valor: mediaPsico(atleta.ratings) },
  ];

  const ultimasAvaliacoes = atleta.historico.slice(-3).reverse();
  const notaRecente = atleta.notasScout[atleta.notasScout.length - 1];

  return (
    <div className="flex h-full flex-col gap-1.5 p-2.5 text-[#eef2f7]">
      <div>
        <p className="font-condensed text-center text-[11px] font-bold uppercase tracking-wide">Radar · IDA {ida.toFixed(1)}</p>
        <div className="h-20 sm:h-24">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="75%">
              <PolarGrid stroke="#2a3242" />
              <PolarAngleAxis dataKey="atributo" tick={{ fill: '#8b96a5', fontSize: 8 }} />
              <Radar dataKey="valor" stroke="#3fa9f5" fill="#3fa9f5" fillOpacity={0.4} isAnimationActive={false} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border-t border-white/10 pt-1">
        <p className="font-condensed text-[10px] font-bold uppercase tracking-wide text-[#7c8aa3]">Últimas avaliações</p>
        <ul className="mt-0.5 space-y-0.5">
          {ultimasAvaliacoes.map((h, i) => (
            <li key={i} className="flex justify-between text-[9px]">
              <span className="text-[#7c8aa3]">{format(new Date(h.data), 'dd/MM/yy')}</span>
              <span className="font-semibold">{h.media.toFixed(1)}</span>
            </li>
          ))}
        </ul>
      </div>

      {notaRecente && (
        <div className="mt-auto border-t border-white/10 pt-1">
          <p className="font-condensed text-[9px] font-bold uppercase tracking-wide text-[#7c8aa3]">Relatório confidencial</p>
          <p className="mt-0.5 line-clamp-4 font-mono text-[8.5px] leading-snug text-[#c7d0dd]">
            &ldquo;{notaRecente.texto}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
