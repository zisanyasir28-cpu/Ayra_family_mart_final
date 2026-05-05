import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { AuthShell } from './LoginPage';
import type { UserPublic } from '@superstore/shared';

// ─── Schema ──────────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Enter a valid email address'),
  phone: z
    .string()
    .regex(/^(?:\+?88)?01[3-9]\d{8}$/, 'Enter a valid Bangladeshi phone number')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .max(72)
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type FormValues = z.infer<typeof schema>;

interface RegisterResponse {
  success: true;
  data: { user: UserPublic; accessToken: string };
}

// ─── Password strength meter ──────────────────────────────────────────────────
function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: 'Weak',   color: 'bg-red-500'    };
  if (score === 2) return { score, label: 'Fair',   color: 'bg-orange-400' };
  if (score === 3) return { score, label: 'Good',   color: 'bg-yellow-400' };
  return              { score, label: 'Strong', color: 'bg-green-500'  };
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const redirect = searchParams.get('redirect') ?? '/';

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const pwValue = watch('password', '');
  const strength = useMemo(() => passwordStrength(pwValue), [pwValue]);

  async function onSubmit(values: FormValues) {
    try {
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        ...(values.phone ? { phone: values.phone } : {}),
      };
      const { data } = await api.post<RegisterResponse>('/auth/register', payload);
      setAuth(data.data.user, data.data.accessToken);
      toast.success(`Account created! Welcome, ${data.data.user.name.split(' ')[0]}! 🎉`);
      navigate(redirect, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Could not create account. Please try again.';
      setError('root', { message: msg });
    }
  }

  return (
    <AuthShell
      title="Create an account"
      subtitle="Join Ayra Family Mart for faster checkout and order tracking"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {errors.root?.message && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {errors.root.message}
          </div>
        )}

        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Full name
          </label>
          <input
            {...register('name')}
            type="text"
            autoComplete="name"
            placeholder="Rabeya Khanom"
            className={cn(
              'w-full rounded-xl border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20',
              errors.name ? 'border-red-400' : 'border-border',
            )}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Email address
          </label>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={cn(
              'w-full rounded-xl border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20',
              errors.email ? 'border-red-400' : 'border-border',
            )}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Phone (optional) */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Phone{' '}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            {...register('phone')}
            type="tel"
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
            className={cn(
              'w-full rounded-xl border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20',
              errors.phone ? 'border-red-400' : 'border-border',
            )}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              className={cn(
                'w-full rounded-xl border bg-muted py-2.5 pl-4 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20',
                errors.password ? 'border-red-400' : 'border-border',
              )}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Strength meter */}
          {pwValue && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1.5 flex-1 rounded-full transition-all duration-300',
                      strength.score >= i ? strength.color : 'bg-muted',
                    )}
                  />
                ))}
              </div>
              {strength.label && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Strength:{' '}
                  <span
                    className={cn(
                      'font-semibold',
                      strength.score <= 1 && 'text-red-500',
                      strength.score === 2 && 'text-orange-400',
                      strength.score === 3 && 'text-yellow-500',
                      strength.score >= 4 && 'text-green-600',
                    )}
                  >
                    {strength.label}
                  </span>
                </p>
              )}
            </div>
          )}
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Confirm password
          </label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              className={cn(
                'w-full rounded-xl border bg-muted py-2.5 pl-4 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20',
                errors.confirmPassword ? 'border-red-400' : 'border-border',
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account you agree to our{' '}
          <a href="#" className="text-green-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-green-600 hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          to={`/login${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
          className="font-semibold text-green-600 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
