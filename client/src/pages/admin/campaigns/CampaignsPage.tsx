import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Megaphone, AlertTriangle, X, ChevronRight, ChevronLeft, Trash2, Pencil, Square as StopSquare, TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, formatPaisa } from '@/lib/utils';
import {
  fetchAdminCampaigns,
  createCampaign,
  endCampaign,
  deleteCampaign,
} from '@/services/adminCampaigns';
import { fetchCategories } from '@/services/categories';
import { previewBulkPriceUpdate, applyBulkPriceUpdate } from '@/services/adminBulkPrice';
import type { ApiCampaign, ApiCampaignTimeStatus, ApiBulkPricePreview, ApiDiscountType } from '@/types/api';
import type { CreateCampaignInput, BulkPriceUpdateInput } from '@superstore/shared';
import { DiscountType } from '@superstore/shared';

// ─── Tiny UI ─────────────────────────────────────────────────────────────────

function Spinner({ className }: { className?: string }) {
  return <div className={cn('h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary', className)} />;
}

function TimeStatusBadge({ status }: { status: ApiCampaignTimeStatus }) {
  const map: Record<ApiCampaignTimeStatus, string> = {
    active:   'bg-green-100 text-green-700',
    upcoming: 'bg-blue-100 text-blue-700',
    ended:    'bg-gray-100 text-gray-600',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', map[status])}>
      {status}
    </span>
  );
}

function DiscountBadge({ type, value }: { type: ApiDiscountType; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-saffron/10 px-2 py-0.5 text-xs font-semibold text-saffron">
      {type === 'PERCENTAGE' ? `${value}% off` : `${formatPaisa(value)} off`}
    </span>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<ApiCampaignTimeStatus>('active');
  const [showWizard, setShowWizard] = useState(false);
  const [showBulkPrice, setShowBulkPrice] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'campaigns', tab],
    queryFn:  () => fetchAdminCampaigns({ status: tab }),
  });

  const endMut = useMutation({
    mutationFn: endCampaign,
    onSuccess:  () => {
      toast.success('Campaign ended');
      qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
    },
    onError: () => { /* demo toast already fired */ },
  });

  const deleteMut = useMutation({
    mutationFn: deleteCampaign,
    onSuccess:  () => {
      toast.success('Campaign deleted');
      qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
    },
    onError: () => { /* demo toast already fired */ },
  });

  const campaigns = data?.data ?? [];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Campaigns</h1>
          <p className="text-sm text-muted-foreground">Time-bound product discounts and flash sales.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowBulkPrice(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <TrendingUp className="h-4 w-4" /> Bulk price update
          </button>
          <button
            type="button"
            onClick={() => setShowWizard(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> New campaign
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {(['active', 'upcoming', 'ended'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 text-sm font-semibold capitalize transition',
              tab === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-12 text-center text-muted-foreground">
          <Megaphone className="mx-auto mb-2 h-8 w-8 opacity-30" />
          No {tab} campaigns.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {campaigns.map((c) => (
            <CampaignCard
              key={c.id}
              campaign={c}
              onEnd={() => endMut.mutate(c.id)}
              onDelete={() => deleteMut.mutate(c.id)}
              pending={endMut.isPending || deleteMut.isPending}
            />
          ))}
        </div>
      )}

      {/* Wizard */}
      {showWizard && (
        <NewCampaignWizard
          onClose={() => setShowWizard(false)}
          onCreated={() => {
            setShowWizard(false);
            qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
          }}
        />
      )}

      {/* Bulk price modal */}
      {showBulkPrice && <BulkPriceModal onClose={() => setShowBulkPrice(false)} />}
    </div>
  );
}

// ─── Campaign card ───────────────────────────────────────────────────────────

interface CampaignCardProps {
  campaign: ApiCampaign;
  onEnd:    () => void;
  onDelete: () => void;
  pending:  boolean;
}

function CampaignCard({ campaign: c, onEnd, onDelete, pending }: CampaignCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {c.bannerUrl && (
        <img src={c.bannerUrl} alt="" className="h-32 w-full object-cover" />
      )}
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-bold leading-tight">{c.name}</h3>
            {c.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{c.description}</p>}
          </div>
          <TimeStatusBadge status={c.timeStatus} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DiscountBadge type={c.discountType} value={c.discountValue} />
          <span className="text-xs text-muted-foreground">· {c.productCount} products</span>
        </div>

        <div className="text-xs text-muted-foreground">
          {new Date(c.startsAt).toLocaleDateString()}
          {' → '}
          {c.endsAt ? new Date(c.endsAt).toLocaleDateString() : 'no end'}
        </div>

        {c.timeStatus === 'ended' && c.totalDiscountGivenInPaisa > 0 && (
          <div className="rounded-md bg-muted/50 px-2 py-1 text-xs">
            Total discount given: <span className="font-semibold">{formatPaisa(c.totalDiscountGivenInPaisa)}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          {c.timeStatus === 'active' && (
            <button
              type="button"
              onClick={onEnd}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-60"
            >
              <StopSquare className="h-3 w-3" /> End now
            </button>
          )}
          {c.timeStatus === 'upcoming' && (
            <>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                onClick={() => toast('Edit coming soon — only product set can change once started.', { icon: 'ℹ️' })}
              >
                <Pencil className="h-3 w-3" /> Edit
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── New Campaign Wizard ──────────────────────────────────────────────────────

type ScopeKind = 'category' | 'products';

interface WizardProps {
  onClose:   () => void;
  onCreated: () => void;
}

function NewCampaignWizard({ onClose, onCreated }: WizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const tomorrow = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0); return d;
  }, []);
  const nextWeek = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(23, 59, 0, 0); return d;
  }, []);

  // Step 1 state
  const [name,          setName]          = useState('');
  const [description,   setDescription]   = useState('');
  const [bannerUrl,     setBannerUrl]     = useState('');
  const [discountType,  setDiscountType]  = useState<ApiDiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [startsAt,      setStartsAt]      = useState<Date>(tomorrow);
  const [endsAt,        setEndsAt]        = useState<Date>(nextWeek);

  // Step 2 state
  const [scopeKind, setScopeKind] = useState<ScopeKind>('category');
  const [categoryId, setCategoryId] = useState<string>('');
  const [productIds, setProductIds] = useState<string[]>([]);

  const { data: categories } = useQuery({
    queryKey: ['categories', 'tree'],
    queryFn:  fetchCategories,
  });

  const createMut = useMutation({
    mutationFn: createCampaign,
    onSuccess:  () => {
      toast.success('Campaign created');
      onCreated();
    },
    onError: () => { /* demo toast already fired */ },
  });

  function canAdvance(): boolean {
    if (step === 1) return name.trim().length >= 2 && discountValue > 0;
    if (step === 2) return scopeKind === 'category' ? !!categoryId : productIds.length > 0;
    return true;
  }

  function handleSubmit() {
    const input: CreateCampaignInput = {
      name:          name.trim(),
      description:   description.trim() || undefined,
      bannerUrl:     bannerUrl.trim() || undefined,
      discountType:  discountType as unknown as DiscountType,
      discountValue,
      startsAt,
      endsAt,
      scope:         scopeKind === 'category'
        ? { kind: 'category', categoryId }
        : { kind: 'products', productIds },
    };
    createMut.mutate(input);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-card shadow-xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-bold">New campaign</h2>
            <p className="text-xs text-muted-foreground">Step {step} of 3 — {step === 1 ? 'Config' : step === 2 ? 'Scope' : 'Preview'}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step progress */}
        <div className="flex h-1 bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-4">
              <Field label="Name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Eid Mubarak Special"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </Field>
              <Field label="Description (optional)">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </Field>
              <Field label="Banner URL (optional)">
                <input
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://…"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Discount type">
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as ApiDiscountType)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed (paisa)</option>
                  </select>
                </Field>
                <Field label="Value">
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Starts at">
                  <input
                    type="datetime-local"
                    value={toDatetimeLocal(startsAt)}
                    onChange={(e) => setStartsAt(new Date(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </Field>
                <Field label="Ends at">
                  <input
                    type="datetime-local"
                    value={toDatetimeLocal(endsAt)}
                    onChange={(e) => setEndsAt(new Date(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Which products will this campaign apply to?</p>

              <div className="grid gap-3 sm:grid-cols-2">
                <ScopeRadio
                  checked={scopeKind === 'category'}
                  onClick={() => setScopeKind('category')}
                  title="Entire category"
                  description="Every product currently in the selected category."
                />
                <ScopeRadio
                  checked={scopeKind === 'products'}
                  onClick={() => setScopeKind('products')}
                  title="Specific products"
                  description="Hand-pick the products to include."
                />
              </div>

              {scopeKind === 'category' && (
                <Field label="Category">
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="">— Pick a category —</option>
                    {(categories ?? []).map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </Field>
              )}

              {scopeKind === 'products' && (
                <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
                  Product picker comes in the next iteration.{' '}
                  <button
                    type="button"
                    onClick={() => setProductIds(['demo-pid-1', 'demo-pid-2', 'demo-pid-3'])}
                    className="font-semibold text-primary underline"
                  >
                    Stub 3 demo products
                  </button>
                  {productIds.length > 0 && (
                    <div className="mt-2 text-xs">{productIds.length} products selected</div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <WizardPreview
              name={name}
              discountType={discountType}
              discountValue={discountValue}
              startsAt={startsAt}
              endsAt={endsAt}
              scopeKind={scopeKind}
              categoryId={categoryId}
              productCount={
                scopeKind === 'category'
                  ? (categories?.find((c) => c.id === categoryId) ? '~entire category' : '0')
                  : String(productIds.length)
              }
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 px-6 py-3">
          <button
            type="button"
            onClick={step === 1 ? onClose : () => setStep((s) => (s - 1) as 1 | 2 | 3)}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          {step < 3 ? (
            <button
              type="button"
              disabled={!canAdvance()}
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createMut.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {createMut.isPending && <Spinner className="!border-primary-foreground/30 !border-t-primary-foreground" />}
              Launch campaign
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function ScopeRadio({ checked, onClick, title, description }: { checked: boolean; onClick: () => void; title: string; description: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg border-2 p-3 text-left transition',
        checked ? 'border-primary bg-primary/5' : 'border-border bg-background hover:bg-muted/50',
      )}
    >
      <div className="font-semibold text-sm">{title}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>
    </button>
  );
}

interface PreviewProps {
  name:          string;
  discountType:  ApiDiscountType;
  discountValue: number;
  startsAt:      Date;
  endsAt:        Date;
  scopeKind:     ScopeKind;
  categoryId:    string;
  productCount:  string;
}

function WizardPreview(p: PreviewProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/40 p-4">
        <h3 className="font-display text-base font-bold">{p.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {p.discountType === 'PERCENTAGE' ? `${p.discountValue}% off` : `${formatPaisa(p.discountValue)} off`}
          {' · '}
          {p.scopeKind === 'category' ? 'entire category' : `${productCountLabel(p.productCount)} hand-picked products`}
        </p>
      </div>
      <dl className="space-y-2 text-sm">
        <Row label="Window">
          {p.startsAt.toLocaleString()} → {p.endsAt.toLocaleString()}
        </Row>
        <Row label="Products affected">{p.productCount}</Row>
      </dl>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
        Customers will see discounted prices on the storefront once the start time passes.
      </div>
    </div>
  );
}

function productCountLabel(s: string): string {
  return s.replace('~', '');
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-border/60 pb-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}

// ─── Bulk Price modal ─────────────────────────────────────────────────────────

function BulkPriceModal({ onClose }: { onClose: () => void }) {
  const [scope,       setScope]       = useState<BulkPriceUpdateInput['type']>('all_active');
  const [categoryId,  setCategoryId]  = useState<string>('');
  const [changeType,  setChangeType]  = useState<BulkPriceUpdateInput['changeType']>('percentage');
  const [changeValue, setChangeValue] = useState<number>(-10);
  const [preview,     setPreview]     = useState<ApiBulkPricePreview | null>(null);

  const { data: categories } = useQuery({ queryKey: ['categories', 'tree'], queryFn: fetchCategories });

  const previewMut = useMutation({
    mutationFn: () => previewBulkPriceUpdate(buildInput()),
    onSuccess:  (data) => setPreview(data),
    onError:    (e: Error) => toast.error(e.message || 'Preview failed'),
  });

  const applyMut = useMutation({
    mutationFn: () => applyBulkPriceUpdate(buildInput()),
    onSuccess:  (data) => {
      toast.success(`Updated ${data.affectedCount} products`);
      onClose();
    },
    onError: () => { /* demo toast already fired */ },
  });

  function buildInput(): BulkPriceUpdateInput {
    return {
      type:        scope,
      categoryId:  scope === 'by_category' ? categoryId : undefined,
      ids:         undefined,
      changeType,
      changeValue,
    };
  }

  const canPreview = scope !== 'by_category' || !!categoryId;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-card shadow-xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-lg font-bold">Bulk price update</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <Field label="Scope">
            <select
              value={scope}
              onChange={(e) => { setScope(e.target.value as BulkPriceUpdateInput['type']); setPreview(null); }}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="all_active">All active products</option>
              <option value="by_category">By category</option>
            </select>
          </Field>

          {scope === 'by_category' && (
            <Field label="Category">
              <select
                value={categoryId}
                onChange={(e) => { setCategoryId(e.target.value); setPreview(null); }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">— Pick a category —</option>
                {(categories ?? []).map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </Field>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Change type">
              <select
                value={changeType}
                onChange={(e) => { setChangeType(e.target.value as BulkPriceUpdateInput['changeType']); setPreview(null); }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (BDT)</option>
              </select>
            </Field>
            <Field label="Value (negative to discount)">
              <input
                type="number"
                value={changeValue}
                onChange={(e) => { setChangeValue(Number(e.target.value)); setPreview(null); }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </Field>
          </div>

          {preview && (
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-sm font-semibold">{preview.affectedCount} products will be updated</p>
              <ul className="mt-2 space-y-1 text-xs">
                {preview.sampleProducts.map((s) => (
                  <li key={s.id} className="flex justify-between">
                    <span className="truncate">{s.name}</span>
                    <span className="text-muted-foreground">
                      {formatPaisa(s.oldPriceInPaisa)} → <span className="font-semibold text-foreground">{formatPaisa(s.newPriceInPaisa)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border bg-muted/30 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </button>
          {!preview ? (
            <button
              type="button"
              onClick={() => previewMut.mutate()}
              disabled={!canPreview || previewMut.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {previewMut.isPending && <Spinner className="!border-primary-foreground/30 !border-t-primary-foreground" />}
              Preview
            </button>
          ) : (
            <button
              type="button"
              onClick={() => applyMut.mutate()}
              disabled={applyMut.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {applyMut.isPending && <Spinner className="!border-white/30 !border-t-white" />}
              Apply to {preview.affectedCount}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
