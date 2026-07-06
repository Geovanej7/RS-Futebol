import type { Posicao } from '@/entities/athlete';

type Pose = 'goleiro' | 'defesa' | 'meia' | 'ataque';

const POSE_BY_POSICAO: Record<Posicao, Pose> = {
  Goleiro: 'goleiro',
  Zagueiro: 'defesa',
  Lateral: 'defesa',
  Volante: 'defesa',
  Meia: 'meia',
  Atacante: 'ataque',
};

/** Pictograma vetorial original (não fotográfico) — pose varia por posição, estilo sinalização esportiva. */
const POSE_PATHS: Record<Pose, { head: [number, number]; limbs: string[] }> = {
  goleiro: {
    head: [50, 22],
    limbs: [
      'M50,34 L50,72', // torso
      'M50,42 L20,20', // braço esq. estendido pra cima
      'M50,42 L80,20', // braço dir. estendido pra cima
      'M50,72 L28,118', // perna esq. aberta
      'M50,72 L72,118', // perna dir. aberta
    ],
  },
  defesa: {
    head: [50, 22],
    limbs: [
      'M50,34 L50,76',
      'M50,44 L26,58',
      'M50,44 L74,58',
      'M50,76 L34,120',
      'M50,76 L66,120',
    ],
  },
  meia: {
    head: [46, 24],
    limbs: [
      'M46,36 Q54,55 58,74',
      'M50,44 L74,34',
      'M54,50 L26,62',
      'M58,74 L36,118',
      'M58,74 L82,108',
    ],
  },
  ataque: {
    head: [42, 24],
    limbs: [
      'M42,36 Q56,52 60,70',
      'M48,44 L74,26',
      'M52,50 L20,46',
      'M60,70 L38,116',
      'M60,70 Q80,86 92,68',
    ],
  },
};

export function PositionSilhouette({ posicao, className }: { posicao: Posicao; className?: string }) {
  const pose = POSE_PATHS[POSE_BY_POSICAO[posicao]];

  return (
    <svg
      viewBox="0 0 100 140"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx={pose.head[0]} cy={pose.head[1]} r="11" fill="currentColor" />
      {pose.limbs.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
