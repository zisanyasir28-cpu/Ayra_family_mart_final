import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

// ─── Banner data ──────────────────────────────────────────────────────────────
const banners = [
  {
    id:      'farm-fresh',
    tag:     'Direct From Farms',
    title:   'Farm Fresh',
    subtitle:'Local Farms',
    bangla:  'স্থানীয় খামার থেকে সরাসরি আপনার কাছে',
    cta:     'Shop Now',
    to:      '/products?collection=fresh',
    emoji:   '🥬',
    emojis:  ['🌽', '🍅', '🥕'],
    bg:      'from-sage/30 via-sage/10 to-surface',
    border:  'border-sage/25',
    glow:    'hsl(var(--sage) / 0.2)',
    tag_cls: 'bg-sage/20 text-sage',
    cta_cls: 'bg-sage text-bg hover:shadow-[0_0_24px_-4px_hsl(var(--sage)/0.65)]',
  },
  {
    id:      'bazar-deal',
    tag:     'Up to 40% Off',
    title:   'Weekend',
    subtitle:'Bazar Deal',
    bangla:  'সেরা দামে সেরা পণ্য',
    cta:     'Grab Now',
    to:      '/products?onSale=true',
    emoji:   '🛒',
    emojis:  ['🍗', '🐟', '🥩'],
    bg:      'from-blush/30 via-blush/10 to-surface',
    border:  'border-blush/25',
    glow:    'hsl(var(--blush) / 0.2)',
    tag_cls: 'bg-blush/20 text-blush',
    cta_cls: 'bg-blush text-bg hover:shadow-[0_0_24px_-4px_hsl(var(--blush)/0.65)]',
  },
  {
    id:      'fresh-plus',
    tag:     'Members Only',
    title:   'Ayra Fresh+',
    subtitle:'Extra Benefits',
    bangla:  'সদস্যদের জন্য বিশেষ সুবিধা',
    cta:     'Join Now',
    to:      '/products?collection=fresh-plus',
    emoji:   '🌿',
    emojis:  ['🫐', '🥑', '🍋'],
    bg:      'from-saffron/25 via-plum/15 to-surface',
    border:  'border-saffron/25',
    glow:    'hsl(var(--saffron) / 0.18)',
    tag_cls: 'bg-saffron/20 text-saffron',
    cta_cls: 'bg-saffron text-bg hover:shadow-[0_0_24px_-4px_hsl(var(--saffron)/0.65)]',
  },
] as const;

// ─── FeatureBanners ───────────────────────────────────────────────────────────

export function FeatureBanners() {
  return (
    <section className="bg-bg py-10 sm:py-12">
      <div className="container">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                delay: i * 0.1,
                type: 'spring',
                stiffness: 200,
                damping: 22,
              }}
            >
              <Link
                to={b.to}
                className={`group relative flex h-full min-h-[200px] flex-col justify-between overflow-hidden rounded-[1.75rem] border bg-gradient-to-br p-6 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] ${b.bg} ${b.border}`}
                style={{ boxShadow: `0 16px 48px -16px ${b.glow}` }}
              >
                {/* Tag pill */}
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${b.tag_cls}`}>
                    {b.tag}
                  </span>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110 ${b.tag_cls}`}
                  >
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </div>

                {/* Title block */}
                <div className="mt-4 flex-1">
                  <p className="font-display text-2xl font-black leading-none text-cream sm:text-3xl">
                    {b.title}
                  </p>
                  <p className="font-display text-2xl font-black leading-none text-cream/60 sm:text-3xl">
                    {b.subtitle}
                  </p>
                  <p className="mt-2 font-bangla text-xs text-cream/40">
                    {b.bangla}
                  </p>
                </div>

                {/* CTA pill */}
                <span
                  className={`mt-5 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 ${b.cta_cls}`}
                >
                  {b.cta}
                  <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                </span>

                {/* Decorative emojis — right side */}
                <div className="pointer-events-none absolute right-5 top-1/2 flex -translate-y-1/2 flex-col items-end gap-1 text-3xl leading-none opacity-60 transition-transform duration-500 group-hover:-translate-y-[calc(50%+4px)] sm:text-4xl">
                  <span>{b.emojis[0]}</span>
                  <span className="ml-3">{b.emojis[1]}</span>
                  <span>{b.emojis[2]}</span>
                </div>

                {/* Main emoji — bottom right corner */}
                <div className="pointer-events-none absolute -bottom-3 -right-1 text-[72px] leading-none opacity-20 transition-all duration-500 group-hover:opacity-30 group-hover:scale-110 sm:text-[90px]">
                  {b.emoji}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
