# Async Button Loading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the design-system spinner and disable every relevant async action while its request is in flight.

**Architecture:** Existing customer and admin `Button` components stay canonical. Native customer buttons receive `Loader2`, `aria-busy`, and their local pending state. Cart mutations gain per-action state so the exact icon being processed shows progress.

**Tech Stack:** Next.js 15, React 18, TypeScript, Tailwind CSS, Zustand, lucide-react, Vitest, Testing Library.

## Global Constraints

- Preserve current request, error, cooldown, success and redirect behavior.
- A loading action must be disabled, visually muted, have `aria-busy="true"`, and contain a labelled spinner.
- Do not change static stock/validation disabled states or pagination.
- Reuse `Loader2`; do not add a dependency or second spinner design.

---

### Task 1: Complete shared Button loading semantics

**Files:**
- Modify: `components/ui/button.tsx:33-45`
- Modify: `components/admin/ui/button.tsx:45-60`
- Create: `tests/button-loading.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
/** @vitest-environment jsdom */
it('disables a loading button and exposes busy state', () => {
  render(React.createElement(Button, { loading: true }, 'Save'));
  expect(screen.getByRole('button')).toBeDisabled();
  expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  expect(screen.getByRole('status', { name: 'Загрузка' })).toBeInTheDocument();
});
```

- [ ] **Step 2: Verify red**

Run: `npm test -- tests/button-loading.test.ts`  
Expected: FAIL because the current Button has no accessible busy state.

- [ ] **Step 3: Implement**

On both Button components add `aria-busy={loading || undefined}` beside `disabled={disabled || loading}`. Give the existing `Loader2` `role="status"` and `aria-label="Загрузка"`; retain its present dimensions and all existing classes.

- [ ] **Step 4: Verify green**

Run: `npm test -- tests/button-loading.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/ui/button.tsx components/admin/ui/button.tsx tests/button-loading.test.ts
git commit -m "feat: expose shared button loading state"
```

### Task 2: Add loaders to native checkout and authentication submits

**Files:**
- Modify: `components/shared/checkout/checkout-form.tsx:1,243-249`
- Modify: `components/shared/auth/login-form.tsx:1,88-94`
- Modify: `components/shared/auth/register-form.tsx:1,97-103`
- Modify: `components/shared/auth/auth-card.tsx:1,197-202,238-244`
- Create: `tests/auth-submit-loading.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
it('disables login while sign-in is pending', async () => {
  signIn.mockReturnValue(new Promise(() => {}));
  render(React.createElement(LoginForm));
  fireEvent.submit(screen.getByRole('button', { name: 'Войти' }).closest('form')!);
  const button = await screen.findByRole('button', { name: 'Вход выполняется' });
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('aria-busy', 'true');
});
```

- [ ] **Step 2: Verify red**

Run: `npm test -- tests/auth-submit-loading.test.ts`  
Expected: FAIL because the current branch changes only text.

- [ ] **Step 3: Implement**

Import `Loader2`. In each native submit, replace only the submitting branch with `<Loader2 className="h-5 w-5 animate-spin" role="status" aria-label="Загрузка" />`, set `aria-busy={isSubmitting || undefined}`, and use action labels `Оформляем заказ`, `Вход выполняется`, or `Создаём аккаунт`. Preserve arrows, normal copy, and registration cooldown behavior.

- [ ] **Step 4: Verify green**

Run: `npm test -- tests/auth-submit-loading.test.ts tests/place-order.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/shared/checkout/checkout-form.tsx components/shared/auth/login-form.tsx components/shared/auth/register-form.tsx components/shared/auth/auth-card.tsx tests/auth-submit-loading.test.ts
git commit -m "feat: show loading spinners on checkout and auth"
```

### Task 3: Add per-control loading to product, wishlist and cart requests

**Files:**
- Modify: `components/shared/product/purchase-panel.tsx:1,35-54,151-163`
- Modify: `components/shared/catalog/catalog-product-card.tsx:1,62-78,153-171`
- Modify: `components/shared/cart/cart-related-grid.tsx:1,9-48`
- Modify: `components/shared/wishlist/wishlist-heart.tsx:1,20-112`
- Modify: `store/cart.ts:5-73`
- Modify: `components/shared/cart/cart-line-item.tsx:1,10-74`
- Modify: `tests/catalog-product-card.test.ts`
- Create: `tests/cart-line-item-loading.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
it('disables the chosen card add button while adding', async () => {
  addCartItem.mockReturnValue(new Promise(() => {}));
  render(React.createElement(CatalogProductCard, { data }));
  fireEvent.click(screen.getByRole('button', { name: 'S' }));
  fireEvent.click(screen.getByRole('button', { name: /Добавить в корзину/ }));
  expect(screen.getByRole('button', { name: 'Добавляем в корзину' })).toBeDisabled();
});
```

- [ ] **Step 2: Verify red**

Run: `npm test -- tests/catalog-product-card.test.ts tests/cart-line-item-loading.test.ts`  
Expected: FAIL because card adds lack local state and cart rows cannot identify the pending operation.

- [ ] **Step 3: Implement**

Add `pendingAction: { itemId: string; kind: 'quantity' | 'remove' } | null` to `CartState` and set it before each relevant API call; clear it in `finally`. In CartLineItem, render a labelled Loader2 only for the matching remove or quantity icon. Add local `adding` state around `await addCartItem` in all three add-to-cart views; disable and render Loader2 on the originating action. In WishlistHeart set `disabled={pending}`, `aria-busy`, and replace the heart with Loader2 during its transition.

- [ ] **Step 4: Verify green**

Run: `npm test -- tests/catalog-product-card.test.ts tests/cart-line-item-loading.test.ts tests/toggle-wishlist.test.ts tests/cart.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add store/cart.ts components/shared/product/purchase-panel.tsx components/shared/catalog/catalog-product-card.tsx components/shared/cart/cart-related-grid.tsx components/shared/cart/cart-line-item.tsx components/shared/wishlist/wishlist-heart.tsx tests/catalog-product-card.test.ts tests/cart-line-item-loading.test.ts
git commit -m "feat: show request state on product and cart actions"
```

### Task 4: Finish secondary customer request indicators

**Files:**
- Modify: `components/shared/auth/verification-gate.tsx:1,40-72,91-99`
- Modify: `components/shared/profile/profile-view.tsx:786-1154`
- Modify: `components/shared/promo-code-field.tsx:55-62`
- Modify: `components/shared/newsletter-form.tsx:30-37`
- Create: `tests/verification-gate-loading.test.ts`

- [ ] **Step 1: Write the failing resend test**

```ts
it('blocks resend while the request is pending', async () => {
  resendVerificationCode.mockReturnValue(new Promise(() => {}));
  render(React.createElement(VerificationGate, { email: 'a@example.com' }));
  fireEvent.click(screen.getByRole('button', { name: 'Отправить код снова' }));
  expect(await screen.findByRole('button', { name: 'Отправляем код' })).toBeDisabled();
});
```

- [ ] **Step 2: Verify red**

Run: `npm test -- tests/verification-gate-loading.test.ts`  
Expected: FAIL because resend has cooldown but no pending state.

- [ ] **Step 3: Implement**

Add `resending` and a `try/finally` around resend; disable while resending or cooling down and show Loader2 while resending. Replace PromoCodeField's custom span with labelled Loader2 and set `aria-busy`. Remove NewsletterForm's loading ellipsis because enhanced shared Button supplies its spinner. Update ProfileView's local Submit helper with the Task 1 busy/Loader2 contract; shared Button users already inherit it.

- [ ] **Step 4: Verify green**

Run: `npm test -- tests/verification-gate-loading.test.ts tests/promo-code-field.test.ts tests/submit-review.test.ts tests/cancel-order.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/shared/auth/verification-gate.tsx components/shared/profile/profile-view.tsx components/shared/promo-code-field.tsx components/shared/newsletter-form.tsx tests/verification-gate-loading.test.ts
git commit -m "feat: cover secondary customer loading actions"
```

### Task 5: Cover admin row actions and verify the whole change

**Files:**
- Modify: `app/(admin)/admin/catalog/categories/_components/category-table.tsx:96-174`
- Modify: `app/(admin)/admin/marketing/_components/coupon-table.tsx:84-141`
- Create: `tests/admin-button-loading.test.ts`
- Modify: `e2e/cart.spec.ts`

- [ ] **Step 1: Write the failing contract test**

```ts
it('marks a pending category move as busy', () => {
  const source = readFileSync('app/(admin)/admin/catalog/categories/_components/category-table.tsx', 'utf8');
  expect(source).toContain('aria-busy={pending === row.id || undefined}');
  expect(source).toContain('role="status"');
});
```

- [ ] **Step 2: Verify red**

Run: `npm test -- tests/admin-button-loading.test.ts`  
Expected: FAIL because row controls only become disabled.

- [ ] **Step 3: Implement**

Import Loader2. Replace the pending category move arrow with a labelled Loader2 and set `aria-busy`; beside a pending coupon switch show a small labelled Loader2. Do not alter pagination or menu buttons. Forms, deletes, upload, roles, order actions already use shared Button `loading`.

- [ ] **Step 4: Verify green and integration**

Run: `npm test -- tests/button-loading.test.ts tests/auth-submit-loading.test.ts tests/catalog-product-card.test.ts tests/cart-line-item-loading.test.ts tests/verification-gate-loading.test.ts tests/admin-button-loading.test.ts && npm run typecheck && npm test`  
Expected: all commands exit 0.

Run: `npx playwright test e2e/cart.spec.ts`  
Expected: PASS; defer the add endpoint through the existing test helper and assert that the initiating add control is disabled while it waits.

- [ ] **Step 5: Commit**

```bash
git add app/(admin)/admin/catalog/categories/_components/category-table.tsx app/(admin)/admin/marketing/_components/coupon-table.tsx tests/admin-button-loading.test.ts e2e/cart.spec.ts
git commit -m "feat: show loading state on admin row actions"
```
