import { useSyncExternalStore } from 'react';

const query = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

// Um único MediaQueryList + listener compartilhado por toda a app (evita N instâncias
// quando dezenas de PlayerCard montam o hook ao mesmo tempo na grade de Atletas).
const listeners = new Set<() => void>();
query?.addEventListener('change', () => {
  for (const listener of listeners) listener();
});

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): boolean {
  return query?.matches ?? false;
}

function getServerSnapshot(): boolean {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
