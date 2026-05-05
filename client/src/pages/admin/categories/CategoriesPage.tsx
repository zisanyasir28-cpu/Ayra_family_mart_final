import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  ChevronRight,
  AlertTriangle,
  ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
  fetchCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from '@/services/categories';
import type { ApiCategory } from '@/types/api';

// ─── Form schema ──────────────────────────────────────────────────────────────

const categoryFormSchema = z.object({
  name:        z.string().min(2, 'At least 2 characters').max(100),
  slug:        z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Only lowercase, numbers, hyphens'),
  description: z.string().max(500).optional(),
  parentId:    z.string().uuid().optional().or(z.literal('').transform(() => undefined)),
  sortOrder:   z.coerce.number().int().min(0).default(0),
  isActive:    z.boolean().default(true),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── Tiny primitives ──────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-1 text-xs text-red-500">{message}</p>
  ) : null;
}

const inputClass =
  'w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200',
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

// ─── Category tree item ───────────────────────────────────────────────────────

interface CategoryItemProps {
  cat: ApiCategory;
  depth: number;
  isSelected: boolean;
  onSelect: (cat: ApiCategory) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (cat: ApiCategory) => void;
}

function CategoryItem({
  cat,
  depth,
  isSelected,
  onSelect,
  onAddChild,
  onDelete,
}: CategoryItemProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = cat.children && cat.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-2 rounded-lg px-3 py-2 transition',
          isSelected
            ? 'bg-primary/10 text-primary'
            : 'hover:bg-muted text-foreground',
        )}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        {/* Drag handle (visual only) */}
        <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/50" />

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground transition',
            !hasChildren && 'invisible',
          )}
        >
          <ChevronRight
            className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-90')}
          />
        </button>

        {/* Category icon / image */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
          {cat.imageUrl ? (
            <img src={cat.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm">📂</span>
          )}
        </div>

        {/* Name */}
        <button
          type="button"
          onClick={() => onSelect(cat)}
          className="flex-1 text-left text-sm font-medium truncate"
        >
          {cat.name}
          {!cat.isActive && (
            <span className="ml-1.5 text-[10px] text-muted-foreground">(inactive)</span>
          )}
        </button>

        {/* Product count badge */}
        <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {cat._count?.products ?? 0}
        </span>

        {/* Action buttons (show on hover) */}
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            title="Edit"
            onClick={() => onSelect(cat)}
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            type="button"
            title="Add subcategory"
            onClick={() => onAddChild(cat.id)}
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition hover:bg-green-50 hover:text-green-700"
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            type="button"
            title="Delete"
            onClick={() => onDelete(cat)}
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {cat.children.map((child) => (
            <CategoryItem
              key={child.id}
              cat={child}
              depth={depth + 1}
              isSelected={isSelected && false}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Category tree ────────────────────────────────────────────────────────────

interface CategoryTreeProps {
  categories: ApiCategory[];
  selectedId: string | null;
  onSelect: (cat: ApiCategory) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (cat: ApiCategory) => void;
}

function CategoryTree({
  categories,
  selectedId,
  onSelect,
  onAddChild,
  onDelete,
}: CategoryTreeProps) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <span className="mb-3 text-4xl">📂</span>
        <p className="text-sm">No categories yet.</p>
        <p className="text-xs">Click "Add Category" to create the first one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {categories.map((cat) => (
        <CategoryItem
          key={cat.id}
          cat={cat}
          depth={0}
          isSelected={selectedId === cat.id}
          onSelect={onSelect}
          onAddChild={onAddChild}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

// ─── Delete dialog ────────────────────────────────────────────────────────────

function DeleteDialog({
  cat,
  onConfirm,
  onCancel,
  isPending,
}: {
  cat: ApiCategory;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Delete category?</h3>
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          </div>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          <strong className="text-foreground">{cat.name}</strong> will be deleted. Categories with
          active products cannot be deleted.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Category form panel ──────────────────────────────────────────────────────

interface CategoryFormProps {
  category: ApiCategory | null;     // null = create mode
  defaultParentId?: string;
  allCategories: ApiCategory[];
  onSuccess: () => void;
  onCancel: () => void;
}

function CategoryFormPanel({
  category,
  defaultParentId,
  allCategories,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!category;
  const slugTouched = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name:        '',
      slug:        '',
      description: '',
      parentId:    defaultParentId ?? '',
      sortOrder:   0,
      isActive:    true,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (category) {
      reset({
        name:        category.name,
        slug:        category.slug,
        description: category.description ?? '',
        parentId:    '' , // parentId not exposed on tree node; set below
        sortOrder:   category.sortOrder,
        isActive:    category.isActive,
      });
      setImagePreview(category.imageUrl);
      setImageFile(null);
    } else {
      reset({
        name:      '',
        slug:      '',
        parentId:  defaultParentId ?? '',
        sortOrder: 0,
        isActive:  true,
      });
      setImagePreview(null);
      setImageFile(null);
    }
    slugTouched.current = false;
  }, [category, defaultParentId, reset]);

  // Auto-slug
  const name = watch('name');
  useEffect(() => {
    if (!slugTouched.current && name && !isEdit) {
      setValue('slug', slugify(name));
    }
  }, [name, isEdit, setValue]);

  // Flatten categories for parent select (exclude self and own children)
  const flatCats: ApiCategory[] = [];
  function flatten(cats: ApiCategory[], depth = 0) {
    cats.forEach((c) => {
      if (!category || c.id !== category.id) {
        flatCats.push({ ...c, name: `${'—'.repeat(depth)} ${c.name}`.trim() });
        if (c.children?.length) flatten(c.children, depth + 1);
      }
    });
  }
  flatten(allCategories);

  const { mutateAsync } = useMutation({
    mutationFn: (values: CategoryFormValues) => {
      const payload = {
        name:        values.name,
        slug:        values.slug,
        description: values.description,
        parentId:    values.parentId || undefined,
        sortOrder:   values.sortOrder,
        isActive:    values.isActive,
        imageFile,
      };
      return isEdit
        ? updateAdminCategory(category!.id, payload)
        : createAdminCategory(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Category updated!' : 'Category created!');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onSuccess();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Something went wrong';
      toast.error(msg);
    },
  });

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  }

  const isActive = watch('isActive');

  return (
    <form onSubmit={handleSubmit((v) => mutateAsync(v))} className="space-y-4">
      {/* Image upload */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Category image
        </label>
        <div className="flex items-center gap-3">
          <div
            className="relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted transition hover:border-primary/50"
            onClick={() => imageInputRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            <p>Click to upload</p>
            <p>JPEG, PNG, WebP</p>
            {imagePreview && (
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="mt-1 text-red-500 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name')}
          placeholder="e.g. Fruits & Vegetables"
          className={cn(inputClass, errors.name && 'border-red-400')}
        />
        <FieldError message={errors.name?.message} />
      </div>

      {/* Slug */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Slug</label>
        <input
          {...register('slug', {
            onChange: () => { slugTouched.current = true; },
          })}
          placeholder="fruits-vegetables"
          className={cn(inputClass, errors.slug && 'border-red-400')}
        />
        <FieldError message={errors.slug?.message} />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Optional description…"
          className={cn(inputClass, 'resize-none')}
        />
      </div>

      {/* Parent category */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Parent category
        </label>
        <select
          {...register('parentId')}
          className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">None (root level)</option>
          {flatCats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sort order */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Sort order
        </label>
        <input
          {...register('sortOrder', { valueAsNumber: true })}
          type="number"
          min="0"
          placeholder="0"
          className={inputClass}
        />
      </div>

      {/* Is active */}
      <Switch
        checked={isActive}
        onChange={(v) => setValue('isActive', v)}
        label="Active"
      />

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
          )}
          {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Category'}
        </button>
      </div>
    </form>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type FormMode =
  | { kind: 'idle' }
  | { kind: 'create'; parentId?: string }
  | { kind: 'edit'; category: ApiCategory };

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [formMode, setFormMode] = useState<FormMode>({ kind: 'idle' });
  const [deleteTarget, setDeleteTarget] = useState<ApiCategory | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminCategory(id),
    onSuccess: () => {
      toast.success('Category deleted');
      setDeleteTarget(null);
      setFormMode({ kind: 'idle' });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Delete failed';
      toast.error(msg);
    },
  });

  const selectedId =
    formMode.kind === 'edit' ? formMode.category.id : null;

  return (
    <div className="flex h-full gap-6">
      {/* ── Left: Tree panel ─────────────────────────────────────────────────── */}
      <div className="flex w-72 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
        {/* Tree header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Categories</h3>
          <button
            onClick={() => setFormMode({ kind: 'create' })}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-3 w-3" />
            Add Category
          </button>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-y-auto py-2">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
            </div>
          ) : (
            <CategoryTree
              categories={categories}
              selectedId={selectedId}
              onSelect={(cat) => setFormMode({ kind: 'edit', category: cat })}
              onAddChild={(parentId) => setFormMode({ kind: 'create', parentId })}
              onDelete={(cat) => setDeleteTarget(cat)}
            />
          )}
        </div>
      </div>

      {/* ── Right: Form / Empty state ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden rounded-xl border border-border bg-card">
        {formMode.kind === 'idle' ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <span className="text-5xl">📂</span>
            <p className="text-sm font-medium text-foreground">
              Select a category to edit
            </p>
            <p className="text-xs">Or click "Add Category" to create a new one.</p>
            <button
              onClick={() => setFormMode({ kind: 'create' })}
              className="mt-2 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            {/* Form header */}
            <div className="sticky top-0 z-10 border-b border-border bg-card px-6 py-4">
              <h3 className="text-base font-semibold text-foreground">
                {formMode.kind === 'edit'
                  ? `Edit — ${formMode.category.name}`
                  : formMode.parentId
                  ? 'Add Subcategory'
                  : 'Add Category'}
              </h3>
            </div>

            <div className="px-6 py-5">
              <CategoryFormPanel
                key={
                  formMode.kind === 'edit'
                    ? formMode.category.id
                    : `new-${formMode.parentId ?? 'root'}`
                }
                category={formMode.kind === 'edit' ? formMode.category : null}
                defaultParentId={
                  formMode.kind === 'create' ? formMode.parentId : undefined
                }
                allCategories={categories}
                onSuccess={() => setFormMode({ kind: 'idle' })}
                onCancel={() => setFormMode({ kind: 'idle' })}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Delete dialog ─────────────────────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteDialog
          cat={deleteTarget}
          isPending={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
