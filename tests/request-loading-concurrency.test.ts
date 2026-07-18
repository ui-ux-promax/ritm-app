// @vitest-environment jsdom

import * as React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WishlistHeart } from '@/components/shared/wishlist/wishlist-heart';
import { CartRelatedGrid } from '@/components/shared/cart/cart-related-grid';
import type { ProductCardData } from '@/lib/product-summary';

const mocks = vi.hoisted(() => ({
  toggleWishlist: vi.fn(),
  addCartItem: vi.fn(),
  increment: vi.fn(),
  decrement: vi.fn(),
  fetchCount: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => React.createElement('img', { src, alt }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href, ...props }, children),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));

vi.mock('@/app/actions/wishlist', () => ({
  toggleWishlist: mocks.toggleWishlist,
}));

vi.mock('@/store', () => ({
  useWishlistStore: (selector: (state: typeof mocks) => unknown) => selector(mocks),
  useCartStore: (selector: (state: typeof mocks) => unknown) => selector(mocks),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((next) => {
    resolve = next;
  });
  return { promise, resolve };
}

function relatedProduct(id: string): ProductCardData {
  return {
    id,
    slug: id,
    name: id.toUpperCase(),
    brand: 'RITM',
    categoryName: 'Knitwear',
    imageUrl: `/${id}.jpg`,
    imageAlt: id,
    minPrice: 5500,
    minCompareAtPrice: null,
    badges: [],
    soldOut: false,
    colorways: [],
    sizes: [{ size: 'S', sizeOrder: 1, inStock: true, variantId: `${id}-variant` }],
  };
}

describe('request loading concurrency', () => {
  it('keeps a wishlist heart busy for the full server request', async () => {
    const request = deferred<{ ok: true; active: true }>();
    mocks.toggleWishlist.mockReturnValue(request.promise);
    render(React.createElement(WishlistHeart, { productId: 'product-1', initialActive: false }));

    fireEvent.click(screen.getByRole('button', { name: 'В избранное' }));

    const button = screen.getByRole('button', { name: 'Обновляем избранное' });
    expect(button.getAttribute('aria-busy')).toBe('true');
    await act(async () => Promise.resolve());
    expect(button.getAttribute('aria-busy')).toBe('true');

    await act(async () => request.resolve({ ok: true, active: true }));
    await waitFor(() => expect(button.getAttribute('aria-busy')).not.toBe('true'));
  });

  it('keeps concurrent related-product adds busy until each request settles', async () => {
    const first = deferred<void>();
    const second = deferred<void>();
    mocks.addCartItem
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    render(React.createElement(CartRelatedGrid, { items: [relatedProduct('first'), relatedProduct('second')] }));

    const firstButton = screen.getByRole('button', { name: 'Добавить FIRST' });
    const secondButton = screen.getByRole('button', { name: 'Добавить SECOND' });
    fireEvent.click(firstButton);
    fireEvent.click(secondButton);

    await waitFor(() => {
      expect(firstButton.getAttribute('aria-busy')).toBe('true');
      expect(secondButton.getAttribute('aria-busy')).toBe('true');
    });

    await act(async () => first.resolve());
    await waitFor(() => expect(firstButton.getAttribute('aria-busy')).not.toBe('true'));
    expect(secondButton.getAttribute('aria-busy')).toBe('true');

    await act(async () => second.resolve());
    await waitFor(() => expect(secondButton.getAttribute('aria-busy')).not.toBe('true'));
  });
});
