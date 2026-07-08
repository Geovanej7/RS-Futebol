import { cloneElement, isValidElement, useId, type ReactElement } from 'react';
import { useWatch, type Control } from 'react-hook-form';
import { z } from 'zod';
import { Avatar } from '@/components/ui/avatar';
import { CATEGORIAS, POSICOES } from '@/entities/athlete';

export const PES_DOMINANTES = ['Direito', 'Esquerdo', 'Ambidestro'] as const;

export const INPUT_CLASS =
  'w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none';

export const athleteFormSchema = z.object({
  nome: z.string().min(3, 'Informe o nome completo'),
  dataNascimento: z.string().min(1, 'Informe a data de nascimento'),
  categoria: z.enum(CATEGORIAS as [string, ...string[]]),
  posicao: z.enum(POSICOES as [string, ...string[]]),
  peDominante: z.enum(PES_DOMINANTES),
  altura: z.coerce.number().min(100, 'Altura inválida').max(230, 'Altura inválida'),
  peso: z.coerce.number().min(25, 'Peso inválido').max(150, 'Peso inválido'),
  cidade: z.string().min(1, 'Informe a cidade'),
  alojamento: z.string().min(1, 'Informe o alojamento'),
  responsavel: z.string().min(1, 'Informe o responsável'),
  contato: z.string().min(1, 'Informe um contato'),
});

export type AthleteFormInput = z.input<typeof athleteFormSchema>;
export type AthleteFormOutput = z.output<typeof athleteFormSchema>;

// Isola o re-render do watch('nome') a este componente só — o resto do formulário
// (8+ campos) não precisa re-renderizar a cada tecla digitada no nome.
export function AvatarPreview({ control, fotoPreview }: { control: Control<AthleteFormInput>; fotoPreview?: string }) {
  const nome = useWatch({ control, name: 'nome' });
  return <Avatar name={nome || '?'} src={fotoPreview} size="lg" />;
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactElement<{ 'aria-invalid'?: boolean; 'aria-describedby'?: string }>;
}) {
  const errorId = useId();
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-xs font-medium text-text-secondary">{label}</span>
      {isValidElement(children)
        ? cloneElement(children, {
            'aria-invalid': !!error,
            'aria-describedby': error ? errorId : undefined,
          })
        : children}
      {error && (
        <span id={errorId} className="mt-1 block text-xs text-accent-red">
          {error}
        </span>
      )}
    </label>
  );
}
