import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import {
  ShoppingBag, TrendingUp, Users, BarChart2,
  AlertTriangle, Package, RefreshCw,
} from 'lucide-react';
import { useAdminStats } from '@/hooks/useAdminStats';
import { formatPaisa, cn } from '@/lib/utils';
import type { ApiDashboardMetrics, ApiOrderStatus } from '@/types/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Period = 'today' | 'thisWeek' | 'thisMonth' | 'allTime';

const PERIODS: { label: string; value: Period }[] = [
  { label: 'Today',      value: 'today'     },
  { label: 'This Week',  value: 'thisWeek'  },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'All Time',   value: 'allTime'   },
];

const STATUS_TONE: Record<ApiOrderStatus, string> = {
  PENDING:          'bg-amber-500/15 text-amber-500',
  CONFIRMED:        'bg-sky-500/15 text-sky-500',
  PROCESSING:       'bg-indigo-500/15 text-indigo-500',
  SHIPPED:          'bg-violet-500/15 text-violet-500',
  OUT_FOR_DELIVERY: 'bg-blue-500/15 text-blue-500',
  DELIVERED:        'bg-emerald-500/15 text-emerald-500',
  CANCELLED:        'bg-rose-500/15 text-rose-500',
  REFUND_REQUESTED: 'bg-orange-500/15 text-orange-500',
  REFUNDED:         'bg-zinc-500/15 text-zinc-500',
};

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  title, value, sub, icon: Icon, accent,
}: {
  title: string;
  value: string;
  sub:   string;
  icon:  React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', accent)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

// ─── Revenue tooltip ─────────────────────────────────────────────────────────

function RevenueTooltip({ active, payload, label }: {
  active?: boolean; payload?: { value: number }[]; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">{label}</p>
      <p className="mt-0.5 text-muted-foreground">
        Revenue: <span className="font-semibold text-foreground">
          {formatPaisa(payload[0]?.value ?? 0)}
        </span>
      </p>
    </div>
  );
}

// ─── DashboardPage ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('today');
  const { data: stats, isLoading, isFetching, refetch } = useAdminStats();

  const metrics: ApiDashboardMetrics = stats?.metrics[period] ?? {
    orders: 0, revenueInPaisa: 0, newCustomers: 0, avgOrderInPaisa: 0,
  };

  // Format chart data
  const chartData = (stats?.revenueByDay ?? []).map((d) => ({
    date:           format(new Date(d.date), 'MMM dd'),
    revenueInPaisa: d.revenueInPaisa,
    revenueTaka:    Math.round(d.revenueInPaisa / 100),
    orders:         d.orders,
  }));

  const statusData = (stats?.orderStatusBreakdown ?? []).map((s) => ({
    status: s.status.replace('_', ' '),
    count:  s.count,
  }));

  return (
    <div className="space-y-6 px-1">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Store overview{' '}
            <span className="text-xs">
              {isFetching && !isLoading && '· refreshing…'}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period tabs */}
          <div className="flex overflow-x-auto scrollbar-hide items-center gap-1 rounded-xl border border-border bg-card p-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPeriod(p.value)}
                className={cn(
                  'shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                  period === p.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            title="Refresh"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            title="Orders"
            value={metrics.orders.toLocaleString()}
            sub="placed in period"
            icon={ShoppingBag}
            accent="bg-primary/10 text-primary"
          />
          <StatCard
            title="Revenue"
            value={formatPaisa(metrics.revenueInPaisa)}
            sub="gross sales"
            icon={TrendingUp}
            accent="bg-emerald-500/10 text-emerald-500"
          />
          <StatCard
            title="New Customers"
            value={metrics.newCustomers.toLocaleString()}
            sub="registered in period"
            icon={Users}
            accent="bg-violet-500/10 text-violet-500"
          />
          <StatCard
            title="Avg Order"
            value={formatPaisa(metrics.avgOrderInPaisa)}
            sub="average order value"
            icon={BarChart2}
            accent="bg-amber-500/10 text-amber-500"
          />
        </div>
      )}

      {/* Revenue chart */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Revenue — last 30 days</h2>
        {isLoading ? (
          <div className="mt-4 h-52 animate-pulse rounded-xl bg-muted" />
        ) : (
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-primary)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `৳${(v / 100).toFixed(0)}`}
                  width={52}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenueInPaisa"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent orders + Low stock */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="mt-4 space-y-2">
              {[0, 1, 2].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />)}
            </div>
          ) : stats?.recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {stats?.recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="font-mono text-xs font-semibold text-foreground hover:text-primary"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="text-[10px] text-muted-foreground">
                      {(order as { user?: { name: string } }).user?.name ?? '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      STATUS_TONE[order.status],
                    )}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {formatPaisa(order.totalInPaisa)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Low stock */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-foreground">Low Stock Alerts</h2>
          </div>
          {isLoading ? (
            <div className="mt-4 space-y-2">
              {[0, 1, 2].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />)}
            </div>
          ) : (stats?.lowStockProducts.length ?? 0) === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">All products are well-stocked.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {stats?.lowStockProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-foreground">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.sku}</p>
                    </div>
                  </div>
                  <span className={cn(
                    'text-xs font-semibold',
                    p.stockQuantity === 0 ? 'text-rose-500' : 'text-amber-500',
                  )}>
                    {p.stockQuantity === 0 ? 'Out of stock' : `${p.stockQuantity} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Status breakdown + Top sellers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Status breakdown */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-3">
          <h2 className="text-sm font-semibold text-foreground">Order Status Breakdown</h2>
          {isLoading ? (
            <div className="mt-4 h-40 animate-pulse rounded-xl bg-muted" />
          ) : statusData.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="mt-4 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statusData}
                  layout="vertical"
                  margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="status"
                    tick={{ fontSize: 9, fill: 'var(--color-muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                    width={90}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--color-muted)', opacity: 0.3 }}
                    contentStyle={{
                      background: 'var(--color-card)',
                      border:     '1px solid var(--color-border)',
                      borderRadius: '8px',
                      fontSize:   '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top selling products */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground">Top Sellers (this month)</h2>
          {isLoading ? (
            <div className="mt-4 space-y-2">
              {[0, 1, 2].map((i) => <div key={i} className="h-8 animate-pulse rounded-lg bg-muted" />)}
            </div>
          ) : (stats?.topSellingProducts.length ?? 0) === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No sales this month.</p>
          ) : (
            <ol className="mt-3 space-y-2">
              {stats?.topSellingProducts.map((p, i) => (
                <li key={p.productId} className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">{p.productName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {p.qtySold} sold · {formatPaisa(p.revenueInPaisa)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
