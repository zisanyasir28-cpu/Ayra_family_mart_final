import { NavLink } from 'react-router-dom';
import {
  Home, Grid2x2, Tag, Star, Sparkles, Award, Leaf,
  Package, Heart, MessageCircle, ArrowRight, type LucideIcon,
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
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-saffron/15 text-saffron font-semibold'
                  : 'text-cream/75 hover:bg-saffron/10 hover:text-saffron',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute -left-4 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-saffron shadow-[0_0_8px_hsl(var(--saffron)/0.6)]"
                  />
                )}
                <Icon className={cn('h-[18px] w-[18px] shrink-0', iconClass)} strokeWidth={1.8} />
                <span className="flex-1 truncate">{label}</span>
                {badge && (
                  <span className="rounded-full bg-coral px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-bg">
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Ayra Fresh+ promo card */}
      <div className="mx-1 mt-6 overflow-hidden rounded-2xl border border-sage/30 bg-gradient-to-br from-sage/20 via-sage/5 to-bg/40 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-sage/20 text-sage">
            <Leaf className="h-4 w-4" />
          </span>
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-sage">
            Ayra Fresh+
          </span>
        </div>
        <p className="font-display text-base font-extrabold leading-tight text-cream">
          Extra 15% Off
        </p>
        <p className="mt-1 text-[11px] text-cream/60">
          <span className="font-bangla normal-case">সদস্যদের জন্য বিশেষ সুবিধা</span>
        </p>
        <NavLink
          to="/products?collection=fresh-plus"
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-sage py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-bg transition hover:shadow-[0_0_18px_-4px_hsl(var(--sage)/0.65)]"
        >
          Join Now <ArrowRight className="h-3 w-3" />
        </NavLink>
      </div>

      {/* 24/7 Live chat CTA */}
      <div className="mx-1 mt-3 overflow-hidden rounded-2xl border border-saffron/25 bg-gradient-to-br from-saffron/20 via-plum/10 to-bg/40 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-saffron/20 text-saffron">
            <MessageCircle className="h-4 w-4" />
          </span>
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-saffron">
            24/7 Support
          </span>
        </div>
        <p className="font-display text-sm font-bold text-cream">
          Need help?
        </p>
        <p className="mt-1 text-[11px] text-cream/60">
          Chat with us anytime — live agents online.
        </p>
        <button
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full border border-saffron/40 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-saffron transition hover:bg-saffron/10 hover:shadow-[0_0_18px_-4px_hsl(var(--saffron)/0.5)]"
        >
          Start Chat <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </aside>
  );
}
