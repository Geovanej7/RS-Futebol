import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useEffectivePermissions } from '@/store/permissions-store';
import { hasAccess, type Modulo } from '@/lib/permissions';
import { EmptyState } from '@/components/ui/empty-state';

export function RequireModule({ modulo, children }: { modulo: Modulo; children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const permissoes = useEffectivePermissions();

  if (!user || !hasAccess(permissoes, user.perfil, modulo, 'leitura')) {
    return (
      <EmptyState
        icon={Lock}
        title="Acesso restrito"
        description={`Seu perfil (${user?.perfil ?? '—'}) não tem permissão para acessar este módulo.`}
      />
    );
  }

  return <>{children}</>;
}
