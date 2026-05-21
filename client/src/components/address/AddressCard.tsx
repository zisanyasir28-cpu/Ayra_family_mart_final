import { Home, Briefcase, MapPin, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApiAddress } from '@/types/api';

interface AddressCardProps {
  address:    ApiAddress;
  selected?:  boolean;
  selectable?: boolean;
  onSelect?:   () => void;
  onEdit?:     () => void;
  onDelete?:   () => void;
}

const TYPE_ICON = {
  HOME:   Home,
  OFFICE: Briefcase,
  OTHER:  MapPin,
};

export function AddressCard({
  address, selected, selectable, onSelect, onEdit, onDelete,
}: AddressCardProps) {
  const Icon = TYPE_ICON[address.type] ?? MapPin;

  return (
    <div
      role={selectable ? 'button' : undefined}
      tabIndex={selectable ? 0 : undefined}
      onClick={selectable ? onSelect : undefined}
      onKeyDown={selectable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect?.();
      } : undefined}
      className={cn(
        'relative rounded-2xl border bg-surface/60 backdrop-blur-sm p-4 transition-all',
        selectable && 'cursor-pointer',
        selected
          ? 'border-saffron bg-saffron/[0.06] shadow-[0_0_20px_-6px_hsl(var(--saffron)/0.35)]'
          : 'border-line/50 hover:border-saffron/40',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-saffron/10 text-saffron">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-cream">{address.label}</span>
              {address.isDefault && (
                <span className="rounded-full bg-saffron/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-saffron">
                  Default
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-cream">{address.fullName}</p>
            <p className="text-sm text-cream/55">{address.phone}</p>
            <p className="mt-1 text-sm text-cream/55">
              {address.addressLine1}
              {address.addressLine2 ? `, ${address.addressLine2}` : ''}, {address.thana}, {address.district}
              {address.postalCode ? ` ${address.postalCode}` : ''}
            </p>
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex shrink-0 items-center gap-1">
            {onEdit && (
              <button
                type="button"
                aria-label="Edit address"
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="rounded-lg p-1.5 text-cream/40 transition-colors hover:bg-saffron/10 hover:text-saffron"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                aria-label="Delete address"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="rounded-lg p-1.5 text-cream/40 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
