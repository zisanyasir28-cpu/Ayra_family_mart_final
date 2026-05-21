import { NavLink } from 'react-router-dom';
import {
  Home, Grid2x2, Tag, Star, Sparkles, Award, Leaf,
  Package, Heart, Headphones, ArrowRight, ChevronRight, type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ─── Desktop persistent left sidebar (lg+) ────────────────────────────────────
//
// Sits below the sticky header on `lg+` viewports and replaces the hamburger
// menu + bottom tab bar (both gated to `lg:hidden` in CustomerLayout).
//
// All routes resolve to existing pages. Filter / sort query params on
// `/products` are interpreted in Phase E — until then the links navigate
// safely and the result set is the unfiltered grid.

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

export function CustomerSidebar() {
  return (
    <aside
      aria-label="Primary navigation"
      className="
        sticky top-[8.25rem] hidden h-[calc(100vh-8.25rem)] w-64 shrink-0
        flex-col gap-1 overflow-y-auto border-r border-line/40
        bg-surface/30 px-4 py-6 backdrop-blur-xl
        lg:flex
      "
    >
      <p className="mb-2 px-2 text-[10px] uppercase tracking-[0.22em] text-cream/45">
        Browse
      </p>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ icon: Icon, label, to, end, badge, iconClass }) => (
          <NavLink
            key={to + label}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all',
                isActive
                  ? 'bg-gradient-to-r from-saffron to-blush text-bg font-bold shadow-[0_4px_16px_-4px_hsl(var(--saffron)/0.5)]'
                  : 'text-cream/75 hover:bg-saffron/10 hover:text-saffron',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors',
                    isActive
                      ? 'bg-white/15'
                      : 'ring-1 ring-line/40 group-hover:ring-saffron/40',
                  )}
                >
                  <Icon className={cn('h-[14px] w-[14px]', !isActive && iconClass)} strokeWidth={1.8} />
                </span>
                <span className="flex-1 truncate">{label}</span>
                {badge && (
                  <span className="rounded-full bg-coral px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-bg">
                    {badge}
                  </span>
                )}
                {isActive && (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2.4} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Ayra Fresh+ promo card */}
      <div className="relative mx-1 mt-6 overflow-hidden rounded-2xl border border-sage/30 bg-gradient-to-br from-sage/25 via-sage/10 to-bg/50 p-4">
        <div className="relative z-10 max-w-[60%]">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-sage/25 text-sage">
              <Leaf className="h-3.5 w-3.5" />
            </span>
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-sage">
              Ayra Fresh+
            </span>
          </div>
          <p className="font-display text-[15px] font-extrabold leading-tight text-cream">
            Extra 15% Off
          </p>
          <p className="mt-0.5 text-[10px] text-cream/55">On Fresh Produce</p>
          <NavLink
            to="/products?collection=fresh-plus"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-saffron px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-bg transition hover:bg-saffron/90 hover:shadow-[0_0_18px_-4px_hsl(var(--saffron)/0.7)]"
          >
            Shop Now <ArrowRight className="h-3 w-3" />
          </NavLink>
        </div>
        {/* Produce basket illustration — bottom-right */}
        <img
          src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=200&h=200&fit=crop&crop=center&q=85"
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute -bottom-3 -right-3 h-24 w-24 select-none rounded-2xl object-cover opacity-90"
        />
      </div>

      {/* Need Help? — 24/7 Live chat CTA */}
      <div className="mx-1 mt-3 overflow-hidden rounded-2xl border border-plum/30 bg-gradient-to-br from-plum/25 via-plum/10 to-bg/40 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cream/65">
          Need Help?
        </p>
        <p className="mt-0.5 text-[10px] text-cream/45">We&apos;re here for you</p>

        <div className="mt-3 flex items-center gap-3">
          {/* Gradient headphone avatar — purple → pink */}
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-plum to-saffron shadow-[0_4px_14px_-2px_hsl(var(--saffron)/0.45)]">
            <Headphones className="h-4 w-4 text-bg" strokeWidth={2} />
          </span>
          <span className="font-display text-2xl font-black leading-none tabular-nums text-cream">
            24/7
          </span>
        </div>

        <button
          type="button"
          className="group mt-3 flex w-full items-center justify-between gap-1.5 rounded-full border border-saffron/45 bg-saffron/5 pl-3.5 pr-1 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-cream transition hover:bg-saffron/15 hover:shadow-[0_0_18px_-4px_hsl(var(--saffron)/0.5)]"
        >
          Live Chat
          <span className="grid h-6 w-6 place-items-center rounded-full bg-saffron text-bg transition group-hover:translate-x-0.5">
            <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
          </span>
        </button>
      </div>
    </aside>
  );
}
