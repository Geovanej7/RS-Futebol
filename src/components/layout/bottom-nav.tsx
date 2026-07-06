import { NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useUiStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { useEffectivePermissions } from '@/store/permissions-store';
import { hasAccess } from '@/lib/permissions';
import { NAV_ITEMS } from './nav-items';

const PREFERRED_PATHS = ['/', '/atletas', '/avaliacoes', '/ranking'];

export function BottomNav() {
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const user = useAuthStore((s) => s.user);
  const permissoes = useEffectivePermissions();

  const items = user
    ? PREFERRED_PATHS.map((to) => NAV_ITEMS.find((item) => item.to === to)!).filter((item) =>
        hasAccess(permissoes, user.perfil, item.modulo, 'leitura'),
      )
    : [];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-border bg-surface/95 backdrop-blur lg:hidden">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium',
              isActive ? 'text-accent-blue' : 'text-text-muted',
            )
          }
        >
          <item.icon size={19} />
          {item.to === '/' ? 'Início' : item.label}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-text-muted"
      >
        <Menu size={19} />
        Mais
      </button>
    </nav>
  );
}
