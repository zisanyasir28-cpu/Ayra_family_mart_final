import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressInputSchema, AddressType, type AddressInput } from '@superstore/shared';
import { cn } from '@/lib/utils';

interface AddressFormProps {
  defaultValues?: Partial<AddressInput>;
  onSubmit:       (values: AddressInput) => void | Promise<void>;
  onCancel?:      () => void;
  submitLabel?:   string;
  submitting?:    boolean;
}

export function AddressForm({
  defaultValues, onSubmit, onCancel, submitLabel = 'Save address', submitting,
}: AddressFormProps) {
  const {
    register, handleSubmit, formState: { errors },
  } = useForm<AddressInput>({
    resolver:      zodResolver(addressInputSchema),
    defaultValues: {
      type:      AddressType.HOME,
      isDefault: false,
      ...defaultValues,
    },
  });

  const onValid: SubmitHandler<AddressInput> = (values) => onSubmit(values);

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full rounded-xl border bg-bg px-3 py-2.5 text-sm text-cream placeholder:text-cream/35 transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-saffron/40',
      hasError ? 'border-rose-500/60' : 'border-line/50',
    );

  const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-cream/55';

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Label</label>
          <input
            {...register('label')}
            placeholder="Home / Office"
            className={inputClass(!!errors.label)}
          />
          {errors.label && <p className="mt-1 text-xs text-rose-400">{errors.label.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Type</label>
          <select {...register('type')} className={inputClass(!!errors.type)}>
            <option value={AddressType.HOME}>Home</option>
            <option value={AddressType.OFFICE}>Office</option>
            <option value={AddressType.OTHER}>Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Full name</label>
          <input
            {...register('fullName')}
            placeholder="Receiver's name"
            className={inputClass(!!errors.fullName)}
          />
          {errors.fullName && <p className="mt-1 text-xs text-rose-400">{errors.fullName.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input
            {...register('phone')}
            placeholder="01XXXXXXXXX"
            className={inputClass(!!errors.phone)}
          />
          {errors.phone && <p className="mt-1 text-xs text-rose-400">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass}>Address line 1</label>
        <input
          {...register('addressLine1')}
          placeholder="House, road, area"
          className={inputClass(!!errors.addressLine1)}
        />
        {errors.addressLine1 && <p className="mt-1 text-xs text-rose-400">{errors.addressLine1.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Address line 2 (optional)</label>
        <input
          {...register('addressLine2')}
          placeholder="Apt, suite, landmark"
          className={inputClass(!!errors.addressLine2)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Thana</label>
          <input
            {...register('thana')}
            placeholder="Thana"
            className={inputClass(!!errors.thana)}
          />
          {errors.thana && <p className="mt-1 text-xs text-rose-400">{errors.thana.message}</p>}
        </div>
        <div>
          <label className={labelClass}>District</label>
          <input
            {...register('district')}
            placeholder="District"
            className={inputClass(!!errors.district)}
          />
          {errors.district && <p className="mt-1 text-xs text-rose-400">{errors.district.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Postal code</label>
          <input
            {...register('postalCode')}
            placeholder="1209"
            className={inputClass(!!errors.postalCode)}
          />
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-cream">
        <input
          type="checkbox"
          {...register('isDefault')}
          className="h-4 w-4 rounded border-line accent-saffron focus:ring-saffron"
        />
        Make this my default delivery address
      </label>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-line/50 bg-surface/60 px-4 py-2 text-sm font-medium text-cream transition-all hover:border-saffron/40 hover:text-saffron"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-saffron px-5 py-2 text-sm font-bold text-bg transition-all hover:bg-saffron/90 hover:shadow-[0_0_16px_-2px_hsl(var(--saffron)/0.5)] disabled:opacity-50"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
