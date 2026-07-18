// @vitest-environment jsdom

import * as React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PurchasePanel } from '@/components/shared/product/purchase-panel';

const addCartItem = vi.hoisted(() => vi.fn());

vi.mock('@/store', () => ({
  useCartStore: (selector: (state: { addCartItem: typeof addCartItem }) => unknown) => selector({ addCartItem }),
}));

vi.mock('@/components/shared/product/rating-stars', () => ({ RatingStars: () => null }));
vi.mock('@/components/shared/product/product-accordions', () => ({ ProductAccordions: () => null }));
vi.mock('@/components/shared/product/size-guide-dialog', () => ({ SizeGuideDialog: () => null }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((next) => {
    resolve = next;
  });
  return { promise, resolve };
}

function renderPanel() {
  return render(React.createElement(PurchasePanel, {
    productName: 'CABLES',
    colorways: [{ slug: 'graphite', name: 'Graphite', swatchHex: '#333', thumbUrl: null }],
    activeColorwaySlug: 'graphite',
    activeColorwayName: 'Graphite',
    variants: [{ id: 'variant-s', size: 'S', stock: 2, active: true, price: 5500, compareAtPrice: null }],
    fitNote: null,
    productSlug: 'cables',
    description: null,
    specs: null,
    ratingAvg: null,
    ratingCount: 0,
    onColorChange: vi.fn(),
  }));
}

describe('PurchasePanel loading style', () => {
  it('applies the muted style only for the pending add request', async () => {
    const request = deferred();
    addCartItem.mockReturnValue(request.promise);
    renderPanel();

    const addButton = screen.getByRole('button', { name: 'Добавить в корзину' });
    expect(addButton.hasAttribute('disabled')).toBe(true);
    expect(addButton.className.split(/\s+/)).not.toContain('disabled:opacity-50');

    fireEvent.click(screen.getByRole('button', { name: 'S' }));
    fireEvent.click(screen.getByRole('button', { name: 'Добавить в корзину' }));

    const pendingButton = screen.getByRole('button', { name: 'Добавляем в корзину' });
    expect(pendingButton.className.split(/\s+/)).toContain('opacity-50');
    expect(pendingButton.className.split(/\s+/)).not.toContain('disabled:opacity-50');

    await act(async () => request.resolve());
    await waitFor(() => expect(pendingButton.getAttribute('aria-busy')).not.toBe('true'));
  });
});
