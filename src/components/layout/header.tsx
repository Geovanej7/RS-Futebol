import { useNavigate } from 'react-router-dom';
import { Menu, Search, Moon, Sun, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useUiStore } from '@/store/ui-store';
import { useAthletes } from '@/hooks/use-athletes';
import { exportarBaseExcel } from '@/lib/exports';
import { useState } from 'react';

export function Header({ title }: { title: string }) {
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { data: atletas } = useAthletes();

  const onExportarRapido = async () => {
    await exportarBaseExcel(atletas ?? []);
    toast.success('Base exportada com sucesso');
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/atletas?busca=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-surface/80 px-4 py-3 backdrop-blur">
      <button
        type="button"
        aria-label="Abrir menu"
        onClick={() => setSidebarOpen(true)}
        className="rounded-lg p-2 text-text-secondary hover:bg-surface-alt lg:hidden"
      >
        <Menu size={20} />
      </button>

      <h1 className="sr-only text-base font-semibold text-text-primary sm:not-sr-only">{title}</h1>

      <form onSubmit={onSearchSubmit} className="ml-auto flex flex-1 items-center gap-2 sm:flex-none">
        <div className="relative w-full sm:w-64">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar atleta..."
            aria-label="Buscar atleta"
            className="w-full rounded-lg border border-border bg-surface-alt py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none"
          />
        </div>
      </form>

      <button
        type="button"
        aria-label="Alternar tema"
        onClick={toggleTheme}
        className="rounded-lg p-2 text-text-secondary hover:bg-surface-alt hover:text-text-primary"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <button
        type="button"
        aria-label="Exportar base de atletas"
        onClick={onExportarRapido}
        className="hidden rounded-lg p-2 text-text-secondary hover:bg-surface-alt hover:text-text-primary sm:block"
      >
        <Download size={18} />
      </button>
    </header>
  );
}
