import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Logo }        from '../common/Logo';
import { CartDrawer }  from '../CartDrawer';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery }    from '@tanstack/react-query';
import {
  Search, ShoppingCart, Heart, User, MapPin, Menu, X,
  ChevronDown, Home, LayoutGrid, Package, LogOut, Settings, Zap,
  Phone, Mail as MailIcon,
} from 'lucide-react';
import { cn }              from '../../lib/utils';
import { useCartStore }    from '../../store/cartStore';
import { useAuthStore }    from '../../store/authStore';
import { fetchCategories } from '../../services/categories';
import type { ApiCategory } from '../../types/api';

// ─── Category emoji helper ────────────────────────────────────────────────────

function getCategoryEmoji(slug: string): string {
  const map: Record<string, string> = {
    fruits: '🍎', vegetables: '🥦', dairy: '🥛', meat: '🥩',
    fish: '🐟', bakery: '🍞', beverages: '🧃', snacks: '🍿',
    grocery: '🛒', cleaning: '🧹', personal: '🧴', electronics: '📱',
    clothing: '👕', household: '🏠', baby: '👶', health: '💊',
  };
  for (const [key, emoji] of Object.entries(map)) {
    if (slug.includes(key)) return emoji;
  }
  return '📦';
}

// ─── Announcement Bar ─────────────────────────────────────────────────────────

function AnnouncementBar() {
  return (
    <div className="overflow-hidden bg-gradient-to-r from-green-700 via-green-600 to-teal-600 py-2">
      <div className="flex whitespace-nowrap animate-marquee">
        {[0, 1].map((i) => (
          <span key={i} className="mx-6 inline-flex items-center gap-5 text-xs font-medium text-white/90 sm:text-sm">
            <span className="flex items-center gap-1.5">🚚 <strong>Free delivery</strong> on orders above ৳999</span>
            <span className="text-white/30">•</span>
            <span className="flex items-center gap-1.5">🎉 Use <strong className="text-yellow-300">WELCOME10</strong> for 10% off your first order</span>
            <span className="text-white/30">•</span>
            <span className="flex items-center gap-1.5">⚡ Express delivery in <strong>60 minutes</strong> in Dhaka</span>
            <span className="text-white/30">•</span>
            <span className="flex items-center gap-1.5">🌿 <strong>Ayra Family Mart</strong> — Fresh · Fast · Trusted</span>
            <span className="text-white/30">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────

function SearchBar() {
  const [query,   setQuery]   = useState('');
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/products?search=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-[42%]">
      <div
        className={cn(
          'relative flex items-center overflow-hidden rounded-2xl border bg-muted/70 transition-all duration-200',
          focused
            ? 'border-green-500 bg-white shadow-glow-green ring-2 ring-green-500/15'
            : 'border-border hover:border-border/80',
        )}
      >
        <Search
          className={cn(
            'absolute left-3.5 h-4 w-4 shrink-0 transition-colors',
            focused ? 'text-green-600' : 'text-muted-foreground',
          )}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search groceries, vegetables, dairy..."
          className="w-full bg-transparent py-2.5 pl-10 pr-12 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        />
        <AnimatePresence>
          {query.length > 0 && (
            <motion.button
              type="submit"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-2 flex h-7 w-7 items-center justify-center rounded-xl bg-green-600 text-white shadow-sm transition hover:bg-green-700"
            >
              <Search className="h-3.5 w-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}

// ─── Cart Button ──────────────────────────────────────────────────────────────

function CartButton({ onClick }: { onClick: () => void }) {
  const { itemCount } = useCartStore();
  const count = itemCount();

  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted active:scale-95"
      aria-label={`Cart (${count} items)`}
    >
      <ShoppingCart className="h-5 w-5" />
      <span className="hidden font-semibold sm:inline">Cart</span>
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 18 }}
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[10px] font-extrabold text-white shadow-sm"
          >
            {count > 99 ? '99+' : count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// ─── User Menu ────────────────────────────────────────────────────────────────

function UserMenu() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className="flex items-center gap-1.5 rounded-xl border border-green-500/30 bg-green-50 px-3.5 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100 hover:border-green-500/50 active:scale-95"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">Login</span>
      </Link>
    );
  }

  const initials = user?.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() ?? '?';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-muted active:scale-95"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-600 text-xs font-extrabold text-white shadow-sm">
          {initials}
        </div>
        <span className="hidden max-w-[80px] truncate text-sm font-semibold text-foreground md:inline">
          {user?.name.split(' ')[0]}
        </span>
        <ChevronDown
          className={cn(
            'hidden h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 md:block',
            open && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-border bg-card shadow-float"
          >
            {/* Profile header */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-teal-600 text-sm font-extrabold text-white">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">{user?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>

            <nav className="p-1.5">
              {[
                { to: '/account', icon: Settings, label: 'My Account' },
                { to: '/orders',  icon: Package,  label: 'My Orders'  },
              ].map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm text-foreground transition hover:bg-muted"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {label}
                </Link>
              ))}
              <div className="my-1.5 h-px bg-border" />
              <button
                onClick={() => { clearAuth(); setOpen(false); }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  categories: ApiCategory[];
}

function MobileDrawer({ open, onClose, categories }: MobileDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col overflow-hidden bg-card shadow-float"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-green-50 to-teal-50 p-4">
              <Logo size="sm" />
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl transition hover:bg-white/80 active:scale-90"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Categories */}
            <div className="flex-1 overflow-y-auto p-3">
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Categories
              </p>
              <nav className="space-y-0.5">
                <Link
                  to="/products"
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                >
                  <LayoutGrid className="h-4 w-4" />
                  All Products
                </Link>
                <Link
                  to="/products?deals=true"
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <Zap className="h-4 w-4" />
                  Flash Deals
                  <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">HOT</span>
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/products?categoryId=${cat.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition hover:bg-muted"
                  >
                    <span className="text-lg leading-none">{getCategoryEmoji(cat.slug)}</span>
                    <span className="flex-1">{cat.name}</span>
                    <span className="text-[11px] text-muted-foreground">{cat._count.products}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4 text-xs text-muted-foreground">
              📍 Gulshan 2, Dhaka &nbsp;•&nbsp; 📞 +880 1700-000000
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Secondary Category Nav ───────────────────────────────────────────────────

function CategoryNav({ categories }: { categories: ApiCategory[] }) {
  return (
    <div className="border-b border-border/60 bg-card/90">
      <div className="container flex items-center gap-0.5 overflow-x-auto scrollbar-hide py-1">
        <NavLink
          to="/products"
          end
          className={({ isActive }) =>
            cn(
              'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition',
              isActive
                ? 'bg-green-50 text-green-700'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          All Products
        </NavLink>
        <NavLink
          to="/products?deals=true"
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <Zap className="h-3.5 w-3.5 fill-red-500" />
          Deals
          <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-extrabold text-white leading-tight">
            HOT
          </span>
        </NavLink>
        {categories.slice(0, 12).map((cat) => (
          <NavLink
            key={cat.id}
            to={`/products?categoryId=${cat.id}`}
            className={({ isActive }) =>
              cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition',
                isActive
                  ? 'bg-green-50 font-semibold text-green-700'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <span className="text-sm leading-none">{getCategoryEmoji(cat.slug)}</span>
            <span>{cat.name}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-border bg-gradient-to-b from-card to-muted/30">
      <div className="container py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Logo asSpan size="sm" />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Bangladesh's most trusted family mart. Fresh groceries, household
              essentials and more — delivered to your door, fast.
            </p>
            <div className="mt-5 flex gap-2">
              {[
                { label: 'Facebook',  symbol: '𝑓' },
                { label: 'Instagram', symbol: '◎' },
                { label: 'X',         symbol: '𝕏' },
                { label: 'YouTube',   symbol: '▶' },
              ].map(({ label, symbol }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-green-400 hover:bg-green-50 hover:text-green-700"
                >
                  {symbol}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-xs font-extrabold uppercase tracking-widest text-foreground/70">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home',          to: '/'                         },
                { label: 'All Products',  to: '/products'                 },
                { label: 'Flash Deals',   to: '/products?deals=true'      },
                { label: 'New Arrivals',  to: '/products?sortBy=newest'   },
                { label: 'Best Sellers',  to: '/products?sortBy=popular'  },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-muted-foreground transition-all hover:translate-x-1 hover:text-green-700 inline-block"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="mb-4 text-xs font-extrabold uppercase tracking-widest text-foreground/70">
              Customer Service
            </h4>
            <ul className="space-y-2.5">
              {['Help Center', 'Track Order', 'Return Policy', 'Privacy Policy', 'Terms of Service'].map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-all hover:translate-x-1 hover:text-green-700 inline-block"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-xs font-extrabold uppercase tracking-widest text-foreground/70">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                Gulshan 2, Dhaka 1212, Bangladesh
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-green-600" />
                +880 1700-000000
              </li>
              <li className="flex items-center gap-2">
                <MailIcon className="h-4 w-4 shrink-0 text-green-600" />
                support@ayrafamilymart.com.bd
              </li>
              <li className="pt-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-foreground/60">Working Hours</div>
                <div className="mt-1">Sat – Thu: 8am – 10pm</div>
                <div>Friday: 2pm – 10pm</div>
              </li>
            </ul>

            {/* Payment methods */}
            <div className="mt-4 flex flex-wrap gap-2">
              {['SSLCommerz', 'bKash', 'Nagad', 'COD'].map((p) => (
                <span
                  key={p}
                  className="rounded-lg border border-border bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border bg-muted/40 py-4">
        <div className="container flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Ayra Family Mart. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Made with <span className="text-red-500">❤️</span> in Bangladesh
          </span>
        </div>
      </div>
    </footer>
  );
}

// ─── Bottom Mobile Tab Bar ────────────────────────────────────────────────────

function BottomTabBar({ onCartClick }: { onCartClick: () => void }) {
  const { itemCount } = useCartStore();
  const count = itemCount();

  const navTabs = [
    { icon: Home,       label: 'Home',       to: '/',       end: true  },
    { icon: LayoutGrid, label: 'Browse',     to: '/products', end: false },
    { icon: Search,     label: 'Search',     to: '/products?focus=search', end: false },
    { icon: User,       label: 'Account',    to: '/account', end: false },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card/95 backdrop-blur-md shadow-float md:hidden">
      {navTabs.slice(0, 2).map(({ icon: Icon, label, to, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors',
              isActive ? 'text-green-700' : 'text-muted-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={cn('h-5 w-5 transition-transform', isActive && 'scale-110')} />
              {label}
            </>
          )}
        </NavLink>
      ))}

      {/* Cart centre button */}
      <button
        onClick={onCartClick}
        className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold text-muted-foreground transition hover:text-green-700"
      >
        <div className="relative">
          <ShoppingCart className="h-5 w-5" />
          <AnimatePresence>
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.4 }}
                className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[9px] font-extrabold text-white"
              >
                {count > 9 ? '9+' : count}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        Cart
      </button>

      {navTabs.slice(2).map(({ icon: Icon, label, to, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors',
              isActive ? 'text-green-700' : 'text-muted-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={cn('h-5 w-5 transition-transform', isActive && 'scale-110')} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────

export default function CustomerLayout() {
  const [scrolled,    setScrolled]    = useState(false);
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [cartOpen,    setCartOpen]    = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn:  fetchCategories,
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 12); }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />

      {/* Sticky header */}
      <header
        className={cn(
          'sticky top-0 z-30 border-b bg-card/95 backdrop-blur-md transition-all duration-200',
          scrolled
            ? 'border-border/80 shadow-md'
            : 'border-transparent shadow-none',
        )}
      >
        <div className="container flex items-center gap-3 py-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition hover:bg-muted active:scale-90 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Logo size="sm" className="shrink-0" />

          {/* Location */}
          <button className="hidden items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs text-muted-foreground transition hover:bg-muted lg:flex">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-green-600" />
            <span className="max-w-[80px] truncate font-medium">Dhaka</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          <SearchBar />

          <div className="ml-auto flex items-center gap-1">
            <Link
              to="/wishlist"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Link>
            <CartButton onClick={() => setCartOpen(true)} />
            <UserMenu />
          </div>
        </div>

        <CategoryNav categories={categories} />
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={categories}
      />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>

      <Footer />

      <BottomTabBar onCartClick={() => setCartOpen(true)} />
    </div>
  );
}
