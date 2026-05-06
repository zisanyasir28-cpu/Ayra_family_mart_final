import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { ArrowRightIcon } from '@/components/common/HandIcon';
import { AuthShell } from './LoginPage';
import type { UserPublic } from '@superstore/shared';

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

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1)  return { score, label: 'Weak',   color: 'bg-coral'   };
  if (score === 2) return { score, label: 'Fair',   color: 'bg-saffron' };
  if (score === 3) return { score, label: 'Good',   color: 'bg-saffron' };
  return                  { score, label: 'Strong', color: 'bg-sage'    };
}

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

  const pwValue  = watch('password', '');
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
      toast.success(`Account created. Welcome, ${data.data.user.name.split(' ')[0]}.`);
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
      subtitle="Faster checkout, order tracking, and quiet weekly deals."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5" noValidate>
        {errors.root?.message && (
          <div className="flex items-start gap-2 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errors.root.message}</span>
          </div>
        )}

        {/* Name */}
        <Field
          label="Full name"
          register={register('name')}
          error={errors.name?.message}
          type="text"
          autoComplete="name"
          placeholder="Rabeya Khanom"
        />

        {/* Email */}
        <Field
          label="Email address"
          register={register('email')}
          error={errors.email?.message}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />

        {/* Phone */}
        <Field
          label="Phone (optional)"
          register={register('phone')}
          error={errors.phone?.message}
          type="tel"
          autoComplete="tel"
          placeholder="01XXXXXXXXX"
        />

        {/* Password */}
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-cream/55">
            Password
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

          {pwValue && (
            <div className="mt-2.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors duration-300',
                      strength.score >= i ? strength.color : 'bg-line',
                    )}
                  />
                ))}
              </div>
              {strength.label && (
                <p className="mt-1.5 text-xs text-cream/55">
                  Strength:{' '}
                  <span
                    className={cn(
                      'font-semibold',
                      strength.score <= 1 && 'text-coral',
                      strength.score === 2 && 'text-saffron',
                      strength.score === 3 && 'text-saffron',
                      strength.score >= 4 && 'text-sage',
                    )}
                  >
                    {strength.label}
                  </span>
                </p>
              )}
            </div>
          )}
          {errors.password && (
            <p className="mt-1.5 text-xs text-coral">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm */}
        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-cream/55">
            Confirm password
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
              <span>Creating</span>
            </>
          ) : (
            <>
              <span>Create account</span>
              <ArrowRightIcon size={14} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-cream/45 sm:text-xs">
          By creating an account you agree to our{' '}
          <a href="#" className="text-cream/65 hover:text-saffron">Terms</a>
          {' '}and{' '}
          <a href="#" className="text-cream/65 hover:text-saffron">Privacy Policy</a>.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-cream/65">
        Already have an account?{' '}
        <Link
          to={`/login${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
          className="font-semibold text-saffron hover:text-cream"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

// ─── Field helper ─────────────────────────────────────────────────────────────

interface FieldProps {
  label:        string;
  register:     ReturnType<ReturnType<typeof useForm<FormValues>>['register']>;
  error?:       string;
  type:         string;
  autoComplete: string;
  placeholder:  string;
}

function Field({ label, register, error, type, autoComplete, placeholder }: FieldProps) {
  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-cream/55">
        {label}
      </label>
      <input
        {...register}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-xl border bg-bg px-4 py-3 text-base text-cream placeholder:text-cream/30 focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/20',
          error ? 'border-coral' : 'border-line',
        )}
      />
      {error && <p className="mt-1.5 text-xs text-coral">{error}</p>}
    </div>
  );
}
