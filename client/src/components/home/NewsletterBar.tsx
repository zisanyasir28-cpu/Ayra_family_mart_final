import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowRightIcon } from '../common/HandIcon';
import { MagneticButton } from '../common/MagneticButton';

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
      toast.success('Welcome — check your inbox for ৳100 off your first order.');
    }, 900);
  }

  return (
    <section className="relative overflow-hidden bg-bg py-24 sm:py-32">
      {/* Aurora glow background */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="bg-aurora h-[600px] w-[600px] rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="eyebrow justify-center"
          >
            <span className="eyebrow-dot" />
            <span>The dispatch · <span className="font-bangla normal-case tracking-normal text-cream">চিঠি</span></span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="display-lg mt-5 text-cream"
          >
            Get <em className="text-saffron">৳100 off</em><br />
            your first order.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-5 max-w-md font-display text-base italic text-cream/70 sm:text-lg"
          >
            One quiet email a fortnight. The season's best produce, recipes, and discounts kept off the homepage.
          </motion.p>

          {/* Form */}
          <div className="mt-12">
            <AnimatePresence mode="wait">
              {done ? (
                <motion.div
                  key="done"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                  className="mx-auto max-w-md rounded-2xl border border-saffron/30 bg-surface px-7 py-6"
                >
                  <span className="text-3xl">🌼</span>
                  <h3 className="mt-3 font-display text-2xl font-bold text-cream">You're on the list.</h3>
                  <p className="mt-2 text-sm text-cream/65">
                    We just sent your <strong className="text-saffron">৳100 welcome discount</strong> — keep an eye on your inbox.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="mx-auto flex max-w-lg flex-col items-stretch gap-3 sm:flex-row"
                >
                  <div className="relative flex-1 rounded-full border border-line bg-surface transition-colors focus-within:border-saffron">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full rounded-full bg-transparent px-6 py-4 font-display text-base text-cream placeholder:font-display placeholder:italic placeholder:text-cream/35 focus:outline-none"
                      required
                      disabled={loading}
                    />
                  </div>

                  <MagneticButton
                    type="submit"
                    disabled={loading}
                    strength={6}
                    className="group/sub inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-saffron px-7 py-4 text-sm font-bold uppercase tracking-[0.18em] text-bg transition-colors hover:bg-cream disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-bg/40 border-t-bg" />
                        <span>Sending</span>
                      </>
                    ) : (
                      <>
                        <span>Send me ৳100 off</span>
                        <ArrowRightIcon size={14} strokeWidth={2} className="transition-transform duration-300 group-hover/sub:translate-x-1" />
                      </>
                    )}
                  </MagneticButton>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Trust line */}
          <p className="mt-7 text-xs uppercase tracking-[0.22em] text-cream/40">
            10,000+ subscribers · No spam, ever
          </p>
        </div>
      </div>
    </section>
  );
}
