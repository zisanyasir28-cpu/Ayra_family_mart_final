import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from './utils';
import { ProductCard } from '@/components/product/ProductCard';
import type { ApiProduct } from '@/types/api';

function makeProduct(overrides: Partial<ApiProduct> = {}): ApiProduct {
  // Cast to ApiProduct — only the fields the component reads need to be set.
  return {
    id:                    'p1',
    name:                  'Bashundhara Premium Rice 5kg',
    slug:                  'bashundhara-rice-5kg',
    description:           'Long grain aromatic rice.',
    sku:                   'BR-5KG',
    barcode:               null,
    priceInPaisa:          120_000,
    effectivePriceInPaisa: 120_000,
    comparePriceInPaisa:   null,
    costPriceInPaisa:      null,
    stockQuantity:         50,
    lowStockThreshold:     10,
    unit:                  'kg',
    weight:                5,
    status:                'ACTIVE',
    categoryId:            'c1',
    brandId:               null,
    images: [
      { id: 'i1', url: 'https://res.cloudinary.com/demo/image/upload/v1/test.jpg', publicId: 'test', altText: 'Rice', sortOrder: 0 },
    ],
    tags:                  [],
    isFeatured:            false,
    createdAt:             new Date().toISOString(),
    updatedAt:             new Date().toISOString(),
    category:              { id: 'c1', name: 'Groceries', slug: 'groceries' },
    activeCampaign:        null,
    ...overrides,
  } as unknown as ApiProduct;
}

describe('ProductCard', () => {
  it('renders product name and price', () => {
    renderWithProviders(<ProductCard product={makeProduct()} />);
    expect(screen.getByText('Bashundhara Premium Rice 5kg')).toBeInTheDocument();
    expect(screen.getByText(/1200\.00/)).toBeInTheDocument();
  });

  it('shows "Sold out" overlay when stockQuantity is 0', () => {
    renderWithProviders(<ProductCard product={makeProduct({ stockQuantity: 0 })} />);
    expect(screen.getByText(/sold out/i)).toBeInTheDocument();
  });

  it('shows low-stock badge when ≤ 5 in stock', () => {
    renderWithProviders(<ProductCard product={makeProduct({ stockQuantity: 3 })} />);
    expect(screen.getByText(/3 left/i)).toBeInTheDocument();
  });

  it('shows discount chip and strikethrough compare price when active campaign exists', () => {
    const product = makeProduct({
      priceInPaisa:          120_000,
      effectivePriceInPaisa:  96_000,
      comparePriceInPaisa:   120_000,
      activeCampaign: {
        id:            'camp1',
        discountType:  'PERCENTAGE',
        discountValue: 20,
        endsAt:        null,
      },
    });
    renderWithProviders(<ProductCard product={product} />);

    // Discount chip — -20% rendered
    expect(screen.getByText(/−20%/)).toBeInTheDocument();
    // Effective price shown
    expect(screen.getByText(/960\.00/)).toBeInTheDocument();
    // Compare price shown with strikethrough
    const compare = screen.getByText(/1200\.00/);
    expect(compare.className).toMatch(/line-through/);
  });

  it('renders category label', () => {
    renderWithProviders(<ProductCard product={makeProduct()} />);
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });
});
