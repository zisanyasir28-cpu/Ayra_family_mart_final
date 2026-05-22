import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Banner config ────────────────────────────────────────────────────────────
interface Banner {
  id:        string;
  title:     string;
  subtitle:  string;
  bangla:    string;        // \n splits into multiple lines
  extra:    string | null;  // optional secondary line ("Up to 40% Off")
  label:    string | null;  // optional small top label ("Ayra Fresh+")
  cta:       string;
  to:        string;
  image:     string;
  bg:        string;        // tailwind gradient classes
  glowColor: string;        // hsl(...) string for shadow
  icon:     LucideIcon | null;
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
    // Green produce crate
    image:     'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=520&h=520&fit=crop&crop=center&q=85',
    bg:        'bg-gradient-to-br from-sage/85 via-sage/55 to-sage/25',
    glowColor: 'hsl(var(--sage) / 0.45)',
    icon:      null,
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
    // Cooking oil + rice bag arrangement
    image:     'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=520&h=520&fit=crop&crop=center&q=85',
    bg:        'bg-gradient-to-br from-blush via-blush/90 to-blush/65',
    glowColor: 'hsl(var(--blush) / 0.55)',
    icon:      Sparkles,
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
    // Green produce bag
    image:     'https://images.unsplash.com/photo-1542838132-92c53300491e?w=520&h=520&fit=crop&crop=center&q=85',
    bg:        'bg-gradient-to-br from-plum/80 via-plum/55 to-plum/25',
    glowColor: 'hsl(var(--plum) / 0.5)',
    icon:      null,
  },
];

// ─── FeatureBanners ───────────────────────────────────────────────────────────

export function FeatureBanners() {
  return (
    <section className="bg-bg py-8 sm:py-10">
      <div className="container">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BANNERS.map((b, i) => {
            const Icon = b.icon;
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
              >
                <Link
                  to={b.to}
                  className={`group relative flex h-full min-h-[230px] flex-col overflow-hidden rounded-[1.75rem] p-6 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] ${b.bg}`}
                  style={{ boxShadow: `0 20px 60px -20px ${b.glowColor}` }}
                >
                  {/* Top-right deco icon */}
                  {Icon && (
                    <span className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
                      <Icon className="h-4 w-4 text-white" />
                    </span>
                  )}

                  {/* Optional small brand label ("Ayra Fresh+") */}
                  {b.label && (
                    <p className="font-display text-base font-extrabold leading-none text-cream">
                      Ayra Fresh<span className="text-sage">+</span>
                    </p>
                  )}

                  {/* Title block — takes the top half */}
                  <div className={`relative z-[5] max-w-[60%] ${b.label ? 'mt-2' : 'mt-0'}`}>
                    <p className="font-display text-[1.7rem] font-black leading-[1.05] text-cream sm:text-[1.85rem]">
                      {b.title}
                    </p>
                    <p className="font-display text-[1.7rem] font-black leading-[1.05] text-cream sm:text-[1.85rem]">
                      {b.subtitle}
                    </p>
                    <p className="mt-2.5 font-bangla text-[11px] leading-snug text-cream/80 whitespace-pre-line">
                      {b.bangla}
                    </p>
                    {b.extra && (
                      <p className="mt-2 font-display text-base font-bold text-cream">
                        {b.extra}
                      </p>
                    )}
                  </div>

                  {/* CTA pill — bottom-left */}
                  <span className="relative z-[5] mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-saffron px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-bg shadow-[0_0_18px_-4px_hsl(var(--saffron)/0.55)] transition-all duration-300 group-hover:scale-[1.04] group-hover:shadow-[0_0_24px_-4px_hsl(var(--saffron)/0.75)]">
                    {b.cta}
                    <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>

                  {/* Product photo — bottom-right, overflows nicely */}
                  <img
                    src={b.image}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    decoding="async"
                    className="pointer-events-none absolute -bottom-3 -right-3 z-0 h-[88%] w-auto max-w-[58%] select-none object-contain object-bottom drop-shadow-[0_10px_28px_rgba(0,0,0,0.45)] transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-[1.06]"
                  />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
