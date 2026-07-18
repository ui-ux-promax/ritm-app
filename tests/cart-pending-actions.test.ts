import { afterEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  updateItemQuantity: vi.fn(),
  removeCartItem: vi.fn(),
}));

vi.mock('@/services/api-client', () => ({
  Api: { cart: api },
}));

vi.mock('@/lib/cart-details', () => ({
  getCartDetails: () => ({ items: [], totalAmount: 0 }),
}));

import { useCartStore } from '@/store/cart';

afterEach(() => {
  useCartStore.setState({ pendingActions: {}, loading: false, error: false });
  api.updateItemQuantity.mockReset();
  api.removeCartItem.mockReset();
});

describe('cart pending actions', () => {
  it('keeps another row pending when the first concurrent request settles', async () => {
    let resolveFirst: (value: unknown) => void;
    let resolveSecond: (value: unknown) => void;
    api.updateItemQuantity
      .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }))
      .mockImplementationOnce(() => new Promise((resolve) => { resolveSecond = resolve; }));

    const first = useCartStore.getState().updateItemQuantity('item-a', 2, 'increase');
    const second = useCartStore.getState().updateItemQuantity('item-b', 3, 'decrease');

    try {
      expect(Object.values(useCartStore.getState().pendingActions)).toEqual([
        { itemId: 'item-a', kind: 'quantity', control: 'increase' },
        { itemId: 'item-b', kind: 'quantity', control: 'decrease' },
      ]);

      resolveFirst!({});
      await first;
      expect(Object.values(useCartStore.getState().pendingActions)).toEqual([
        { itemId: 'item-b', kind: 'quantity', control: 'decrease' },
      ]);
    } finally {
      resolveFirst!({});
      resolveSecond!({});
      await Promise.all([first, second]);
    }
  });
});
