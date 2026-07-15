/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CatalogProductCard } from '@/components/shared/catalog/catalog-product-card';
import type { ProductCardData } from '@/lib/product-summary';

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => React.createElement('img', { src, alt }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href, ...props }, children),
}));

vi.mock('@/store', () => ({
  useCartStore: () => vi.fn(),
}));

vi.mock('@/components/shared/wishlist/wishlist-heart', () => ({
  WishlistHeart: () => React.createElement('button', { type: 'button' }, 'wishlist'),
}));

const data: ProductCardData = {
  id: 'product-1',
  slug: 'cables-cardigan',
  name: 'CABLES',
  brand: 'RITM',
  categoryName: 'Knitwear',
  imageUrl: '/images/graphite.jpg',
  imageAlt: 'CABLES cardigan',
  minPrice: 5500,
  minCompareAtPrice: null,
  badges: [],
  soldOut: false,
  colorways: [
    { id: 'cw-graphite', name: 'Graphite', swatchHex: '#4b5563', imageUrl: '/images/graphite.jpg' },
    { id: 'cw-terracotta', name: 'Terracotta', swatchHex: '#b9654b', imageUrl: '/images/terracotta.jpg' },
  ],
  sizes: [],
};

describe('CatalogProductCard', () => {
  it('changes the product image when a colorway is selected', async () => {
    render(React.createElement(CatalogProductCard, { data }));

    expect(screen.getByAltText('CABLES cardigan').getAttribute('src')).toBe('/images/graphite.jpg');

    fireEvent.click(screen.getByRole('button', { name: 'Terracotta' }));

    expect(screen.getByAltText('CABLES cardigan').getAttribute('src')).toBe('/images/terracotta.jpg');
  });
});
