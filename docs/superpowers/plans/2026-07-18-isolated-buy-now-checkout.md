# Isolated Buy Now Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a selected product variant open checkout and create an order without reading or changing the shopper's existing cart.

**Architecture:** A validated `buyNow` query parameter selects one active product variant for checkout display. The checkout form submits that ID as an optional field. The order action reloads the variant server-side, constructs a one-item order snapshot, and skips cart cleanup only in this mode; normal cart checkout remains canonical.

**Tech Stack:** Next.js 15, React 18, Prisma 6, Zod, Vitest.

## Global Constraints

- Never trust price, stock, product name, or cart state supplied by the client.
- `buyNow` accepts a single product variant ID and always uses quantity one.
- Standard checkout continues to create an order from every current cart item and clears the cart on success.
- Buy-now checkout must not add, remove, or change items in the cart.

---

### Task 1: Make the product CTA require a selected variant and navigate to buy-now checkout

**Files:**
- Modify: `components/shared/product/product-view.tsx:30-150`
- Modify: `components/shared/product/purchase-panel.tsx:12-165`
- Create: `tests/product-view-buy-now.test.ts`

**Interfaces:**
- Produces: a selected variant ID lifted from `PurchasePanel` to `ProductView`, and navigation to `/checkout?buyNow=<encoded variant ID>`.
- Consumes: selected active `PanelVariant` and Next.js router navigation.

- [ ] **Step 1: Write failing tests**

Test that Buy now is disabled without a size, then select an in-stock size and click Buy now. Assert the mocked router receives `/checkout?buyNow=variant-1`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/product-view-buy-now.test.ts`

Expected: FAIL because the CTA has no handler or selected-variant contract.

- [ ] **Step 3: Implement minimal interaction**

Lift selected variant state to `ProductView`, pass it to and from `PurchasePanel`, and set the CTA to:

```tsx
disabled={!selectedVariant}
onClick={() => router.push(`/checkout?buyNow=${encodeURIComponent(selectedVariant.id)}`)}
```

- [ ] **Step 4: Run focused test**

Run: `npm test -- tests/product-view-buy-now.test.ts`

Expected: PASS.

### Task 2: Load and display an isolated buy-now checkout

**Files:**
- Modify: `app/(shop)/checkout/page.tsx:15-62`
- Modify: `components/shared/checkout/checkout-form.tsx:24-52`
- Create: `tests/checkout-buy-now.test.ts`

**Interfaces:**
- Consumes: `searchParams.buyNow?: string`, a server-loaded active product variant, and `CartDetails` shape.
- Produces: checkout details containing only the selected variant and submits `buyNowVariantId`.

- [ ] **Step 1: Write failing tests**

Mock Prisma's variant lookup with a cart containing unrelated items. Assert `buyNow=variant-1` renders only variant 1 details and `CheckoutForm` submits `buyNowVariantId: 'variant-1'`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/checkout-buy-now.test.ts`

Expected: FAIL because the page only loads the owner cart.

- [ ] **Step 3: Implement isolated loader**

Accept promised search params in the checkout page. When `buyNow` exists, fetch its active product variant with its colorway, product, and first image; convert that server result to a one-item `CartDetails` record and pass `buyNowVariantId` to `CheckoutForm`. Redirect to the product/catalog if the variant is unavailable. Do not resolve or inspect the cart in this branch.

- [ ] **Step 4: Run focused test**

Run: `npm test -- tests/checkout-buy-now.test.ts`

Expected: PASS.

### Task 3: Create an order from the selected variant without cart cleanup

**Files:**
- Modify: `services/dto/order.dto.ts:3-14`
- Modify: `app/actions/order.ts:31-205`
- Modify: `components/shared/checkout/checkout-form.tsx:45-52`
- Create: `tests/place-order-buy-now.test.ts`

**Interfaces:**
- Consumes: optional `buyNowVariantId?: string` in validated `CheckoutValues`.
- Produces: an order with one server-derived item, stock decrement and sales adjustment for that item, while preserving all cart items.

- [ ] **Step 1: Write failing tests**

Mock a cart with `cartVariant` plus a direct variant `variant-1`. Call `placeOrder({ ...form, buyNowVariantId: 'variant-1' })`, then assert the order item references only `variant-1`, `cartItem.deleteMany` is not called, and stock decrements by one.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/place-order-buy-now.test.ts`

Expected: FAIL because `checkoutSchema` strips the ID and the action uses cart items.

- [ ] **Step 3: Implement server-side order source selection**

Extend `checkoutSchema` with `buyNowVariantId: z.string().cuid().optional()`. When present, reload that variant with active colorway/product, construct an order snapshot from its server price/name/size/image and quantity one, and use its product ID for sales adjustment. Bypass only cart resolution and cleanup in this branch; keep stock, payment, address saving, cancellation, coupon validation, and rollback paths shared.

- [ ] **Step 4: Run focused tests and type check**

Run: `npm test -- tests/place-order-buy-now.test.ts tests/checkout-buy-now.test.ts tests/product-view-buy-now.test.ts && npm run typecheck`

Expected: all tests pass and TypeScript exits with code 0.

- [ ] **Step 5: Commit**

```bash
git add app/(shop)/checkout/page.tsx app/actions/order.ts services/dto/order.dto.ts components/shared/product/product-view.tsx components/shared/product/purchase-panel.tsx components/shared/checkout/checkout-form.tsx tests
git commit -m "feat: add isolated buy now checkout"
```

