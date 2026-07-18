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
const cartState = vi.hoisted(() => ({
  pendingActions: {} as Record<string, { itemId: string; kind: 'quantity' | 'remove'; control?: 'decrease' | 'increase' }>,
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => React.createElement('img', { src, alt }),
}));

vi.mock('@/store', () => ({
  useCartStore: (selector: (state: {
    updateItemQuantity: typeof updateItemQuantity;
    removeCartItem: typeof removeCartItem;
    pendingAction: null;
    pendingActions: typeof cartState.pendingActions;
  }) => unknown) => selector({
    updateItemQuantity,
    removeCartItem,
    pendingAction: null,
    pendingActions: cartState.pendingActions,
  }),
}));

vi.mock('@/components/shared/wishlist/wishlist-heart', () => ({
  WishlistHeart: () => React.createElement('button', { type: 'button' }, 'wishlist'),
}));

afterEach(() => {
  cleanup();
  cartState.pendingActions = {};
});

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

describe('CartLineItem pending actions', () => {
  it('keeps concurrent row removals visibly pending', () => {
    cartState.pendingActions = {
      removeFirst: { itemId: 'cart-item-1', kind: 'remove' },
      removeSecond: { itemId: 'cart-item-2', kind: 'remove' },
    };
    render(React.createElement(React.Fragment, null,
      React.createElement(CartLineItem, { item }),
      React.createElement(CartLineItem, { item: { ...item, id: 'cart-item-2', productId: 'product-2' } }),
    ));

    expect(screen.getAllByRole('status', { name: '\u0423\u0434\u0430\u043b\u044f\u0435\u043c \u0442\u043e\u0432\u0430\u0440' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: '\u0423\u0434\u0430\u043b\u044f\u0435\u043c \u0442\u043e\u0432\u0430\u0440' }).every((button) => button.hasAttribute('disabled'))).toBe(true);
  });

  it('disables and replaces only the initiating quantity control', () => {
    cartState.pendingActions = {
      increase: { itemId: 'cart-item-1', kind: 'quantity', control: 'increase' },
    };
    render(React.createElement(CartLineItem, { item }));

    expect(screen.getByRole('status', { name: '\u041e\u0431\u043d\u043e\u0432\u043b\u044f\u0435\u043c \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e' })).not.toBeNull();
    expect(screen.getByRole('button', { name: '\u041e\u0431\u043d\u043e\u0432\u043b\u044f\u0435\u043c \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: '\u041c\u0435\u043d\u044c\u0448\u0435' }).hasAttribute('disabled')).toBe(false);
    expect(screen.getByRole('button', { name: '\u0423\u0434\u0430\u043b\u0438\u0442\u044c' }).hasAttribute('disabled')).toBe(false);
  });
});
