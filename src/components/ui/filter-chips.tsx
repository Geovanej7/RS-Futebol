import { cn } from '@/lib/cn';

interface FilterChipsProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function FilterChips<T extends string>({ label, options, value, onChange }: FilterChipsProps<T>) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">{label}</p>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={value === opt.value}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              value === opt.value
                ? 'border-accent-blue bg-accent-blue/15 text-accent-blue'
                : 'border-border bg-surface-alt text-text-secondary hover:bg-surface',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
