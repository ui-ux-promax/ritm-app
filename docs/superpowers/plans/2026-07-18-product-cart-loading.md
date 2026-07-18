# Product Add-to-Cart Loading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render a spinner and loading copy while the product-page cart request is in flight.

**Architecture:** `PurchasePanel` already owns the `adding` state around `addCartItem`; this change only presents that state in the current primary button. The cart request, success message, cooldown, and selected-variant behavior remain unchanged.

**Tech Stack:** Next.js 15, React 18, Tailwind CSS, Vitest 2, Testing Library.

## Global Constraints

- Do not change cart-store APIs, product data, cooldown handling, or dependencies.
- While `adding`, the button remains disabled, uses `aria-busy="true"`, and displays a 16px `animate-spin` SVG with `Добавляем`.
- Preserve the existing button dimensions, default copy, and `Добавлено ✓` success state.

---

### Task 1: Present the existing product-page pending state

**Files:**
- Create: `tests/purchase-panel-loading.test.ts`
- Modify: `components/shared/product/purchase-panel.tsx:145-166`

**Interfaces:**
- Consumes: the existing `adding: boolean` state and `addCartItem({ productVariantId: string }): Promise<void>` store action.
- Produces: an `aria-busy` button whose child is a spinner plus `Добавляем` only while its request is unresolved.

- [ ] **Step 1: Write the failing test**

Create a jsdom test for `PurchasePanel`, mocking the cart store, `axios.isAxiosError`, `useCountdown`, `RatingStars`, `ProductAccordions`, and `SizeGuideDialog`. Supply one active `M` variant; make `addCartItem` return an unresolved promise. Select `M`, click `Добавить в корзину`, and assert:

```ts
const button = screen.getByRole('button', { name: 'Добавляем' }) as HTMLButtonElement;
expect(button.disabled).toBe(true);
expect(button.getAttribute('aria-busy')).toBe('true');
expect(button.querySelector('svg.animate-spin')).not.toBeNull();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/purchase-panel-loading.test.ts`

Expected: FAIL because `PurchasePanel` currently leaves the default label visible and has no spinner or `aria-busy`.

- [ ] **Step 3: Write minimal implementation**

On the existing button, add `aria-busy={adding}` and `inline-flex items-center justify-center gap-2` to its class. Give `adding` priority over the existing labels:

```tsx
{adding ? (
  <>
    <svg aria-hidden="true" className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">...</svg>
    Добавляем
  </>
) : added ? 'Добавлено ✓' : cooldown > 0 ? `Подождите ${cooldown} сек` : 'Добавить в корзину'}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/purchase-panel-loading.test.ts`

Expected: PASS.

- [ ] **Step 5: Run required verification**

Run: `npm test -- tests/purchase-panel-loading.test.ts && npm run typecheck`

Expected: the focused suite passes and TypeScript exits with code 0.

- [ ] **Step 6: Commit**

```bash
git add tests/purchase-panel-loading.test.ts components/shared/product/purchase-panel.tsx
git commit -m "feat: show product cart loading state"
```

