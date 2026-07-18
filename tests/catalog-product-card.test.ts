/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CatalogProductCard } from '@/components/shared/catalog/catalog-product-card';
import type { ProductCardData } from '@/lib/product-summary';

const addCartItem = vi.hoisted(() => vi.fn());

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => React.createElement('img', { src, alt }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href, ...props }, children),
}));

vi.mock('@/store', () => ({
  useCartStore: (selector: (state: { addCartItem: typeof addCartItem }) => unknown) => selector({ addCartItem }),
}));

vi.mock('@/components/shared/wishlist/wishlist-heart', () => ({
  WishlistHeart: () => React.createElement('button', { type: 'button' }, 'wishlist'),
}));

afterEach(() => {
  cleanup();
  addCartItem.mockClear();
});

const data: ProductCardData = {
  id: 'product-1',
  slug: 'cables-cardigan',
  name: 'CABLES',
  brand: 'RITM',
  categoryName: 'Knitwear',
  imageUrl: '/images/graphite.jpg',
  imageAlt: 'CABLES cardigan',
  minPrice: 5500,
  minCompareAtPrice: 6000,
  badges: [],
  soldOut: false,
  colorways: [
    {
      id: 'cw-graphite',
      name: 'Graphite',
      swatchHex: '#4b5563',
      imageUrl: '/images/graphite.jpg',
      variants: [{ size: 'S', sizeOrder: 2, inStock: true, variantId: 'variant-graphite-s' }],
    },
    {
      id: 'cw-terracotta',
      name: 'Terracotta',
      swatchHex: '#b9654b',
      imageUrl: '/images/terracotta.jpg',
      variants: [{ size: 'S', sizeOrder: 2, inStock: true, variantId: 'variant-terracotta-s' }],
    },
  ],
  sizes: [{ size: 'S', sizeOrder: 2, inStock: true, variantId: 'variant-graphite-s' }],
};

describe('CatalogProductCard', () => {
  it('shows the previous price when the product is discounted', () => {
    render(React.createElement(CatalogProductCard, { data }));

    expect(screen.getByText(/6[\s\u00a0]000 ₽/).className).toContain('self-end');
  });

  it('changes the product image when a colorway is selected', async () => {
    render(React.createElement(CatalogProductCard, { data }));

    expect(screen.getByAltText('CABLES cardigan').getAttribute('src')).toBe('/images/graphite.jpg');

    fireEvent.click(screen.getByRole('button', { name: 'Terracotta' }));

    expect(screen.getByAltText('CABLES cardigan').getAttribute('src')).toBe('/images/terracotta.jpg');
  });

  it('adds the variant for the selected colorway and size', () => {
    addCartItem.mockResolvedValue(undefined);
    render(React.createElement(CatalogProductCard, { data }));

    fireEvent.click(screen.getByRole('button', { name: 'Terracotta' }));
    fireEvent.click(screen.getByRole('button', { name: 'S' }));
    fireEvent.click(screen.getAllByRole('button').find((button) => button.textContent?.includes('Добавить'))!);

    expect(addCartItem).toHaveBeenCalledWith({ productVariantId: 'variant-terracotta-s' });
  });

  it('shows a busy, disabled add action while the catalog request is pending', async () => {
    let resolveAdd: () => void;
    addCartItem.mockReturnValue(new Promise<void>((resolve) => { resolveAdd = resolve; }));
    render(React.createElement(CatalogProductCard, { data }));

    fireEvent.click(screen.getByRole('button', { name: 'S' }));
    fireEvent.click(screen.getByRole('button', { name: '\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0432 \u043a\u043e\u0440\u0437\u0438\u043d\u0443' }));

    const pendingButton = await screen.findByRole('button', { name: '\u0414\u043e\u0431\u0430\u0432\u043b\u044f\u0435\u043c \u0432 \u043a\u043e\u0440\u0437\u0438\u043d\u0443' });
    expect(pendingButton.hasAttribute('disabled')).toBe(true);
    expect(pendingButton.getAttribute('aria-busy')).toBe('true');
    expect(screen.getByRole('status', { name: '\u0414\u043e\u0431\u0430\u0432\u043b\u044f\u0435\u043c \u0432 \u043a\u043e\u0440\u0437\u0438\u043d\u0443' })).not.toBeNull();

    resolveAdd!();
  });
});
