import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressInputSchema, AddressType, type AddressInput } from '@superstore/shared';
import { cn } from '@/lib/utils';

interface AddressFormProps {
  defaultValues?: Partial<AddressInput>;
  submitting?: boolean;
  onSubmit: (values: AddressInput) => void | Promise<void>;
  onCancel?: () => void;
  /** Submit-button label. */
  submitLabel?: string;
}

const TYPE_OPTIONS: Array<{ value: AddressType; label: string }> = [
  { value: AddressType.HOME,   label: 'Home' },
  { value: AddressType.OFFICE, label: 'Office' },
  { value: AddressType.OTHER,  label: 'Other' },
];

export function AddressForm({
  defaultValues,
  submitting,
  onSubmit,
  onCancel,
  submitLabel = 'Save address',
}: AddressFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressInputSchema) as never,
    defaultValues: {
      type: AddressType.HOME,
      label: 'Home',
      isDefault: false,
      ...defaultValues,
    },
  });

  const onValid: SubmitHandler<AddressInput> = (values) => onSubmit(values);

  const selectedType = watch('type');
  const isDefault = watch('isDefault');

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-4">
      {/* Type pills */}
      <div>
        <Label>Address type</Label>
        <div className="grid grid-cols-3 gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue('type', opt.value, { shouldDirty: true })}
              className={cn(
                'rounded-xl border-2 px-3 py-2 text-sm font-medium transition-colors',
                selectedType === opt.value
                  ? 'border-saffron bg-saffron/[0.06] text-saffron'
                  : 'border-line text-cream/70 hover:border-saffron/40',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Field
        label="Label"
        register={register('label')}
        placeholder="e.g. Home, Office, Mom's place"
        error={errors.label?.message}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Full name"
          register={register('fullName')}
          placeholder="As on delivery"
          error={errors.fullName?.message}
        />
        <Field
          label="Phone"
          register={register('phone')}
          placeholder="+8801..."
          error={errors.phone?.message}
        />
      </div>

      <Field
        label="Address line 1"
        register={register('addressLine1')}
        placeholder="House, road, area"
        error={errors.addressLine1?.message}
      />
      <Field
        label="Address line 2 (optional)"
        register={register('addressLine2')}
        placeholder="Apartment, landmark"
        error={errors.addressLine2?.message}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field
          label="District"
          register={register('district')}
          placeholder="Dhaka"
          error={errors.district?.message}
        />
        <Field
          label="Thana / area"
          register={register('thana')}
          placeholder="Gulshan"
          error={errors.thana?.message}
        />
        <Field
          label="Postal code (optional)"
          register={register('postalCode')}
          placeholder="1212"
          error={errors.postalCode?.message}
        />
      </div>

      <label className="flex items-center gap-2.5 text-sm text-cream/80">
        <input
          type="checkbox"
          {...register('isDefault')}
          className="h-4 w-4 rounded border-line bg-bg accent-saffron"
        />
        <span>{isDefault ? 'This will be your default address' : 'Set as default address'}</span>
      </label>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-cream/80 transition-colors hover:border-cream/40 hover:text-cream"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-saffron px-6 py-2.5 text-sm font-bold uppercase tracking-[0.14em] text-bg transition-colors hover:bg-cream disabled:opacity-60"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

// ─── Field primitives ─────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-cream/55">
      {children}
    </label>
  );
}

interface FieldProps {
  label: string;
  register: ReturnType<ReturnType<typeof useForm>['register']>;
  placeholder?: string;
  error?: string;
}

function Field({ label, register, placeholder, error }: FieldProps) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        {...register}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-xl border bg-bg px-4 py-3 text-base text-cream placeholder:text-cream/30 focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/20',
          error ? 'border-coral' : 'border-line',
        )}
      />
      {error && <p className="mt-1.5 text-xs text-coral">{error}</p>}
    </div>
  );
}
