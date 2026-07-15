# Customer Order Cancellation Dialog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the browser confirmation prompt for customer order cancellation with a branded, accessible Ritm dialog.

**Architecture:** Keep cancellation in `CancelOrderButton` and replace its native `window.confirm` guard with controlled Radix Dialog state. The existing server action remains unchanged; the dialog controls closing and disables actions while that action is pending.

**Tech Stack:** React, Next.js, Radix Dialog, Tailwind CSS, Vitest.

## Global Constraints

- Do not use `window.confirm` for customer order cancellation.
- Preserve the current cancellation server action and error rendering.
- Allow closing through Escape, overlay click, close button, and the secondary action when no request is pending.

---

### Task 1: Add regression coverage for the replacement

**Files:**
- Create: `tests/cancel-order-dialog.test.ts`

**Interfaces:**
- Consumes: `components/shared/orders/cancel-order-button.tsx` source.
- Produces: a contract that the customer flow has no native confirmation and renders dialog controls.

- [ ] **Step 1: Write the failing test**

```ts
expect(source).not.toContain('window.confirm');
expect(source).toContain('<Dialog.Root');
expect(source).toContain('Отменить заказ?');
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `npm test -- tests/cancel-order-dialog.test.ts`

Expected: FAIL because the component currently calls `window.confirm`.

### Task 2: Implement the customer cancellation dialog

**Files:**
- Modify: `components/shared/orders/cancel-order-button.tsx`

**Interfaces:**
- Consumes: `cancelOrder(orderId)` and controlled `Dialog.Root` state.
- Produces: a dialog with `open`, `close`, `cancel`, and `confirm` interactions while retaining the existing error state.

- [ ] **Step 1: Add controlled dialog state**

```tsx
const [confirmOpen, setConfirmOpen] = useState(false);
```

- [ ] **Step 2: Move the server request behind the dialog confirmation button**

```tsx
async function confirmCancellation() {
  setBusy(true);
  const res = await cancelOrder(orderId);
  setBusy(false);
  if (!res.ok) return setError(res.error);
  setConfirmOpen(false);
  router.refresh();
}
```

- [ ] **Step 3: Render the branded dialog and preserve accessibility**

```tsx
<Dialog.Root open={confirmOpen} onOpenChange={(open) => !busy && setConfirmOpen(open)}>
  <Dialog.Overlay />
  <Dialog.Content>
    <Dialog.Title>Отменить заказ?</Dialog.Title>
    <Dialog.Description>Заказ будет отменён, а товары вернутся в наличие.</Dialog.Description>
  </Dialog.Content>
</Dialog.Root>
```

### Task 3: Verify the customer flow

**Files:**
- Test: `tests/cancel-order-dialog.test.ts`

**Interfaces:**
- Consumes: updated client component.
- Produces: verified static and TypeScript contracts.

- [ ] **Step 1: Run focused test**

Run: `npm test -- tests/cancel-order-dialog.test.ts tests/cancel-order.test.ts`

Expected: PASS.

- [ ] **Step 2: Run full verification**

Run: `npm run typecheck; npm test; git diff --check`

Expected: all commands exit with code 0.
