# Ritm Payment Reliability Design

## Goal

Stabilize the online payment state path for Phase 2.1 by making YooKassa payment synchronization consistent, idempotent, and shared across webhook and order-return flows.

Phase 1 proved that a real checkout can complete on production. Phase 2.1 focuses on the cases that usually break after the first successful payment: repeated webhook delivery, delayed return-page sync, canceled payments, mismatched remote/local state, and duplicate side effects such as double stock restoration.

## Selected Approach

Use **Payment Reconciliation Core**.

Create one service-level reconciliation path that owns payment state transitions. Webhook and order page sync should call the same core behavior instead of carrying separate status interpretation logic.

## Hard Project Rules

- Never run `prisma db push`, `prisma db seed`, or e2e locally on Windows against Neon.
- Locally run only safe checks: `npm run prisma:generate`, `npm run typecheck`, `npm run test`, and `npm run build`.
- Never hand-edit or read/write `.env*` files.
- Commits and PRs must be English, conventional-commits style, single author `ui-ux-promax`, and contain no `Co-Authored-By` or assistant attribution.
- Commit or push only when the user asks.
- Branch from `main` for new work; never commit directly on `main`.
- Schema changes must be additive-safe. Phase 2.1 should avoid schema changes unless implementation proves they are required.

## Current Behavior

The app already has:

- Online order creation through `placeOrder`.
- YooKassa payment creation through `createPayment`.
- A `Payment` row with raw string status, confirmation URL, amount, and `paidAt`.
- YooKassa webhook handling at `/api/yookassa/webhook`.
- Return-page polling on `/orders/[number]` when a payment is still pending.
- Helpers `applyPaymentSucceeded` and `applyPaymentCanceled`.
- Tests for online order creation, webhook status verification, and payment side effects.

The current weak point is that status interpretation and side-effect control are split between entry points. The success path also updates payment and order separately without an explicit transition gate that protects against final-state conflicts.

## Scope

### In Scope

- Add a single reconciliation function for local payment state updates.
- Normalize YooKassa statuses used by the app:
  - `pending`
  - `waiting_for_capture`
  - `succeeded`
  - `canceled`
- Keep unsupported or unknown statuses as no-op outcomes with logging.
- Use the same reconciliation path from:
  - YooKassa webhook.
  - `/orders/[number]` return page sync.
- Preserve idempotency for repeated webhook and return-page calls.
- Prevent final-state downgrade:
  - `succeeded -> canceled` must not cancel the order or restore stock.
  - `canceled -> succeeded` must not move the order to processing.
- Keep stock and sales-count rollback guarded by a single `PENDING -> CANCELLED` order transition.
- Keep `paidAt` stable after the first successful transition.
- Expand unit tests around the transition matrix and webhook entry point.

### Out of Scope

- Refund implementation.
- YooKassa capture flow for two-stage payments.
- Admin manual payment sync UI.
- Payment event history table.
- New database migrations unless implementation cannot safely meet the behavior with current tables.
- Local e2e against Neon.
- Any local database push or seed.

## Reconciliation Contract

The core function should accept:

- local payment id;
- observed remote YooKassa status;
- source label such as `webhook`, `order-page`, or future `admin`;
- optional current time provider for deterministic tests.

The function should return a small structured result that tests and callers can reason about:

- `applied`: a local state transition was applied.
- `ignored`: status was already final, unknown, non-final, or conflicted.
- `missing`: local payment row was not found.

The exact TypeScript shape can be chosen during implementation, but it should avoid throwing for expected stale or repeated provider events.

## State Transitions

### Pending To Succeeded

When local payment is `pending` and remote status is `succeeded`:

- Set `Payment.status` to `succeeded`.
- Set `Payment.paidAt` only if it is currently null.
- Set `Order.status` to `PROCESSING`.
- Do not restore stock.

Repeated `succeeded` events should not update `paidAt` again.

### Pending To Canceled

When local payment is `pending` and remote status is `canceled`:

- Set `Payment.status` to `canceled`.
- Move `Order.status` from `PENDING` to `CANCELLED`.
- Restore stock once.
- Decrement sales count once.

The order transition must remain the side-effect gate. If the order is no longer `PENDING`, stock and sales count must not be touched.

### Pending Or Waiting

When remote status is `pending` or `waiting_for_capture`:

- Do not change local payment state.
- Do not change order state.
- Return an ignored/no-op result.

### Final-State Conflicts

If local payment is already `succeeded`:

- Ignore `canceled` remote status.
- Keep the order and stock untouched.

If local payment is already `canceled`:

- Ignore `succeeded` remote status.
- Keep the order and stock untouched.

These cases should be logged as conflicts or stale events, not treated as runtime failures.

### Missing Local Payment

If the local payment row cannot be found:

- Do not update any order or inventory state.
- Return a missing/no-op result.
- Webhook should still respond with `{ ok: true }` for valid provider notifications to avoid infinite retries for stale or unrelated payment ids.

## Entry Points

### YooKassa Webhook

The webhook should:

- Parse the provider notification.
- Load the authoritative remote payment status from YooKassa.
- Pass the payment id, remote status, and source `webhook` to the reconciliation core.
- Return `{ ok: true }` for valid notifications even when reconciliation is a no-op, missing local payment, or unsupported status.
- Return 400 only for invalid payloads.
- Return 500 only for unexpected infrastructure failures, such as inability to verify remote status.

### Order Return Page

The order page should:

- Keep checking remote status only when the local order is `PENDING` and local payment is `pending`.
- Delegate local updates to the same reconciliation core.
- Refetch the order after an applied transition.
- Log sync failures without breaking the order page.

## Testing Strategy

Use Vitest only. Do not run local e2e.

Add or update tests for:

- `pending + succeeded` applies success effects and sets `paidAt`.
- repeated `succeeded` is idempotent and preserves existing `paidAt`.
- `pending + canceled` applies cancel effects once.
- repeated `canceled` does not restore stock twice.
- `succeeded + canceled` is ignored.
- `canceled + succeeded` is ignored.
- `pending + pending` and `pending + waiting_for_capture` are ignored.
- unknown remote status is ignored with no side effects.
- missing local payment does not throw and does not touch order or inventory.
- webhook calls reconciliation once with remote status.
- webhook returns success for valid no-op reconciliation outcomes.

Run the safe local checks before handoff:

```powershell
npm run prisma:generate
npm run typecheck
npm run test
npm run build
```

## Preview Verification

After deployment:

- Create an online order on preview.
- Complete payment in YooKassa test flow.
- Confirm the order page shows paid state.
- Confirm admin order detail/list show payment succeeded and order processing.
- If possible, revisit the order page and webhook-triggered state more than once to confirm no visible regressions.

Do not run local e2e against Neon.

## Acceptance Criteria

Phase 2.1 is done when:

- Webhook and order return page share one reconciliation path.
- Repeated YooKassa events do not duplicate stock or sales-count side effects.
- Final payment states do not downgrade each other.
- Missing local payment ids and non-final remote statuses are safe no-ops.
- Existing checkout, payment, webhook, cancellation, and order tests still pass.
- New tests cover the Phase 2.1 transition matrix.
- Safe local checks pass.
- Preview manual purchase smoke still works.
