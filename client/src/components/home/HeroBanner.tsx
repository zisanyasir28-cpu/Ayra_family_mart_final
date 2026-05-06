import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRightIcon } from '../common/HandIcon';
import { CountUp }       from '../common/CountUp';
import { fetchFeaturedProducts } from '../../services/products';
import { formatPaisa } from '../../lib/utils';
import { cn } from '../../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
//  TILE 1 — Brand statement (big, dominant)
// ─────────────────────────────────────────────────────────────────────────────

function HeadlineTile() {
  // Mouse parallax for the gradient blob
  const blobX = useMotionValue(0.5);
  const blobY = useMotionValue(0.5);
  const sx = useSpring(blobX, { stiffness: 60, damping: 18 });
  const sy = useSpring(blobY, { stiffness: 60, damping: 18 });
  const tx = useTransform(sx, [0, 1], [-40, 40]);
  const ty = useTransform(sy, [0, 1], [-30, 30]);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    blobX.set((e.clientX - r.left) / r.width);
    blobY.set((e.clientY - r.top)  / r.height);
  }

  return (
    <div
      onPointerMove={onMove}
      className="bg-noise group relative overflow-hidden rounded-3xl bg-surface p-7 sm:p-10 md:col-span-2 md:row-span-2"
    >
      {/* Aurora blob */}
      <motion.div
        style={{ x: tx, y: ty }}
        className="pointer-events-none absolute -right-32 -top-24 h-[420px] w-[420px] rounded-full bg-aurora opacity-50 blur-3xl transition-opacity duration-700 group-hover:opacity-80"
      />
      <motion.div
        style={{ x: useTransform(sx, [0, 1], [40, -40]), y: useTransform(sy, [0, 1], [30, -30]) }}
        className="pointer-events-none absolute -bottom-32 -left-24 h-[360px] w-[360px] rounded-full bg-coral/30 opacity-50 blur-3xl"
      />

      <div className="relative z-10 flex h-full flex-col">
        {/* Top label */}
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-saffron opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-saffron" />
          </span>
          <span className="text-[11px] uppercase tracking-[0.22em] text-cream/60">
            Live · <span className="font-bangla normal-case tracking-normal text-cream">তাজা পণ্য</span> · Fresh today
          </span>
        </div>

        {/* Massive headline */}
        <h1 className="display-xl mt-auto pt-12 text-cream">
          The market,<br />
          <span className="text-saffron">rewritten</span>
          <span className="inline-block animate-pulse text-saffron">.</span>
        </h1>

        {/* Subline */}
        <p className="mt-6 max-w-md text-base leading-relaxed text-cream/70 md:text-lg">
          Fresh produce, daily essentials, and a few quiet luxuries — delivered across Bangladesh in under sixty minutes.
        </p>

        {/* CTA pair */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            to="/products"
            className="group/btn inline-flex items-center gap-3 rounded-full bg-saffron px-7 py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-bg transition-all hover:bg-cream hover:shadow-saffron"
          >
            Start shopping
            <span className="transition-transform duration-300 group-hover/btn:translate-x-1">
              <ArrowRightIcon size={16} strokeWidth={2} />
            </span>
          </Link>
          <Link
            to="/products?deals=true"
            className="link-underline font-display text-base italic text-cream/80 hover:text-saffron"
          >
            or see today's deals
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TILE 2 — Live stats (number ticker)
// ─────────────────────────────────────────────────────────────────────────────

function LiveStatsTile() {
  // Tick "orders today" by 1 every 4-7s for a "live" feel
  const [orders, setOrders] = useState(2847);
  useEffect(() => {
    const id = setInterval(() => setOrders((n) => n + 1), 4000 + Math.random() * 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-line bg-surface p-6 transition-colors hover:border-saffron/40 sm:p-7">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-coral" />
        <span className="text-[11px] uppercase tracking-[0.22em] text-cream/60">Live</span>
      </div>

      <div className="mt-8">
        <div className="font-display text-5xl font-black tabular-nums text-cream sm:text-6xl">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={orders}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0,  opacity: 1 }}
              exit={{    y: -30, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block"
            >
              {orders.toLocaleString()}
            </motion.span>
          </AnimatePresence>
        </div>
        <p className="mt-3 font-display text-sm italic text-cream/55">
          orders shipped today
        </p>
      </div>

      {/* Sparkline */}
      <svg className="mt-5 w-full" height="36" viewBox="0 0 200 36" preserveAspectRatio="none">
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
    <Link
      to="/products"
      className="group relative col-span-2 overflow-hidden rounded-3xl bg-surface md:col-span-1"
    >
      <img
        src={image}
        alt={name}
        loading="lazy"
        className="h-full min-h-[220px] w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-110"
      />
      {/* Bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />

      <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-cream/65">Editor's pick</p>
          <h3 className="mt-1 font-display text-xl font-bold text-cream sm:text-2xl">{name}</h3>
          <p className="mt-0.5 font-display text-2xl font-black text-saffron">{formatPaisa(price)}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream text-bg transition-transform duration-300 group-hover:rotate-[-45deg]">
          <ArrowRightIcon size={16} strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TILE 4 — Animated SVG marigold / illustration
// ─────────────────────────────────────────────────────────────────────────────

function BloomTile() {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-aurora p-6 sm:p-7">
      {/* Inner content sits over aurora gradient */}
      <div className="relative z-10 flex h-full flex-col justify-between text-bg">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] opacity-80">Today's harvest</p>
          <h3 className="display-md mt-2 font-extrabold leading-[0.95]">
            From farm,<br /><em>not factory.</em>
          </h3>
        </div>

        {/* Animated marigold cluster */}
        <div className="relative mt-6 flex h-24 items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.svg
              key={i}
              viewBox="0 0 60 60"
              className="absolute"
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
//  TILE 5 — Delivery promise
// ─────────────────────────────────────────────────────────────────────────────

function DeliveryTile() {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-line bg-surface p-6 transition-colors hover:border-coral/40 sm:p-7">
      <div className="flex items-center gap-2">
        <span className="text-[11px] uppercase tracking-[0.22em] text-cream/60">Express</span>
      </div>

      {/* Big number */}
      <div className="mt-6 flex items-baseline gap-2">
        <span className="font-display text-7xl font-black leading-none text-cream tabular-nums sm:text-8xl">
          <CountUp to={60} />
        </span>
        <span className="font-display text-2xl text-cream/55">min</span>
      </div>

      <p className="mt-4 max-w-[14ch] font-display text-base leading-snug text-cream/60">
        Same-day delivery across Dhaka. <em className="text-coral">Track from kitchen to door.</em>
      </p>

      {/* Animated truck path */}
      <svg className="mt-4 w-full" height="44" viewBox="0 0 200 44" preserveAspectRatio="none">
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
//  TILE 6 — Quick action CTA
// ─────────────────────────────────────────────────────────────────────────────

function ScanTile() {
  return (
    <Link
      to="/products"
      className="group relative flex min-h-[180px] flex-col justify-between overflow-hidden rounded-3xl bg-cream p-6 text-bg transition-colors hover:bg-saffron sm:p-7"
    >
      <div className="flex items-center gap-2">
        <span className="text-[11px] uppercase tracking-[0.22em] text-bg/60">Browse</span>
      </div>

      <div>
        <h3 className="display-md font-extrabold leading-tight text-bg">
          50,000+ products
        </h3>
        <p className="mt-2 font-display italic text-bg/65">
          Search anything — we probably stock it.
        </p>

        <span className="mt-5 inline-flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.16em]">
          Open the market
          <ArrowRightIcon size={16} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-1.5" />
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
  show:   { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const tileVar = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 180, damping: 24 } },
};

export function HeroBanner() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Featured for the visual tile (graceful fallback to demo)
  const { data: featured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn:  fetchFeaturedProducts,
    staleTime: 1000 * 60 * 5,
  });

  const featuredOne = featured?.[0];

  return (
    <section className="relative bg-bg pt-8 pb-16 sm:pt-10 md:pt-12">
      <div className="container relative" ref={containerRef}>

        {/* Bento grid — 4 cols on desktop, 2 on mobile */}
        <motion.div
          variants={containerVar}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:auto-rows-[minmax(180px,auto)]"
        >
          {/* Tile 1: Headline (2x2 on desktop) */}
          <motion.div variants={tileVar} className="col-span-2 row-span-2 md:col-span-2 md:row-span-2">
            <HeadlineTile />
          </motion.div>

          {/* Tile 2: Live stats */}
          <motion.div variants={tileVar} className="col-span-1 row-span-1">
            <LiveStatsTile />
          </motion.div>

          {/* Tile 3: Featured product */}
          <motion.div variants={tileVar} className="col-span-1 row-span-2 md:col-span-1 md:row-span-2">
            {featuredOne ? (
              <FeaturedTile
                image={featuredOne.images[0]?.url ?? ''}
                name={featuredOne.name}
                price={featuredOne.effectivePriceInPaisa}
              />
            ) : (
              <div className="h-full min-h-[220px] skeleton rounded-3xl" />
            )}
          </motion.div>

          {/* Tile 4: Bloom */}
          <motion.div variants={tileVar} className="col-span-1 row-span-1">
            <BloomTile />
          </motion.div>

          {/* Tile 5: Delivery */}
          <motion.div variants={tileVar} className="col-span-2 row-span-1 md:col-span-2 md:row-span-1">
            <DeliveryTile />
          </motion.div>

          {/* Tile 6: Scan/Browse */}
          <motion.div variants={tileVar} className="col-span-1 row-span-1">
            <ScanTile />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
