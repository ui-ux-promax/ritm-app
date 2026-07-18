# Catalog Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give catalog shoppers clear feedback while a selected variant is added to the cart, and distinguish selectable pagination controls with a white surface.

**Architecture:** Keep the add-to-cart request and success state local to `CatalogProductCard`, adding a pending state around the existing store action. Keep pagination URL behavior unchanged; adjust only the reusable non-active button class in `Pagination`.

**Tech Stack:** Next.js 15, React 18, Tailwind CSS, Vitest 2, Testing Library.

## Global Constraints

- Do not change product, cart, or pagination data models and do not add dependencies.
- Pending cart actions disable only their own product-card button, render an accessible spinner, and preserve the button’s dimensions.
- The active pagination page remains dark; selectable page and navigation buttons use `bg-surface`.
- Retain existing page-navigation and cart-success behavior.

---

### Task 1: Expose the product-card pending state

**Files:**
- Modify: `tests/catalog-product-card.test.ts:9-79`
- Modify: `components/shared/catalog/catalog-product-card.tsx:35-174`

**Interfaces:**
- Consumes: `addCartItem({ productVariantId: string }): Promise<unknown>` from `useCartStore`.
- Produces: a button with `disabled`, `aria-busy="true"`, an `animate-spin` SVG, and the `Добавляем` label until `addCartItem` settles.

- [ ] **Step 1: Write the failing test**

Add this test after the selected-colour test:

```ts
it('disables the add-to-cart button and shows its loading label while the request is pending', () => {
  let resolveAdd!: () => void;
  addCartItem.mockReturnValueOnce(new Promise<void>((resolve) => { resolveAdd = resolve; }));
  render(React.createElement(CatalogProductCard, { data }));

  fireEvent.click(screen.getByRole('button', { name: 'S' }));
  fireEvent.click(screen.getByRole('button', { name: 'Добавить в корзину' }));

  const button = screen.getByRole('button', { name: 'Добавляем' });
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('aria-busy', 'true');
  expect(button.querySelector('svg.animate-spin')).not.toBeNull();
  resolveAdd();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/catalog-product-card.test.ts`

Expected: FAIL because the card currently has no pending state, `aria-busy`, loading copy, or spinner.

- [ ] **Step 3: Write minimal implementation**

Add state and make the existing handler set and clear it around `addCartItem`:

```tsx
const [isAdding, setIsAdding] = useState(false);

const handleAddToCart = async () => {
  if (!selectedVariant?.inStock || isAdding) return;
  setIsAdding(true);
  try {
    await addCartItem({ productVariantId: selectedVariant.variantId });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  } catch {
    /* store sets error */
  } finally {
    setIsAdding(false);
  }
};
```

Update the action button to merge the existing unavailable and pending disabled conditions. Set `aria-busy={isAdding}`, add `inline-flex items-center justify-center gap-2` to its class, and render this before the existing added/default labels when pending:

```tsx
<>
  <svg aria-hidden="true" className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
  Добавляем
</>
```

- [ ] **Step 4: Run focused test to verify it passes**

Run: `npm test -- tests/catalog-product-card.test.ts`

Expected: PASS with the new pending-state assertion and all existing card tests green.

- [ ] **Step 5: Commit**

```bash
git add tests/catalog-product-card.test.ts components/shared/catalog/catalog-product-card.tsx
git commit -m "feat: show catalog cart loading state"
```

### Task 2: Give selectable pagination controls a white surface

**Files:**
- Create: `tests/catalog-pagination.test.ts`
- Modify: `components/shared/catalog/pagination.tsx:5-20`

**Interfaces:**
- Consumes: `Pagination({ page: number; totalPages: number })` and `setPage(page: number)` from `useCatalogUrl`.
- Produces: non-active page and enabled navigation buttons with `bg-surface`; the active page continues to use `bg-ink text-white`.

- [ ] **Step 1: Write the failing test**

Create `tests/catalog-pagination.test.ts`:

```ts
/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from '@/components/shared/catalog/pagination';

vi.mock('@/hooks/use-catalog-url', () => ({ useCatalogUrl: () => ({ setPage: vi.fn() }) }));

describe('Pagination', () => {
  it('uses a white surface for controls that can be selected', () => {
    render(React.createElement(Pagination, { page: 1, totalPages: 2 }));

    expect(screen.getByRole('button', { name: '2' }).className).toContain('bg-surface');
    expect(screen.getByRole('button', { name: 'Вперёд' }).className).toContain('bg-surface');
    expect(screen.getByRole('button', { name: '1' }).className).toContain('bg-ink');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/catalog-pagination.test.ts`

Expected: FAIL because the shared selectable-control class does not include `bg-surface`.

- [ ] **Step 3: Write minimal implementation**

Change the `cell` constant in `Pagination`:

```tsx
const cell = 'w-9 h-9 grid place-items-center rounded-lg border border-line bg-surface hover:border-ink tnum';
```

- [ ] **Step 4: Run focused test to verify it passes**

Run: `npm test -- tests/catalog-pagination.test.ts`

Expected: PASS with active-page styling unchanged and selectable page/next controls using `bg-surface`.

- [ ] **Step 5: Run required verification**

Run: `npm test -- tests/catalog-product-card.test.ts tests/catalog-pagination.test.ts && npm run typecheck`

Expected: both focused suites pass and TypeScript exits with code 0.

- [ ] **Step 6: Commit**

```bash
git add tests/catalog-pagination.test.ts components/shared/catalog/pagination.tsx
git commit -m "style: clarify catalog pagination controls"
```

