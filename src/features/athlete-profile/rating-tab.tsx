import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import { SliderField } from '@/components/ui/slider-field';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { podeEditarGrupo } from '@/lib/permissions';
import { calcularRaridade, RARIDADES_ORDEM, type Raridade } from '@/lib/rarity';
import type { Atleta } from '@/entities/athlete';

interface RatingTabProps {
  atleta: Atleta;
  grupo: 'tecnica' | 'fisica' | 'tatica' | 'psico';
  atributos: readonly string[];
  /** Chamado quando a avaliação salva eleva a raridade do atleta (ex.: Prata → Ouro). */
  onRarityUp?: (atleta: Atleta, novaRaridade: Raridade) => void;
}

/**
 * Requer `key={`${atleta.id}-${grupo}`}` no call site (athlete-drawer.tsx): a troca de key
 * remonta o componente e reinicia `valores` a partir do novo atleta, em vez de sincronizar
 * via effect — evita o clássico "estado derivado de prop sincronizado em useEffect".
 */
export function RatingTab({ atleta, grupo, atributos, onRarityUp }: RatingTabProps) {
  const [valores, setValores] = useState<Record<string, number>>(() => atleta.ratings[grupo]);
  const [dirty, setDirty] = useState(false);
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const podeEditar = !!user && podeEditarGrupo(grupo, user.perfil);

  const mutation = useMutation({
    mutationFn: () =>
      apiClient.post(`/api/athletes/${atleta.id}/evaluations`, {
        grupo,
        valores,
        data: new Date().toISOString(),
      }),
    onSuccess: () => {
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ['athletes', atleta.id] });
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });

      const raridadeAntes = calcularRaridade(atleta);
      const atletaAtualizado: Atleta = { ...atleta, ratings: { ...atleta.ratings, [grupo]: valores } };
      const raridadeDepois = calcularRaridade(atletaAtualizado);

      if (RARIDADES_ORDEM.indexOf(raridadeDepois) > RARIDADES_ORDEM.indexOf(raridadeAntes) && onRarityUp) {
        onRarityUp(atletaAtualizado, raridadeDepois);
      } else {
        toast.success('Avaliação salva com sucesso');
      }
    },
    onError: () => toast.error('Não foi possível salvar a avaliação'),
  });

  return (
    <div className="space-y-4">
      {!podeEditar && (
        <p className="flex items-center gap-2 rounded-lg bg-surface-alt px-3 py-2 text-xs text-text-muted">
          <Lock size={13} />
          Seu perfil não tem permissão de escrita nesta aba — visualização apenas.
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {atributos.map((attr) => (
          <SliderField
            key={attr}
            label={attr}
            value={valores[attr] ?? 0}
            disabled={!podeEditar}
            onChange={(v) => {
              setValores((prev) => ({ ...prev, [attr]: v }));
              setDirty(true);
            }}
          />
        ))}
      </div>
      {podeEditar && (
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={!dirty || mutation.isPending}
          className="w-full rounded-lg bg-accent-blue py-2.5 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto sm:px-6"
        >
          {mutation.isPending ? 'Salvando...' : 'Salvar avaliação'}
        </button>
      )}
    </div>
  );
}
