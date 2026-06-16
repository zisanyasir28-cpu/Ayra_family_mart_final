import { NavLink } from 'react-router-dom';
import {
  Home, Grid2x2, Tag, Star, Sparkles, Award, Leaf,
  Package, Heart, Headphones, ArrowRight, ChevronRight, type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useThemeStore } from '../../store/themeStore';

// ─── Desktop persistent left sidebar (lg+) ────────────────────────────────────
//
// Sits below the sticky header on `lg+` viewports and replaces the hamburger
// menu + bottom tab bar (both gated to `lg:hidden` in CustomerLayout).
//
// Theme strategy:
//   Dark mode  → bg-surface/30 backdrop-blur, saffron/blush active pill, CSS tokens for text
//   Light mode → always-dark forest green bg, hardcoded white text (tokens resolve wrong on green bg)

interface SidebarItem {
  icon:       LucideIcon;
  label:      string;
  to:         string;
  end?:       boolean;
  iconClass?: string;
  badge?:     string;
  /** Tailwind gradient classes applied to the background span (dark mode only) */
  grad:       string;
}

const NAV_ITEMS: SidebarItem[] = [
  { icon: Home,     label: 'Home',           to: '/',                                  end: true,  grad: 'from-saffron to-blush'  },
  { icon: Grid2x2,  label: 'All Categories', to: '/products',                          end: true,  grad: 'from-coral to-blush'    },
  { icon: Tag,      label: 'Offers',         to: '/products?onSale=true', badge: 'HOT',            grad: 'from-saffron to-coral'  },
  { icon: Star,     label: 'Best Sellers',   to: '/products?collection=best-sellers',               grad: 'from-plum to-saffron'   },
  { icon: Sparkles, label: 'New Arrivals',   to: '/products?sortBy=newest',                        grad: 'from-sage to-coral'     },
  { icon: Award,    label: 'Brands',         to: '/products?view=brands',                          grad: 'from-plum to-coral'     },
  { icon: Leaf,     label: 'Ayra Fresh+',    to: '/products?collection=fresh-plus', iconClass: 'text-sage', grad: 'from-sage to-sage/80' },
  { icon: Package,  label: 'My Orders',      to: '/orders',                                        grad: 'from-saffron to-plum'   },
  { icon: Heart,    label: 'Wishlist',       to: '/wishlist',                                      grad: 'from-coral to-saffron'  },
];

// Light-mode: sidebar is always-dark forest green.
// CSS tokens like --cream resolve to dark values in light mode, so text is hardcoded white.
const LIGHT_BG  = 'hsl(145 62% 8%)';
const LIGHT_BDR = 'hsl(145 42% 17% / 0.55)';

export function CustomerSidebar() {
  const isLight = useThemeStore(s => s.resolved === 'light');

  return (
    <aside
      aria-label="Primary navigation"
      className={cn(
        'sticky top-[7.375rem] hidden h-[calc(100vh-7.375rem)] w-64 shrink-0 flex-col gap-1 overflow-y-auto border-r px-4 py-6 lg:flex',
        // Dark mode: glass backdrop; light mode: bg + border via inline style below
        !isLight && 'border-line/40 bg-surface/30 backdrop-blur-xl',
      )}
      style={isLight ? { backgroundColor: LIGHT_BG, borderRightColor: LIGHT_BDR } : undefined}
    >
      {/* ── Botanical background watermark — light mode only ────────────── */}
      {isLight && (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full select-none"
          viewBox="0 0 256 600"
          overflow="hidden"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
          style={{ color: 'hsl(145 55% 55%)', opacity: 0.07 }}
        >
          {/* Large tropical stem/frond — right side, top → bottom-right */}
          <path
            d="M210 -20 C228 30, 264 90, 248 155 C232 220, 186 248, 172 310 C158 372, 178 435, 212 480"
            stroke="currentColor" strokeWidth="54" fill="none" strokeLinecap="round"
          />
          {/* Secondary frond — right, lower */}
          <path
            d="M278 260 C260 315, 248 380, 260 438 C272 496, 294 524, 282 572"
            stroke="currentColor" strokeWidth="38" fill="none" strokeLinecap="round"
          />
          {/* Small accent — left side */}
          <path
            d="M-18 370 C24 388, 68 426, 56 480 C44 534, 8 554, 36 596"
            stroke="currentColor" strokeWidth="30" fill="none" strokeLinecap="round"
          />
        </svg>
      )}

      {/* ── "Browse" section label ───────────────────────────────────────── */}
      <p
        className={cn('relative mb-2 px-2 text-[10px] uppercase tracking-[0.22em]', !isLight && 'text-cream/45')}
        style={isLight ? { color: 'hsl(152 38% 58% / 0.65)' } : undefined}
      >
        Browse
      </p>

      <nav className="relative flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ icon: Icon, label, to, end, badge, iconClass, grad }) => (
          <NavLink
            key={to + label}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                // Base — overflow-hidden so the watermark SVG is clipped cleanly
                'group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm transition-all',
                isLight
                  ? isActive
                    // Light-mode active: green gradient + glow, matching dark-mode energy
                    ? 'bg-gradient-to-r from-[hsl(142_72%_26%)] to-[hsl(158_65%_20%)] font-bold shadow-[0_4px_16px_-4px_hsl(142_72%_28%/0.65)]'
                    : 'hover:bg-[hsl(142_40%_16%/0.75)] hover:text-[hsl(142_60%_75%)]'
                  // ── dark mode — text color only; background handled by span layer ──
                  : isActive
                    ? 'font-bold text-bg shadow-[0_4px_16px_-4px_hsl(var(--saffron)/0.5)]'
                    : 'text-cream/75 hover:text-saffron',
              )
            }
            // Light mode: text is hardcoded because --cream resolves dark on green bg
            style={isLight
              ? ({ isActive }) => ({ color: isActive ? 'hsl(0 0% 96%)' : 'hsl(0 0% 88% / 0.72)' })
              : undefined
            }
          >
            {({ isActive }) => (
              <>
                {/* ── Gradient background layer (dark mode) — opacity 1 active, 0.18 inactive ── */}
                {!isLight && (
                  <span
                    aria-hidden
                    className={cn(
                      'pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r transition-opacity duration-300',
                      grad,
                    )}
                    style={{ opacity: isActive ? 1 : 0.18 }}
                  />
                )}

                {/* ── Static watermark sparkle — always visible, brighter when active ── */}
                {!isLight && (
                  <svg
                    aria-hidden
                    className="pointer-events-none absolute right-7 top-1/2 h-9 w-9 -translate-y-1/2 transition-opacity duration-300"
                    viewBox="0 0 32 32"
                    fill="currentColor"
                    style={{ opacity: isActive ? 0.15 : 0.07 }}
                  >
                    {/* 4-pointed diamond star */}
                    <path d="M16 0 L18.2 13.8 L32 16 L18.2 18.2 L16 32 L13.8 18.2 L0 16 L13.8 13.8Z" />
                    {/* Two smaller flanking diamonds for depth */}
                    <path d="M6 6 L6.8 9.2 L10 10 L6.8 10.8 L6 14 L5.2 10.8 L2 10 L5.2 9.2Z" opacity="0.7" />
                    <path d="M26 18 L26.5 20.5 L29 21 L26.5 21.5 L26 24 L25.5 21.5 L23 21 L25.5 20.5Z" opacity="0.6" />
                  </svg>
                )}

                {/* ── Active sparkle (light mode only — original behaviour) ── */}
                {isLight && isActive && (
                  <svg
                    aria-hidden
                    className="pointer-events-none absolute right-7 top-1/2 h-9 w-9 -translate-y-1/2 opacity-[0.13]"
                    viewBox="0 0 32 32"
                    fill="currentColor"
                  >
                    <path d="M16 0 L18.2 13.8 L32 16 L18.2 18.2 L16 32 L13.8 18.2 L0 16 L13.8 13.8Z" />
                    <path d="M6 6 L6.8 9.2 L10 10 L6.8 10.8 L6 14 L5.2 10.8 L2 10 L5.2 9.2Z" opacity="0.7" />
                    <path d="M26 18 L26.5 20.5 L29 21 L26.5 21.5 L26 24 L25.5 21.5 L23 21 L25.5 20.5Z" opacity="0.6" />
                  </svg>
                )}

                <span
                  className={cn(
                    'relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors',
                    isActive
                      ? 'bg-white/15'
                      : isLight
                        ? 'ring-1 ring-[hsl(145_40%_40%/0.5)] group-hover:ring-[hsl(145_40%_50%/0.6)]'
                        : 'ring-1 ring-line/40 group-hover:ring-saffron/40',
                  )}
                >
                  {isLight ? (
                    // Light: icon color hardcoded (green palette)
                    <Icon
                      className="h-[14px] w-[14px]"
                      strokeWidth={1.8}
                      color={isActive
                        ? 'hsl(152 42% 60%)'
                        : iconClass ? 'hsl(152 38% 55%)' : 'hsl(0 0% 78%)'}
                    />
                  ) : (
                    // Dark: icon inherits text color from className
                    <Icon className={cn('h-[14px] w-[14px]', !isActive && iconClass)} strokeWidth={1.8} />
                  )}
                </span>

                <span className="relative flex-1 truncate">{label}</span>

                {badge && (
                  <span
                    className={cn(
                      'relative rounded-full bg-coral px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider',
                      !isLight && 'text-bg',
                    )}
                    style={isLight ? { color: 'hsl(145 62% 8%)' } : undefined}
                  >
                    {badge}
                  </span>
                )}

                {isActive && (
                  <span className="relative">
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2.4} />
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Ayra Fresh+ promo card ───────────────────────────────────────── */}
      <div
        className={cn(
          'relative mx-1 mt-6 rounded-2xl p-[1.5px] shadow-[0_8px_24px_-10px_hsl(var(--sage)/0.4)]',
          // Dark mode: Tailwind gradient; light mode: inline style gradient below
          !isLight && 'bg-gradient-to-br from-saffron/35 via-sage/25 to-saffron/25',
        )}
        style={isLight
          ? { background: 'linear-gradient(135deg, hsl(var(--saffron)/0.45), hsl(var(--sage)/0.32), hsl(var(--saffron)/0.28))' }
          : undefined}
      >
        <div
          className={cn(
            'relative overflow-hidden rounded-[calc(1rem-1.5px)] p-4',
            !isLight && 'bg-gradient-to-br from-sage/20 via-bg/70 to-bg/85 backdrop-blur-xl',
          )}
          style={isLight ? { backgroundColor: 'hsl(145 58% 10%)' } : undefined}
        >
          {/* Glass shine */}
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,hsl(0_0%_100%/0.10)_0%,transparent_55%)]" />
          {/* Sage glow orb */}
          <div aria-hidden className="pointer-events-none absolute -right-8 -top-6 h-28 w-28 rounded-full bg-sage/30 blur-3xl" />
          {/* Saffron warm accent orb */}
          <div aria-hidden className="pointer-events-none absolute right-4 bottom-10 h-16 w-16 rounded-full bg-saffron/15 blur-2xl" />

          {/* Leaf watermark — elaborate tropical (light) vs simple Lucide leaf (dark) */}
          {isLight ? (
            <svg
              aria-hidden
              className="pointer-events-none absolute -bottom-2 -right-4 h-44 w-24 select-none"
              viewBox="0 0 60 180"
              style={{ color: 'hsl(152 45% 58%)', opacity: 0.18 }}
            >
              <path
                d="M30 0 C50 22, 60 70, 55 112 C50 154, 40 170, 30 180 C20 170, 10 154, 5 112 C0 70, 10 22, 30 0Z"
                fill="currentColor"
              />
              <path d="M30 0 L30 180" stroke="hsl(145 55% 8%)" strokeWidth="1.4" fill="none" />
              <path d="M30 38 Q16 50, 11 62"   stroke="hsl(145 55% 8%)" strokeWidth="0.7" fill="none" />
              <path d="M30 68 Q13 82, 9  96"   stroke="hsl(145 55% 8%)" strokeWidth="0.7" fill="none" />
              <path d="M30 98 Q16 112, 13 126" stroke="hsl(145 55% 8%)" strokeWidth="0.7" fill="none" />
              <path d="M30 38 Q44 50, 49 62"   stroke="hsl(145 55% 8%)" strokeWidth="0.7" fill="none" />
              <path d="M30 68 Q47 82, 51 96"   stroke="hsl(145 55% 8%)" strokeWidth="0.7" fill="none" />
              <path d="M30 98 Q44 112, 47 126" stroke="hsl(145 55% 8%)" strokeWidth="0.7" fill="none" />
            </svg>
          ) : (
            <svg
              aria-hidden
              className="pointer-events-none absolute -right-1 bottom-8 h-24 w-24 select-none text-sage opacity-[0.08]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 5.5-11 8" />
            </svg>
          )}

          {/* ── Content ── */}
          <div className="relative z-10 max-w-[62%]">
            <div className="mb-2 flex items-center gap-1.5">
              <span
                className="grid h-6 w-6 place-items-center rounded-full bg-sage/25"
                style={isLight ? { color: 'hsl(152 42% 60%)' } : undefined}
              >
                <Leaf className={cn('h-3.5 w-3.5', !isLight && 'text-sage')} />
              </span>
              <span
                className={cn('font-display text-[10px] font-bold uppercase tracking-[0.16em]', !isLight && 'text-sage')}
                style={isLight ? { color: 'hsl(152 42% 60%)' } : undefined}
              >
                Ayra Fresh+
              </span>
            </div>

            <p
              className={cn('font-display text-[15px] font-extrabold leading-tight', !isLight && 'text-cream')}
              style={isLight ? { color: 'hsl(0 0% 96%)' } : undefined}
            >
              Extra 15% Off
            </p>
            <p
              className={cn('mt-0.5 text-[10px]', !isLight && 'text-cream/55')}
              style={isLight ? { color: 'hsl(0 0% 90% / 0.55)' } : undefined}
            >
              On Fresh Produce
            </p>

            {/* CTA — text link (light) vs sage pill (dark) */}
            {isLight ? (
              <NavLink
                to="/products?collection=fresh-plus"
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold transition"
                style={{ color: 'hsl(var(--saffron))' }}
              >
                Join Now
                <ArrowRight className="h-3 w-3" />
              </NavLink>
            ) : (
              <NavLink
                to="/products?collection=fresh-plus"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sage px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-bg shadow-[0_4px_14px_-2px_hsl(var(--sage)/0.5)] transition hover:bg-sage/90 hover:shadow-[0_6px_18px_-2px_hsl(var(--sage)/0.7)]"
              >
                <span className="[text-shadow:0_1px_4px_rgba(0,0,0,0.4)]">Shop Now</span>
                <ArrowRight className="h-3 w-3" />
              </NavLink>
            )}
          </div>

          {/* Produce basket photo */}
          <img
            src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=200&h=200&fit=crop&crop=center&q=85"
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute -bottom-3 -right-3 z-10 h-24 w-24 select-none rounded-2xl object-cover opacity-90"
          />
        </div>
      </div>

      {/* ── Need Help? card ──────────────────────────────────────────────── */}
      <div className="mx-1 mt-3 rounded-2xl bg-gradient-to-br from-saffron/40 via-plum/30 to-saffron/35 p-[1.5px] shadow-[0_8px_24px_-10px_hsl(var(--plum)/0.4)]">
        <div
          className={cn(
            'relative overflow-hidden rounded-[calc(1rem-1.5px)] p-4',
            isLight
              ? 'bg-gradient-to-br from-plum/25 via-surface-dark to-surface-dark'
              : 'bg-gradient-to-br from-plum/20 via-bg/70 to-bg/85 backdrop-blur-xl',
          )}
        >
          {/* Glass shine */}
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,hsl(0_0%_100%/0.10)_0%,transparent_55%)]" />
          {/* Plum glow orb */}
          <div aria-hidden className="pointer-events-none absolute -left-6 -top-6 h-28 w-28 rounded-full bg-plum/35 blur-3xl" />
          {/* Saffron warm accent orb */}
          <div aria-hidden className="pointer-events-none absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-saffron/20 blur-2xl" />
          {/* Abstract concentric ring SVG */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full select-none opacity-[0.10]"
            viewBox="0 0 200 160"
            fill="none"
          >
            <circle cx="185" cy="15" r="55" stroke="hsl(var(--plum))"    strokeWidth="1.5" />
            <circle cx="185" cy="15" r="75" stroke="hsl(var(--saffron))" strokeWidth="0.8" />
            <circle cx="10"  cy="145" r="35" stroke="hsl(var(--saffron))" strokeWidth="0.8" />
          </svg>

          {/* ── Content ── */}
          <div className="relative z-10">
            <p
              className={cn('text-[10px] font-bold uppercase tracking-[0.16em]', !isLight && 'text-cream/65')}
              style={isLight ? { color: 'hsl(0 0% 94% / 0.65)' } : undefined}
            >
              Need Help?
            </p>
            <p
              className={cn('mt-0.5 text-[10px]', !isLight && 'text-cream/45')}
              style={isLight ? { color: 'hsl(0 0% 90% / 0.45)' } : undefined}
            >
              We&apos;re here for you
            </p>

            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-plum to-saffron shadow-[0_4px_14px_-2px_hsl(var(--saffron)/0.45)]">
                <Headphones
                  className={cn('h-4 w-4', !isLight && 'text-bg')}
                  strokeWidth={2}
                  style={isLight ? { color: 'hsl(0 0% 96%)' } : undefined}
                />
              </span>
              <span
                className={cn('font-display text-2xl font-black leading-none tabular-nums', !isLight && 'text-cream')}
                style={isLight ? { color: 'hsl(0 0% 96%)' } : undefined}
              >
                24/7
              </span>
            </div>

            {/* Live Chat — solid green button (light) vs glass-gradient pill (dark) */}
            {isLight ? (
              <button
                type="button"
                className="group relative mt-3 flex w-full overflow-hidden rounded-full transition hover:brightness-110"
                style={{ backgroundColor: 'hsl(145 52% 26%)' }}
              >
                {/* Leaf watermark inside button */}
                <svg
                  aria-hidden
                  className="pointer-events-none absolute inset-0 h-full w-full select-none"
                  viewBox="0 0 160 36"
                  style={{ color: 'hsl(145 55% 55%)', opacity: 0.18 }}
                >
                  <path d="M72 -4 C84 2, 92 14, 86 26 C80 38, 64 38, 58 26 C52 14, 60 2, 72 -4Z" fill="currentColor" />
                  <path d="M130 -2 C140 4, 146 16, 140 27 C134 38, 120 37, 116 27 C112 16, 118 4, 130 -2Z" fill="currentColor" />
                  <path d="M104 4 C110 10, 112 20, 108 28 C104 36, 96 36, 94 28 C92 20, 96 10, 104 4Z" fill="currentColor" />
                </svg>
                <span
                  className="relative flex w-full items-center justify-between gap-1.5 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]"
                  style={{ color: 'hsl(0 0% 94%)' }}
                >
                  Live Chat
                  <span
                    className="grid h-6 w-6 place-items-center rounded-full transition group-hover:translate-x-0.5"
                    style={{ backgroundColor: 'hsl(145 44% 42%)' }}
                  >
                    <ArrowRight className="h-3 w-3" strokeWidth={2.4} style={{ color: 'hsl(0 0% 96%)' }} />
                  </span>
                </span>
              </button>
            ) : (
              <button
                type="button"
                className="group relative mt-3 flex w-full rounded-full bg-gradient-to-r from-saffron/60 via-plum/40 to-saffron/60 p-[1px] transition hover:shadow-[0_0_18px_-4px_hsl(var(--saffron)/0.55)]"
              >
                <span className="flex w-full items-center justify-between gap-1.5 rounded-full bg-bg/60 pl-3.5 pr-1 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-cream [text-shadow:0_1px_4px_rgba(0,0,0,0.5)] backdrop-blur-md transition group-hover:bg-bg/40">
                  Live Chat
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-saffron text-bg transition group-hover:translate-x-0.5">
                    <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
