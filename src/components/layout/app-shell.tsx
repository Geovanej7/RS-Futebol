import { lazy, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { BottomNav } from './bottom-nav';
import { MobileSidebarDrawer } from './mobile-sidebar-drawer';
import { NAV_ITEMS } from './nav-items';
import { useUiStore } from '@/store/ui-store';
import { useAlerts } from '@/hooks/use-alerts';
import { Skeleton } from '@/components/ui/skeleton';

const AthleteDrawer = lazy(() =>
  import('@/features/athlete-profile/athlete-drawer').then((m) => ({ default: m.AthleteDrawer })),
);

function PageFallback() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-32" />
    </div>
  );
}

export function AppShell() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const location = useLocation();
  const alerts = useAlerts();

  const currentTitle =
    NAV_ITEMS.find((item) => (item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)))
      ?.label ?? 'RS Futebol Club';

  return (
    <div className="flex min-h-svh bg-bg text-text-primary">
      <div className="hidden lg:block">
        <Sidebar alertCount={alerts.length} variant="desktop" />
      </div>

      <MobileSidebarDrawer open={sidebarOpen} onOpenChange={setSidebarOpen} alertCount={alerts.length} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={currentTitle} />
        <main className="flex-1 px-4 py-4 pb-24 sm:px-6 sm:py-6 lg:pb-6">
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <BottomNav />
      <Suspense fallback={null}>
        <AthleteDrawer />
      </Suspense>
    </div>
  );
}
