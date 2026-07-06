import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { Atleta } from '@/entities/athlete';
import { RARIDADE_CONFIG, type Raridade } from '@/lib/rarity';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { PlayerCard } from './player-card';

const DURATION_MS = 1800;
const REDUCED_MOTION_DELAY_MS = 100;

/**
 * Disparada quando uma avaliação salva eleva a raridade do atleta (ex.: Prata → Ouro).
 * Reaproveita o toast já usado no resto do app — a animação é só reforço visual do mesmo evento.
 */
export function RarityUpCelebration({
  atleta,
  raridade,
  onDone,
}: {
  atleta: Atleta;
  raridade: Raridade;
  onDone: () => void;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const config = RARIDADE_CONFIG[raridade];

  const [particulas] = useState(() =>
    Array.from({ length: 14 }, () => ({
      x: (Math.random() - 0.5) * 240,
      delay: Math.random() * 0.6,
    })),
  );

  useEffect(() => {
    toast.success(`🎉 ${atleta.nome} subiu para ${raridade}!`);
    const timeout = setTimeout(onDone, reducedMotion ? REDUCED_MOTION_DELAY_MS : DURATION_MS);
    return () => clearTimeout(timeout);
    // Dispara uma vez ao montar — atleta/raridade/onDone não mudam durante a vida deste overlay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (reducedMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center overflow-hidden">
      <motion.div
        aria-hidden="true"
        className="absolute inset-y-0 w-1/3 -skew-x-12"
        style={{ background: `linear-gradient(90deg, transparent, ${config.borda}55, transparent)` }}
        initial={{ x: '-140%' }}
        animate={{ x: '240%' }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />

      {particulas.map((p, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="absolute bottom-1/3 h-1.5 w-1.5 rounded-full"
          style={{ background: config.borda, left: `calc(50% + ${p.x}px)` }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: -220, opacity: [0, 1, 0] }}
          transition={{ duration: 1.4, delay: p.delay, ease: 'easeOut' }}
        />
      ))}

      <motion.div
        initial={{ rotateY: 0 }}
        animate={{ rotateY: 360 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <PlayerCard atleta={atleta} size="lg" />
      </motion.div>
    </div>
  );
}
