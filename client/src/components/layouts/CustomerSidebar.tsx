import { NavLink } from 'react-router-dom';
import {
  Home, Grid2x2, Tag, Star, Sparkles, Award, Leaf,
  Package, Heart, Headphones, ArrowRight, ChevronRight, type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ─── Desktop persistent left sidebar (lg+) ────────────────────────────────────

interface SidebarItem {
  icon:       LucideIcon;
  label:      string;
  to:         string;
  end?:       boolean;
  iconClass?: string;
  badge?:     string;
}

const NAV_ITEMS: SidebarItem[] = [
  { icon: Home,     label: 'Home',           to: '/',                                  end: true },
  { icon: Grid2x2,  label: 'All Categories', to: '/products',                          end: true },
  { icon: Tag,      label: 'Offers',         to: '/products?onSale=true', badge: 'HOT'           },
  { icon: Star,     label: 'Best Sellers',   to: '/products?sort=popular'                        },
  { icon: Sparkles, label: 'New Arrivals',   to: '/products?sort=newest'                         },
  { icon: Award,    label: 'Brands',         to: '/products?view=brands'                         },
  { icon: Leaf,     label: 'Ayra Fresh+',    to: '/products?collection=fresh-plus', iconClass: 'text-sage' },
  { icon: Package,  label: 'My Orders',      to: '/orders'                                       },
  { icon: Heart,    label: 'Wishlist',       to: '/wishlist'                                     },
];

// Always-dark deep forest green — same in light and dark mode
const SIDEBAR_BG  = 'hsl(145 62% 8%)';
const SIDEBAR_BDR = 'hsl(145 42% 17% / 0.55)';

export function CustomerSidebar() {
  return (
    <aside
      aria-label="Primary navigation"
      className="sticky top-[8.25rem] hidden h-[calc(100vh-8.25rem)] w-64 shrink-0 flex-col gap-1 overflow-y-auto border-r px-4 py-6 lg:flex relative"
      style={{ backgroundColor: SIDEBAR_BG, borderRightColor: SIDEBAR_BDR }}
    >
      {/* ── Botanical background watermark ───────────────────────────────── */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
        viewBox="0 0 256 600"
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

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <p className="relative mb-2 px-2 text-[10px] uppercase tracking-[0.22em] text-sage/55">
        Browse
      </p>

      <nav className="relative flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ icon: Icon, label, to, end, badge, iconClass }) => (
          <NavLink
            key={to + label}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all',
                isActive
                  ? 'bg-[hsl(145_44%_19%)] font-bold text-cream shadow-[0_2px_14px_-4px_hsl(145_55%_8%)]'
                  : 'text-cream/70 hover:bg-[hsl(145_50%_13%)] hover:text-cream',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors',
                    isActive
                      ? 'bg-sage/30'
                      : 'ring-1 ring-sage/25 group-hover:ring-sage/45',
                  )}
                >
                  <Icon
                    className={cn('h-[14px] w-[14px]', isActive ? 'text-sage' : iconClass)}
                    strokeWidth={1.8}
                  />
                </span>
                <span className="flex-1 truncate">{label}</span>
                {badge && (
                  <span className="rounded-full bg-coral px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-bg">
                    {badge}
                  </span>
                )}
                {isActive && (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-sage/70" strokeWidth={2.4} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Ayra Fresh+ promo card ───────────────────────────────────────── */}
      <div
        className="relative mx-1 mt-6 rounded-2xl p-[1.5px] shadow-[0_8px_24px_-10px_hsl(var(--sage)/0.4)]"
        style={{ background: 'linear-gradient(135deg, hsl(var(--saffron)/0.45), hsl(var(--sage)/0.32), hsl(var(--saffron)/0.28))' }}
      >
        <div
          className="relative overflow-hidden rounded-[calc(1rem-1.5px)] p-4"
          style={{ backgroundColor: 'hsl(145 58% 10%)' }}
        >
          {/* Glass shine */}
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,hsl(0_0%_100%/0.10)_0%,transparent_55%)]" />
          {/* Sage glow orb */}
          <div aria-hidden className="pointer-events-none absolute -right-8 -top-6 h-28 w-28 rounded-full bg-sage/30 blur-3xl" />
          {/* Saffron accent orb */}
          <div aria-hidden className="pointer-events-none absolute right-4 bottom-10 h-16 w-16 rounded-full bg-saffron/15 blur-2xl" />

          {/* ── Long tropical leaf watermark ── */}
          <svg
            aria-hidden
            className="pointer-events-none absolute -bottom-2 -right-4 h-44 w-24 select-none"
            viewBox="0 0 60 180"
            style={{ color: 'hsl(152 45% 58%)', opacity: 0.18 }}
          >
            {/* Filled elongated leaf shape */}
            <path
              d="M30 0 C50 22, 60 70, 55 112 C50 154, 40 170, 30 180 C20 170, 10 154, 5 112 C0 70, 10 22, 30 0Z"
              fill="currentColor"
            />
            {/* Midrib vein */}
            <path d="M30 0 L30 180" stroke="hsl(145 55% 8%)" strokeWidth="1.4" fill="none" />
            {/* Left veins */}
            <path d="M30 38 Q16 50, 11 62" stroke="hsl(145 55% 8%)" strokeWidth="0.7" fill="none" />
            <path d="M30 68 Q13 82, 9  96" stroke="hsl(145 55% 8%)" strokeWidth="0.7" fill="none" />
            <path d="M30 98 Q16 112, 13 126" stroke="hsl(145 55% 8%)" strokeWidth="0.7" fill="none" />
            {/* Right veins */}
            <path d="M30 38 Q44 50, 49 62" stroke="hsl(145 55% 8%)" strokeWidth="0.7" fill="none" />
            <path d="M30 68 Q47 82, 51 96" stroke="hsl(145 55% 8%)" strokeWidth="0.7" fill="none" />
            <path d="M30 98 Q44 112, 47 126" stroke="hsl(145 55% 8%)" strokeWidth="0.7" fill="none" />
          </svg>

          {/* ── Content ── */}
          <div className="relative z-10 max-w-[62%]">
            <div className="mb-2 flex items-center gap-1.5">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-sage/25 text-sage">
                <Leaf className="h-3.5 w-3.5" />
              </span>
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-sage">
                Ayra Fresh+
              </span>
            </div>
            <p className="font-display text-[15px] font-extrabold leading-tight text-dark-fg">
              Extra 15% Off
            </p>
            <p className="mt-0.5 text-[10px] text-dark-fg/55">On Fresh Produce</p>

            {/* Join Now — saffron text link (matches reference) */}
            <NavLink
              to="/products?collection=fresh-plus"
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-saffron transition hover:text-saffron/80"
            >
              Join Now
              <ArrowRight className="h-3 w-3" />
            </NavLink>
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
        <div className="relative overflow-hidden rounded-[calc(1rem-1.5px)] bg-gradient-to-br from-plum/25 via-surface-dark to-surface-dark p-4">

          {/* Background art */}
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,hsl(0_0%_100%/0.10)_0%,transparent_55%)]" />
          <div aria-hidden className="pointer-events-none absolute -left-6 -top-6 h-28 w-28 rounded-full bg-plum/35 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-saffron/20 blur-2xl" />
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

          {/* Content */}
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-dark-fg/65">
              Need Help?
            </p>
            <p className="mt-0.5 text-[10px] text-dark-fg/45">We&apos;re here for you</p>

            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-plum to-saffron shadow-[0_4px_14px_-2px_hsl(var(--saffron)/0.45)]">
                <Headphones className="h-4 w-4 text-dark-fg" strokeWidth={2} />
              </span>
              <span className="font-display text-2xl font-black leading-none tabular-nums text-dark-fg">
                24/7
              </span>
            </div>

            {/* Live Chat — solid deep-green button with leaf watermark */}
            <button
              type="button"
              className="group relative mt-3 flex w-full overflow-hidden rounded-full transition hover:brightness-110"
              style={{ backgroundColor: 'hsl(145 60% 11%)' }}
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
                {/* Small leaf tip */}
                <path d="M104 4 C110 10, 112 20, 108 28 C104 36, 96 36, 94 28 C92 20, 96 10, 104 4Z" fill="currentColor" />
              </svg>
              <span className="relative flex w-full items-center justify-between gap-1.5 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-dark-fg [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">
                Live Chat
                <span
                  className="grid h-6 w-6 place-items-center rounded-full transition group-hover:translate-x-0.5"
                  style={{ backgroundColor: 'hsl(145 44% 42%)' }}
                >
                  <ArrowRight className="h-3 w-3 text-bg" strokeWidth={2.4} />
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
