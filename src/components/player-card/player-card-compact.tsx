import type { ReactNode } from 'react';
import type { Atleta } from '@/entities/athlete';
import { calcularRaridade, RARIDADE_CONFIG } from '@/lib/rarity';
import { Avatar } from '@/components/ui/avatar';

interface PlayerCardCompactProps {
  atleta: Atleta;
  /** Conteúdo à direita (tendência no Dashboard, valor de ranking, etc). */
  rightSlot?: ReactNode;
  /** Número sobreposto no canto (posição no ranking). */
  badge?: number;
  onClick?: () => void;
}

/** Versão silenciosa do PlayerCard — sem tilt/flip, só a faixa de raridade lateral como assinatura visual. */
export function PlayerCardCompact({ atleta, rightSlot, badge, onClick }: PlayerCardCompactProps) {
  const raridade = calcularRaridade(atleta);
  const config = RARIDADE_CONFIG[raridade];

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 overflow-hidden rounded-lg border border-border bg-surface-alt py-1.5 pl-0 pr-2.5 text-left hover:bg-surface"
    >
      <span aria-hidden="true" className="h-9 w-1.5 shrink-0 self-stretch rounded-r" style={{ background: config.borda }} />

      <span className="relative shrink-0">
        <Avatar name={atleta.nome} src={atleta.avatarUrl} size="sm" />
        {badge !== undefined && (
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-blue text-[9px] font-bold text-white">
            {badge}
          </span>
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-text-primary">{atleta.nome}</span>
        <span className="block truncate text-[11px] text-text-muted">
          {atleta.categoria} · {atleta.posicao}
        </span>
      </span>

      {rightSlot && <span className="shrink-0">{rightSlot}</span>}
    </button>
  );
}
