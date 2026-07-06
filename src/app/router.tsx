import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { LoginPage } from '@/features/auth/login-page';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { RequireModule } from '@/features/auth/require-module';

const DashboardPage = lazy(() => import('@/features/dashboard/dashboard-page').then((m) => ({ default: m.DashboardPage })));
const AthletesPage = lazy(() => import('@/features/athletes/athletes-page').then((m) => ({ default: m.AthletesPage })));
const EvaluationsPage = lazy(() => import('@/features/evaluations/evaluations-page').then((m) => ({ default: m.EvaluationsPage })));
const TrainingsPage = lazy(() => import('@/features/trainings/trainings-page').then((m) => ({ default: m.TrainingsPage })));
const ComparisonsPage = lazy(() => import('@/features/comparisons/comparisons-page').then((m) => ({ default: m.ComparisonsPage })));
const RankingPage = lazy(() => import('@/features/ranking/ranking-page').then((m) => ({ default: m.RankingPage })));
const ReportsPage = lazy(() => import('@/features/reports/reports-page').then((m) => ({ default: m.ReportsPage })));
const ScoutPage = lazy(() => import('@/features/scout/scout-page').then((m) => ({ default: m.ScoutPage })));
const AlertsPage = lazy(() => import('@/features/alerts/alerts-page').then((m) => ({ default: m.AlertsPage })));
const SettingsPage = lazy(() => import('@/features/settings/settings-page').then((m) => ({ default: m.SettingsPage })));

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            path: '/',
            element: (
              <RequireModule modulo="dashboard">
                <DashboardPage />
              </RequireModule>
            ),
          },
          {
            path: '/atletas',
            element: (
              <RequireModule modulo="atletas">
                <AthletesPage />
              </RequireModule>
            ),
          },
          {
            path: '/avaliacoes',
            element: (
              <RequireModule modulo="avaliacoes">
                <EvaluationsPage />
              </RequireModule>
            ),
          },
          {
            path: '/treinos',
            element: (
              <RequireModule modulo="treinos">
                <TrainingsPage />
              </RequireModule>
            ),
          },
          {
            path: '/comparativos',
            element: (
              <RequireModule modulo="comparativos">
                <ComparisonsPage />
              </RequireModule>
            ),
          },
          {
            path: '/ranking',
            element: (
              <RequireModule modulo="ranking">
                <RankingPage />
              </RequireModule>
            ),
          },
          {
            path: '/relatorios',
            element: (
              <RequireModule modulo="relatorios">
                <ReportsPage />
              </RequireModule>
            ),
          },
          {
            path: '/scout',
            element: (
              <RequireModule modulo="scout">
                <ScoutPage />
              </RequireModule>
            ),
          },
          {
            path: '/alertas',
            element: (
              <RequireModule modulo="alertas">
                <AlertsPage />
              </RequireModule>
            ),
          },
          {
            path: '/configuracoes',
            element: (
              <RequireModule modulo="configuracoes">
                <SettingsPage />
              </RequireModule>
            ),
          },
        ],
      },
    ],
  },
]);
