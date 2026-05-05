import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export function NewsletterBar() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      setEmail('');
      toast.success("🎉 You're subscribed! Check your inbox for a welcome discount.");
    }, 900);
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-800 via-green-700 to-teal-700 py-16">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow orbs */}
      <div className="pointer-events-none absolute -top-16 left-1/4 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-1/4 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6 text-center"
        >
          {/* Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur-sm shadow-lg">
            <Mail className="h-7 w-7 text-white" />
          </div>

          {/* Headline */}
          <div>
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              Get Exclusive Deals in Your Inbox
            </h2>
            <p className="mt-2 text-white/75">
              Subscribe and get{' '}
              <strong className="text-white">৳100 off</strong>{' '}
              your first order + weekly deals &amp; offers.
            </p>
          </div>

          {/* Form */}
          {done ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="flex items-center gap-3 rounded-2xl border border-white/25 bg-white/15 px-6 py-4 backdrop-blur-sm"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">You're all set!</div>
                <div className="text-sm text-white/70">Welcome discount sent to your inbox.</div>
              </div>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-2xl border border-white/20 bg-white/15 py-3.5 pl-10 pr-4 text-sm text-white placeholder:text-white/50 backdrop-blur-sm transition focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/30"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="group flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-green-700 shadow-float transition-all hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-xl active:scale-95 disabled:opacity-70"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Social proof */}
          <div className="flex items-center gap-2 text-xs text-white/55">
            <div className="flex -space-x-2">
              {['👩', '👨', '🧑', '👩'].map((e, i) => (
                <div
                  key={i}
                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-green-700 bg-green-600 text-sm"
                >
                  {e}
                </div>
              ))}
            </div>
            <span>10,000+ subscribers • No spam, ever.</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
