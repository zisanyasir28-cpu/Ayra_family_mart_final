import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Leaf, BadgePercent } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Banner config ────────────────────────────────────────────────────────────
interface Banner {
  id:         string;
  title:      string;
  subtitle:   string;
  bangla:     string;
  extra:      string | null;
  label:      string | null;
  cta:        string;
  to:         string;
  image:      string;
  bg:         string;
  glowColor:  string;
  topIcon:    LucideIcon | null;
  watermark:  LucideIcon;
  wmTint:     string;
}

const BANNERS: Banner[] = [
  {
    id:        'farm-fresh',
    title:     'Farm Fresh',
    subtitle:  'From Local Farms',
    bangla:    'স্থানীয় খামার থেকে\nসরাসরি আপনার কাছে',
    extra:     null,
    label:     null,
    cta:       'Shop Now',
    to:        '/products?collection=fresh',
    image:     'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=520&h=520&fit=crop&crop=center&q=85',
    bg:        'bg-gradient-to-br from-sage/85 via-sage/55 to-sage/25',
    glowColor: 'hsl(var(--sage) / 0.45)',
    topIcon:   null,
    watermark: Leaf,
    wmTint:    'text-sage',
  },
  {
    id:        'bazar-deal',
    title:     'Weekend',
    subtitle:  'Bazar Deal',
    bangla:    'সেরা দামে সেরা পণ্য',
    extra:     'Up to 40% Off',
    label:     null,
    cta:       'Grab Now',
    to:        '/products?onSale=true',
    image:     'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=520&h=520&fit=crop&crop=center&q=85',
    bg:        'bg-gradient-to-br from-blush via-blush/90 to-blush/65',
    glowColor: 'hsl(var(--blush) / 0.55)',
    topIcon:   BadgePercent,
    watermark: BadgePercent,
    wmTint:    'text-bg',
  },
  {
    id:        'fresh-plus',
    title:     'Extra Fresh',
    subtitle:  'Extra Benefits',
    bangla:    'সদস্যদের জন্য বিশেষ সুবিধা',
    extra:     'Extra 15% Off',
    label:     'Ayra Fresh+',
    cta:       'Join Now',
    to:        '/products?collection=fresh-plus',
    image:     'https://images.unsplash.com/photo-1542838132-92c53300491e?w=520&h=520&fit=crop&crop=center&q=85',
    bg:        'bg-gradient-to-br from-plum/80 via-plum/55 to-plum/25',
    glowColor: 'hsl(var(--plum) / 0.5)',
    topIcon:   Sparkles,
    watermark: Sparkles,
    wmTint:    'text-saffron',
  },
];

// ─── FeatureBanners (content only — no section wrapper) ──────────────────────

export function FeatureBanners() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {BANNERS.map((b, i) => {
        const TopIcon   = b.topIcon;
        const Watermark = b.watermark;
        return (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              delay:     i * 0.1,
              type:      'spring',
              stiffness: 200,
              damping:   22,
            }}
            // ── Pearl-shimmer outer ring ──────────────────────────────────
            className="group relative p-[1.5px] rounded-[1.85rem] bg-gradient-to-br from-white/40 via-saffron/22 to-plum/15 transition-all duration-300 hover:from-white/55 hover:via-saffron/35 hover:to-plum/22 hover:-translate-y-1"
            style={{ boxShadow: `0 20px 60px -20px ${b.glowColor}` }}
          >
            <Link
              to={b.to}
              className={`relative flex h-full min-h-[230px] flex-col overflow-hidden rounded-[calc(1.85rem-1.5px)] p-6 active:scale-[0.98] ${b.bg}`}
            >
              {/* ─── Decorative art watermark ─── giant faded icon clusters */}
              <Watermark
                aria-hidden
                className={`pointer-events-none absolute -bottom-8 left-4 z-[1] h-32 w-32 opacity-[0.10] ${b.wmTint}`}
                strokeWidth={1}
              />
              <Watermark
                aria-hidden
                className={`pointer-events-none absolute top-1/2 left-12 z-[1] h-10 w-10 -translate-y-1/2 opacity-[0.08] ${b.wmTint}`}
                strokeWidth={1}
              />

              {/* Sparkle dots scattered (decorative) */}
              <div aria-hidden className="pointer-events-none absolute right-12 top-8 z-[2] h-1.5 w-1.5 rounded-full bg-white/70 shadow-[0_0_8px_2px_rgba(255,255,255,0.5)]" />
              <div aria-hidden className="pointer-events-none absolute right-20 bottom-12 z-[2] h-1 w-1 rounded-full bg-white/60 shadow-[0_0_6px_1px_rgba(255,255,255,0.5)]" />
              <div aria-hidden className="pointer-events-none absolute left-1/3 top-3 z-[2] h-1 w-1 rounded-full bg-white/50 shadow-[0_0_4px_1px_rgba(255,255,255,0.4)]" />

              {/* Glass shine diagonal overlay */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(135deg,hsl(0_0%_100%/0.16)_0%,transparent_42%)]"
              />

              {/* Top-right circular icon chip */}
              {TopIcon && (
                <span className="absolute right-5 top-5 z-[8] flex h-9 w-9 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm ring-1 ring-white/40 shadow-[0_0_12px_-2px_rgba(255,255,255,0.4)]">
                  <TopIcon className="h-4 w-4 text-white" strokeWidth={2.2} />
                </span>
              )}

              {/* Optional small brand label ("Ayra Fresh+") */}
              {b.label && (
                <p className="relative z-[6] font-display text-base font-extrabold leading-none text-cream">
                  Ayra Fresh<span className="text-sage">+</span>
                </p>
              )}

              {/* Title block */}
              <div className={`relative z-[6] max-w-[58%] ${b.label ? 'mt-2.5' : 'mt-0'}`}>
                <p className="font-display text-[1.65rem] font-black leading-[1.05] text-cream sm:text-[1.85rem]">
                  {b.title}
                </p>
                <p className="font-display text-[1.65rem] font-black leading-[1.05] text-cream sm:text-[1.85rem]">
                  {b.subtitle}
                </p>
                <p className="mt-2.5 font-bangla text-[11px] leading-snug text-cream/85 whitespace-pre-line">
                  {b.bangla}
                </p>
                {b.extra && (
                  <p className="mt-2 font-display text-base font-bold text-cream">
                    {b.extra}
                  </p>
                )}
              </div>

              {/* CTA pill */}
              <span className="relative z-[6] mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-saffron px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-bg shadow-[0_0_18px_-4px_hsl(var(--saffron)/0.6)] transition-all duration-300 group-hover:scale-[1.04] group-hover:shadow-[0_0_24px_-4px_hsl(var(--saffron)/0.8)]">
                {b.cta}
                <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
              </span>

              {/* Product photo — bottom-right */}
              <img
                src={b.image}
                alt=""
                aria-hidden
                loading="lazy"
                decoding="async"
                className="pointer-events-none absolute -bottom-3 -right-3 z-[5] h-[88%] w-auto max-w-[58%] select-none object-contain object-bottom drop-shadow-[0_10px_28px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-[1.06]"
              />
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
