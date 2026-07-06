import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Dumbbell,
  GitCompare,
  Trophy,
  FileText,
  Eye,
  Bell,
  Settings,
} from 'lucide-react';
import type { Modulo } from '@/lib/permissions';

export interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  group: 'Principal' | 'Análises' | 'Sistema';
  modulo: Modulo;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, group: 'Principal', modulo: 'dashboard' },
  { to: '/atletas', label: 'Atletas', icon: Users, group: 'Principal', modulo: 'atletas' },
  { to: '/avaliacoes', label: 'Avaliações', icon: ClipboardList, group: 'Principal', modulo: 'avaliacoes' },
  { to: '/treinos', label: 'Treinos', icon: Dumbbell, group: 'Principal', modulo: 'treinos' },
  { to: '/comparativos', label: 'Comparativos', icon: GitCompare, group: 'Análises', modulo: 'comparativos' },
  { to: '/ranking', label: 'Ranking', icon: Trophy, group: 'Análises', modulo: 'ranking' },
  { to: '/relatorios', label: 'Relatórios', icon: FileText, group: 'Análises', modulo: 'relatorios' },
  { to: '/scout', label: 'Scout', icon: Eye, group: 'Análises', modulo: 'scout' },
  { to: '/alertas', label: 'Alertas', icon: Bell, group: 'Sistema', modulo: 'alertas' },
  { to: '/configuracoes', label: 'Configurações', icon: Settings, group: 'Sistema', modulo: 'configuracoes' },
];

export const NAV_GROUPS = ['Principal', 'Análises', 'Sistema'] as const;
