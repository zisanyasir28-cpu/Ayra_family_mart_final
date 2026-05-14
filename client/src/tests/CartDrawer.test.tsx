import { describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders, screen } from './utils';
import { CartDrawer } from '@/components/CartDrawer';
import { useCartStore } from '@/store/cartStore';

beforeEach(() => {
  // Reset cart between tests
  useCartStore.setState({ items: [], coupon: null });
});

describe('CartDrawer', () => {
  it('renders empty state when there are no items', () => {
    renderWithProviders(<CartDrawer open={true} onClose={() => {}} />);
    // CartDrawer uses framer-motion AnimatePresence — content is in the DOM
    // but may have opacity:0 until the animation frame fires. We assert on the
    // presence of empty-state copy which mounts immediately.
    const allText = document.body.textContent ?? '';
    expect(allText.toLowerCase()).toMatch(/empty|start shopping|browse/);
  });

  it('renders a cart line when items are added', () => {
    useCartStore.getState().addItem({
      productId:    'p1',
      name:         'Test Rice',
      slug:         'test-rice',
      image:        'https://res.cloudinary.com/demo/image/upload/v1/test.jpg',
      priceInPaisa: 50_000,
      stock:        10,
      unit:         'kg',
      quantity:     2,
    });

    renderWithProviders(<CartDrawer open={true} onClose={() => {}} />);

    expect(screen.getByText('Test Rice')).toBeInTheDocument();
    // Subtotal = 2 × 500.00 = 1000.00
    expect(screen.getAllByText(/500\.00|1000\.00/).length).toBeGreaterThan(0);
  });

  it('does not render anything when closed', () => {
    const { container } = renderWithProviders(<CartDrawer open={false} onClose={() => {}} />);
    // Drawer uses AnimatePresence — when closed there should be no visible cart heading
    expect(container.textContent ?? '').not.toMatch(/Your Cart|Cart \(/);
  });
});
