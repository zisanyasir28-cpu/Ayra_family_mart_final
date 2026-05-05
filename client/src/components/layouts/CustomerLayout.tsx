import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { CartDrawer } from '../CartDrawer';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  MapPin,
  Menu,
  X,
  ChevronDown,
  Home,
  LayoutGrid,
  Package,
  LogOut,
  Settings,
  Zap,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { fetchCategories } from '../../services/categories';
import type { ApiCategory } from '../../types/api';

// ─── Announcement Bar ─────────────────────────────────────────────────────────

function AnnouncementBar() {
  return (
    <div className="bg-green-700 py-2 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        {[0, 1].map((i) => (
          <span key={i} className="mx-8 inline-flex items-center gap-6 text-sm font-medium text-white">
            <span>🚚 Free delivery on orders above ৳999</span>
            <span className="opacity-50">•</span>
            <span>🎉 Use <strong>WELCOME10</strong> for 10% off your first order</span>
            <span className="opacity-50">•</span>
            <span>🌿 Ayra Family Mart — Fresh · Fast · Trusted</span>
            <span className="opacity-50">•</span>
            <span>📦 Same-day delivery in Dhaka</span>
            <span className="opacity-50">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────

function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/products?search=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-[40%]">
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search groceries, vegetables, dairy..."
          className="w-full rounded-xl border border-border bg-muted py-2.5 pl-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
        />
        <button
          type="submit"
          className="absolute right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-green-600 text-white transition hover:bg-green-700"
        >
          <Search className="h-3.5 w-3.5" />
        </button>
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
      className="relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
      aria-label={`Cart (${count} items)`}
    >
      <ShoppingCart className="h-5 w-5" />
      <span className="hidden sm:inline">Cart</span>
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white"
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

  // Close on outside click
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
        className="flex items-center gap-1.5 rounded-xl border border-green-600 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50"
      >
        <User className="h-4 w-4" />
        Login
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-muted"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-800">
          {user?.name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden text-sm font-medium text-foreground md:inline">
          {user?.name.split(' ')[0]}
        </span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
          >
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-foreground">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <nav className="py-1">
              <Link
                to="/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-foreground transition hover:bg-muted"
              >
                <Settings className="h-4 w-4" />
                My Account
              </Link>
              <Link
                to="/orders"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-foreground transition hover:bg-muted"
              >
                <Package className="h-4 w-4" />
                My Orders
              </Link>
              <button
                onClick={() => { clearAuth(); setOpen(false); }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
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
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-card shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <Logo size="sm" />
              <button onClick={onClose} className="rounded-lg p-1.5 transition hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Categories
              </p>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?categoryId=${cat.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition hover:bg-muted"
                >
                  <span className="text-xl">{getCategoryEmoji(cat.slug)}</span>
                  <span>{cat.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{cat._count.products}</span>
                </Link>
              ))}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Secondary Category Nav ───────────────────────────────────────────────────

function CategoryNav({ categories }: { categories: ApiCategory[] }) {
  return (
    <div className="border-b border-border bg-card">
      <div className="container flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5">
        <NavLink
          to="/products"
          end
          className={({ isActive }: { isActive: boolean }) =>
            cn(
              'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-green-50 text-green-700'
                : 'text-foreground hover:bg-muted',
            )
          }
        >
          All Products
        </NavLink>
        <NavLink
          to="/products?deals=true"
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <Zap className="h-3.5 w-3.5" />
          Deals
          <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
            HOT
          </span>
        </NavLink>
        {categories.slice(0, 10).map((cat) => (
          <NavLink
            key={cat.id}
            to={`/products?categoryId=${cat.id}`}
            className={({ isActive }: { isActive: boolean }) =>
              cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-foreground hover:bg-muted',
              )
            }
          >
            <span>{getCategoryEmoji(cat.slug)}</span>
            {cat.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <div className="mb-4">
              <Logo asSpan size="sm" />
            </div>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Bangladesh's most trusted family mart. Fresh groceries, household
              essentials and more — delivered to your door.
            </p>
            <div className="flex gap-3">
              {['facebook', 'instagram', 'twitter', 'youtube'].map((s) => (
                <a
                  key={s}
                  href="#"
                  aria-label={s}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition hover:bg-green-100 hover:text-green-700"
                >
                  {s === 'facebook' ? '𝑓' : s === 'instagram' ? '◎' : s === 'twitter' ? '𝕏' : '▶'}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'Home', to: '/' },
                { label: 'All Products', to: '/products' },
                { label: 'Flash Deals', to: '/products?deals=true' },
                { label: 'New Arrivals', to: '/products?sortBy=newest' },
                { label: 'Best Sellers', to: '/products?sortBy=popular' },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-muted-foreground transition hover:text-green-700">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Customer Service
            </h4>
            <ul className="space-y-2">
              {[
                'Help Center',
                'Track Order',
                'Return Policy',
                'Privacy Policy',
                'Terms of Service',
              ].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-muted-foreground transition hover:text-green-700">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Contact Us
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>📍 Gulshan 2, Dhaka 1212</li>
              <li>📞 +880 1700-000000</li>
              <li>✉️ support@ayrafamilymart.com.bd</li>
              <li className="pt-2 font-medium text-foreground">Working Hours</li>
              <li>Sat – Thu: 8am – 10pm</li>
              <li>Friday: 2pm – 10pm</li>
            </ul>
            {/* Payment logos */}
            <div className="mt-4 flex flex-wrap gap-2">
              {['SSLCommerz', 'bKash', 'COD'].map((p) => (
                <span
                  key={p}
                  className="rounded-md border border-border bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border bg-muted/50 py-4">
        <div className="container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Ayra Family Mart. All rights reserved.
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
    { icon: Home,       label: 'Home',       to: '/',                      end: true  },
    { icon: LayoutGrid, label: 'Categories', to: '/products',              end: false },
    { icon: Search,     label: 'Search',     to: '/products?focus=search', end: false },
    { icon: User,       label: 'Account',    to: '/account',               end: false },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card md:hidden">
      {/* First two nav tabs */}
      {navTabs.slice(0, 2).map(({ icon: Icon, label, to, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }: { isActive: boolean }) =>
            cn(
              'relative flex flex-1 flex-col items-center justify-center py-2 text-[10px] font-medium transition',
              isActive ? 'text-green-700' : 'text-muted-foreground',
            )
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}

      {/* Cart tab — opens drawer */}
      <button
        onClick={onCartClick}
        className="relative flex flex-1 flex-col items-center justify-center py-2 text-[10px] font-medium text-muted-foreground transition hover:text-green-700"
        aria-label={`Cart (${count} items)`}
      >
        <div className="relative">
          <ShoppingCart className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[9px] font-bold text-white">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </div>
        Cart
      </button>

      {/* Remaining nav tabs */}
      {navTabs.slice(2).map(({ icon: Icon, label, to, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }: { isActive: boolean }) =>
            cn(
              'relative flex flex-1 flex-col items-center justify-center py-2 text-[10px] font-medium transition',
              isActive ? 'text-green-700' : 'text-muted-foreground',
            )
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

// ─── Emoji helper ─────────────────────────────────────────────────────────────

function getCategoryEmoji(slug: string): string {
  const map: Record<string, string> = {
    fruits: '🍎',
    vegetables: '🥦',
    dairy: '🥛',
    meat: '🥩',
    fish: '🐟',
    bakery: '🍞',
    beverages: '🧃',
    snacks: '🍿',
    grocery: '🛒',
    cleaning: '🧹',
    personal: '🧴',
    electronics: '📱',
    clothing: '👕',
    household: '🏠',
    baby: '👶',
    health: '💊',
  };
  for (const [key, emoji] of Object.entries(map)) {
    if (slug.includes(key)) return emoji;
  }
  return '📦';
}

// ─── Main Layout ──────────────────────────────────────────────────────────────

export default function CustomerLayout() {
  const [scrolled, setScrolled]     = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartOpen, setCartOpen]     = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10, // 10 min
  });

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Announcement bar */}
      <AnnouncementBar />

      {/* Sticky navbar */}
      <header
        className={cn(
          'sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md transition-shadow',
          scrolled && 'shadow-sm',
        )}
      >
        <div className="container flex items-center gap-3 py-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-muted md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Logo size="sm" className="shrink-0" />

          {/* Location selector */}
          <button className="hidden items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted lg:flex">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-green-600" />
            <span className="max-w-[80px] truncate">Dhaka</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {/* Search */}
          <SearchBar />

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1">
            <Link
              to="/wishlist"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-foreground transition hover:bg-muted"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Link>
            <CartButton onClick={() => setCartOpen(true)} />
            <UserMenu />
          </div>
        </div>

        {/* Category nav strip */}
        <CategoryNav categories={categories} />
      </header>

      {/* Mobile category drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={categories}
      />

      {/* Cart drawer (slides from right on all screen sizes) */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Page content */}
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>

      <Footer />

      {/* Mobile bottom tab bar */}
      <BottomTabBar onCartClick={() => setCartOpen(true)} />
    </div>
  );
}
