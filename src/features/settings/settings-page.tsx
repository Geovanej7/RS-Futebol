import { useState } from 'react';
import { toast } from 'sonner';
import { Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import { CATEGORIAS, PERFIS_ACESSO } from '@/entities/athlete';
import { useSettingsStore } from '@/store/settings-store';
import { useAuthStore } from '@/store/auth-store';
import { usePermissionsStore, useEffectivePermissions } from '@/store/permissions-store';
import { MODULOS, NIVEIS, type NivelAcesso } from '@/lib/permissions';
import { Select } from '@/components/ui/select';

const NIVEL_LABEL: Record<NivelAcesso, string> = {
  nenhum: 'Nenhum',
  leitura: 'Leitura',
  escrita: 'Escrita',
};

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.perfil === 'Administrador';

  const nomePlataforma = useSettingsStore((s) => s.nomePlataforma);
  const categoriaPadrao = useSettingsStore((s) => s.categoriaPadrao);
  const setNomePlataforma = useSettingsStore((s) => s.setNomePlataforma);
  const setCategoriaPadrao = useSettingsStore((s) => s.setCategoriaPadrao);

  const [nomeDraft, setNomeDraft] = useState(nomePlataforma);
  const [categoriaDraft, setCategoriaDraft] = useState(categoriaPadrao);

  const permissoes = useEffectivePermissions();
  const setPermissao = usePermissionsStore((s) => s.setPermissao);

  const salvarPreferencias = () => {
    setNomePlataforma(nomeDraft);
    setCategoriaPadrao(categoriaDraft);
    toast.success('Preferências atualizadas');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-text-primary">Configurações</h2>

      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-primary">
          <SettingsIcon size={15} />
          Preferências gerais
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nomePlataforma" className="mb-1 block text-xs font-medium text-text-secondary">
              Nome da plataforma
            </label>
            <input
              id="nomePlataforma"
              value={nomeDraft}
              disabled={!isAdmin}
              onChange={(e) => setNomeDraft(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-text-primary disabled:opacity-60"
            />
          </div>
          <div>
            <label htmlFor="categoriaPadrao" className="mb-1 block text-xs font-medium text-text-secondary">
              Categoria padrão
            </label>
            <Select
              id="categoriaPadrao"
              value={categoriaDraft}
              disabled={!isAdmin}
              onValueChange={(v) => setCategoriaDraft(v as typeof categoriaDraft)}
              options={CATEGORIAS.map((c) => ({ value: c, label: c }))}
            />
          </div>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={salvarPreferencias}
            className="mt-4 rounded-lg bg-accent-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Salvar
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-text-primary">
          <ShieldCheck size={15} />
          Matriz de permissões
        </h3>
        <p className="mb-4 text-xs text-text-muted">
          {isAdmin
            ? 'Ajuste o nível de acesso de cada perfil por módulo. As alterações valem imediatamente para todo o app.'
            : 'Somente o perfil Administrador pode editar esta matriz.'}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-text-muted">
                <th className="py-2 pr-3">Módulo</th>
                {PERFIS_ACESSO.map((perfil) => (
                  <th key={perfil} className="px-2 py-2 font-medium">
                    {perfil}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MODULOS.map(({ modulo, label }) => (
                <tr key={modulo}>
                  <td className="py-2 pr-3 font-medium text-text-primary">{label}</td>
                  {PERFIS_ACESSO.map((perfil) => (
                    <td key={perfil} className="px-2 py-2">
                      <Select
                        value={permissoes[perfil][modulo]}
                        disabled={!isAdmin}
                        onValueChange={(v) => setPermissao(perfil, modulo, v as NivelAcesso)}
                        ariaLabel={`${label} — ${perfil}`}
                        options={NIVEIS.map((nivel) => ({ value: nivel, label: NIVEL_LABEL[nivel] }))}
                        triggerClassName="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface-alt px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent-blue disabled:opacity-60"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
