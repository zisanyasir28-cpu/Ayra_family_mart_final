import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { ArrowRightIcon } from '@/components/common/HandIcon';
import { AuthShell } from './LoginPage';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent,      setSent]      = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit({ email }: FormValues) {
    try {
      await api.post('/auth/forgot-password', { email });
      setSentEmail(email);
      setSent(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ??
        'Something went wrong. Please try again.';
      toast.error(msg);
      setError('root', { message: msg });
    }
  }

  if (sent) {
    return (
      <AuthShell
        title="Check your inbox"
        subtitle="We sent reset instructions to your email."
      >
        <div className="flex flex-col items-center gap-5 py-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-saffron/15 text-saffron sm:h-20 sm:w-20">
            <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
          <p className="text-sm leading-relaxed text-cream/70">
            Email sent to{' '}
            <span className="font-semibold text-cream">{sentEmail}</span>.<br />
            Follow the link to reset your password.
            It expires in <span className="font-semibold text-saffron">30 minutes</span>.
          </p>
          <p className="text-xs text-cream/50">
            Didn't get it?{' '}
            <button
              onClick={() => setSent(false)}
              className="font-semibold text-saffron hover:text-cream"
            >
              try again
            </button>
            .
          </p>
        </div>
        <div className="mt-6 border-t border-line pt-5">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-cream/65 transition-colors hover:text-saffron"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {errors.root?.message && (
          <div className="flex items-start gap-2 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errors.root.message}</span>
          </div>
        )}

        <div>
          <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-cream/55">
            Email address
          </label>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={cn(
              'w-full rounded-xl border bg-bg px-4 py-3 text-base text-cream placeholder:text-cream/30 focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/20',
              errors.email ? 'border-coral' : 'border-line',
            )}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-coral">{errors.email.message}</p>
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
              <span>Sending</span>
            </>
          ) : (
            <>
              <span>Send reset link</span>
              <ArrowRightIcon size={14} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 border-t border-line pt-5">
        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-sm text-cream/65 transition-colors hover:text-saffron"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
