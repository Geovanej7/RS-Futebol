import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'blue' | 'purple' | 'green' | 'yellow' | 'red' | 'cyan' | 'neutral';

const TONE_CLASSES: Record<BadgeTone, string> = {
  blue: 'bg-accent-blue/15 text-accent-blue border-accent-blue/30',
  purple: 'bg-accent-purple/15 text-accent-purple border-accent-purple/30',
  green: 'bg-accent-green/15 text-accent-green border-accent-green/30',
  yellow: 'bg-accent-yellow/15 text-accent-yellow border-accent-yellow/30',
  red: 'bg-accent-red/15 text-accent-red border-accent-red/30',
  cyan: 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30',
  neutral: 'bg-surface-alt text-text-secondary border-border',
};

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap',
        TONE_CLASSES[tone],
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): BadgeTone {
  switch (status) {
    case 'Ativo':
      return 'green';
    case 'Lesionado':
      return 'red';
    case 'Em observação':
      return 'yellow';
    case 'Dispensado':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export function idaTone(classificacao: string): BadgeTone {
  switch (classificacao) {
    case 'Elite':
      return 'purple';
    case 'Alto Potencial':
      return 'blue';
    case 'Em Desenvolvimento':
      return 'cyan';
    case 'Necessita Desenvolvimento':
      return 'yellow';
    default:
      return 'red';
  }
}
