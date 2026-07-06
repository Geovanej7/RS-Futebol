import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import type { PerfilAcesso } from '@/entities/athlete';

const loginSchema = z.object({
  email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
  senha: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginResponse {
  token: string;
  user: { nome: string; email: string; perfil: PerfilAcesso };
}

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', senha: '' },
  });

  const onSubmit = async (values: LoginForm) => {
    setFormError(null);
    try {
      const res = await apiClient.post<LoginResponse>('/api/auth/login', {
        email: values.email,
        senha: values.senha,
      });
      login({ nome: res.user.nome, email: res.user.email, perfil: res.user.perfil }, res.token);
      toast.success('Login realizado com sucesso');
      navigate('/', { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Não foi possível entrar. Tente novamente.');
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-bg px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.15), transparent 40%), radial-gradient(circle at 80% 80%, rgba(139,92,246,0.15), transparent 40%)',
        }}
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-surface/90 p-6 shadow-xl backdrop-blur sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-black">
            <img src="/logo.png" alt="RS Futebol Club" className="h-full w-full object-cover" />
          </span>
          <h1 className="text-lg font-semibold text-text-primary">RS Futebol Club</h1>
          <p className="mt-1 text-sm text-text-secondary">Entre para acessar o painel de inteligência esportiva</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-text-secondary">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
              className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2.5 text-sm text-text-primary focus:border-accent-blue focus:outline-none"
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-accent-red">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="senha" className="mb-1 block text-sm font-medium text-text-secondary">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.senha}
              aria-describedby={errors.senha ? 'senha-error' : undefined}
              {...register('senha')}
              className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2.5 text-sm text-text-primary focus:border-accent-blue focus:outline-none"
            />
            {errors.senha && (
              <p id="senha-error" className="mt-1 text-xs text-accent-red">
                {errors.senha.message}
              </p>
            )}
          </div>

          {formError && (
            <p role="alert" className="rounded-lg bg-accent-red/10 px-3 py-2 text-xs text-accent-red">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-blue py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Entrar na plataforma
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-text-muted">
          Contas de demonstração: ver <code className="text-text-secondary">CREDENCIAIS.md</code>
        </p>
      </div>
    </div>
  );
}
