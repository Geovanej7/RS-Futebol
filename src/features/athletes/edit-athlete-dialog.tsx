import { useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X, Loader2, Camera } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Select } from '@/components/ui/select';
import { CATEGORIAS, POSICOES, STATUS_ATLETA, type Atleta, type StatusAtleta } from '@/entities/athlete';
import {
  athleteFormSchema,
  AvatarPreview,
  Field,
  INPUT_CLASS,
  PES_DOMINANTES,
  type AthleteFormInput,
  type AthleteFormOutput,
} from './athlete-form';

export function EditAthleteDialog({
  atleta,
  open,
  onOpenChange,
}: {
  atleta: Atleta;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const [fotoPreview, setFotoPreview] = useState<string | undefined>(atleta.avatarUrl);
  const [status, setStatus] = useState<StatusAtleta>(atleta.status);
  const [observacoes, setObservacoes] = useState(atleta.observacoes);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AthleteFormInput, unknown, AthleteFormOutput>({
    resolver: zodResolver(athleteFormSchema),
    defaultValues: {
      nome: atleta.nome,
      dataNascimento: atleta.dataNascimento,
      categoria: atleta.categoria,
      posicao: atleta.posicao,
      peDominante: atleta.peDominante,
      altura: atleta.altura,
      peso: atleta.peso,
      cidade: atleta.cidade,
      alojamento: atleta.alojamento,
      responsavel: atleta.responsavel,
      contato: atleta.contato,
    },
  });

  const onSelecionarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const mutation = useMutation({
    mutationFn: (valores: AthleteFormOutput) =>
      apiClient.put<Atleta>(`/api/athletes/${atleta.id}`, {
        ...valores,
        avatarUrl: fotoPreview,
        status,
        observacoes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      queryClient.invalidateQueries({ queryKey: ['athletes', atleta.id] });
      toast.success('Atleta atualizado com sucesso');
      onOpenChange(false);
    },
    onError: () => toast.error('Não foi possível atualizar o atleta'),
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content
          key={atleta.id}
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-bg p-5 outline-none sm:p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-text-primary">Editar atleta</Dialog.Title>
            <Dialog.Close aria-label="Fechar" className="rounded-lg p-1 text-text-secondary hover:bg-surface-alt">
              <X size={18} />
            </Dialog.Close>
          </div>

          <form
            onSubmit={handleSubmit((valores) => mutation.mutate(valores))}
            noValidate
            className="space-y-4"
          >
            <div className="flex items-center gap-4">
              <AvatarPreview control={control} fotoPreview={fotoPreview} />
              <div className="flex flex-col gap-1">
                <input
                  ref={fotoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onSelecionarFoto}
                />
                <button
                  type="button"
                  onClick={() => fotoInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-alt px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface"
                >
                  <Camera size={13} />
                  {fotoPreview ? 'Trocar foto' : 'Adicionar foto'}
                </button>
                {fotoPreview && (
                  <button
                    type="button"
                    onClick={() => setFotoPreview(undefined)}
                    className="text-xs text-text-muted hover:text-accent-red"
                  >
                    Remover foto
                  </button>
                )}
              </div>
            </div>

            <Field label="Nome completo" error={errors.nome?.message}>
              <input {...register('nome')} className={INPUT_CLASS} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Data de nascimento" error={errors.dataNascimento?.message}>
                <input type="date" {...register('dataNascimento')} className={INPUT_CLASS} />
              </Field>
              <Field label="Pé dominante">
                <Controller
                  control={control}
                  name="peDominante"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      options={PES_DOMINANTES.map((p) => ({ value: p, label: p }))}
                    />
                  )}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Categoria">
                <Controller
                  control={control}
                  name="categoria"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      options={CATEGORIAS.map((c) => ({ value: c, label: c }))}
                    />
                  )}
                />
              </Field>
              <Field label="Posição">
                <Controller
                  control={control}
                  name="posicao"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      options={POSICOES.map((p) => ({ value: p, label: p }))}
                    />
                  )}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Altura (cm)" error={errors.altura?.message}>
                <input type="number" {...register('altura')} className={INPUT_CLASS} />
              </Field>
              <Field label="Peso (kg)" error={errors.peso?.message}>
                <input type="number" {...register('peso')} className={INPUT_CLASS} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Cidade" error={errors.cidade?.message}>
                <input {...register('cidade')} className={INPUT_CLASS} />
              </Field>
              <Field label="Alojamento" error={errors.alojamento?.message}>
                <input {...register('alojamento')} className={INPUT_CLASS} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Responsável" error={errors.responsavel?.message}>
                <input {...register('responsavel')} className={INPUT_CLASS} />
              </Field>
              <Field label="Contato" error={errors.contato?.message}>
                <input {...register('contato')} className={INPUT_CLASS} />
              </Field>
            </div>

            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium text-text-secondary">Status</span>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as StatusAtleta)}
                options={STATUS_ATLETA.map((s) => ({ value: s, label: s }))}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium text-text-secondary">Observações</span>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                className={INPUT_CLASS}
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-blue py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              Salvar alterações
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
