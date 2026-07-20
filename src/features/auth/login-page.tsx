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

        <div className="mt-4 flex justify-center">
          <a
            href="https://manguehouse.com/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            <svg width="21" height="14" viewBox="0 0 21 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-auto text-current">
              <rect x="5.10205" y="3.93286" width="10.6294" height="1.27552" fill="currentColor" />
              <rect x="5.1084" y="3.95032" width="10.6251" height="5.72121" fill="currentColor" />
              <rect x="5.65576" y="6.49353" width="9.53089" height="4.6607" fill="currentColor" />
              <rect x="5.28857" y="11.0577" width="2.56413" height="0.80129" transform="rotate(180 5.28857 11.0577)" fill="currentColor" />
              <rect width="2.56413" height="0.80129" transform="matrix(1 8.74226e-08 8.74229e-08 -1 15.5449 11.0577)" fill="currentColor" />
              <rect width="2.56413" height="0.80129" transform="matrix(1 8.74226e-08 8.74229e-08 -1 16.667 9.93591)" fill="currentColor" />
              <rect x="4.1665" y="9.93591" width="2.56413" height="0.80129" transform="rotate(180 4.1665 9.93591)" fill="currentColor" />
              <rect x="3.52539" y="10.2565" width="2.88464" height="0.801291" transform="rotate(90 3.52539 10.2565)" fill="currentColor" />
              <rect width="2.88464" height="0.801291" transform="matrix(-1.39071e-07 1 1 1.39071e-07 17.3081 10.2565)" fill="currentColor" />
              <rect width="2.88464" height="0.801291" transform="matrix(-1.39071e-07 1 1 1.39071e-07 18.4297 9.13464)" fill="currentColor" />
              <rect x="2.40381" y="9.13464" width="2.88464" height="0.801291" transform="rotate(90 2.40381 9.13464)" fill="currentColor" />
              <rect x="4.22314" y="5.44873" width="12.3279" height="2.79249" fill="currentColor" />
              <rect x="7.54102" y="1.51855" width="0.62841" height="3.08968" fill="currentColor" />
              <rect x="7.01514" width="1.7007" height="1.7007" fill="currentColor" />
              <rect x="12.6729" y="1.51855" width="0.62841" height="3.77045" fill="currentColor" />
              <rect x="12.1172" width="1.7007" height="1.7007" fill="currentColor" />
              <rect x="2.12598" y="3.82654" width="1.91329" height="1.27552" fill="currentColor" />
              <rect x="1.59424" y="5.3147" width="1.91329" height="1.27552" fill="currentColor" />
              <rect x="0.531738" y="2.76367" width="1.91329" height="1.27552" fill="currentColor" />
              <rect y="4.25171" width="1.91329" height="1.27552" fill="currentColor" />
              <rect width="1.91329" height="1.27552" transform="matrix(-1 0 0 1 18.7075 3.72021)" fill="currentColor" />
              <rect width="1.91329" height="1.27552" transform="matrix(-1 0 0 1 19.2393 5.20837)" fill="currentColor" />
              <rect width="1.91329" height="1.27552" transform="matrix(-1 0 0 1 20.3022 2.65735)" fill="currentColor" />
              <rect width="1.91329" height="1.27552" transform="matrix(-1 0 0 1 20.8335 4.14551)" fill="currentColor" />
            </svg>
            Desenvolvido por Mangue House
          </a>
        </div>
      </div>
    </div>
  );
}
