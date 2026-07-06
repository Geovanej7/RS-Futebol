import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { FileText, Sheet, DatabaseBackup, Upload, X } from 'lucide-react';
import { useAthletes, useEvaluations } from '@/hooks/use-athletes';
import { useTrainings } from '@/hooks/use-trainings';
import { useSettingsStore } from '@/store/settings-store';
import { useAuthStore } from '@/store/auth-store';
import { useEffectivePermissions } from '@/store/permissions-store';
import { hasAccess } from '@/lib/permissions';
import { exportarBackupJSON, exportarBaseExcel, exportarRelatorioExecutivoPDF } from '@/lib/exports';
import { backupSchema, type BackupFile } from '@/lib/import-schema';
import { Skeleton } from '@/components/ui/skeleton';

export function ReportsPage() {
  const { data: atletas, isLoading } = useAthletes();
  const { data: avaliacoes } = useEvaluations();
  const { data: sessoesTreino } = useTrainings();
  const nomePlataforma = useSettingsStore((s) => s.nomePlataforma);
  const user = useAuthStore((s) => s.user);
  const permissoes = useEffectivePermissions();
  const queryClient = useQueryClient();

  const podeImportar = !!user && hasAccess(permissoes, user.perfil, 'relatorios', 'escrita');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<BackupFile | null>(null);

  const onSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const texto = await file.text();
      const json = JSON.parse(texto);
      const resultado = backupSchema.safeParse(json);
      if (!resultado.success) {
        toast.error('Arquivo de backup inválido ou em formato incompatível');
        return;
      }
      setPreview(resultado.data);
    } catch {
      toast.error('Não foi possível ler o arquivo selecionado');
    }
  };

  const aplicarImportacao = () => {
    if (!preview) return;
    queryClient.setQueryData(['athletes'], preview.atletas);
    queryClient.setQueryData(['evaluations'], preview.avaliacoes);
    queryClient.setQueryData(['trainings'], preview.sessoesTreino);
    toast.success('Backup importado com sucesso');
    setPreview(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-text-primary">Relatórios</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ExportCard
          icon={FileText}
          tone="blue"
          title="Relatório Executivo"
          description="PDF com KPIs gerais e top 10 atletas por IDA."
          actionLabel="Exportar PDF"
          onClick={async () => {
            await exportarRelatorioExecutivoPDF(atletas ?? [], nomePlataforma);
            toast.success('Relatório executivo gerado com sucesso');
          }}
        />
        <ExportCard
          icon={Sheet}
          tone="green"
          title="Base de Dados"
          description="Planilha Excel com todos os atletas e suas médias."
          actionLabel="Exportar Excel"
          onClick={async () => {
            await exportarBaseExcel(atletas ?? []);
            toast.success('Base exportada com sucesso');
          }}
        />
        <ExportCard
          icon={DatabaseBackup}
          tone="purple"
          title="Backup"
          description="Cópia completa em JSON (atletas, avaliações, treinos)."
          actionLabel="Exportar JSON"
          onClick={() => {
            exportarBackupJSON(atletas ?? [], avaliacoes ?? [], sessoesTreino ?? []);
            toast.success('Backup exportado com sucesso');
          }}
        />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <h3 className="mb-1 text-sm font-semibold text-text-primary">Importar backup</h3>
        <p className="mb-4 text-xs text-text-muted">
          {podeImportar
            ? 'Selecione um arquivo de backup JSON gerado por esta plataforma para restaurar os dados.'
            : 'Seu perfil não tem permissão de escrita em Relatórios para importar dados.'}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={onSelectFile}
        />
        <button
          type="button"
          disabled={!podeImportar}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface-alt px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface disabled:opacity-50"
        >
          <Upload size={16} />
          Selecionar arquivo
        </button>
      </div>

      <Dialog.Root open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-bg p-5 outline-none"
          >
            <div className="mb-3 flex items-center justify-between">
              <Dialog.Title className="text-sm font-semibold text-text-primary">Pré-visualização do backup</Dialog.Title>
              <Dialog.Close aria-label="Fechar" className="rounded-lg p-1 text-text-secondary hover:bg-surface-alt">
                <X size={18} />
              </Dialog.Close>
            </div>
            {preview && (
              <div className="space-y-3 text-sm">
                <p className="text-text-secondary">
                  Gerado em {new Date(preview.geradoEm).toLocaleString('pt-BR')}
                </p>
                <ul className="space-y-1 text-text-primary">
                  <li>{preview.atletas.length} atletas</li>
                  <li>{preview.avaliacoes.length} avaliações</li>
                  <li>{preview.sessoesTreino.length} sessões de treino</li>
                </ul>
                <p className="text-xs text-text-muted">
                  Exemplos: {preview.atletas.slice(0, 4).map((a) => a.nome).join(', ')}
                  {preview.atletas.length > 4 ? '…' : ''}
                </p>
                <button
                  type="button"
                  onClick={aplicarImportacao}
                  className="w-full rounded-lg bg-accent-blue py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                  Aplicar importação
                </button>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function ExportCard({
  icon: Icon,
  tone,
  title,
  description,
  actionLabel,
  onClick,
}: {
  icon: typeof FileText;
  tone: 'blue' | 'green' | 'purple';
  title: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
}) {
  const toneClasses = {
    blue: 'bg-accent-blue/15 text-accent-blue',
    green: 'bg-accent-green/15 text-accent-green',
    purple: 'bg-accent-purple/15 text-accent-purple',
  }[tone];

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses}`}>
        <Icon size={18} />
      </span>
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 flex-1 text-xs text-text-muted">{description}</p>
      <button
        type="button"
        onClick={onClick}
        className="mt-4 rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm font-medium text-text-primary hover:bg-surface"
      >
        {actionLabel}
      </button>
    </div>
  );
}
