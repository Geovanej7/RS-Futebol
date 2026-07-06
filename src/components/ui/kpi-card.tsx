import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: 'blue' | 'purple' | 'green' | 'yellow';
  trend?: string;
}

const TONE_ICON: Record<string, string> = {
  blue: 'bg-accent-blue/15 text-accent-blue',
  purple: 'bg-accent-purple/15 text-accent-purple',
  green: 'bg-accent-green/15 text-accent-green',
  yellow: 'bg-accent-yellow/15 text-accent-yellow',
};

export function KpiCard({ label, value, icon: Icon, tone = 'blue', trend }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition-transform hover:-translate-y-0.5 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary sm:text-sm">{label}</span>
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', TONE_ICON[tone])}>
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-3 text-xl font-semibold text-text-primary sm:text-2xl">{value}</div>
      {trend && <div className="mt-1 text-xs text-text-muted">{trend}</div>}
    </div>
  );
}
