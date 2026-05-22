import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, BadgePercent } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── SVG Watermark Art ───────────────────────────────────────────────────────
// Inline SVG art — sits at z-[1] behind photo and text

/** Farm Fresh — botanical leaves, veins, vine, berry clusters, herb sprig */
function FarmFreshArt() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
      viewBox="0 0 400 280"
      fill="none"
      preserveAspectRatio="xMaxYMid meet"
    >
      <g opacity="0.14">
        <path d="M352 18 C388 44 400 96 382 142 C364 188 320 200 294 172 C268 144 274 96 302 62 C317 44 337 26 352 18Z" fill="white"/>
        <path d="M352 18 C337 74 312 130 290 170" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
        <path d="M327 58 C310 63 294 76 292 93" stroke="white" strokeWidth="0.9" strokeLinecap="round" opacity="0.45"/>
        <path d="M316 93 C297 100 282 113 280 130" stroke="white" strokeWidth="0.9" strokeLinecap="round" opacity="0.4"/>
        <path d="M302 128 C286 135 272 146 270 160" stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.35"/>
        <path d="M362 53 C377 58 384 70 380 83" stroke="white" strokeWidth="0.9" strokeLinecap="round" opacity="0.4"/>
        <path d="M312 38 C342 56 352 98 337 133 C322 168 284 178 264 155 C244 132 250 90 274 64 C286 50 300 40 312 38Z" fill="white" opacity="0.6"/>
        <path d="M272 168 C294 163 307 176 304 194 C301 212 282 218 265 208 C248 198 250 174 272 168Z" fill="white" opacity="0.45" transform="rotate(-15 286 193)"/>
      </g>
      <path d="M48 48 C58 36 73 38 74 53 C75 68 61 76 48 68 C35 60 38 60 48 48Z" fill="white" opacity="0.08" transform="rotate(-25 61 62)"/>
      <path d="M88 228 C98 216 113 218 114 233 C115 248 101 256 88 248 C75 240 78 240 88 228Z" fill="white" opacity="0.07" transform="rotate(20 101 242)"/>
      <path d="M178 13 C186 4 198 6 199 18 C200 30 189 36 179 30 C169 24 170 22 178 13Z" fill="white" opacity="0.07" transform="rotate(-10 189 20)"/>
      <path d="M10 258 C42 228 72 208 112 190 C152 172 188 163 222 153" stroke="white" strokeWidth="1.4" strokeDasharray="3 8" strokeLinecap="round" opacity="0.09" fill="none"/>
      <circle cx="22" cy="163" r="5.5" fill="white" opacity="0.09"/>
      <circle cx="32" cy="153" r="4"   fill="white" opacity="0.08"/>
      <circle cx="14" cy="152" r="3.5" fill="white" opacity="0.07"/>
      <g opacity="0.09">
        <path d="M65 128 L65 178" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M65 140 C58 133 50 132 47 138 C44 144 50 150 58 148" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M65 153 C72 146 80 145 83 151 C86 157 80 163 72 161" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M65 166 C58 159 50 158 47 164 C44 170 50 176 58 174" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round"/>
      </g>
      <circle cx="157" cy="78"  r="2.5" fill="white" opacity="0.08"/>
      <circle cx="172" cy="93"  r="1.8" fill="white" opacity="0.07"/>
      <circle cx="252" cy="198" r="2.5" fill="white" opacity="0.07"/>
    </svg>
  );
}

/** Bazar Deal — 16-pt starburst, scattered stars, price tag, coins */
function BazarDealArt() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
      viewBox="0 0 400 280"
      fill="none"
      preserveAspectRatio="xMaxYMid meet"
    >
      <g transform="translate(330 155)" opacity="0.12">
        <path d="M0,-85 L14,-32 L60,-60 L28,-8 L82,0 L28,8 L60,60 L14,32 L0,85 L-14,32 L-60,60 L-28,8 L-82,0 L-28,-8 L-60,-60 L-14,-32Z" fill="white"/>
      </g>
      <g transform="translate(370 48)" opacity="0.08">
        <path d="M0,-48 L8,-18 L34,-34 L16,-5 L46,0 L16,5 L34,34 L8,18 L0,48 L-8,18 L-34,34 L-16,5 L-46,0 L-16,-5 L-34,-34 L-8,-18Z" fill="white"/>
      </g>
      <path d="M75 26 L79 39 L93 39 L82 47 L86 60 L75 52 L64 60 L68 47 L57 39 L71 39Z" fill="white" opacity="0.10"/>
      <path d="M143 238 L146 248 L156 248 L148 254 L151 264 L143 258 L135 264 L138 254 L130 248 L140 248Z" fill="white" opacity="0.08"/>
      <path d="M23 203 L25 210 L32 210 L27 214 L29 221 L23 217 L17 221 L19 214 L14 210 L21 210Z" fill="white" opacity="0.09"/>
      <path d="M198 13 L202 26 L216 26 L205 34 L209 47 L198 39 L187 47 L191 34 L180 26 L194 26Z" fill="white" opacity="0.07"/>
      <g opacity="0.08">
        <path d="M38 63 L93 63 L110 86 L93 110 L38 110 Q30 110 26 103 L26 70 Q30 63 38 63Z" fill="white"/>
        <circle cx="42" cy="86" r="6" fill="none" stroke="white" strokeWidth="1.8" opacity="0.6"/>
        <line x1="60" y1="76" x2="86" y2="76" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
        <line x1="60" y1="86" x2="83" y2="86" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
        <line x1="60" y1="96" x2="78" y2="96" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
      </g>
      <circle cx="108" cy="203" r="14" fill="none" stroke="white" strokeWidth="2"   opacity="0.09"/>
      <circle cx="108" cy="203" r="9"  fill="white"                                 opacity="0.04"/>
      <circle cx="138" cy="223" r="11" fill="none" stroke="white" strokeWidth="1.8" opacity="0.07"/>
      <circle cx="78"  cy="228" r="9"  fill="none" stroke="white" strokeWidth="1.5" opacity="0.07"/>
      <circle cx="193" cy="58"  r="3"   fill="white" opacity="0.11"/>
      <circle cx="213" cy="73"  r="2"   fill="white" opacity="0.09"/>
      <circle cx="178" cy="76"  r="2.5" fill="white" opacity="0.09"/>
      <circle cx="238" cy="48"  r="3"   fill="white" opacity="0.08"/>
      <circle cx="53"  cy="173" r="2.5" fill="white" opacity="0.09"/>
    </svg>
  );
}

/** Ayra Fresh+ — crown, diamonds, star constellation, sparkle asterisks, rings */
function FreshPlusArt() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
      viewBox="0 0 400 280"
      fill="none"
      preserveAspectRatio="xMaxYMid meet"
    >
      <g transform="translate(295 115)" opacity="0.12">
        <path d="M-65 55 L-65 -18 L-32 12 L0 -45 L32 12 L65 -18 L65 55 Q65 62 58 62 L-58 62 Q-65 62 -65 55Z" fill="white"/>
        <rect x="-65" y="44" width="130" height="18" rx="4" fill="white" opacity="0.5"/>
        <circle cx="0"   cy="-45" r="8" fill="white" opacity="0.7"/>
        <circle cx="-32" cy="12"  r="6" fill="white" opacity="0.55"/>
        <circle cx="32"  cy="12"  r="6" fill="white" opacity="0.55"/>
        <line x1="0" y1="-53" x2="0" y2="-66" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <circle cx="0" cy="-66" r="4" fill="white" opacity="0.5"/>
      </g>
      <path d="M58 53 L80 80 L58 108 L36 80Z"      fill="white" opacity="0.09"/>
      <path d="M103 208 L118 228 L103 248 L88 228Z" fill="white" opacity="0.08"/>
      <path d="M183 28 L196 46 L183 64 L170 46Z"   fill="white" opacity="0.08"/>
      <path d="M358 213 L370 230 L358 248 L346 230Z" fill="white" opacity="0.07"/>
      <path d="M38 178 L46 189 L38 200 L30 189Z"   fill="white" opacity="0.08"/>
      <circle cx="36"  cy="128" r="3.5" fill="white" opacity="0.15"/>
      <circle cx="63"  cy="108" r="2.5" fill="white" opacity="0.13"/>
      <circle cx="78"  cy="133" r="2"   fill="white" opacity="0.12"/>
      <circle cx="53"  cy="156" r="3"   fill="white" opacity="0.13"/>
      <circle cx="26"  cy="160" r="2"   fill="white" opacity="0.10"/>
      <circle cx="88"  cy="156" r="1.8" fill="white" opacity="0.11"/>
      <circle cx="108" cy="128" r="2.5" fill="white" opacity="0.10"/>
      <line x1="36"  y1="128" x2="63"  y2="108" stroke="white" strokeWidth="0.7" opacity="0.09"/>
      <line x1="63"  y1="108" x2="78"  y2="133" stroke="white" strokeWidth="0.7" opacity="0.09"/>
      <line x1="78"  y1="133" x2="53"  y2="156" stroke="white" strokeWidth="0.7" opacity="0.09"/>
      <line x1="53"  y1="156" x2="26"  y2="160" stroke="white" strokeWidth="0.7" opacity="0.08"/>
      <line x1="78"  y1="133" x2="88"  y2="156" stroke="white" strokeWidth="0.7" opacity="0.08"/>
      <line x1="88"  y1="156" x2="108" y2="128" stroke="white" strokeWidth="0.7" opacity="0.08"/>
      <g transform="translate(163 183)" opacity="0.13">
        <line x1="-9" y1="0"  x2="9"  y2="0"  stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="0"  y1="-9" x2="0"  y2="9"  stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="-6" y1="-6" x2="6"  y2="6"  stroke="white" strokeWidth="1.1" strokeLinecap="round"/>
        <line x1="6"  y1="-6" x2="-6" y2="6"  stroke="white" strokeWidth="1.1" strokeLinecap="round"/>
      </g>
      <g transform="translate(53 38)" opacity="0.10">
        <line x1="-7" y1="0"  x2="7"  y2="0"  stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="0"  y1="-7" x2="0"  y2="7"  stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="-5" y1="-5" x2="5"  y2="5"  stroke="white" strokeWidth="1"   strokeLinecap="round"/>
        <line x1="5"  y1="-5" x2="-5" y2="5"  stroke="white" strokeWidth="1"   strokeLinecap="round"/>
      </g>
      <circle cx="208" cy="258" r="30" fill="none" stroke="white" strokeWidth="1.2" opacity="0.07"/>
      <circle cx="208" cy="258" r="20" fill="none" stroke="white" strokeWidth="1"   opacity="0.06"/>
      <circle cx="208" cy="258" r="10" fill="none" stroke="white" strokeWidth="0.8" opacity="0.05"/>
    </svg>
  );
}

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
  /** Transparent gradient overlay on top of dark surface base */
  colorWash:  string;
  /** Used for box-shadow glow AND image drop-shadow halo */
  glowColor:  string;
  /** CSS filter applied to the product photo for thematic colour cohesion */
  imgFilter:  string;
  topIcon:    LucideIcon | null;
  Art:        () => JSX.Element;
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
    colorWash: 'bg-gradient-to-br from-sage/52 via-sage/24 to-transparent',
    glowColor: 'hsl(var(--sage) / 0.62)',
    imgFilter: 'saturate(1.35)',
    topIcon:   null,
    Art:       FarmFreshArt,
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
    colorWash: 'bg-gradient-to-br from-blush/60 via-blush/27 to-transparent',
    glowColor: 'hsl(var(--blush) / 0.68)',
    imgFilter: 'saturate(1.25) hue-rotate(5deg)',
    topIcon:   BadgePercent,
    Art:       BazarDealArt,
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
    colorWash: 'bg-gradient-to-br from-plum/65 via-plum/30 to-transparent',
    glowColor: 'hsl(var(--plum) / 0.62)',
    imgFilter: 'saturate(1.15) hue-rotate(-12deg)',
    topIcon:   Sparkles,
    Art:       FreshPlusArt,
  },
];

// ─── FeatureBanners (content only — no section wrapper) ──────────────────────

export function FeatureBanners() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {BANNERS.map((b, i) => {
        const TopIcon = b.topIcon;
        const Art     = b.Art;
        return (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 200, damping: 22 }}
            // Pearl-shimmer ring — reduced radius
            className="group relative p-[1.5px] rounded-xl bg-gradient-to-br from-white/40 via-saffron/22 to-plum/15 transition-all duration-300 hover:from-white/55 hover:via-saffron/35 hover:to-plum/22 hover:-translate-y-1"
            style={{ boxShadow: `0 20px 60px -20px ${b.glowColor}` }}
          >
            <Link
              to={b.to}
              // Dark glass surface base — colour wash sits on top as a transparent overlay
              className="relative flex h-full min-h-[230px] flex-col overflow-hidden rounded-[calc(0.75rem-1.5px)] bg-surface/82 p-6 active:scale-[0.98]"
            >
              {/* ── Transparent colour wash — gives theme tint without solid fill ── */}
              <div aria-hidden className={`pointer-events-none absolute inset-0 z-[0] ${b.colorWash}`} />

              {/* ── SVG watermark art ── */}
              <Art />

              {/* Sparkle dots */}
              <div aria-hidden className="pointer-events-none absolute right-12 top-8 z-[2] h-1.5 w-1.5 rounded-full bg-white/70 shadow-[0_0_8px_2px_rgba(255,255,255,0.5)]" />
              <div aria-hidden className="pointer-events-none absolute right-20 bottom-12 z-[2] h-1 w-1 rounded-full bg-white/60 shadow-[0_0_6px_1px_rgba(255,255,255,0.5)]" />
              <div aria-hidden className="pointer-events-none absolute left-1/3 top-3 z-[2] h-1 w-1 rounded-full bg-white/50 shadow-[0_0_4px_1px_rgba(255,255,255,0.4)]" />

              {/* Glass shine diagonal */}
              <div aria-hidden className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(135deg,hsl(0_0%_100%/0.11)_0%,transparent_40%)]" />

              {/* ── Radial glow halo behind the product photo ── */}
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-10 right-0 z-[3] h-[72%] w-[62%]"
                style={{ background: `radial-gradient(ellipse at 55% 88%, ${b.glowColor} 0%, transparent 65%)` }}
              />

              {/* Top-right icon chip */}
              {TopIcon && (
                <span className="absolute right-5 top-5 z-[8] flex h-9 w-9 items-center justify-center rounded-full bg-white/18 backdrop-blur-sm ring-1 ring-white/32 shadow-[0_0_14px_-2px_rgba(255,255,255,0.28)]">
                  <TopIcon className="h-4 w-4 text-white" strokeWidth={2.2} />
                </span>
              )}

              {/* Optional brand label */}
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

              {/* ── Product photo — themed filter + coloured aura ── */}
              <img
                src={b.image}
                alt=""
                aria-hidden
                loading="lazy"
                decoding="async"
                className="pointer-events-none absolute -bottom-3 -right-3 z-[5] h-[88%] w-auto max-w-[58%] select-none object-contain object-bottom transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-[1.07]"
                style={{
                  filter: `${b.imgFilter} drop-shadow(0 6px 20px ${b.glowColor}) drop-shadow(0 0 45px ${b.glowColor})`,
                }}
              />
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
