import { NavLink } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { NAV_GROUPS, NAV_ITEMS } from './nav-items';
import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth-store';
import { useUiStore } from '@/store/ui-store';
import { useEffectivePermissions } from '@/store/permissions-store';
import { hasAccess } from '@/lib/permissions';
import { cn } from '@/lib/cn';

interface SidebarProps {
  alertCount: number;
  variant: 'desktop' | 'mobile';
}

export function Sidebar({ alertCount, variant }: SidebarProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const permissoes = useEffectivePermissions();

  const itensPermitidos = user
    ? NAV_ITEMS.filter((item) => hasAccess(permissoes, user.perfil, item.modulo, 'leitura'))
    : [];

  const closeIfMobile = () => {
    if (variant === 'mobile') setSidebarOpen(false);
  };

  return (
    <div className="flex h-full w-72 flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black">
            <img src="/logo.png" alt="RS Futebol Club" className="h-full w-full object-cover" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-none text-text-primary">RS Futebol</p>
            <p className="text-xs text-text-muted">Club</p>
          </div>
        </div>
        {variant === 'mobile' && (
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-alt"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.filter((group) => itensPermitidos.some((item) => item.group === group)).map((group) => (
          <div key={group}>
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              {group}
            </p>
            <ul className="space-y-1">
              {itensPermitidos.filter((item) => item.group === group).map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onClick={closeIfMobile}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-accent-blue/15 text-accent-blue'
                          : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary',
                      )
                    }
                  >
                    <span className="flex items-center gap-3">
                      <item.icon size={17} />
                      {item.label}
                    </span>
                    {item.to === '/alertas' && alertCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-red px-1 text-[11px] font-semibold text-white">
                        {alertCount}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {user && (
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <Avatar name={user.nome} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">{user.nome}</p>
              <p className="truncate text-xs text-text-muted">{user.perfil}</p>
            </div>
            <button
              type="button"
              aria-label="Sair"
              onClick={logout}
              className="rounded-lg p-2 text-text-secondary hover:bg-surface-alt hover:text-accent-red"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
