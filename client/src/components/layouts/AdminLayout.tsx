import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Users,
  Ticket,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
  PanelLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@superstore/shared';

// ─── Navigation items ─────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',  to: '/admin',            end: true  },
  { icon: Package,         label: 'Products',   to: '/admin/products',   end: false },
  { icon: Tag,             label: 'Categories', to: '/admin/categories', end: false },
  { icon: ShoppingCart,    label: 'Orders',     to: '/admin/orders',     end: false },
  { icon: Users,           label: 'Customers',  to: '/admin/customers',  end: false },
  { icon: Ticket,          label: 'Coupons',    to: '/admin/coupons',    end: false },
  { icon: Megaphone,       label: 'Campaigns',  to: '/admin/campaigns',  end: false },
  { icon: Settings,        label: 'Settings',   to: '/admin/settings',   end: false },
] as const;

// ─── Nav item component ───────────────────────────────────────────────────────

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  end: boolean;
  collapsed: boolean;
  onClick?: () => void;
}

function NavItem({ icon: Icon, label, to, end, collapsed, onClick }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
          isActive
            ? 'border-l-[3px] border-primary bg-primary/10 pl-[9px] text-primary'
            : 'border-l-[3px] border-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
        )
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tooltip when collapsed */}
      {collapsed && (
        <div className="pointer-events-none absolute left-full z-50 ml-2 hidden rounded-md bg-foreground px-2 py-1 text-xs text-background group-hover:block">
          {label}
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
        </div>
      )}
    </NavLink>
  );
}

// ─── Role badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string | undefined }) {
  const map: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-700',
    ADMIN:       'bg-blue-100 text-blue-700',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        map[role ?? ''] ?? 'bg-muted text-muted-foreground',
      )}
    >
      {role?.replace('_', ' ') ?? 'Staff'}
    </span>
  );
}

// ─── User avatar ──────────────────────────────────────────────────────────────

function UserAvatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary',
        size === 'sm' ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm',
      )}
    >
      {initials}
    </div>
  );
}

// ─── Sidebar content (shared between desktop and mobile) ──────────────────────

interface SidebarContentProps {
  collapsed: boolean;
  onNavClick?: () => void;
  onToggleCollapse?: () => void;
  showCollapseButton?: boolean;
}

function SidebarContent({
  collapsed,
  onNavClick,
  onToggleCollapse,
  showCollapseButton = true,
}: SidebarContentProps) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate('/login', { replace: true });
  }

  return (
    <>
      {/* Logo + collapse button */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <Link to="/admin" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Package className="h-4 w-4" />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-bold text-foreground">Ayra Admin</p>
                  <p className="text-[10px] text-muted-foreground">Family Mart</p>
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {collapsed && (
          <Link to="/admin" className="mx-auto flex items-center justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Package className="h-4 w-4" />
            </div>
          </Link>
        )}

        {showCollapseButton && (
          <button
            onClick={onToggleCollapse}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeft
              className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
            />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              collapsed={collapsed}
              onClick={onNavClick}
            />
          ))}
        </div>
      </nav>

      {/* Bottom: user info + logout */}
      <div className="shrink-0 border-t border-border p-3">
        {!collapsed && (
          <div className="mb-2 flex items-center gap-2 rounded-lg p-1">
            <UserAvatar name={user?.name ?? 'A'} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.name ?? 'Admin'}
              </p>
              <RoleBadge role={user?.role} />
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mb-2 flex justify-center">
            <UserAvatar name={user?.name ?? 'A'} />
          </div>
        )}

        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50',
            collapsed && 'justify-center px-2',
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );
}

// ─── Mobile sidebar drawer ────────────────────────────────────────────────────

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col bg-card shadow-2xl md:hidden"
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-4 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent
              collapsed={false}
              onNavClick={onClose}
              showCollapseButton={false}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.replace('/admin', '').split('/').filter(Boolean);
  const crumbs: { label: string; to: string }[] = [
    { label: 'Admin', to: '/admin' },
  ];
  let current = '/admin';
  for (const seg of segments) {
    current += `/${seg}`;
    const label = seg.charAt(0).toUpperCase() + seg.slice(1);
    crumbs.push({ label, to: current });
  }
  return crumbs;
}

// ─── Header ───────────────────────────────────────────────────────────────────

interface HeaderProps {
  onMenuClick: () => void;
}

function AdminHeader({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const { user } = useAuthStore();
  const crumbs = buildBreadcrumbs(location.pathname);
  const pageTitle = crumbs[crumbs.length - 1]?.label ?? 'Admin';

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4 sm:gap-4 sm:px-6">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumb + title */}
      <div className="flex flex-col justify-center">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          {crumbs.slice(0, -1).map((crumb, i) => (
            <span key={crumb.to} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              <Link
                to={crumb.to}
                className="transition hover:text-foreground"
              >
                {crumb.label}
              </Link>
            </span>
          ))}
          {crumbs.length > 1 && <ChevronRight className="h-3 w-3" />}
        </nav>
        <h1 className="text-base font-semibold leading-tight text-foreground">
          {pageTitle}
        </h1>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        {/* Notification bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground">
          <Bell className="h-5 w-5" />
          {/* Notification dot */}
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Avatar */}
        <UserAvatar name={user?.name ?? 'A'} size="md" />
      </div>
    </header>
  );
}

// ─── AdminLayout ──────────────────────────────────────────────────────────────

export default function AdminLayout() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('admin-sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  // Persist collapse state
  useEffect(() => {
    try {
      localStorage.setItem('admin-sidebar-collapsed', String(collapsed));
    } catch {
      // ignore
    }
  }, [collapsed]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin =
    user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden shrink-0 flex-col overflow-hidden border-r border-border bg-card md:flex"
      >
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      </motion.aside>

      {/* ── Mobile drawer ───────────────────────────────────────────────────── */}
      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* ── Main content area ────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
