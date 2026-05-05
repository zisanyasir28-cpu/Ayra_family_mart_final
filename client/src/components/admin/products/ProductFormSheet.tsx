import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Trash2,
  Wand2,
  GripVertical,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, paisaToTaka, takaToPaisa } from '@/lib/utils';
import { createAdminProduct, updateAdminProduct } from '@/services/products';
import type { ApiProduct } from '@/types/api';
import type { ApiCategory } from '@/types/api';

// ─── Form schema (BDT taka values for price display) ─────────────────────────

const productFormSchema = z.object({
  name:              z.string().min(2, 'At least 2 characters').max(255),
  slug:              z.string().min(2, 'At least 2 characters').max(255)
                       .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  description:       z.string().min(10, 'At least 10 characters').max(5000),
  categoryId:        z.string().uuid('Select a category'),
  unit:              z.enum(['piece', 'kg', 'litre', 'pack', 'box', 'dozen']),
  // Pricing (BDT)
  price:             z.coerce.number().positive('Enter a positive price'),
  comparePrice:      z.coerce.number().positive().optional().or(z.literal(0).transform(() => undefined)),
  costPrice:         z.coerce.number().positive().optional().or(z.literal(0).transform(() => undefined)),
  // Stock
  stock:             z.coerce.number().int().min(0, 'Cannot be negative'),
  lowStockThreshold: z.coerce.number().int().min(0).default(10),
  sku:               z.string().min(1, 'SKU is required').max(100),
  // Flags
  isFeatured:        z.boolean().default(false),
  status:            z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED']).default('ACTIVE'),
  // SEO
  tags:              z.string().default(''),  // comma-separated
  metaTitle:         z.string().max(70).optional(),
  metaDescription:   z.string().max(160).optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

// ─── Utility ─────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateSku(): string {
  return 'SKU-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

// ─── Error message ────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-1 text-xs text-red-500">{message}</p>
  ) : null;
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

const selectClass =
  'w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50',
          checked ? 'bg-primary' : 'bg-muted',
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200',
            checked ? 'translate-x-4' : 'translate-x-0',
          )}
        />
      </button>
    </div>
  );
}

// ─── Searchable Category Combobox ─────────────────────────────────────────────

interface ComboboxProps {
  value: string;
  onChange: (v: string) => void;
  options: ApiCategory[];
  placeholder?: string;
}

function CategoryCombobox({ value, onChange, options, placeholder = 'Select…' }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const flat: ApiCategory[] = [];
  function flattenCats(cats: ApiCategory[], depth = 0) {
    cats.forEach((c) => {
      flat.push({ ...c, name: `${'  '.repeat(depth)}${c.name}` });
      if (c.children?.length) flattenCats(c.children, depth + 1);
    });
  }
  flattenCats(options);

  const filtered = flat.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );
  const selected = flat.find((c) => c.id === value);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(inputClass, 'flex items-center justify-between')}
      >
        <span className={selected ? 'text-foreground' : 'text-muted-foreground'}>
          {selected ? selected.name.trim() : placeholder}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg"
          >
            <div className="border-b border-border p-2">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="w-full rounded-md border border-border bg-muted px-2 py-1 text-sm focus:outline-none"
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">No match</p>
              ) : (
                filtered.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { onChange(cat.id); setOpen(false); setQuery(''); }}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted',
                      cat.id === value && 'bg-primary/10 text-primary',
                    )}
                  >
                    {cat.name}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Image dropzone ───────────────────────────────────────────────────────────

interface ImageEntry {
  id: string;            // local temp id for new files, or DB id for existing
  type: 'existing' | 'new';
  url: string;           // preview URL (object URL for new, CDN url for existing)
  file?: File;
  publicId?: string;
}

interface ImageZoneProps {
  existingImages: { id: string; url: string; publicId: string }[];
  onChange: (newFiles: File[], removeIds: string[]) => void;
}

function ImageZone({ existingImages, onChange }: ImageZoneProps) {
  const [images, setImages] = useState<ImageEntry[]>(() =>
    existingImages.map((img) => ({
      id:       img.id,
      type:     'existing',
      url:      img.url,
      publicId: img.publicId,
    })),
  );
  const [isDrag, setIsDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Notify parent whenever images change
  useEffect(() => {
    const newFiles = images.filter((i) => i.type === 'new' && i.file).map((i) => i.file!);
    const removedIds = existingImages
      .filter((orig) => !images.some((i) => i.id === orig.id))
      .map((orig) => orig.id);
    onChange(newFiles, removedIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) =>
      ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type),
    );
    const MAX = 8 - images.length;
    const toAdd = arr.slice(0, Math.max(0, MAX));
    const entries: ImageEntry[] = toAdd.map((f) => ({
      id:   crypto.randomUUID(),
      type: 'new',
      url:  URL.createObjectURL(f),
      file: f,
    }));
    setImages((prev) => [...prev, ...entries]);
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img?.type === 'new') URL.revokeObjectURL(img.url);
      return prev.filter((i) => i.id !== id);
    });
  }

  function moveImage(from: number, to: number) {
    setImages((prev) => {
      const next = [...prev];
      const item = next[from];
      if (!item) return prev;
      next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {images.length < 8 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
          onDragLeave={() => setIsDrag(false)}
          onDrop={(e) => { e.preventDefault(); setIsDrag(false); addFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition',
            isDrag
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/50',
          )}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Drop images here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, WebP · Max 8 images · First image is primary
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files ?? [])}
          />
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
            >
              {i === 0 && (
                <span className="absolute left-1 top-1 z-10 rounded bg-primary px-1 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  Primary
                </span>
              )}

              <img
                src={img.url}
                alt=""
                className="h-full w-full object-cover"
              />

              {/* Overlay controls */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition group-hover:opacity-100">
                {i > 0 && (
                  <button
                    type="button"
                    title="Move left"
                    onClick={() => moveImage(i, i - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-foreground transition hover:bg-white"
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  title="Remove"
                  onClick={() => removeImage(img.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab list ─────────────────────────────────────────────────────────────────

const TABS = ['Basic Info', 'Pricing & Stock', 'Images', 'SEO'] as const;
type TabKey = (typeof TABS)[number];

// ─── Main component ───────────────────────────────────────────────────────────

interface ProductFormSheetProps {
  open: boolean;
  onClose: () => void;
  product?: ApiProduct;
  categories: ApiCategory[];
  onSuccess: () => void;
}

export function ProductFormSheet({
  open,
  onClose,
  product,
  categories,
  onSuccess,
}: ProductFormSheetProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('Basic Info');
  const [newImages, setNewImages] = useState<File[]>([]);
  const [removeImageIds, setRemoveImageIds] = useState<string[]>([]);

  const isEdit = !!product?.id;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name:              '',
      slug:              '',
      description:       '',
      categoryId:        '',
      unit:              'piece',
      price:             0,
      stock:             0,
      lowStockThreshold: 10,
      sku:               '',
      isFeatured:        false,
      status:            'ACTIVE',
      tags:              '',
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (open && product) {
      reset({
        name:              product.name,
        slug:              product.slug,
        description:       product.description,
        categoryId:        product.categoryId,
        unit:              product.unit as ProductFormValues['unit'],
        price:             paisaToTaka(product.priceInPaisa),
        comparePrice:      product.comparePriceInPaisa ? paisaToTaka(product.comparePriceInPaisa) : undefined,
        costPrice:         product.costPriceInPaisa ? paisaToTaka(product.costPriceInPaisa) : undefined,
        stock:             product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
        sku:               product.sku,
        isFeatured:        product.isFeatured,
        status:            product.status as ProductFormValues['status'],
        tags:              product.tags.join(', '),
      });
    } else if (open && !product) {
      reset();
      setActiveTab('Basic Info');
    }
    // Reset image state
    setNewImages([]);
    setRemoveImageIds([]);
  }, [open, product, reset]);

  // Auto-generate slug from name
  const name = watch('name');
  const slugField = watch('slug');
  const slugWasTouched = useRef(false);

  useEffect(() => {
    if (!slugWasTouched.current && name && !isEdit) {
      setValue('slug', slugify(name), { shouldValidate: false });
    }
  }, [name, isEdit, setValue]);

  // Auto-fill meta title from name
  const metaTitleField = watch('metaTitle');
  useEffect(() => {
    if (!metaTitleField && name) {
      setValue('metaTitle', name.slice(0, 70), { shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  // Auto-fill meta description from description
  const descField = watch('description');
  const metaDesc = watch('metaDescription');
  useEffect(() => {
    if (!metaDesc && descField) {
      setValue('metaDescription', descField.slice(0, 160), { shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [descField]);

  const { mutateAsync } = useMutation({
    mutationFn: (values: ProductFormValues) => {
      const tagArr = values.tags
        ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      const payload = {
        name:              values.name,
        slug:              values.slug,
        description:       values.description,
        categoryId:        values.categoryId,
        unit:              values.unit,
        price:             values.price,
        comparePrice:      values.comparePrice,
        costPrice:         values.costPrice,
        stock:             values.stock,
        lowStockThreshold: values.lowStockThreshold,
        sku:               values.sku,
        tags:              tagArr,
        isFeatured:        values.isFeatured,
        status:            values.status,
        metaTitle:         values.metaTitle,
        metaDescription:   values.metaDescription,
        newImages,
        removeImageIds,
      };

      return isEdit
        ? updateAdminProduct(product!.id, payload)
        : createAdminProduct(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Product updated!' : 'Product created!');
      onSuccess();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Something went wrong';
      toast.error(msg);
    },
  });

  // Tab validation indicators
  const tabErrors: Record<TabKey, boolean> = {
    'Basic Info':       !!(errors.name || errors.slug || errors.description || errors.categoryId || errors.unit),
    'Pricing & Stock':  !!(errors.price || errors.stock || errors.sku),
    'Images':           false,
    'SEO':              false,
  };

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
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.aside
            key="sheet"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-card shadow-2xl sm:w-[640px]"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {isEdit ? 'Edit Product' : 'Add Product'}
                </h2>
                {product?.name && (
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                    {product.name}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tab list */}
            <div className="shrink-0 border-b border-border">
              <div className="flex overflow-x-auto scrollbar-hide">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-5 py-3 text-sm font-medium transition',
                      activeTab === tab
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {tab}
                    {tabErrors[tab] && (
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Form body (scrollable) */}
            <form
              onSubmit={handleSubmit((values) => mutateAsync(values))}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {/* ── Tab 1: Basic Info ──────────────────────────────────────── */}
                {activeTab === 'Basic Info' && (
                  <div className="space-y-4">
                    <Field label="Product name" required>
                      <input
                        {...register('name')}
                        placeholder="e.g. Fresh Organic Mango 1kg"
                        className={cn(inputClass, errors.name && 'border-red-400')}
                      />
                      <FieldError message={errors.name?.message} />
                    </Field>

                    <Field label="Slug" hint="URL-friendly identifier. Auto-generated from name.">
                      <input
                        {...register('slug', {
                          onChange: () => { slugWasTouched.current = true; },
                        })}
                        placeholder="e.g. fresh-organic-mango-1kg"
                        className={cn(inputClass, errors.slug && 'border-red-400')}
                      />
                      <FieldError message={errors.slug?.message} />
                      {slugField && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          /products/{slugField}
                        </p>
                      )}
                    </Field>

                    <Field label="Description" required>
                      <textarea
                        {...register('description')}
                        rows={5}
                        placeholder="Describe the product…"
                        className={cn(inputClass, 'resize-none', errors.description && 'border-red-400')}
                      />
                      <FieldError message={errors.description?.message} />
                    </Field>

                    <Field label="Category" required>
                      <Controller
                        name="categoryId"
                        control={control}
                        render={({ field }) => (
                          <CategoryCombobox
                            value={field.value}
                            onChange={field.onChange}
                            options={categories}
                            placeholder="Select a category…"
                          />
                        )}
                      />
                      <FieldError message={errors.categoryId?.message} />
                    </Field>

                    <Field label="Unit">
                      <select
                        {...register('unit')}
                        className={selectClass}
                      >
                        <option value="piece">Piece</option>
                        <option value="kg">Kilogram (kg)</option>
                        <option value="litre">Litre</option>
                        <option value="pack">Pack</option>
                        <option value="box">Box</option>
                        <option value="dozen">Dozen</option>
                      </select>
                    </Field>

                    <Field label="Tags" hint="Comma-separated: e.g. organic, fresh, imported">
                      <input
                        {...register('tags')}
                        placeholder="organic, fresh, local"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                )}

                {/* ── Tab 2: Pricing & Stock ─────────────────────────────────── */}
                {activeTab === 'Pricing & Stock' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Selling price (৳)" required>
                        <input
                          {...register('price', { valueAsNumber: true })}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className={cn(inputClass, errors.price && 'border-red-400')}
                        />
                        <FieldError message={errors.price?.message} />
                      </Field>

                      <Field label="Compare-at price (৳)" hint="Crossed-out 'was' price">
                        <input
                          {...register('comparePrice', { valueAsNumber: true })}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Cost price (৳)" hint="Internal only, not shown to customers">
                        <input
                          {...register('costPrice', { valueAsNumber: true })}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Low-stock threshold" hint="Alert when stock drops below this">
                        <input
                          {...register('lowStockThreshold', { valueAsNumber: true })}
                          type="number"
                          min="0"
                          placeholder="10"
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Stock quantity" required>
                        <input
                          {...register('stock', { valueAsNumber: true })}
                          type="number"
                          min="0"
                          placeholder="0"
                          className={cn(inputClass, errors.stock && 'border-red-400')}
                        />
                        <FieldError message={errors.stock?.message} />
                      </Field>

                      <Field label="SKU" required hint="Unique product identifier">
                        <div className="flex gap-2">
                          <input
                            {...register('sku')}
                            placeholder="PROD-001"
                            className={cn(inputClass, errors.sku && 'border-red-400')}
                          />
                          <button
                            type="button"
                            title="Generate SKU"
                            onClick={() => setValue('sku', generateSku())}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                          >
                            <Wand2 className="h-4 w-4" />
                          </button>
                        </div>
                        <FieldError message={errors.sku?.message} />
                      </Field>
                    </div>

                    <div className="space-y-2 pt-1">
                      <Controller
                        name="isFeatured"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onChange={field.onChange}
                            label="Featured product"
                          />
                        )}
                      />

                      <Field label="Status">
                        <select
                          {...register('status')}
                          className={selectClass}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="OUT_OF_STOCK">Out of Stock</option>
                          <option value="DISCONTINUED">Discontinued</option>
                        </select>
                      </Field>
                    </div>
                  </div>
                )}

                {/* ── Tab 3: Images ──────────────────────────────────────────── */}
                {activeTab === 'Images' && (
                  <ImageZone
                    existingImages={product?.images ?? []}
                    onChange={(files, removedIds) => {
                      setNewImages(files);
                      setRemoveImageIds(removedIds);
                    }}
                  />
                )}

                {/* ── Tab 4: SEO ─────────────────────────────────────────────── */}
                {activeTab === 'SEO' && (
                  <div className="space-y-4">
                    <Field
                      label="Meta title"
                      hint={`${(metaTitleField ?? '').length}/70 — auto-filled from product name`}
                    >
                      <input
                        {...register('metaTitle')}
                        placeholder="Product name for SEO…"
                        maxLength={70}
                        className={inputClass}
                      />
                    </Field>

                    <Field
                      label="Meta description"
                      hint={`${(watch('metaDescription') ?? '').length}/160 — auto-filled from description`}
                    >
                      <textarea
                        {...register('metaDescription')}
                        rows={4}
                        placeholder="Brief SEO description…"
                        maxLength={160}
                        className={cn(inputClass, 'resize-none')}
                      />
                    </Field>

                    {/* Preview card */}
                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Search Preview
                      </p>
                      <p className="text-sm font-medium text-blue-600 underline line-clamp-1">
                        {watch('metaTitle') || watch('name') || 'Product Title'}
                      </p>
                      <p className="text-xs text-green-700">
                        ayrafamilymart.com.bd/products/{watch('slug') || 'slug'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {watch('metaDescription') || watch('description') || 'Product description goes here…'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="shrink-0 flex items-center justify-between border-t border-border px-6 py-4">
                {/* Tab navigation */}
                <div className="flex gap-2">
                  {activeTab !== 'Basic Info' && (
                    <button
                      type="button"
                      onClick={() => {
                        const idx = TABS.indexOf(activeTab);
                        const prev = TABS[idx - 1];
                        if (prev) setActiveTab(prev);
                      }}
                      className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
                    >
                      Back
                    </button>
                  )}
                  {activeTab !== 'SEO' && (
                    <button
                      type="button"
                      onClick={() => {
                        const idx = TABS.indexOf(activeTab);
                        const next = TABS[idx + 1];
                        if (next) setActiveTab(next);
                      }}
                      className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
                    >
                      Next
                    </button>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                >
                  {isSubmitting && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  )}
                  {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
