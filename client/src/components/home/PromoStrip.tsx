import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Zap, Truck, Award, Coins, ArrowRight } from 'lucide-react';

// ─── Countdown to end-of-day ─────────────────────────────────────────────────
function useCountdown() {
  // Target = midnight tonight (resets at page load if past midnight)
  const target = useMemo(() => {
    const t = new Date();
    t.setHours(23, 59, 59, 0);
    if (t.getTime() <= Date.now()) t.setDate(t.getDate() + 1);
    return t.getTime();
  }, []);

  const [remaining, setRemaining] = useState(() => Math.max(0, target - Date.now()));

  useEffect(() => {
    const id = setInterval(() => setRemaining(Math.max(0, target - Date.now())), 1_000);
    return () => clearInterval(id);
  }, [target]);

  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1_000);

  const pad = (n: number) => String(n).padStart(2, '0');
  return { h: pad(h), m: pad(m), s: pad(s) };
}

// ─── TimeUnit chip ────────────────────────────────────────────────────────────
function TimeUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="min-w-[2.8rem] rounded-xl bg-saffron/20 px-2 py-1 text-center font-display text-xl font-black tabular-nums text-saffron">
        {value}
      </span>
      <span className="mt-0.5 text-[9px] uppercase tracking-wider text-cream/45">{label}</span>
    </div>
  );
}

// ─── PromoStrip ───────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 24 } },
};

export function PromoStrip() {
  const { h, m, s } = useCountdown();

  return (
    <section className="bg-bg py-10 sm:py-12">
      <div className="container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >

          {/* ── Card 1: Today's Best Deal + countdown ──────────────────── */}
          <motion.div
            variants={cardVariants}
            className="relative overflow-hidden rounded-3xl border border-saffron/20 bg-gradient-to-br from-saffron/15 via-surface to-surface p-5 shadow-[0_0_40px_-16px_hsl(var(--saffron)/0.3)]"
          >
            <div className="flex items-center gap-2.5 text-saffron">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-saffron/20">
                <Zap className="h-4 w-4 fill-current" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                Today&apos;s Best Deal
              </span>
            </div>
            <p className="mt-1 text-xs text-cream/50">Limited time offers — ending in</p>

            <div className="mt-4 flex items-end gap-2">
              <TimeUnit value={h} label="HRS" />
              <span className="mb-3 font-display text-lg font-black text-saffron">:</span>
              <TimeUnit value={m} label="MIN" />
              <span className="mb-3 font-display text-lg font-black text-saffron">:</span>
              <TimeUnit value={s} label="SEC" />
            </div>

            <Link
              to="/products?onSale=true"
              className="group mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-saffron transition hover:text-cream"
            >
              View All Deals
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            {/* Decorative glow dot */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-saffron/15 blur-2xl"
            />
          </motion.div>

          {/* ── Card 2: Free Delivery ────────────────────────────────────── */}
          <motion.div
            variants={cardVariants}
            className="relative overflow-hidden rounded-3xl border border-sage/20 bg-gradient-to-br from-sage/15 via-surface to-surface p-5 shadow-[0_0_40px_-16px_hsl(var(--sage)/0.25)]"
          >
            <div className="flex items-center gap-2.5 text-sage">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage/20">
                <Truck className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                Free Delivery
              </span>
            </div>

            <p className="mt-4 font-display text-2xl font-black leading-tight text-cream">
              On orders<br />
              <span className="text-sage">over ৳1,500</span>
            </p>

            <p className="mt-2 text-xs text-cream/50">
              No hidden fees. No minimum fuss.
            </p>
            <p className="mt-1 font-bangla text-xs text-cream/40">
              বিনামূল্যে ডেলিভারি
            </p>

            <div
              aria-hidden
              className="pointer-events-none absolute -right-6 -bottom-6 text-[80px] select-none leading-none opacity-15"
            >
              🛵
            </div>
          </motion.div>

          {/* ── Card 3: Member Exclusive ─────────────────────────────────── */}
          <motion.div
            variants={cardVariants}
            className="relative overflow-hidden rounded-3xl border border-coral/20 bg-gradient-to-br from-coral/15 via-surface to-surface p-5 shadow-[0_0_40px_-16px_hsl(var(--coral)/0.25)]"
          >
            <div className="flex items-center gap-2.5 text-coral">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coral/20">
                <Award className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                Member Exclusive
              </span>
            </div>

            {/* Mini member card */}
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-coral/30 via-saffron/15 to-plum/20 p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-coral/80">
                Ayra Gold Member
              </p>
              <p className="font-display text-xl font-black text-cream">Extra 15% Off</p>
              <p className="mt-0.5 text-[10px] text-cream/60">on every purchase</p>
            </div>

            <Link
              to="/products?collection=fresh-plus"
              className="group mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-coral transition hover:text-cream"
            >
              Join Now
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-coral/15 blur-2xl"
            />
          </motion.div>

          {/* ── Card 4: Ayra Points ──────────────────────────────────────── */}
          <motion.div
            variants={cardVariants}
            className="relative overflow-hidden rounded-3xl border border-plum/20 bg-gradient-to-br from-plum/15 via-surface to-surface p-5 shadow-[0_0_40px_-16px_hsl(var(--plum)/0.3)]"
          >
            <div className="flex items-center gap-2.5 text-plum">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-plum/20">
                <Coins className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                Ayra Points
              </span>
            </div>

            <p className="mt-1 font-bangla text-xs text-cream/40">আপনার পয়েন্ট</p>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-4xl font-black text-cream tabular-nums">
                860
              </span>
              <span className="font-display text-sm text-cream/55">Points</span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-plum to-saffron"
                initial={{ width: '0%' }}
                whileInView={{ width: '60%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
              />
            </div>
            <p className="mt-1 text-[10px] text-cream/40">640 more to Platinum tier</p>

            <Link
              to="/account"
              className="group mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-plum transition hover:text-cream"
            >
              Redeem Now
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <div
              aria-hidden
              className="pointer-events-none absolute -right-6 -bottom-4 text-[72px] select-none leading-none opacity-10"
            >
              🪙
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
