# Product Specifications Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the existing admin-managed product specifications immediately after the product description on the product page.

**Architecture:** The server page already reads `product.specs`; it will pass a normalized record through `ProductView` and `PurchasePanel` to `ProductAccordions`. The accordion component will render a semantic two-column definition list only when at least one specification exists.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Vitest.

## Global Constraints

- Reuse the existing `specs` values saved by the admin product form.
- Render the specifications accordion after description and before delivery/payment.
- Do not render an empty specifications accordion.

---

### Task 1: Cover the product specifications flow

**Files:**
- Modify: `tests/product-view-color-selection.test.ts`
- Create: `tests/product-accordions.test.ts`

**Interfaces:**
- Consumes: `ProductAccordions({ description, specs })`.
- Produces: regression tests proving specifications are passed to the view and conditionally rendered.

- [ ] **Step 1: Write the failing tests**

```ts
expect(source).toContain('specs={product.specs}');
expect(source).toContain('<span>Характеристики</span>');
expect(source).toContain('Object.entries(specs)');
```

- [ ] **Step 2: Run the focused tests and confirm failure**

Run: `npm test -- tests/product-accordions.test.ts tests/product-view-color-selection.test.ts`

Expected: FAIL because `specs` is not passed into the accordion component.

### Task 2: Render specifications in the purchase panel

**Files:**
- Modify: `app/(shop)/product/[slug]/page.tsx`
- Modify: `components/shared/product/product-view.tsx`
- Modify: `components/shared/product/purchase-panel.tsx`
- Modify: `components/shared/product/product-accordions.tsx`

**Interfaces:**
- Consumes: `product.specs` as `Record<string, string> | null`.
- Produces: `ProductAccordions({ description, specs })` with an optional details section.

- [ ] **Step 1: Pass the JSON record to `ProductView`**

```tsx
product={{ ...product, specs }}
```

- [ ] **Step 2: Extend the panel props and forward specifications**

```tsx
<ProductAccordions description={description} specs={specs} />
```

- [ ] **Step 3: Render the definition list under the description**

```tsx
{specs && Object.keys(specs).length > 0 && (
  <details className="group border-t border-line">
    <summary><span>Характеристики</span></summary>
    <dl>{Object.entries(specs).map(([key, value]) => <div key={key}>...</div>)}</dl>
  </details>
)}
```

### Task 3: Verify the completed flow

**Files:**
- Test: `tests/product-accordions.test.ts`
- Test: `tests/product-view-color-selection.test.ts`

**Interfaces:**
- Consumes: the updated product page and presentation components.
- Produces: verified TypeScript and test coverage.

- [ ] **Step 1: Run focused tests**

Run: `npm test -- tests/product-accordions.test.ts tests/product-view-color-selection.test.ts`

Expected: PASS.

- [ ] **Step 2: Run complete verification**

Run: `npm run typecheck; npm test; git diff --check`

Expected: all commands exit with code 0.
