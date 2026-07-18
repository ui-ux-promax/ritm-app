/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CartLineItem } from '@/components/shared/cart/cart-line-item';
import type { CartStateItem } from '@/services/dto/cart.dto';

const updateItemQuantity = vi.hoisted(() => vi.fn());
const removeCartItem = vi.hoisted(() => vi.fn());

vi.stubGlobal('React', React);

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => React.createElement('img', { src, alt }),
}));

vi.mock('@/store', () => ({
  useCartStore: (selector: (state: {
    updateItemQuantity: typeof updateItemQuantity;
    removeCartItem: typeof removeCartItem;
    pendingAction: { itemId: string; kind: 'quantity' | 'remove' } | null;
  }) => unknown) => selector({
    updateItemQuantity,
    removeCartItem,
    pendingAction: { itemId: 'cart-item-1', kind: 'remove' },
  }),
}));

vi.mock('@/components/shared/wishlist/wishlist-heart', () => ({
  WishlistHeart: () => React.createElement('button', { type: 'button' }, 'wishlist'),
}));

afterEach(cleanup);

const item: CartStateItem = {
  id: 'cart-item-1',
  productId: 'product-1',
  quantity: 2,
  name: 'CABLES',
  productSlug: 'cables-cardigan',
  colorwayName: 'Graphite',
  size: 'S',
  imageUrl: '/images/graphite.jpg',
  unitPrice: 5500,
  lineTotal: 11000,
  stock: 3,
  available: true,
};

describe('CartLineItem pending removal', () => {
  it('shows a labelled remove spinner and disables the active row controls', () => {
    render(React.createElement(CartLineItem, { item }));

    expect(screen.getByRole('status', { name: '\u0423\u0434\u0430\u043b\u044f\u0435\u043c \u0442\u043e\u0432\u0430\u0440' })).not.toBeNull();
    expect(screen.getByRole('button', { name: '\u0423\u0434\u0430\u043b\u044f\u0435\u043c \u0442\u043e\u0432\u0430\u0440' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: '\u041c\u0435\u043d\u044c\u0448\u0435' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: '\u0411\u043e\u043b\u044c\u0448\u0435' }).hasAttribute('disabled')).toBe(true);
  });
});
