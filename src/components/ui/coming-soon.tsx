import type { LucideIcon } from 'lucide-react';

export function ComingSoon({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-blue/15 text-accent-blue">
        <Icon size={26} />
      </span>
      <p className="text-base font-semibold text-text-primary">{title}</p>
      <p className="max-w-sm text-sm text-text-muted">
        Este módulo está sendo construído no próximo round de desenvolvimento.
      </p>
    </div>
  );
}
