function EmptyFieldIllustration() {
  return (
    <svg viewBox="0 0 200 130" className="h-24 w-36 text-text-muted" aria-hidden="true" focusable="false">
      <rect x="4" y="4" width="192" height="122" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="100" y1="4" x2="100" y2="126" stroke="currentColor" strokeWidth="2" />
      <circle cx="100" cy="65" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="100" cy="65" r="2" fill="currentColor" />
      <rect x="4" y="35" width="28" height="60" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="168" y="35" width="28" height="60" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function EmptyFieldState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
      <EmptyFieldIllustration />
      <p className="text-sm font-medium text-text-primary">{title}</p>
      {description && <p className="max-w-xs text-xs text-text-muted">{description}</p>}
    </div>
  );
}
