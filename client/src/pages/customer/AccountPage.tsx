import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Package, Heart, MapPin, User, Lock,
  Plus, Star, ShoppingBag, Wallet, ChevronRight,
} from 'lucide-react';
import { cn, formatPaisa } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useMyOrders } from '@/hooks/useMyOrders';
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from '@/hooks/useAddresses';
import { AddressCard } from '@/components/address/AddressCard';
import { AddressForm } from '@/components/address/AddressForm';
import { ProductCard } from '@/components/product/ProductCard';
import { getMyProfile, updateMyProfile, changeMyPassword } from '@/services/user';
import { fetchWishlist } from '@/services/wishlist';
import { updateProfileSchema, changePasswordSchema, AddressType } from '@superstore/shared';
import type { UpdateProfileInput, ChangePasswordInput, AddressInput } from '@superstore/shared';
import type { Resolver } from 'react-hook-form';

// ─── Sections ─────────────────────────────────────────────────────────────────

type Section = 'overview' | 'orders' | 'wishlist' | 'addresses' | 'profile' | 'password';

const NAV_ITEMS: { id: Section; label: string; icon: typeof User }[] = [
  { id: 'overview',   label: 'Overview',        icon: LayoutDashboard },
  { id: 'orders',     label: 'My Orders',       icon: Package          },
  { id: 'wishlist',   label: 'Wishlist',        icon: Heart            },
  { id: 'addresses',  label: 'Addresses',       icon: MapPin           },
  { id: 'profile',    label: 'Profile',         icon: User             },
  { id: 'password',   label: 'Change Password', icon: Lock             },
];

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  PENDING:         'bg-saffron/15 text-saffron',
  CONFIRMED:       'bg-sage/15 text-sage',
  PROCESSING:      'bg-blue-500/15 text-blue-400',
  SHIPPED:         'bg-purple-500/15 text-purple-400',
  OUT_FOR_DELIVERY:'bg-teal-500/15 text-teal-400',
  DELIVERED:       'bg-sage/20 text-sage',
  CANCELLED:       'bg-coral/15 text-coral',
  REFUND_REQUESTED:'bg-orange-500/15 text-orange-400',
  REFUNDED:        'bg-cream/10 text-cream/55',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider', STATUS_COLORS[status] ?? 'bg-cream/10 text-cream/60')}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

// ─── Overview Section ─────────────────────────────────────────────────────────

function OverviewSection({ setSection }: { setSection: (s: Section) => void }) {
  const { user }    = useAuthStore();
  const wishlistIds = useWishlistStore((s) => s.ids);
  const { data: ordersData } = useMyOrders({ limit: 3 });

  const orders = ordersData?.data ?? [];
  const totalSpent = orders.reduce((sum, o) => sum + o.totalInPaisa, 0);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="rounded-2xl bg-gradient-to-r from-saffron/10 to-sage/10 px-6 py-5 ring-1 ring-saffron/20">
        <p className="text-xs uppercase tracking-[0.2em] text-cream/55">Welcome back</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-cream">{user?.name}</h2>
        <p className="text-sm text-cream/55">{user?.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Orders',   value: ordersData?.meta.pagination.total ?? orders.length, icon: Package,      color: 'text-saffron', bg: 'bg-saffron/10' },
          { label: 'Spent',    value: formatPaisa(totalSpent),                            icon: Wallet,       color: 'text-sage',    bg: 'bg-sage/10'    },
          { label: 'Wishlist', value: wishlistIds.length,                                 icon: Heart,        color: 'text-coral',   bg: 'bg-coral/10'   },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl bg-surface ring-1 ring-line p-4 text-center">
            <div className={cn('mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full', bg)}>
              <Icon className={cn('h-4 w-4', color)} />
            </div>
            <p className="font-display text-lg font-bold text-cream">{String(value)}</p>
            <p className="text-[10px] uppercase tracking-wider text-cream/45">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-sm font-bold text-cream">Recent Orders</h3>
          <button onClick={() => setSection('orders')} className="flex items-center gap-1 text-xs text-saffron hover:underline">
            See all <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface ring-1 ring-line py-10 text-center">
            <ShoppingBag className="h-10 w-10 text-cream/20" />
            <p className="text-sm text-cream/45">No orders yet</p>
            <Link to="/products" className="rounded-full bg-saffron px-4 py-2 text-xs font-bold text-bg hover:bg-saffron/90">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <Link
                key={o.id}
                to={`/orders/${o.id}`}
                className="flex items-center justify-between rounded-xl bg-surface ring-1 ring-line px-4 py-3 transition hover:ring-saffron/30"
              >
                <div>
                  <p className="font-display text-sm font-semibold text-cream">{o.orderNumber}</p>
                  <p className="text-[11px] text-cream/45">{o.items.length} item{o.items.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  <span className="font-display text-sm font-bold text-cream">{formatPaisa(o.totalInPaisa)}</span>
                  <ChevronRight className="h-4 w-4 text-cream/30" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Orders Section ───────────────────────────────────────────────────────────

function OrdersSection() {
  const [page, setPage]     = useState(1);
  const { data, isLoading } = useMyOrders({ page, limit: 8 });
  const orders = data?.data ?? [];
  const pagination = data?.meta.pagination;

  if (isLoading) {
    return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-saffron border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-display text-lg font-bold text-cream">My Orders</h3>
      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface ring-1 ring-line py-16 text-center">
          <ShoppingBag className="h-12 w-12 text-cream/20" />
          <p className="text-sm text-cream/45">No orders yet</p>
          <Link to="/products" className="rounded-full bg-saffron px-5 py-2 text-sm font-bold text-bg hover:bg-saffron/90">
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          {orders.map((o) => (
            <Link
              key={o.id}
              to={`/orders/${o.id}`}
              className="flex items-center justify-between rounded-xl bg-surface ring-1 ring-line px-4 py-4 transition hover:ring-saffron/30"
            >
              <div className="flex items-center gap-3">
                {o.items[0]?.product?.images[0]?.url ? (
                  <img src={o.items[0].product.images[0].url} alt="" className="h-12 w-12 rounded-lg object-cover bg-surface-2" />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-surface-2 flex items-center justify-center text-2xl">🛒</div>
                )}
                <div>
                  <p className="font-display text-sm font-semibold text-cream">{o.orderNumber}</p>
                  <p className="text-xs text-cream/45">{o.items.length} item{o.items.length !== 1 ? 's' : ''} · {new Date(o.createdAt).toLocaleDateString('en-BD')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={o.status} />
                <span className="font-display text-sm font-bold text-cream">{formatPaisa(o.totalInPaisa)}</span>
                <ChevronRight className="h-4 w-4 text-cream/30" />
              </div>
            </Link>
          ))}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className="rounded-full border border-line px-4 py-2 text-sm text-cream/70 hover:border-saffron hover:text-cream disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-cream/45">Page {pagination.page} of {pagination.totalPages}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                className="rounded-full border border-line px-4 py-2 text-sm text-cream/70 hover:border-saffron hover:text-cream disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Wishlist Section ─────────────────────────────────────────────────────────

function WishlistSection() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn:  fetchWishlist,
    staleTime: 60_000,
  });
  const wishlistIds = useWishlistStore((s) => s.ids);

  const displayItems = items.length > 0 ? items : [];

  if (isLoading) {
    return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-saffron border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-cream">Wishlist</h3>
        <span className="text-sm text-cream/45">{wishlistIds.length} item{wishlistIds.length !== 1 ? 's' : ''}</span>
      </div>
      {displayItems.length === 0 && wishlistIds.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface ring-1 ring-line py-16 text-center">
          <Heart className="h-12 w-12 text-cream/20" />
          <p className="text-sm text-cream/45">Your wishlist is empty</p>
          <Link to="/products" className="rounded-full bg-saffron px-5 py-2 text-sm font-bold text-bg hover:bg-saffron/90">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {displayItems.map((item) => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Addresses Section ────────────────────────────────────────────────────────

function AddressesSection() {
  const [editing, setEditing]   = useState<string | null>(null); // address id or 'new'
  const { data: addresses = [] } = useAddresses();
  const createMut   = useCreateAddress();
  const updateMut   = useUpdateAddress();
  const deleteMut   = useDeleteAddress();
  const defaultMut  = useSetDefaultAddress();

  const editingAddress = addresses.find((a) => a.id === editing);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-cream">Addresses</h3>
        <button
          onClick={() => setEditing('new')}
          disabled={addresses.length >= 5}
          className="flex items-center gap-1.5 rounded-full bg-saffron px-4 py-2 text-sm font-bold text-bg hover:bg-saffron/90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Add {addresses.length >= 5 ? '(max 5)' : ''}
        </button>
      </div>

      {addresses.length === 0 && editing !== 'new' ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface ring-1 ring-line py-12 text-center">
          <MapPin className="h-10 w-10 text-cream/20" />
          <p className="text-sm text-cream/45">No saved addresses</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((addr) => (
            editing === addr.id ? (
              <div key={addr.id} className="rounded-2xl ring-1 ring-saffron/40 bg-surface p-4 col-span-full">
                <h4 className="mb-3 font-display text-sm font-bold text-cream">Edit Address</h4>
                <AddressForm
                  defaultValues={{
                    ...addr,
                    type:        addr.type as unknown as AddressType,
                    addressLine2: addr.addressLine2 ?? undefined,
                    postalCode:   addr.postalCode   ?? undefined,
                  }}
                  submitting={updateMut.isPending}
                  onCancel={() => setEditing(null)}
                  submitLabel="Save changes"
                  onSubmit={async (values) => {
                    await updateMut.mutateAsync({ id: addr.id, input: values });
                    setEditing(null);
                    toast.success('Address updated');
                  }}
                />
              </div>
            ) : (
              <AddressCard
                key={addr.id}
                address={addr}
                onEdit={() => setEditing(addr.id)}
                onDelete={() => { deleteMut.mutate(addr.id); toast.success('Address deleted'); }}
              />
            )
          ))}
        </div>
      )}

      {editing === 'new' && (
        <div className="rounded-2xl ring-1 ring-saffron/40 bg-surface p-4">
          <h4 className="mb-3 font-display text-sm font-bold text-cream">New Address</h4>
          <AddressForm
            submitting={createMut.isPending}
            onCancel={() => setEditing(null)}
            submitLabel="Add address"
            onSubmit={async (values) => {
              await createMut.mutateAsync(values as AddressInput);
              setEditing(null);
              toast.success('Address added');
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Profile Section ──────────────────────────────────────────────────────────

function ProfileSection() {
  const { user, updateUser } = useAuthStore();
  const qc = useQueryClient();

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<UpdateProfileInput>({
      resolver: zodResolver(updateProfileSchema) as Resolver<UpdateProfileInput>,
      defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' },
    });

  async function onSubmit(data: UpdateProfileInput) {
    try {
      const updated = await updateMyProfile(data);
      updateUser({ name: updated.name, phone: updated.phone ?? undefined });
      qc.invalidateQueries({ queryKey: ['my-profile'] });
      toast.success('Profile updated');
    } catch {
      // toast already shown by service
    }
  }

  return (
    <div className="max-w-md space-y-5">
      <h3 className="font-display text-lg font-bold text-cream">Profile</h3>

      <div className="rounded-2xl bg-surface ring-1 ring-line p-6 space-y-4">
        {/* Avatar placeholder */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-saffron font-display text-2xl font-extrabold text-bg">
            {user?.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
          </div>
          <div>
            <p className="font-display font-bold text-cream">{user?.name}</p>
            <p className="text-sm text-cream/55">{user?.email}</p>
            {user?.isEmailVerified && (
              <span className="inline-flex items-center gap-1 text-[10px] text-sage">
                <Star className="h-3 w-3" /> Verified
              </span>
            )}
          </div>
        </div>

        <div className="h-px bg-line" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-cream/55">Name</label>
            <input
              {...register('name')}
              className="w-full rounded-xl bg-surface-2 px-4 py-2.5 text-sm text-cream ring-1 ring-line focus:outline-none focus:ring-saffron"
              placeholder="Your name"
            />
            {errors.name && <p className="mt-1 text-xs text-coral">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-cream/55">Phone</label>
            <input
              {...register('phone')}
              className="w-full rounded-xl bg-surface-2 px-4 py-2.5 text-sm text-cream ring-1 ring-line focus:outline-none focus:ring-saffron"
              placeholder="01XXXXXXXXX"
            />
            {errors.phone && <p className="mt-1 text-xs text-coral">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.15em] text-cream/55">Email</label>
            <input
              value={user?.email ?? ''}
              disabled
              className="w-full rounded-xl bg-surface-2 px-4 py-2.5 text-sm text-cream/40 ring-1 ring-line cursor-not-allowed"
            />
            <p className="mt-1 text-[10px] text-cream/35">Email cannot be changed</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-saffron py-2.5 text-sm font-bold text-bg transition hover:bg-saffron/90 disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Change Password Section ──────────────────────────────────────────────────

function ChangePasswordSection() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<ChangePasswordInput>({
      resolver: zodResolver(changePasswordSchema) as Resolver<ChangePasswordInput>,
    });

  async function onSubmit(data: ChangePasswordInput) {
    try {
      await changeMyPassword(data);
      toast.success('Password changed. Please log in again.');
      reset();
    } catch {
      // toast already shown by service
    }
  }

  return (
    <div className="max-w-md space-y-5">
      <h3 className="font-display text-lg font-bold text-cream">Change Password</h3>

      <div className="rounded-2xl bg-surface ring-1 ring-line p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: 'currentPassword'     as const, label: 'Current Password'  },
            { name: 'newPassword'         as const, label: 'New Password'       },
            { name: 'confirmNewPassword'  as const, label: 'Confirm New Password' },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-cream/55">{label}</label>
              <input
                type="password"
                {...register(name)}
                className="w-full rounded-xl bg-surface-2 px-4 py-2.5 text-sm text-cream ring-1 ring-line focus:outline-none focus:ring-saffron"
              />
              {errors[name] && <p className="mt-1 text-xs text-coral">{errors[name]?.message}</p>}
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-coral py-2.5 text-sm font-bold text-bg transition hover:bg-coral/90 disabled:opacity-60"
          >
            {isSubmitting ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const [activeSection, setActiveSection] = useState<Section>('overview');

  function renderSection() {
    switch (activeSection) {
      case 'overview':  return <OverviewSection setSection={setActiveSection} />;
      case 'orders':    return <OrdersSection />;
      case 'wishlist':  return <WishlistSection />;
      case 'addresses': return <AddressesSection />;
      case 'profile':   return <ProfileSection />;
      case 'password':  return <ChangePasswordSection />;
    }
  }

  return (
    <div className="container py-8">
      <div className="flex gap-8">
        {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-24 space-y-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition',
                  activeSection === id
                    ? 'bg-saffron/15 font-semibold text-saffron'
                    : 'text-cream/65 hover:bg-cream/5 hover:text-cream',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <main className="min-w-0 flex-1">
          {/* Mobile tab bar */}
          <div className="mb-6 flex gap-1 overflow-x-auto scrollbar-hide rounded-2xl bg-surface ring-1 ring-line p-1 lg:hidden">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  'flex shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] uppercase tracking-wider transition',
                  activeSection === id
                    ? 'bg-saffron/15 text-saffron font-semibold'
                    : 'text-cream/55 hover:text-cream',
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="whitespace-nowrap">{label.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {renderSection()}
        </main>
      </div>
    </div>
  );
}
