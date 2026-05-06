import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRightIcon } from '../common/HandIcon';
import { CountUp }       from '../common/CountUp';
import { fetchFeaturedProducts } from '../../services/products';
import { formatPaisa } from '../../lib/utils';

// ─── Use a single hover-capable check ───────────────────────────────────────
function useCanHover() {
  const [can, setCan] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setCan(
      window.matchMedia('(any-hover: hover)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
  }, []);
  return can;
}

// ─────────────────────────────────────────────────────────────────────────────
//  TILE 1 — Big headline tile (col-span 2, row-span 2)
// ─────────────────────────────────────────────────────────────────────────────

function HeadlineTile() {
  const canHover = useCanHover();
  const blobX = useMotionValue(0.5);
  const blobY = useMotionValue(0.5);
  const sx = useSpring(blobX, { stiffness: 60, damping: 18 });
  const sy = useSpring(blobY, { stiffness: 60, damping: 18 });
  const tx  = useTransform(sx, [0, 1], [-30, 30]);
  const ty  = useTransform(sy, [0, 1], [-22, 22]);
  const tx2 = useTransform(sx, [0, 1], [30, -30]);
  const ty2 = useTransform(sy, [0, 1], [22, -22]);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!canHover) return;
    const r = e.currentTarget.getBoundingClientRect();
    blobX.set((e.clientX - r.left) / r.width);
    blobY.set((e.clientY - r.top)  / r.height);
  }

  return (
    <div
      onPointerMove={onMove}
      className="bg-noise group relative flex flex-col overflow-hidden rounded-2xl bg-surface p-5 sm:p-7 sm:rounded-3xl md:p-10"
    >
      {/* Aurora blobs */}
      <motion.div
        style={canHover ? { x: tx, y: ty } : undefined}
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-aurora opacity-50 blur-3xl transition-opacity duration-700 group-hover:opacity-80 sm:-right-32 sm:-top-24 sm:h-[420px] sm:w-[420px]"
      />
      <motion.div
        style={canHover ? { x: tx2, y: ty2 } : undefined}
        className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-coral/30 opacity-50 blur-3xl sm:-bottom-32 sm:-left-24 sm:h-[360px] sm:w-[360px]"
      />

      <div className="relative z-10 flex h-full flex-col">
        {/* Top label */}
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-saffron opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-saffron" />
          </span>
          <span className="text-[10px] uppercase tracking-[0.22em] text-cream/60 sm:text-[11px]">
            Live · <span className="font-bangla normal-case tracking-normal text-cream">তাজা পণ্য</span>
          </span>
        </div>

        {/* Headline */}
        <h1 className="mt-6 font-display font-black leading-[0.95] tracking-tight text-cream sm:mt-auto sm:pt-10"
            style={{ fontSize: 'clamp(2.25rem, 8vw, 5.5rem)' }}>
          The market,<br />
          <span className="text-saffron">rewritten.</span>
        </h1>

        {/* Subline */}
        <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/70 sm:mt-6 sm:text-base md:text-lg">
          Fresh produce, daily essentials, and a few quiet luxuries — delivered across Bangladesh in under sixty minutes.
        </p>

        {/* CTAs */}
        <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4">
          <Link
            to="/products"
            className="group/btn inline-flex items-center gap-2 rounded-full bg-saffron px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-bg transition-colors hover:bg-cream sm:gap-3 sm:px-7 sm:py-3.5 sm:text-sm"
          >
            Start shopping
            <ArrowRightIcon size={14} strokeWidth={2} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Link>
          <Link
            to="/products?deals=true"
            className="font-display text-sm italic text-cream/80 transition-colors hover:text-saffron sm:text-base"
          >
            today's deals →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TILE 2 — Live order ticker
// ─────────────────────────────────────────────────────────────────────────────

function LiveStatsTile() {
  const [orders, setOrders] = useState(2847);
  useEffect(() => {
    const id = setInterval(() => setOrders((n) => n + 1), 4000 + Math.random() * 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-saffron/40 sm:rounded-3xl sm:p-6">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral" />
        <span className="text-[10px] uppercase tracking-[0.22em] text-cream/60">Live</span>
      </div>

      <div className="mt-4 sm:mt-7">
        <div className="font-display font-black leading-none text-cream tabular-nums" style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={orders}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0,   opacity: 1 }}
              exit={{    y: -20, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block"
            >
              {orders.toLocaleString()}
            </motion.span>
          </AnimatePresence>
        </div>
        <p className="mt-2 font-display text-[11px] italic text-cream/55 sm:text-sm">
          orders today
        </p>
      </div>

      {/* Sparkline */}
      <svg className="mt-3 w-full sm:mt-5" height="28" viewBox="0 0 200 36" preserveAspectRatio="none">
        <motion.path
          d="M 0 28 L 25 22 L 50 26 L 75 14 L 100 18 L 125 8 L 150 12 L 175 6 L 200 10"
          fill="none"
          stroke="hsl(var(--saffron))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TILE 3 — Featured product preview
// ─────────────────────────────────────────────────────────────────────────────

function FeaturedTile({ image, name, price }: { image: string; name: string; price: number }) {
  return (
    <Link to="/products" className="group relative block h-full overflow-hidden rounded-2xl bg-surface sm:rounded-3xl">
      <img
        src={image}
        alt={name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />

      <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 sm:inset-x-5 sm:bottom-5">
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.22em] text-cream/65 sm:text-[10px]">Pick</p>
          <h3 className="mt-0.5 line-clamp-2 font-display font-bold leading-tight text-cream sm:mt-1" style={{ fontSize: 'clamp(0.95rem, 2vw, 1.5rem)' }}>
            {name}
          </h3>
          <p className="mt-0.5 font-display font-black text-saffron sm:mt-1" style={{ fontSize: 'clamp(1rem, 2.4vw, 1.5rem)' }}>
            {formatPaisa(price)}
          </p>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-bg transition-transform duration-300 group-hover:rotate-[-45deg] sm:h-10 sm:w-10">
          <ArrowRightIcon size={14} strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TILE 4 — Bloom (animated marigold cluster)
// ─────────────────────────────────────────────────────────────────────────────

function BloomTile() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-aurora p-4 sm:rounded-3xl sm:p-6">
      <div className="relative z-10 flex h-full flex-col justify-between text-bg">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] opacity-80">Today's harvest</p>
          <h3 className="mt-2 font-display font-extrabold leading-[0.95]" style={{ fontSize: 'clamp(1.25rem, 3vw, 2rem)' }}>
            From farm,<br /><em>not factory.</em>
          </h3>
        </div>

        <div className="relative mt-4 flex h-16 items-center justify-center sm:mt-6 sm:h-24">
          {[0, 1, 2].map((i) => (
            <motion.svg
              key={i}
              viewBox="0 0 60 60"
              className="absolute h-12 w-12 sm:h-16 sm:w-16"
              style={{ left: `${30 + i * 15}%`, transform: 'translateX(-50%)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 14 + i * 4, repeat: Infinity, ease: 'linear' }}
            >
              {[0, 30, 60, 90, 120, 150].map((deg) => (
                <ellipse
                  key={deg}
                  cx="30" cy="30" rx="12" ry="4"
                  fill="hsl(33 20% 6%)"
                  opacity={0.65 - i * 0.15}
                  transform={`rotate(${deg} 30 30)`}
                />
              ))}
              <circle cx="30" cy="30" r="4" fill="hsl(33 20% 6%)" />
            </motion.svg>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TILE 5 — Delivery 60-min counter
// ─────────────────────────────────────────────────────────────────────────────

function DeliveryTile() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-coral/40 sm:rounded-3xl sm:p-6">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.22em] text-cream/60">Express</span>
      </div>

      <div className="mt-3 flex items-baseline gap-2 sm:mt-6">
        <span className="font-display font-black leading-none text-cream tabular-nums" style={{ fontSize: 'clamp(2.5rem, 9vw, 5.5rem)' }}>
          <CountUp to={60} />
        </span>
        <span className="font-display text-lg text-cream/55 sm:text-2xl">min</span>
      </div>

      <p className="mt-2 max-w-[18ch] font-display text-sm leading-snug text-cream/60 sm:mt-4 sm:text-base">
        Same-day delivery across Dhaka. <em className="text-coral">Track from kitchen to door.</em>
      </p>

      <svg className="mt-3 w-full sm:mt-4" height="36" viewBox="0 0 200 44" preserveAspectRatio="none">
        <line x1="0" y1="22" x2="200" y2="22" stroke="hsl(var(--line))" strokeWidth="1" strokeDasharray="4 4" />
        <motion.g
          animate={{ x: [0, 180, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <text x="-2" y="18" fontSize="22">🛵</text>
        </motion.g>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TILE 6 — Open the market CTA
// ─────────────────────────────────────────────────────────────────────────────

function ScanTile() {
  return (
    <Link
      to="/products"
      className="group relative flex h-full min-h-[150px] flex-col justify-between overflow-hidden rounded-2xl bg-cream p-4 text-bg transition-colors hover:bg-saffron sm:min-h-[180px] sm:rounded-3xl sm:p-6"
    >
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.22em] text-bg/60">Browse</span>
      </div>

      <div>
        <h3 className="font-display font-extrabold leading-tight text-bg" style={{ fontSize: 'clamp(1.25rem, 3vw, 2rem)' }}>
          50,000+ products
        </h3>
        <p className="mt-1.5 font-display text-xs italic text-bg/65 sm:mt-2 sm:text-base">
          Search anything — we probably stock it.
        </p>

        <span className="mt-3 inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.16em] sm:mt-5 sm:text-sm">
          Open the market
          <ArrowRightIcon size={14} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-1.5" />
        </span>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main HeroBanner
// ─────────────────────────────────────────────────────────────────────────────

const containerVar = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const tileVar = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 24 } },
};

export function HeroBanner() {
  const { data: featured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn:  fetchFeaturedProducts,
    staleTime: 1000 * 60 * 5,
  });

  const featuredOne = featured?.[0];

  return (
    <section className="relative bg-bg pt-6 pb-12 sm:pt-8 sm:pb-16 md:pt-12 md:pb-20">
      <div className="container relative">
        {/* Bento grid:
            mobile  (2-col) → Headline(2) / LiveStats|Bloom / Featured(2) / Delivery|Scan
            desktop (4-col) → Headline(2x2)|LiveStats|Featured(1x2) / -|Bloom|- / Delivery(2)|Scan(2)
        */}
        <motion.div
          variants={containerVar}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4 md:gap-4"
        >
          {/* Tile 1: Headline */}
          <motion.div variants={tileVar} className="col-span-2 md:col-span-2 md:row-span-2 min-h-[300px] sm:min-h-[380px]">
            <HeadlineTile />
          </motion.div>

          {/* Tile 2: Live stats */}
          <motion.div variants={tileVar} className="col-span-1 md:col-span-1 min-h-[170px]">
            <LiveStatsTile />
          </motion.div>

          {/* Tile 3: Bloom — mobile shows here (right of LiveStats) */}
          <motion.div variants={tileVar} className="col-span-1 md:hidden min-h-[170px]">
            <BloomTile />
          </motion.div>

          {/* Tile 4: Featured — mobile full width, desktop col-1 row-2 */}
          <motion.div variants={tileVar} className="col-span-2 md:col-span-1 md:row-span-2 min-h-[260px] sm:min-h-[380px]">
            {featuredOne && featuredOne.images[0] ? (
              <FeaturedTile
                image={featuredOne.images[0].url}
                name={featuredOne.name}
                price={featuredOne.effectivePriceInPaisa}
              />
            ) : (
              <div className="h-full skeleton rounded-2xl sm:rounded-3xl" />
            )}
          </motion.div>

          {/* Tile 5: Bloom — desktop only (under LiveStats) */}
          <motion.div variants={tileVar} className="hidden md:block md:col-span-1 min-h-[170px]">
            <BloomTile />
          </motion.div>

          {/* Tile 6: Delivery — full width mobile, 2 cols desktop */}
          <motion.div variants={tileVar} className="col-span-1 md:col-span-2 min-h-[170px]">
            <DeliveryTile />
          </motion.div>

          {/* Tile 7: Scan — col-1 mobile, 2 cols desktop */}
          <motion.div variants={tileVar} className="col-span-1 md:col-span-2 min-h-[170px]">
            <ScanTile />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
