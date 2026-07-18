import { create } from 'zustand';
import { Api } from '@/services/api-client';
import { getCartDetails } from '@/lib/cart-details';
import type { CartStateItem, CreateCartItemValues } from '@/services/dto/cart.dto';

export type CartPendingAction = {
  itemId: string;
  kind: 'quantity' | 'remove';
  control?: 'decrease' | 'increase';
};

export interface CartState {
  loading: boolean;
  error: boolean;
  pendingActions: Record<string, CartPendingAction>;
  totalAmount: number;
  items: CartStateItem[];
  fetchCartItems: () => Promise<void>;
  addCartItem: (values: CreateCartItemValues) => Promise<void>;
  updateItemQuantity: (id: string, quantity: number, control?: 'decrease' | 'increase') => Promise<void>;
  removeCartItem: (id: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  error: false,
  pendingActions: {},
  loading: true,
  totalAmount: 0,

  fetchCartItems: async () => {
    try {
      set({ loading: true, error: false });
      const data = await Api.cart.getCart();
      set(getCartDetails(data));
    } catch (e) {
      console.error(e);
      set({ error: true });
    } finally {
      set({ loading: false });
    }
  },

  addCartItem: async (values) => {
    try {
      set({ loading: true, error: false });
      const data = await Api.cart.addCartItem(values);
      set(getCartDetails(data));
    } catch (e) {
      console.error(e);
      set({ error: true });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  updateItemQuantity: async (id, quantity, control) => {
    const action: CartPendingAction = { itemId: id, kind: 'quantity', control };
    const actionKey = `${id}:quantity:${control ?? 'unknown'}`;
    try {
      set((state) => ({ loading: true, error: false, pendingActions: { ...state.pendingActions, [actionKey]: action } }));
      const data = await Api.cart.updateItemQuantity(id, quantity);
      set(getCartDetails(data));
    } catch (e) {
      console.error(e);
      set({ error: true });
    } finally {
      set((state) => {
        const pendingActions = { ...state.pendingActions };
        delete pendingActions[actionKey];
        return { loading: Object.keys(pendingActions).length > 0, pendingActions };
      });
    }
  },

  removeCartItem: async (id) => {
    const actionKey = `${id}:remove`;
    try {
      set((state) => ({ loading: true, error: false, pendingActions: { ...state.pendingActions, [actionKey]: { itemId: id, kind: 'remove' } } }));
      const data = await Api.cart.removeCartItem(id);
      set(getCartDetails(data));
    } catch (e) {
      console.error(e);
      set({ error: true });
    } finally {
      set((state) => {
        const pendingActions = { ...state.pendingActions };
        delete pendingActions[actionKey];
        return { loading: Object.keys(pendingActions).length > 0, pendingActions };
      });
    }
  },
}));
