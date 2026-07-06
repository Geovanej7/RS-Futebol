import { memo, useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { RotateCcw, Flame, TrendingDown } from 'lucide-react';
import type { Atleta, Posicao } from '@/entities/athlete';
import { calcularIda, calcularTendencia, mediaGeral } from '@/lib/calculations';
import { calcularRaridade, RARIDADE_CONFIG } from '@/lib/rarity';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { PositionSilhouette } from './position-silhouette';
import { CardBack } from './card-back';
import { cn } from '@/lib/cn';

const POSICAO_SIGLA: Record<Posicao, string> = {
  Goleiro: 'GOL',
  Zagueiro: 'ZAG',
  Lateral: 'LAT',
  Volante: 'VOL',
  Meia: 'MEI',
  Atacante: 'ATA',
};

const SIZE_CLASSES: Record<'md' | 'lg', string> = {
  md: 'w-[168px] sm:w-[188px]',
  lg: 'w-[260px] sm:w-[300px]',
};

const MAX_TILT = 10;

interface PlayerCardProps {
  atleta: Atleta;
  size?: 'md' | 'lg';
  /** Permite virar o card para ver o verso (radar, timeline, nota de scout). */
  flippable?: boolean;
  /**
   * Disparado ao clicar no corpo do card (ex.: abrir o perfil), recebendo o id do atleta.
   * Passe uma referência estável (useCallback) para que `memo()` evite re-renderizar
   * os cards não afetados quando a grade de Atletas re-renderiza (busca, ordenação, etc).
   */
  onActivate?: (atletaId: string) => void;
  className?: string;
}

export const PlayerCard = memo(function PlayerCard({
  atleta,
  size = 'md',
  flippable = false,
  onActivate,
  className,
}: PlayerCardProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [flipped, setFlipped] = useState(false);
  const [fotoErro, setFotoErro] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);

  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rotateX = useSpring(rawRotateX, { stiffness: 300, damping: 25 });
  const rotateY = useSpring(rawRotateY, { stiffness: 300, damping: 25 });

  // useSpring(numero, ...) só reage ao valor inicial nesta versão do Framer Motion — para animar
  // corretamente a cada troca de `flipped`, a MotionValue precisa ser controlada via animate().
  const flipRotate = useMotionValue(0);
  useEffect(() => {
    const controls = animate(flipRotate, flipped ? 180 : 0, {
      type: 'spring',
      stiffness: reducedMotion ? 1000 : 260,
      damping: reducedMotion ? 100 : 24,
    });
    return () => controls.stop();
  }, [flipped, reducedMotion, flipRotate]);

  const combinedRotateY = useTransform([rotateY, flipRotate], (v) => (v as number[])[0] + (v as number[])[1]);

  const shineX = useTransform(rotateY, [-MAX_TILT, MAX_TILT], ['75%', '25%']);
  const shineY = useTransform(rotateX, [-MAX_TILT, MAX_TILT], ['25%', '75%']);

  const ida = calcularIda(atleta.ratings);
  const overall = mediaGeral(atleta.ratings);
  const tendencia = calcularTendencia(atleta.historico);
  const raridade = calcularRaridade(atleta);
  const config = RARIDADE_CONFIG[raridade];

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (reducedMotion || e.pointerType === 'touch') return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rawRotateY.set(px * MAX_TILT * 2);
    rawRotateX.set(-py * MAX_TILT * 2);
  };

  const onPointerLeave = () => {
    rawRotateX.set(0);
    rawRotateY.set(0);
  };

  const atributos = [
    ['PAC', atleta.ratings.fisica['Velocidade'] ?? 0],
    ['FIN', atleta.ratings.tecnica['Finalização'] ?? 0],
    ['PAS', atleta.ratings.tecnica['Passe'] ?? 0],
    ['DRI', atleta.ratings.tecnica['Drible'] ?? 0],
    ['DEF', atleta.ratings.tecnica['Marcação'] ?? 0],
    ['FIS', atleta.ratings.fisica['Força'] ?? 0],
  ] as const;

  const tendenciaLabel = tendencia > 0.25 ? ', tendência forte de alta' : tendencia < -0.25 ? ', tendência forte de queda' : '';
  const ariaLabel = `${atleta.nome}, ${atleta.posicao}, overall ${overall.toFixed(1)}, raridade ${raridade}${tendenciaLabel}`;

  return (
    <div className={cn('card-3d-perspective relative', SIZE_CLASSES[size], className)}>
      <motion.button
        ref={cardRef}
        type="button"
        aria-label={ariaLabel}
        onClick={onActivate ? () => onActivate(atleta.id) : undefined}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="card-3d-flip relative block aspect-[5/7] w-full cursor-pointer overflow-visible rounded-xl text-left outline-none"
        style={{ rotateX: reducedMotion ? 0 : rotateX, rotateY: reducedMotion ? (flipped ? 180 : 0) : combinedRotateY }}
      >
        {/* Frente */}
        <div
          className="card-3d-face absolute inset-0 overflow-hidden rounded-xl border-2 shadow-lg"
          style={{ borderColor: config.borda, background: `linear-gradient(155deg, ${config.gradiente[0]}, ${config.gradiente[1]})` }}
        >
          <div className="grain-texture" />

          {config.acabamento === 'holografico' && !reducedMotion && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-40 mix-blend-color-dodge"
              style={{
                background: 'conic-gradient(from 90deg, #ff9ad5, #a0e7ff, #fff6a0, #baffc9, #ff9ad5)',
                left: shineX,
                top: shineY,
                x: '-50%',
                y: '-50%',
                width: '160%',
                height: '160%',
                position: 'absolute',
              }}
            />
          )}

          {!reducedMotion && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute h-[140%] w-[140%] rounded-full opacity-25"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.9), transparent 60%)',
                left: shineX,
                top: shineY,
                x: '-50%',
                y: '-50%',
              }}
            />
          )}

          {(raridade === 'Elite' || raridade === 'Em Alta') && (
            <>
              <span className="absolute left-1.5 top-1.5 h-3 w-3 border-l-2 border-t-2 opacity-70" style={{ borderColor: config.borda }} />
              <span className="absolute right-1.5 top-1.5 h-3 w-3 border-r-2 border-t-2 opacity-70" style={{ borderColor: config.borda }} />
              <span className="absolute bottom-1.5 left-1.5 h-3 w-3 border-b-2 border-l-2 opacity-70" style={{ borderColor: config.borda }} />
              <span className="absolute bottom-1.5 right-1.5 h-3 w-3 border-b-2 border-r-2 opacity-70" style={{ borderColor: config.borda }} />
            </>
          )}

          <div className="relative flex h-full flex-col p-2.5" style={{ color: config.texto }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-2xl italic leading-none" style={{ fontWeight: 800 }}>
                  {overall.toFixed(1)}
                </p>
                <p className="font-condensed text-[11px] font-semibold tracking-wide">{POSICAO_SIGLA[atleta.posicao]}</p>
                <span
                  className="mt-1 inline-block rounded px-1 py-0.5 text-[9px] font-semibold"
                  style={{ background: 'rgba(0,0,0,0.18)' }}
                >
                  {atleta.categoria}
                </span>
              </div>
              {tendencia > 0.25 && <Flame size={16} aria-hidden="true" />}
              {tendencia < -0.25 && <TrendingDown size={16} aria-hidden="true" />}
            </div>

            <div className="flex flex-1 items-center justify-center">
              {atleta.avatarUrl && !fotoErro ? (
                <div
                  className="h-16 w-16 overflow-hidden rounded-full border-2 shadow-md sm:h-20 sm:w-20"
                  style={{ borderColor: config.borda, boxShadow: 'inset 0 0 12px rgba(0,0,0,0.35)' }}
                >
                  <img
                    src={atleta.avatarUrl}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    onError={() => setFotoErro(true)}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <PositionSilhouette posicao={atleta.posicao} className="h-16 w-16 opacity-80 sm:h-20 sm:w-20" />
              )}
            </div>

            <div className="border-t pt-1 text-center" style={{ borderColor: `${config.texto}33` }}>
              <p className="font-condensed truncate text-xs font-bold uppercase tracking-wide">{atleta.nome}</p>
            </div>

            <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
              {atributos.map(([sigla, valor]) => (
                <div key={sigla} className="flex items-center justify-between">
                  <span className="font-condensed font-semibold opacity-80">{sigla}</span>
                  <span className="font-display italic" style={{ fontWeight: 700 }}>
                    {valor.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Verso — só existe (e só carrega o radar) quando o card é flippable */}
        {flippable && (
          <div
            className="card-3d-face card-3d-face-back absolute inset-0 overflow-hidden rounded-xl border-2 shadow-lg"
            style={{ borderColor: config.borda, background: '#0b0d12' }}
          >
            <CardBack atleta={atleta} ida={ida} />
          </div>
        )}
      </motion.button>

      {flippable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setFlipped((f) => !f);
          }}
          aria-label={flipped ? 'Ver frente do card' : 'Ver verso do card'}
          className="absolute bottom-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
        >
          <RotateCcw size={13} />
        </button>
      )}
    </div>
  );
});
