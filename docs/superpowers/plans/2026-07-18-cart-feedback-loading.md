# Cart Feedback Loading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show item-local loading feedback while changing a cart quantity or adding a related product.

**Architecture:** `CartLineItem` owns a pending state around its existing quantity mutation. `CartRelatedGrid` owns the pending product ID for its existing cart action. Neither change alters Zustand store methods, cart data, or global loading state.

**Tech Stack:** Next.js 15, React 18, Tailwind CSS, Zustand, Vitest 2, Testing Library.

## Global Constraints

- Do not change cart API routes, state-store interfaces, data models, or add dependencies.
- Only the action that initiated a request is disabled while pending.
- Pending controls expose `aria-busy="true"`, and retain their surrounding dimensions.
- Failed requests restore the normal controls; other cart rows/cards stay interactive.

---

### Task 1: Render pending feedback for one cart-line quantity update

**Files:**
- Create: `tests/cart-line-item.test.ts`
- Modify: `components/shared/cart/cart-line-item.tsx:1-76`

**Interfaces:**
- Consumes: `updateItemQuantity(itemId: string, quantity: number): Promise<unknown>` from `useCartStore`.
- Produces: disabled plus/minus buttons and a centered `animate-spin` SVG while the selected line's request is unresolved.

- [ ] **Step 1: Write the failing test**

Create `tests/cart-line-item.test.ts` with a pending store promise, mocks for `next/image` and `WishlistHeart`, then assert that clicking `Больше` disables both stepper buttons and replaces quantity `1` with a spinner:

```ts
it('shows a local spinner while increasing its quantity', () => {
  updateItemQuantity.mockReturnValueOnce(pending.promise);
  render(React.createElement(CartLineItem, { item }));

  fireEvent.click(screen.getByRole('button', { name: 'Больше' }));

  expect(screen.getByRole('button', { name: 'Меньше' }).disabled).toBe(true);
  expect(screen.getByRole('button', { name: 'Больше' }).disabled).toBe(true);
  expect(screen.getByLabelText('Обновляем количество').querySelector('svg.animate-spin')).not.toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/cart-line-item.test.ts`

Expected: FAIL because the current line item neither tracks an in-flight update nor renders the spinner.

- [ ] **Step 3: Write minimal implementation**

Wrap the existing quantity action with local state and use it for both stepper buttons:

```tsx
const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);

const updateQuantity = async (quantity: number) => {
  if (isUpdatingQuantity) return;
  setIsUpdatingQuantity(true);
  try {
    await updateItemQuantity(item.id, quantity);
  } finally {
    setIsUpdatingQuantity(false);
  }
};
```

Make `dec` and `inc` call `void updateQuantity(...)`. Add `isUpdatingQuantity` to each disabled condition. Replace the quantity span content while pending with:

```tsx
<span aria-label="Обновляем количество" className="min-w-[30px] grid place-items-center">
  <svg aria-hidden="true" className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">...</svg>
</span>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/cart-line-item.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/cart-line-item.test.ts components/shared/cart/cart-line-item.tsx
git commit -m "feat: show cart quantity loading state"
```

### Task 2: Render pending feedback for one related-product add button

**Files:**
- Create: `tests/cart-related-grid.test.ts`
- Modify: `components/shared/cart/cart-related-grid.tsx:1-57`

**Interfaces:**
- Consumes: `addCartItem({ productVariantId: string }): Promise<unknown>` from `useCartStore`.
- Produces: a per-product pending button ID; the active related-card button disables and shows a spinner instead of its plus icon.

- [ ] **Step 1: Write the failing test**

Create `tests/cart-related-grid.test.ts`, mocking `next/image`, `next/link`, and `useCartStore`. Render one product with an in-stock variant, return an unresolved promise from `addCartItem`, click `Добавить Hoodie`, and assert:

```ts
const button = screen.getByRole('button', { name: 'Добавить Hoodie' });
expect(button.disabled).toBe(true);
expect(button.getAttribute('aria-busy')).toBe('true');
expect(button.querySelector('svg.animate-spin')).not.toBeNull();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/cart-related-grid.test.ts`

Expected: FAIL because the plus button does not have a pending state or spinner.

- [ ] **Step 3: Write minimal implementation**

Add `const [addingProductId, setAddingProductId] = useState<string | null>(null);`. Derive `isAdding = addingProductId === p.id`, return early when another product is pending, and wrap the existing `addCartItem` call:

```tsx
setAddingProductId(p.id);
try {
  await addCartItem({ productVariantId: variant.variantId });
} catch {
  /* store sets error */
} finally {
  setAddingProductId(null);
}
```

Set the clicked button's `disabled={isAdding}` and `aria-busy={isAdding}`; render a 16px `animate-spin` SVG instead of the existing plus SVG when `isAdding`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/cart-related-grid.test.ts`

Expected: PASS.

- [ ] **Step 5: Run required verification**

Run: `npm test -- tests/cart-line-item.test.ts tests/cart-related-grid.test.ts && npm run typecheck`

Expected: both suites pass and TypeScript exits with code 0.

- [ ] **Step 6: Commit**

```bash
git add tests/cart-related-grid.test.ts components/shared/cart/cart-related-grid.tsx
git commit -m "feat: show related cart loading state"
```

