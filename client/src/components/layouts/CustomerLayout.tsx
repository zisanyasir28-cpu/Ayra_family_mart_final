import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Heart, User, Menu, X, ChevronDown,
  Home, LayoutGrid, Package, LogOut, Settings, Zap,
  MapPin, Phone, Mail as MailIcon, Bell, ShoppingBag, Info, Search as SearchLucide,
} from 'lucide-react';
import { Logo }            from '../common/Logo';
import { CartDrawer }      from '../CartDrawer';
import { CursorFollower }  from '../common/CursorFollower';
import { SearchIcon, BasketIcon, ArrowRightIcon } from '../common/HandIcon';
import { cn, formatPaisa } from '../../lib/utils';
import { thumb }           from '../../lib/cloudinary';
import { sanitizeText }    from '../../lib/sanitize';
import { ThemeToggle }     from '../common/ThemeToggle';
import { useCartStore }    from '../../store/cartStore';
import { useAuthStore }    from '../../store/authStore';
import { fetchCategories } from '../../services/categories';
import { fetchAutocomplete, type AutocompleteHit } from '../../services/products';
import {
  fetchUnreadCount,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../services/notifications';
import type { ApiCategory, ApiNotification } from '../../types/api';

// ─── Category emoji helper ────────────────────────────────────────────────────

function getCategoryEmoji(slug: string): string {
  const map: Record<string, string> = {
    fruits: '🥭', vegetables: '🥬', dairy: '🥛', meat: '🥩',
    fish: '🐟', bakery: '🥐', beverages: '☕', snacks: '🍿',
    grocery: '🛒', cleaning: '🧹', personal: '🧴', electronics: '📱',
    clothing: '👕', household: '🏠', baby: '🧸', health: '💊',
  };
  for (const [key, emoji] of Object.entries(map)) {
    if (slug.includes(key)) return emoji;
  }
  return '📦';
}

// ─── Announcement bar — tiny, saffron, single line ───────────────────────────

function AnnouncementBar() {
  return (
    <div className="overflow-hidden border-b border-line bg-bg py-2">
      <div className="flex whitespace-nowrap text-[11px] tracking-[0.18em] animate-marquee-x-slow">
        {[0, 1].map((i) => (
          <span key={i} className="mx-4 inline-flex items-center gap-6 text-cream/60">
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-saffron" />
              <span>FREE DELIVERY ABOVE ৳999</span>
            </span>
            <span className="opacity-40">/</span>
            <span className="flex items-center gap-2">
              <span>USE</span>
              <span className="font-bold text-saffron">WELCOME10</span>
              <span>FOR 10% OFF</span>
            </span>
            <span className="opacity-40">/</span>
            <span className="flex items-center gap-2">
              <span>EXPRESS DELIVERY IN 60 MIN</span>
            </span>
            <span className="opacity-40">/</span>
            <span className="flex items-center gap-2">
              <span className="font-bangla normal-case tracking-normal text-cream/85">তাজা পণ্য, প্রতিদিন</span>
              <span className="opacity-50">·</span>
              <span>FRESH, DAILY</span>
            </span>
            <span className="mr-4 opacity-40">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Search bar ───────────────────────────────────────────────────────────────

function SearchBar() {
  const [query,    setQuery]    = useState('');
  const [debounced, setDebounced] = useState('');
  const [focused,  setFocused]  = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLFormElement>(null);

  // Debounce the search query for autocomplete
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(id);
  }, [query]);

  const { data: hits = [] } = useQuery<AutocompleteHit[]>({
    queryKey: ['autocomplete', debounced],
    queryFn:  () => fetchAutocomplete(debounced),
    enabled:  debounced.length >= 2,
    staleTime: 30_000,
  });

  // Close dropdown on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      setFocused(false);
      navigate(`/products?search=${encodeURIComponent(q)}`);
    }
  }

  const showDropdown = focused && debounced.length >= 2 && hits.length > 0;

  return (
    <form ref={containerRef} onSubmit={handleSubmit} className="relative flex-1 max-w-md">
      <div
        className={cn(
          'relative flex items-center rounded-full border bg-surface px-4 transition-all duration-300',
          focused
            ? 'border-saffron shadow-saffron/30'
            : 'border-line hover:border-cream/15',
        )}
      >
        <SearchIcon
          size={16}
          className={cn('shrink-0 transition-colors', focused ? 'text-saffron' : 'text-cream/45')}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search the market…"
          className="w-full bg-transparent py-2.5 pl-3 pr-2 text-sm text-cream placeholder:text-cream/35 focus:outline-none"
        />
        <AnimatePresence>
          {query.length > 0 && (
            <motion.button
              type="submit"
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              className="text-[11px] uppercase tracking-[0.2em] text-saffron hover:text-cream"
            >
              Go
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Autocomplete dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{    opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
          >
            <ul className="max-h-80 overflow-y-auto">
              {hits.map((hit) => (
                <li key={hit.id}>
                  <Link
                    to={`/products/${hit.slug}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setFocused(false); setQuery(''); }}
                    className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-surface-2"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                      {hit.imageUrl ? (
                        <img src={thumb(hit.imageUrl)} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl opacity-30">🛒</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-cream">{hit.name}</p>
                      <p className="text-[11px] text-cream/55">{formatPaisa(hit.priceInPaisa)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <button
              type="submit"
              onMouseDown={(e) => e.preventDefault()}
              className="block w-full border-t border-line bg-surface-2 py-2 text-center text-[11px] uppercase tracking-[0.15em] text-saffron hover:bg-bg/30"
            >
              See all results for "{debounced}"
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

// ─── Mobile search (icon + full-screen modal) ─────────────────────────────────

function MobileSearch() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-cream/70 transition hover:bg-cream/5 hover:text-cream md:hidden"
        aria-label="Search"
      >
        <SearchLucide className="h-5 w-5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            className="fixed inset-0 z-[55] flex flex-col bg-bg p-4"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:bg-cream/5 active:scale-90"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-cream" />
              </button>
              <div className="flex-1" onClick={() => setOpen(false)}>
                <SearchBar />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Cart button ──────────────────────────────────────────────────────────────

function CartButton({ onClick }: { onClick: () => void }) {
  const { itemCount } = useCartStore();
  const count = itemCount();

  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-2 rounded-full p-2.5 text-cream transition hover:bg-cream/5"
      aria-label={`Cart (${count} items)`}
    >
      <BasketIcon size={20} strokeWidth={1.5} />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{    scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 18 }}
            className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-saffron font-display text-[10px] font-extrabold text-bg"
          >
            {count > 99 ? '99+' : count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// ─── Notification Bell ────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function notifIcon(type: string) {
  if (type === 'ORDER_STATUS' || type === 'ORDER_CREATED') return ShoppingBag;
  return Info;
}

function NotificationBell() {
  const { isAuthenticated } = useAuthStore();
  const [open, setOpen]     = useState(false);
  const [items, setItems]   = useState<ApiNotification[]>([]);
  const ref                 = useRef<HTMLDivElement>(null);
  const qc                  = useQueryClient();

  const { data: unreadCount = 0 } = useQuery({
    queryKey:       ['notifications', 'unread-count'],
    queryFn:        fetchUnreadCount,
    refetchInterval: 30_000,
    enabled:        isAuthenticated,
  });

  // Load notifications when dropdown opens
  useEffect(() => {
    if (!open) return;
    fetchNotifications({ limit: 10 }).then((r) => setItems(r.data));
  }, [open]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!isAuthenticated) return null;

  async function handleMarkAll() {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    void qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
  }

  async function handleMarkOne(id: string) {
    await markNotificationRead(id);
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    void qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-cream/70 transition hover:bg-cream/5 hover:text-cream"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-coral font-display text-[9px] font-extrabold text-bg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{    opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line bg-surface-2 px-4 py-3">
              <span className="font-display text-sm font-bold text-cream">Notifications</span>
              {items.some((n) => !n.isRead) && (
                <button
                  onClick={handleMarkAll}
                  className="text-[11px] text-saffron hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <Bell className="h-8 w-8 text-cream/20" />
                  <p className="text-sm text-cream/45">No notifications yet</p>
                </div>
              ) : (
                items.map((n) => {
                  const Icon = notifIcon(n.type);
                  return (
                    <button
                      key={n.id}
                      onClick={() => { void handleMarkOne(n.id); setOpen(false); }}
                      className={cn(
                        'flex w-full gap-3 px-4 py-3 text-left transition hover:bg-surface-2',
                        !n.isRead && 'bg-saffron/5',
                      )}
                    >
                      <div className={cn(
                        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                        n.type === 'ORDER_STATUS' || n.type === 'ORDER_CREATED'
                          ? 'bg-saffron/15 text-saffron'
                          : 'bg-cream/10 text-cream/60',
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-xs font-semibold text-cream">
                          {sanitizeText(n.title)}
                          {!n.isRead && (
                            <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-coral align-middle" />
                          )}
                        </p>
                        <p className="line-clamp-2 text-[11px] text-cream/55">{sanitizeText(n.message)}</p>
                        <p className="mt-0.5 text-[10px] text-cream/35">{relativeTime(n.createdAt)}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── User menu ────────────────────────────────────────────────────────────────

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
        className="hidden items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm text-cream transition hover:border-saffron hover:text-saffron sm:inline-flex"
      >
        Sign in
      </Link>
    );
  }

  const initials = user?.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() ?? '?';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full p-1 transition hover:bg-cream/5"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-saffron font-display text-xs font-extrabold text-bg">
          {initials}
        </div>
        <ChevronDown
          className={cn('hidden h-3.5 w-3.5 text-cream/45 transition-transform duration-200 sm:block', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{    opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
          >
            <div className="border-b border-line bg-surface-2 px-4 py-3.5">
              <p className="font-display text-sm font-bold text-cream">{user?.name}</p>
              <p className="truncate text-xs text-cream/55">{user?.email}</p>
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
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm text-cream transition hover:bg-surface-2"
                >
                  <Icon className="h-4 w-4 text-cream/55" />
                  {label}
                </Link>
              ))}
              <div className="my-1.5 h-px bg-line" />
              <div className="px-3.5 py-2">
                <p className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-cream/45">Theme</p>
                <ThemeToggle compact />
              </div>
              <div className="my-1.5 h-px bg-line" />
              <button
                onClick={() => { clearAuth(); setOpen(false); }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm text-coral transition hover:bg-coral/10"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Mobile drawer ────────────────────────────────────────────────────────────

interface MobileDrawerProps {
  open:       boolean;
  onClose:    () => void;
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
            className="fixed inset-0 z-40 bg-bg/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col overflow-hidden bg-surface"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <Logo size="sm" />
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-cream/5 active:scale-90"
              >
                <X className="h-4 w-4 text-cream" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">
              <p className="mb-2 px-3 text-[10px] uppercase tracking-[0.22em] text-cream/45">
                Browse
              </p>
              <nav className="space-y-0.5">
                <Link
                  to="/products"
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-saffron transition hover:bg-saffron/10"
                >
                  <LayoutGrid className="h-4 w-4" />
                  All Products
                </Link>
                <Link
                  to="/products?deals=true"
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-coral transition hover:bg-coral/10"
                >
                  <Zap className="h-4 w-4" />
                  Flash Deals
                  <span className="ml-auto rounded-full bg-coral px-1.5 py-0.5 text-[10px] font-bold text-bg">HOT</span>
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/products?categoryId=${cat.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream transition hover:bg-cream/5"
                  >
                    <span className="text-lg leading-none">{getCategoryEmoji(cat.slug)}</span>
                    <span className="flex-1">{cat.name}</span>
                    <span className="text-[11px] text-cream/45">{cat._count.products}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="border-t border-line px-5 py-4 text-xs text-cream/55">
              <span>+880 1700-000000</span>
              <br />
              <span>hello@ayrafamilymart.com.bd</span>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Secondary nav ────────────────────────────────────────────────────────────

function CategoryNav({ categories }: { categories: ApiCategory[] }) {
  return (
    <div className="border-t border-line bg-bg/85 backdrop-blur">
      <div className="container flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
        <NavLink
          to="/products"
          end
          className={({ isActive }) =>
            cn(
              'group relative shrink-0 px-3 py-1 text-sm transition-colors',
              isActive ? 'text-saffron' : 'text-cream/65 hover:text-cream',
            )
          }
        >
          {({ isActive }) => (
            <>
              All
              {isActive && (
                <motion.span
                  layoutId="cat-underline"
                  className="absolute -bottom-0.5 left-3 right-3 h-[2px] rounded-full bg-saffron"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </>
          )}
        </NavLink>

        <NavLink
          to="/products?deals=true"
          className="group relative flex shrink-0 items-center gap-1.5 px-3 py-1 text-sm font-semibold text-coral transition hover:text-saffron"
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Deals</span>
        </NavLink>

        {categories.slice(0, 12).map((cat) => (
          <NavLink
            key={cat.id}
            to={`/products?categoryId=${cat.id}`}
            className={({ isActive }) =>
              cn(
                'group relative flex shrink-0 items-center gap-1.5 px-3 py-1 text-sm transition-colors',
                isActive ? 'text-saffron' : 'text-cream/65 hover:text-cream',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="text-sm leading-none">{getCategoryEmoji(cat.slug)}</span>
                <span>{cat.name}</span>
                {isActive && (
                  <motion.span
                    layoutId="cat-underline"
                    className="absolute -bottom-0.5 left-3 right-3 h-[2px] rounded-full bg-saffron"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="relative border-t border-line bg-bg">
      <div className="container py-16">
        {/* Massive brand line */}
        <div className="border-b border-line pb-12">
          <h2 className="display-xl select-none text-cream/90">
            Ayra<span className="text-saffron">.</span>
          </h2>
          <p className="mt-4 max-w-2xl font-display text-base italic text-cream/55 sm:text-lg">
            A family-run Bengali marketplace, brought to your screen.
          </p>
        </div>

        {/* Links + contact */}
        <div className="grid grid-cols-2 gap-6 pt-12 md:grid-cols-4 md:gap-10">
          <div>
            <h4 className="mb-5 text-[10px] uppercase tracking-[0.22em] text-cream/40">Wander</h4>
            <ul className="space-y-3">
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
                    className="group inline-flex items-center gap-1.5 text-sm text-cream/70 transition-colors hover:text-saffron"
                  >
                    {l.label}
                    <ArrowRightIcon size={11} className="opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-[10px] uppercase tracking-[0.22em] text-cream/40">Help</h4>
            <ul className="space-y-3">
              {['Help Center', 'Track Order', 'Returns', 'Privacy', 'Terms'].map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="group inline-flex items-center gap-1.5 text-sm text-cream/70 transition-colors hover:text-saffron"
                  >
                    {l}
                    <ArrowRightIcon size={11} className="opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-[10px] uppercase tracking-[0.22em] text-cream/40">Contact</h4>
            <ul className="space-y-3 text-sm text-cream/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />
                <span>Gulshan 2,<br />Dhaka 1212</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-saffron" />
                +880 1700-000000
              </li>
              <li className="flex items-center gap-2.5">
                <MailIcon className="h-4 w-4 shrink-0 text-saffron" />
                hello@ayra.bd
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-[10px] uppercase tracking-[0.22em] text-cream/40">We accept</h4>
            <div className="flex flex-wrap gap-2">
              {['SSLCommerz', 'bKash', 'Nagad', 'COD'].map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-line px-3 py-1 text-[10px] font-semibold text-cream/65"
                >
                  {p}
                </span>
              ))}
            </div>
            <div className="mt-6">
              <h4 className="mb-3 text-[10px] uppercase tracking-[0.22em] text-cream/40">Follow</h4>
              <div className="flex gap-2">
                {['F', 'I', 'X', 'Y'].map((c) => (
                  <a
                    key={c}
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-cream/65 transition hover:border-saffron hover:text-saffron"
                  >
                    {c}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line py-5">
        <div className="container flex flex-col items-center justify-between gap-2 text-xs text-cream/40 sm:flex-row">
          <span>
            © {new Date().getFullYear()} Ayra Family Mart · All rights reserved.
          </span>
          <span className="flex items-center gap-1.5">
            Made with <span className="text-coral">♥</span> in <span className="font-bangla normal-case text-cream/65">বাংলাদেশ</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

// ─── Bottom mobile tab bar ────────────────────────────────────────────────────

function BottomTabBar({ onCartClick }: { onCartClick: () => void }) {
  const { itemCount } = useCartStore();
  const count = itemCount();

  const navTabs = [
    { icon: Home,       label: 'Home',     to: '/',                       end: true  },
    { icon: LayoutGrid, label: 'Browse',   to: '/products',               end: false },
    { icon: SearchIcon, label: 'Search',   to: '/products?focus=search',  end: false },
    { icon: User,       label: 'Account',  to: '/account',                end: false },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-bg/95 backdrop-blur md:hidden">
      {navTabs.slice(0, 2).map(({ icon: Icon, label, to, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] uppercase tracking-[0.15em] transition-colors',
              isActive ? 'text-saffron' : 'text-cream/55',
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

      <button
        onClick={onCartClick}
        className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] uppercase tracking-[0.15em] text-cream/55 transition hover:text-saffron"
      >
        <div className="relative">
          <BasketIcon size={20} strokeWidth={1.5} />
          <AnimatePresence>
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-saffron font-display text-[9px] font-extrabold text-bg"
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
              'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] uppercase tracking-[0.15em] transition-colors',
              isActive ? 'text-saffron' : 'text-cream/55',
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

// ─── Main layout ──────────────────────────────────────────────────────────────

export default function CustomerLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartOpen,   setCartOpen]   = useState(false);
  const [scrolled,   setScrolled]   = useState(false);

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
    <div className="flex min-h-screen flex-col bg-bg">
      <CursorFollower />

      <AnnouncementBar />

      {/* Sticky header — glass, premium */}
      <header
        className={cn(
          'sticky top-0 z-30 transition-all duration-300',
          scrolled ? 'glass-strong' : 'bg-bg',
        )}
      >
        <div className="container flex items-center gap-4 py-4">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-cream/5 active:scale-90 md:hidden"
          >
            <Menu className="h-5 w-5 text-cream" />
          </button>

          <Logo size="sm" className="shrink-0" />

          <div className="hidden flex-1 items-center md:flex">
            <SearchBar />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <MobileSearch />
            <Link
              to="/wishlist"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-cream/70 transition hover:bg-cream/5 hover:text-cream sm:flex"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Link>
            <NotificationBell />
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
