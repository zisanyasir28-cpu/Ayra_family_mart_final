import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { ArrowRightIcon } from '@/components/common/HandIcon';
import { AuthShell } from './LoginPage';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .max(72)
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done,        setDone]        = useState(false);

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // ── Invalid / missing token ───────────────────────────────────────────────
  if (!token) {
    return (
      <AuthShell
        title="Invalid reset link"
        subtitle="This reset link is missing a token."
      >
        <div className="flex flex-col items-center gap-5 py-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-coral/15 text-coral sm:h-20 sm:w-20">
            <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
          <p className="text-sm leading-relaxed text-cream/70">
            The link you followed is incomplete or has expired.<br />
            Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="group inline-flex items-center gap-2 rounded-full bg-saffron px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-bg transition-colors hover:bg-cream"
          >
            Request new link
            <ArrowRightIcon size={13} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </AuthShell>
    );
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <AuthShell
        title="Password updated"
        subtitle="You can now sign in with your new password."
      >
        <div className="flex flex-col items-center gap-5 py-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/15 text-sage sm:h-20 sm:w-20">
            <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
          <p className="text-sm leading-relaxed text-cream/70">
            All done. Redirecting you to sign in…
          </p>
          <Link
            to="/login"
            className="group inline-flex items-center gap-2 rounded-full bg-saffron px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-bg transition-colors hover:bg-cream"
          >
            Go to sign in
            <ArrowRightIcon size={13} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </AuthShell>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  async function onSubmit({ password }: FormValues) {
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      toast.success('Password updated.');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ??
        'This reset link has expired. Please request a new one.';
      setError('root', { message: msg });
    }
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose something strong — eight characters minimum."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {errors.root?.message && (
          <div className="flex items-start gap-2 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {errors.root.message}{' '}
              <Link to="/forgot-password" className="font-semibold text-cream underline">
                Request a new link
              </Link>
            </span>
          </div>
        )}

        {/* New password */}
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-cream/55">
            New password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
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
          <p className="mt-1.5 text-xs text-cream/45">
            Min 8 chars · one uppercase · one number
          </p>
        </div>

        {/* Confirm */}
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-cream/55">
            Confirm new password
          </label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              className={cn(
                'w-full rounded-xl border bg-bg py-3 pl-4 pr-11 text-base text-cream placeholder:text-cream/30 focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/20',
                errors.confirmPassword ? 'border-coral' : 'border-line',
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/50 transition-colors hover:text-cream"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-coral">{errors.confirmPassword.message}</p>
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
              <span>Updating</span>
            </>
          ) : (
            <>
              <span>Update password</span>
              <ArrowRightIcon size={14} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
