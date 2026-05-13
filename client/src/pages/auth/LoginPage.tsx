import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { DEMO_MODE, DEMO_USERS, DEMO_PASSWORDS } from '@/lib/demoMode';
import { cn } from '@/lib/utils';
import { ArrowRightIcon } from '@/components/common/HandIcon';
import type { UserPublic } from '@superstore/shared';

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

interface LoginResponse {
  success: true;
  data: { user: UserPublic; accessToken: string };
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();
  const [showPw, setShowPw] = useState(false);

  const redirect = searchParams.get('redirect') ?? '/';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    if (DEMO_MODE) {
      const user = DEMO_USERS[values.email];
      if (user && DEMO_PASSWORDS[values.email] === values.password) {
        setAuth(user, 'demo-access-token');
        toast.success(`Welcome back, ${user.name.split(' ')[0]}.`);
        navigate(redirect, { replace: true });
      } else {
        setError('root', { message: 'Invalid email or password' });
      }
      return;
    }

    try {
      const { data } = await api.post<LoginResponse>('/auth/login', values);
      setAuth(data.data.user, data.data.accessToken);
      toast.success(`Welcome back, ${data.data.user.name.split(' ')[0]}.`);
      navigate(redirect, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Invalid email or password';
      setError('root', { message: msg });
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your account.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {errors.root?.message && (
          <div className="flex items-start gap-2 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errors.root.message}</span>
          </div>
        )}

        <FieldEmail register={register('email')} error={errors.email?.message} />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs uppercase tracking-[0.18em] text-cream/55">Password</label>
            <Link to="/forgot-password" className="text-xs text-saffron hover:text-cream">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className={cn(
                'w-full rounded-xl border bg-bg py-3 pl-4 pr-11 text-base text-cream placeholder:text-cream/30 focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/20',
                errors.password ? 'border-coral' : 'border-line',
              )}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/50 transition-colors hover:text-cream"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-coral">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group flex w-full items-center justify-center gap-2 rounded-full bg-saffron py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-bg transition-colors hover:bg-cream active:scale-[0.98] disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-bg/30 border-t-bg" />
              <span>Signing in</span>
            </>
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRightIcon size={14} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-cream/65">
        Don't have an account?{' '}
        <Link
          to={`/register${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
          className="font-semibold text-saffron hover:text-cream"
        >
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}

// ─── Reusable email field ─────────────────────────────────────────────────────

interface FieldEmailProps {
  register: ReturnType<ReturnType<typeof useForm<FormValues>>['register']>;
  error?:   string;
}

function FieldEmail({ register, error }: FieldEmailProps) {
  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-cream/55">
        Email address
      </label>
      <input
        {...register}
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        className={cn(
          'w-full rounded-xl border bg-bg px-4 py-3 text-base text-cream placeholder:text-cream/30 focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/20',
          error ? 'border-coral' : 'border-line',
        )}
      />
      {error && <p className="mt-1.5 text-xs text-coral">{error}</p>}
    </div>
  );
}

// ─── Shared auth shell — dark, mobile-first ──────────────────────────────────

interface AuthShellProps {
  title:    string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-8 sm:px-6 sm:py-12">
      {/* Aurora bg glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-aurora absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-20 blur-3xl" />
      </div>

      {/* Logo */}
      <Link to="/" className="relative mb-7 inline-flex items-center gap-2.5 sm:mb-10">
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-saffron font-display text-bg shadow-saffron">
          <span className="font-display font-black tracking-tight">A</span>
          <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-coral ring-2 ring-bg" />
        </span>
        <span className="font-display text-xl font-black tracking-tight text-cream">
          Ayra<span className="text-saffron">.</span>
        </span>
      </Link>

      {/* Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-lift sm:p-8 sm:rounded-3xl">
        <div className="mb-6 sm:mb-7">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-cream sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-cream/65">{subtitle}</p>
        </div>
        {children}
      </div>

      {/* Back link */}
      <Link
        to="/"
        className="mt-6 text-xs uppercase tracking-[0.18em] text-cream/45 hover:text-cream sm:mt-8"
      >
        ← Back to homepage
      </Link>
    </div>
  );
}
