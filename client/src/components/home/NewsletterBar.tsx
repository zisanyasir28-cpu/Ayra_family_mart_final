import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Inline SVG social icons (lucide v1 removed brand icons) ─────────────────
function FacebookIcon(p: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function InstagramIcon(p: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function YoutubeIcon(p: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.95C18.88 4 12 4 12 4s-6.88 0-8.59.47a2.78 2.78 0 0 0-1.95 1.95C1 8.12 1 12 1 12s0 3.88.46 5.58a2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95C23 15.88 23 12 23 12s0-3.88-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
    </svg>
  );
}
function TiktokIcon(p: React.SVGProps<SVGSVGElement>): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.95a8.16 8.16 0 0 0 4.77 1.52V7.03a4.85 4.85 0 0 1-1-.34z" />
    </svg>
  );
}

const SOCIALS: Array<{
  label: string;
  href:  string;
  Icon:  (p: React.SVGProps<SVGSVGElement>) => React.ReactElement;
}> = [
  { label: 'Facebook',  href: '#', Icon: FacebookIcon  },
  { label: 'Instagram', href: '#', Icon: InstagramIcon },
  { label: 'YouTube',   href: '#', Icon: YoutubeIcon   },
  { label: 'TikTok',    href: '#', Icon: TiktokIcon    },
];

// ─── NewsletterBar ────────────────────────────────────────────────────────────

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
      toast.success('Welcome — ৳100 off sent to your inbox!');
    }, 900);
  }

  return (
    <section className="relative overflow-hidden bg-surface py-14 sm:py-16">

      {/* Glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-saffron/10 blur-[100px]" />
        <div className="absolute -right-24 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-plum/15 blur-[100px]" />
      </div>

      <div className="container relative">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-8">

          {/* ── Col 1: App Download ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-saffron/25 bg-saffron/10 px-3 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-saffron" />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-saffron">
                Get the App
              </span>
            </div>
            <h3 className="font-display text-2xl font-black leading-tight text-cream sm:text-3xl">
              Download the<br />
              <span className="text-saffron">Ayra App</span> Now!
            </h3>
            <p className="mt-2 text-sm text-cream/55">
              Order in 30 seconds. Track live. Exclusive app-only deals every day.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              {/* Play Store */}
              <a
                href="#"
                className="group flex items-center gap-3 rounded-2xl border border-line/60 bg-surface-2/80 px-4 py-3 transition hover:border-saffron/40 hover:bg-surface-2"
              >
                <span className="text-2xl">▶</span>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-cream/50">Get it on</p>
                  <p className="font-display text-sm font-bold text-cream">Google Play</p>
                </div>
              </a>
              {/* App Store */}
              <a
                href="#"
                className="group flex items-center gap-3 rounded-2xl border border-line/60 bg-surface-2/80 px-4 py-3 transition hover:border-saffron/40 hover:bg-surface-2"
              >
                <span className="text-2xl">🍎</span>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-cream/50">Download on the</p>
                  <p className="font-display text-sm font-bold text-cream">App Store</p>
                </div>
              </a>
            </div>
          </motion.div>

          {/* ── Col 2: Newsletter Signup ────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            <h3 className="font-display text-2xl font-black leading-tight text-cream sm:text-3xl">
              Subscribe &amp; Get<br />
              <span className="text-coral">Best Offers!</span>
            </h3>
            <p className="mt-2 text-sm text-cream/55">
              Get <strong className="text-coral">৳100 off</strong> your first order. One quiet email a fortnight — no spam, ever.
            </p>

            <div className="mt-5">
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div
                    key="done"
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.92, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                    className="flex items-center gap-3 rounded-2xl border border-saffron/30 bg-saffron/10 px-5 py-4"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-saffron" />
                    <div>
                      <p className="font-display text-sm font-bold text-cream">You&apos;re on the list!</p>
                      <p className="text-xs text-cream/60">
                        Your <span className="text-saffron">৳100 discount</span> is on its way.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-2.5 sm:flex-row"
                  >
                    <div className="relative flex-1 overflow-hidden rounded-full border border-line bg-surface transition-colors focus-within:border-saffron focus-within:ring-2 focus-within:ring-saffron/25">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-transparent px-5 py-3.5 text-sm text-cream placeholder:text-cream/35 focus:outline-none"
                        required
                        disabled={loading}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-saffron px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-bg transition hover:bg-saffron/90 hover:shadow-[0_0_24px_-4px_hsl(var(--saffron)/0.6)] disabled:opacity-60"
                    >
                      {loading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-bg/40 border-t-bg" />
                      ) : (
                        <>
                          Subscribe
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-cream/35">
              10,000+ subscribers · No spam, ever
            </p>
          </motion.div>

          {/* ── Col 3: Social Links ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-display text-2xl font-black leading-tight text-cream sm:text-3xl">
              Follow Us &amp;<br />
              <span className="text-saffron">Stay Updated</span>
            </h3>
            <p className="mt-2 text-sm text-cream/55">
              Daily deals, recipe tips, and behind-the-scenes freshness — straight to your feed.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-line/60 bg-surface-2/80 text-cream/70 transition hover:border-saffron hover:bg-saffron hover:text-bg hover:shadow-[0_0_16px_-4px_hsl(var(--saffron)/0.6)]"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            {/* Followers count */}
            <div className="mt-6 flex items-center gap-4 text-sm text-cream/50">
              <div>
                <p className="font-display text-xl font-black text-cream">48K+</p>
                <p className="text-[10px] uppercase tracking-wider">Followers</p>
              </div>
              <div className="h-8 w-px bg-line" />
              <div>
                <p className="font-display text-xl font-black text-cream">12K+</p>
                <p className="text-[10px] uppercase tracking-wider">Reviews</p>
              </div>
              <div className="h-8 w-px bg-line" />
              <div>
                <p className="font-display text-xl font-black text-cream">4.9 ★</p>
                <p className="text-[10px] uppercase tracking-wider">Rating</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
