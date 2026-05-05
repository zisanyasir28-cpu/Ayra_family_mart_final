import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, ShoppingBag, Sparkles, Star, Truck, Shield } from 'lucide-react';

// ─── Floating product card ─────────────────────────────────────────────────────

interface FloatingCardProps {
  emoji:  string;
  name:   string;
  price:  string;
  delay:  number;
  style?: React.CSSProperties;
}

function FloatingCard({ emoji, name, price, delay, style }: FloatingCardProps) {
  return (
    <motion.div
      className="absolute"
      style={style}
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 150, damping: 18 }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.5 + delay, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.5 }}
        className="flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-float border border-white/80"
      >
        <span className="text-2xl leading-none">{emoji}</span>
        <div>
          <div className="text-xs font-semibold text-slate-800 leading-tight">{name}</div>
          <div className="text-xs font-bold text-green-600 leading-tight">{price}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Stat badge ───────────────────────────────────────────────────────────────

function StatBadge({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur-sm"
    >
      <span className="text-2xl leading-none">{icon}</span>
      <div>
        <div className="text-base font-extrabold leading-tight text-white">{value}</div>
        <div className="text-[11px] leading-tight text-white/70">{label}</div>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function HeroBanner() {
  const sectionRef = useRef<HTMLElement>(null);

  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);
  const springX = useSpring(rawX, { stiffness: 40, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 40, damping: 20 });
  const orb1X = useTransform(springX, [0, 1], [-30, 30]);
  const orb1Y = useTransform(springY, [0, 1], [-20, 20]);
  const orb2X = useTransform(springX, [0, 1], [20, -20]);
  const orb2Y = useTransform(springY, [0, 1], [10, -10]);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width);
    rawY.set((e.clientY - rect.top) / rect.height);
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden bg-mesh-green py-20 md:py-28 lg:py-36"
    >
      {/* ── Grid overlay ─────────────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* ── Parallax orbs ────────────────────────────────────────────────── */}
      <motion.div
        className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-white/[0.04] blur-3xl"
        style={{ x: orb1X, y: orb1Y }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-20 right-0 h-[400px] w-[400px] rounded-full bg-white/[0.05] blur-3xl"
        style={{ x: orb2X, y: orb2Y }}
      />
      <motion.div
        className="pointer-events-none absolute top-1/3 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-white/[0.03] blur-2xl"
        style={{ x: orb1X, y: orb2Y }}
      />

      <div className="container relative z-10">
        <div className="flex flex-col items-center gap-14 lg:flex-row lg:items-center lg:justify-between">

          {/* ── LEFT: Text content ──────────────────────────────────────────── */}
          <div className="max-w-2xl text-center lg:text-left">

            {/* Top badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                Bangladesh's #1 Online Family Mart
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="mt-5 text-5xl font-black leading-[1.07] tracking-tight text-white md:text-6xl lg:text-[4.5rem]"
            >
              Fresh &amp; Fast
              <br />
              <span className="relative inline-block text-yellow-300">
                Delivered
                <motion.span
                  className="absolute -bottom-1 left-0 h-[3px] rounded-full bg-yellow-300/50"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.9, duration: 0.6, ease: 'easeOut' }}
                />
              </span>
              <br />
              To Your Door
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-5 text-lg leading-relaxed text-white/85 md:text-xl"
            >
              Shop thousands of products — fresh groceries, household essentials,
              electronics &amp; more. Free delivery above <span className="font-semibold text-white">৳999</span>.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.38 }}
              className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start"
            >
              <Link
                to="/products"
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-green-700 shadow-float transition-all hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-xl active:scale-95"
              >
                <ShoppingBag className="h-4 w-4" />
                Shop Now
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/products?deals=true"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/35 bg-white/15 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/25 active:scale-95"
              >
                🔥 Flash Deals
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.52 }}
              className="mt-8 flex flex-wrap justify-center gap-5 lg:justify-start"
            >
              {[
                { icon: Truck,  text: 'Free delivery above ৳999'  },
                { icon: Star,   text: '4.8★ customer rating'       },
                { icon: Shield, text: '100% secure payments'       },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-white/80">
                  <Icon className="h-4 w-4 text-white/55" />
                  <span>{text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT: Visual showcase ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.22, type: 'spring', stiffness: 100, damping: 20 }}
            className="relative hidden shrink-0 lg:block"
          >
            <div className="relative h-[320px] w-[320px]">
              {/* Central circle */}
              <div className="absolute inset-0 rounded-3xl border border-white/20 bg-white/12 backdrop-blur-sm shadow-2xl flex items-center justify-center">
                <motion.div
                  animate={{ rotate: [0, 3, -3, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-[130px] leading-none select-none"
                >
                  🛒
                </motion.div>
              </div>

              {/* Pulsing rings */}
              {[1, 2].map((n) => (
                <motion.div
                  key={n}
                  className="absolute inset-0 rounded-3xl border border-white/15"
                  animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 3, delay: n * 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}

              {/* Floating product cards */}
              <FloatingCard
                emoji="🥦" name="Broccoli" price="৳45"
                delay={0.5} style={{ right: '-28%', top: '-4%' }}
              />
              <FloatingCard
                emoji="🍎" name="Red Apple" price="৳120"
                delay={0.7} style={{ left: '-32%', top: '12%' }}
              />
              <FloatingCard
                emoji="🥛" name="Fresh Milk" price="৳68"
                delay={0.9} style={{ right: '-26%', bottom: '10%' }}
              />
              <FloatingCard
                emoji="🍞" name="Wheat Bread" price="৳35"
                delay={1.1} style={{ left: '-30%', bottom: '8%' }}
              />

              {/* Delivery badge */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, type: 'spring', stiffness: 180, damping: 18 }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap flex items-center gap-2 rounded-2xl bg-yellow-400 px-5 py-2.5 shadow-glow-gold text-sm font-bold text-yellow-900"
              >
                <Truck className="h-4 w-4" />
                Express Delivery in 60 min!
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* ── Stats row ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="mt-16 flex flex-wrap justify-center gap-3 lg:justify-start"
        >
          <StatBadge icon="📦" value="50,000+"   label="Products available" />
          <StatBadge icon="😊" value="1,00,000+" label="Happy customers"    />
          <StatBadge icon="⚡" value="60-min"    label="Express delivery"   />
          <StatBadge icon="🏙️" value="64+"       label="Districts covered"  />
        </motion.div>
      </div>
    </section>
  );
}
