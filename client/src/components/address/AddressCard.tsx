import { Pencil, Trash2, Check, MapPin, Home, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApiAddress } from '@/types/api';

interface AddressCardProps {
  address: ApiAddress;
  selected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TYPE_ICONS = {
  HOME:   Home,
  OFFICE: Briefcase,
  OTHER:  MapPin,
};

export function AddressCard({
  address,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: AddressCardProps) {
  const Icon = TYPE_ICONS[address.type];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'group relative flex w-full flex-col rounded-2xl border-2 p-5 text-left transition-all',
        selected
          ? 'border-saffron bg-saffron/[0.06]'
          : 'border-line bg-surface hover:border-saffron/40',
      )}
    >
      {/* Top row: type icon + label + default badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-cream">
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2/60',
              selected && 'text-saffron',
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <span className="truncate">{address.label}</span>
          {address.isDefault && (
            <span className="rounded-full bg-saffron/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-saffron">
              Default
            </span>
          )}
        </div>

        {/* Selected indicator */}
        {selected && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-saffron text-bg">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        )}
      </div>

      {/* Address details */}
      <div className="mt-3 space-y-0.5 text-sm text-cream/80">
        <div className="font-medium text-cream">{address.fullName}</div>
        <div>{address.phone}</div>
        <div className="text-cream/65">
          {address.addressLine1}
          {address.addressLine2 ? `, ${address.addressLine2}` : ''}
        </div>
        <div className="text-cream/65">
          {address.thana}, {address.district}
          {address.postalCode ? ` — ${address.postalCode}` : ''}
        </div>
      </div>

      {/* Actions — only show on hover for non-selected, always for selected */}
      {(onEdit || onDelete) && (
        <div className="mt-4 flex items-center gap-2 border-t border-line/60 pt-3">
          {onEdit && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit();
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-cream/65 transition-colors hover:text-saffron"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </span>
          )}
          {onDelete && !address.isDefault && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete();
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-cream/65 transition-colors hover:text-coral"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </span>
          )}
        </div>
      )}
    </button>
  );
}
