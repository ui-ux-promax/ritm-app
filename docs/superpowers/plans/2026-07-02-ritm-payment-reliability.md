# Ritm Payment Reliability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single idempotent payment reconciliation path for YooKassa webhook and order-return synchronization.

**Architecture:** Keep the current `Payment` and `Order` schema. Refactor `lib/payment-sync.ts` into a small reconciliation module that reads the current local payment state, applies only allowed transitions, and keeps stock/sales side effects behind the existing `PENDING -> CANCELLED` order gate. Webhook and `/orders/[number]` will delegate to this module rather than each interpreting remote YooKassa statuses separately.

**Tech Stack:** Next.js 15 App Router, React 18, Prisma 6, Neon, YooKassa SDK, Vitest, PowerShell on Windows.

---

## Non-Negotiable Rules

- Do not run `npm run prisma:push`, `npm run prisma:seed`, `prisma db push`, `prisma db seed`, or local e2e on Windows against Neon.
- Do not read, write, or hand-edit `.env*` files.
- Allowed local commands: `npm run prisma:generate`, `npm run typecheck`, `npm run test`, `npm run build`, and read-only source/git inspections.
- Commit only when the user asks. Push only when the user asks.
- Commit messages and PR titles must be English conventional commits, single author `ui-ux-promax`, no `Co-Authored-By` or assistant attribution.
- New work is on `feat/payment-reliability`, branched from `origin/main`. Never commit directly on `main`.
- Avoid schema changes for Phase 2.1.

## File Structure

- Modify: `lib/payment-sync.ts`
  - Own local payment reconciliation, status normalization, state transition guards, and compatibility wrappers.
- Modify: `app/api/yookassa/webhook/route.ts`
  - Parse provider notification, load remote status, call reconciliation once.
- Modify: `app/(shop)/orders/[number]/page.tsx`
  - Use the same reconciliation helper for pending payment sync on order return.
- Modify: `tests/payment-sync.test.ts`
  - Cover the transition matrix and idempotent side effects.
- Modify: `tests/yookassa-webhook.test.ts`
  - Update route expectations from direct success/cancel helpers to the reconciliation helper.
- Create or keep modified: `docs/superpowers/specs/2026-07-02-ritm-payment-reliability-design.md`
  - Approved Phase 2.1 design spec.
- Create: `docs/superpowers/plans/2026-07-02-ritm-payment-reliability.md`
  - This plan.

---

### Task 1: Lock Branch And Baseline

**Files:**
- No source files.

- [ ] **Step 1: Confirm branch and uncommitted files**

Run:

```powershell
git status --short --branch
```

Expected:

```text
## feat/payment-reliability...origin/main
?? docs/superpowers/specs/2026-07-02-ritm-payment-reliability-design.md
?? docs/superpowers/plans/2026-07-02-ritm-payment-reliability.md
```

If other files appear, inspect them before continuing. Do not revert unrelated user changes.

- [ ] **Step 2: Run current targeted payment tests before edits**

Run:

```powershell
npm run test -- tests/payment-sync.test.ts tests/yookassa-webhook.test.ts tests/place-order-online.test.ts tests/cancel-order.test.ts tests/admin-orders-action.test.ts
```

Expected: tests pass before refactor. If they fail, use systematic debugging before editing.

---

### Task 2: Define Reconciliation Contract With Failing Tests

**Files:**
- Modify: `tests/payment-sync.test.ts`

- [ ] **Step 1: Replace `tests/payment-sync.test.ts` with transition-focused tests**

Use this full test file:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Prisma } from '@prisma/client';

const fixedNow = new Date('2026-07-02T10:00:00.000Z');

vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() } }));
vi.mock('@/lib/prisma-client', () => ({
  prisma: {
    payment: { update: vi.fn(), findUnique: vi.fn() },
    order: { update: vi.fn() },
    productVariant: { update: vi.fn() },
    product: { update: vi.fn() },
  },
}));

import {
  applyPaymentCanceled,
  applyPaymentSucceeded,
  reconcilePaymentStatus,
  type YooKassaPaymentStatus,
} from '@/lib/payment-sync';
import { prisma } from '@/lib/prisma-client';

const paymentUpdate = prisma.payment.update as unknown as ReturnType<typeof vi.fn>;
const paymentFindUnique = prisma.payment.findUnique as unknown as ReturnType<typeof vi.fn>;
const orderUpdate = prisma.order.update as unknown as ReturnType<typeof vi.fn>;
const variantUpdate = prisma.productVariant.update as unknown as ReturnType<typeof vi.fn>;
const productUpdate = prisma.product.update as unknown as ReturnType<typeof vi.fn>;

const orderItems = [
  { productVariantId: 'v1', quantity: 2, productVariant: { colorway: { productId: 'prod_1' } } },
];

function payment(status = 'pending', paidAt: Date | null = null) {
  return {
    id: 'pay_1',
    orderId: 'o1',
    status,
    paidAt,
    order: { id: 'o1', status: 'PENDING', items: orderItems },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  paymentUpdate.mockResolvedValue({});
  orderUpdate.mockResolvedValue({});
  variantUpdate.mockResolvedValue({});
  productUpdate.mockResolvedValue({});
  paymentFindUnique.mockResolvedValue(payment());
});

describe('reconcilePaymentStatus', () => {
  it('pending + succeeded applies success effects and sets paidAt', async () => {
    const result = await reconcilePaymentStatus({
      paymentId: 'pay_1',
      remoteStatus: 'succeeded',
      source: 'webhook',
      now: () => fixedNow,
    });

    expect(result).toEqual({ kind: 'applied', transition: 'succeeded' });
    expect(paymentFindUnique).toHaveBeenCalledWith({
      where: { id: 'pay_1' },
      include: { order: { include: { items: { include: { productVariant: { select: { colorway: { select: { productId: true } } } } } } } } },
    });
    expect(paymentUpdate).toHaveBeenCalledWith({
      where: { id: 'pay_1' },
      data: { status: 'succeeded', paidAt: fixedNow },
    });
    expect(orderUpdate).toHaveBeenCalledWith({ where: { id: 'o1' }, data: { status: 'PROCESSING' } });
    expect(variantUpdate).not.toHaveBeenCalled();
    expect(productUpdate).not.toHaveBeenCalled();
  });

  it('repeated succeeded preserves existing paidAt and does not touch the order again', async () => {
    const paidAt = new Date('2026-07-01T10:00:00.000Z');
    paymentFindUnique.mockResolvedValue(payment('succeeded', paidAt));

    const result = await reconcilePaymentStatus({
      paymentId: 'pay_1',
      remoteStatus: 'succeeded',
      source: 'order-page',
      now: () => fixedNow,
    });

    expect(result).toEqual({ kind: 'ignored', reason: 'already-succeeded' });
    expect(paymentUpdate).not.toHaveBeenCalled();
    expect(orderUpdate).not.toHaveBeenCalled();
  });

  it('pending + canceled applies cancel effects once', async () => {
    const result = await reconcilePaymentStatus({
      paymentId: 'pay_1',
      remoteStatus: 'canceled',
      source: 'webhook',
      now: () => fixedNow,
    });

    expect(result).toEqual({ kind: 'applied', transition: 'canceled' });
    expect(paymentUpdate).toHaveBeenCalledWith({ where: { id: 'pay_1' }, data: { status: 'canceled' } });
    expect(orderUpdate).toHaveBeenCalledWith({ where: { id: 'o1', status: 'PENDING' }, data: { status: 'CANCELLED' } });
    expect(variantUpdate).toHaveBeenCalledWith({ where: { id: 'v1' }, data: { stock: { increment: 2 } } });
    expect(productUpdate).toHaveBeenCalledWith({ where: { id: 'prod_1' }, data: { salesCount: { increment: -2 } } });
  });

  it('repeated canceled does not restore stock twice', async () => {
    paymentFindUnique.mockResolvedValue(payment('canceled'));

    const result = await reconcilePaymentStatus({
      paymentId: 'pay_1',
      remoteStatus: 'canceled',
      source: 'webhook',
      now: () => fixedNow,
    });

    expect(result).toEqual({ kind: 'ignored', reason: 'already-canceled' });
    expect(paymentUpdate).not.toHaveBeenCalled();
    expect(orderUpdate).not.toHaveBeenCalled();
    expect(variantUpdate).not.toHaveBeenCalled();
    expect(productUpdate).not.toHaveBeenCalled();
  });

  it('succeeded + canceled is ignored without downgrade', async () => {
    paymentFindUnique.mockResolvedValue(payment('succeeded', fixedNow));

    const result = await reconcilePaymentStatus({
      paymentId: 'pay_1',
      remoteStatus: 'canceled',
      source: 'webhook',
      now: () => fixedNow,
    });

    expect(result).toEqual({ kind: 'ignored', reason: 'final-state-conflict' });
    expect(paymentUpdate).not.toHaveBeenCalled();
    expect(orderUpdate).not.toHaveBeenCalled();
    expect(variantUpdate).not.toHaveBeenCalled();
  });

  it('canceled + succeeded is ignored without upgrade', async () => {
    paymentFindUnique.mockResolvedValue(payment('canceled'));

    const result = await reconcilePaymentStatus({
      paymentId: 'pay_1',
      remoteStatus: 'succeeded',
      source: 'order-page',
      now: () => fixedNow,
    });

    expect(result).toEqual({ kind: 'ignored', reason: 'final-state-conflict' });
    expect(paymentUpdate).not.toHaveBeenCalled();
    expect(orderUpdate).not.toHaveBeenCalled();
  });

  it.each(['pending', 'waiting_for_capture'] satisfies YooKassaPaymentStatus[])(
    'pending local payment + %s remote status is a no-op',
    async (remoteStatus) => {
      const result = await reconcilePaymentStatus({
        paymentId: 'pay_1',
        remoteStatus,
        source: 'webhook',
        now: () => fixedNow,
      });

      expect(result).toEqual({ kind: 'ignored', reason: 'remote-not-final' });
      expect(paymentUpdate).not.toHaveBeenCalled();
      expect(orderUpdate).not.toHaveBeenCalled();
    },
  );

  it('unknown remote status is ignored without side effects', async () => {
    const result = await reconcilePaymentStatus({
      paymentId: 'pay_1',
      remoteStatus: 'refunded',
      source: 'webhook',
      now: () => fixedNow,
    });

    expect(result).toEqual({ kind: 'ignored', reason: 'unknown-remote-status' });
    expect(paymentUpdate).not.toHaveBeenCalled();
    expect(orderUpdate).not.toHaveBeenCalled();
  });

  it('missing local payment is a no-op', async () => {
    paymentFindUnique.mockResolvedValue(null);

    const result = await reconcilePaymentStatus({
      paymentId: 'pay_x',
      remoteStatus: 'succeeded',
      source: 'webhook',
      now: () => fixedNow,
    });

    expect(result).toEqual({ kind: 'missing' });
    expect(paymentUpdate).not.toHaveBeenCalled();
    expect(orderUpdate).not.toHaveBeenCalled();
  });

  it('canceled side effects are gated by PENDING order transition', async () => {
    orderUpdate.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError('not found', { code: 'P2025', clientVersion: 'test' }));

    const result = await reconcilePaymentStatus({
      paymentId: 'pay_1',
      remoteStatus: 'canceled',
      source: 'webhook',
      now: () => fixedNow,
    });

    expect(result).toEqual({ kind: 'ignored', reason: 'order-not-pending' });
    expect(paymentUpdate).toHaveBeenCalledWith({ where: { id: 'pay_1' }, data: { status: 'canceled' } });
    expect(variantUpdate).not.toHaveBeenCalled();
    expect(productUpdate).not.toHaveBeenCalled();
  });
});

describe('compatibility wrappers', () => {
  it('applyPaymentSucceeded delegates to reconciliation', async () => {
    await applyPaymentSucceeded('pay_1');

    expect(paymentUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'pay_1' },
      data: expect.objectContaining({ status: 'succeeded' }),
    }));
  });

  it('applyPaymentCanceled delegates to reconciliation', async () => {
    await applyPaymentCanceled('pay_1');

    expect(paymentUpdate).toHaveBeenCalledWith({ where: { id: 'pay_1' }, data: { status: 'canceled' } });
  });
});
```

- [ ] **Step 2: Run payment-sync tests to verify they fail**

Run:

```powershell
npm run test -- tests/payment-sync.test.ts
```

Expected: fail because `reconcilePaymentStatus` and exported result/status types do not exist yet.

---

### Task 3: Implement Payment Reconciliation Core

**Files:**
- Modify: `lib/payment-sync.ts`

- [ ] **Step 1: Replace `lib/payment-sync.ts` with reconciliation implementation**

Use this full file:

```typescript
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma-client';
import { logger } from '@/lib/logger';
import { adjustSalesCount } from '@/lib/sales-count';

export type YooKassaPaymentStatus = 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
export type PaymentSyncSource = 'webhook' | 'order-page' | 'admin';

export type PaymentReconciliationResult =
  | { kind: 'applied'; transition: 'succeeded' | 'canceled' }
  | {
      kind: 'ignored';
      reason:
        | 'already-succeeded'
        | 'already-canceled'
        | 'final-state-conflict'
        | 'remote-not-final'
        | 'unknown-remote-status'
        | 'order-not-pending';
    }
  | { kind: 'missing' };

export interface ReconcilePaymentStatusInput {
  paymentId: string;
  remoteStatus: string;
  source: PaymentSyncSource;
  now?: () => Date;
}

const paymentWithOrderInclude = {
  order: {
    include: {
      items: {
        include: {
          productVariant: { select: { colorway: { select: { productId: true } } } },
        },
      },
    },
  },
} satisfies Prisma.PaymentInclude;

type PaymentWithOrder = Prisma.PaymentGetPayload<{ include: typeof paymentWithOrderInclude }>;

function normalizeRemoteStatus(status: string): YooKassaPaymentStatus | null {
  if (status === 'pending' || status === 'waiting_for_capture' || status === 'succeeded' || status === 'canceled') {
    return status;
  }
  return null;
}

function logIgnoredPayment(
  reason: PaymentReconciliationResult extends { kind: 'ignored'; reason: infer R } ? R : never,
  input: ReconcilePaymentStatusInput,
  payment?: Pick<PaymentWithOrder, 'status' | 'orderId'> | null,
) {
  logger.warn('payment_reconciliation_ignored', {
    reason,
    paymentId: input.paymentId,
    remoteStatus: input.remoteStatus,
    localStatus: payment?.status ?? null,
    orderId: payment?.orderId ?? null,
    source: input.source,
  });
}

async function applySucceeded(
  payment: PaymentWithOrder,
  input: ReconcilePaymentStatusInput,
): Promise<PaymentReconciliationResult> {
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'succeeded', paidAt: payment.paidAt ?? (input.now ?? (() => new Date()))() },
  });
  await prisma.order.update({ where: { id: payment.orderId }, data: { status: 'PROCESSING' } });
  return { kind: 'applied', transition: 'succeeded' };
}

async function applyCanceled(payment: PaymentWithOrder): Promise<PaymentReconciliationResult> {
  await prisma.payment.update({ where: { id: payment.id }, data: { status: 'canceled' } });

  try {
    await prisma.order.update({ where: { id: payment.orderId, status: 'PENDING' }, data: { status: 'CANCELLED' } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return { kind: 'ignored', reason: 'order-not-pending' };
    }
    throw e;
  }

  for (const item of payment.order.items) {
    try {
      await prisma.productVariant.update({
        where: { id: item.productVariantId },
        data: { stock: { increment: item.quantity } },
      });
    } catch (e) {
      logger.error('payment_canceled_stock_restore_failed', e, { variantId: item.productVariantId });
    }
  }

  await adjustSalesCount(
    payment.order.items.map((i) => ({ productId: i.productVariant.colorway.productId, quantity: i.quantity })),
    -1,
  );

  return { kind: 'applied', transition: 'canceled' };
}

export async function reconcilePaymentStatus(input: ReconcilePaymentStatusInput): Promise<PaymentReconciliationResult> {
  const remoteStatus = normalizeRemoteStatus(input.remoteStatus);
  if (!remoteStatus) {
    logIgnoredPayment('unknown-remote-status', input);
    return { kind: 'ignored', reason: 'unknown-remote-status' };
  }

  if (remoteStatus === 'pending' || remoteStatus === 'waiting_for_capture') {
    logIgnoredPayment('remote-not-final', input);
    return { kind: 'ignored', reason: 'remote-not-final' };
  }

  const payment = await prisma.payment.findUnique({
    where: { id: input.paymentId },
    include: paymentWithOrderInclude,
  });
  if (!payment) {
    logger.warn('payment_reconciliation_missing_payment', {
      paymentId: input.paymentId,
      remoteStatus: input.remoteStatus,
      source: input.source,
    });
    return { kind: 'missing' };
  }

  if (payment.status === 'succeeded') {
    const reason = remoteStatus === 'succeeded' ? 'already-succeeded' : 'final-state-conflict';
    logIgnoredPayment(reason, input, payment);
    return { kind: 'ignored', reason };
  }

  if (payment.status === 'canceled') {
    const reason = remoteStatus === 'canceled' ? 'already-canceled' : 'final-state-conflict';
    logIgnoredPayment(reason, input, payment);
    return { kind: 'ignored', reason };
  }

  if (remoteStatus === 'succeeded') return applySucceeded(payment, input);
  return applyCanceled(payment);
}

export async function applyPaymentSucceeded(paymentId: string): Promise<void> {
  await reconcilePaymentStatus({ paymentId, remoteStatus: 'succeeded', source: 'webhook' });
}

export async function applyPaymentCanceled(paymentId: string): Promise<void> {
  await reconcilePaymentStatus({ paymentId, remoteStatus: 'canceled', source: 'webhook' });
}
```

- [ ] **Step 2: Run payment-sync tests**

Run:

```powershell
npm run test -- tests/payment-sync.test.ts
```

Expected: pass. If TypeScript complains about the conditional type in `logIgnoredPayment`, replace the parameter type with:

```typescript
type IgnoredReason = Extract<PaymentReconciliationResult, { kind: 'ignored' }>['reason'];
```

and use `reason: IgnoredReason`.

---

### Task 4: Route Webhook Through Reconciliation

**Files:**
- Modify: `app/api/yookassa/webhook/route.ts`
- Modify: `tests/yookassa-webhook.test.ts`

- [ ] **Step 1: Replace `tests/yookassa-webhook.test.ts`**

Use this full test file:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

const { parseMock } = vi.hoisted(() => ({ parseMock: vi.fn() }));

vi.mock('@webzaytsev/yookassa-ts-sdk', () => ({ parseNotification: parseMock }));
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() } }));
vi.mock('@/lib/payment-sync', () => ({ reconcilePaymentStatus: vi.fn() }));
vi.mock('@/lib/yookassa', () => ({ getPaymentStatus: vi.fn() }));

import { POST } from '@/app/api/yookassa/webhook/route';
import { reconcilePaymentStatus } from '@/lib/payment-sync';
import { getPaymentStatus } from '@/lib/yookassa';

const reconcileMock = reconcilePaymentStatus as unknown as ReturnType<typeof vi.fn>;
const statusMock = getPaymentStatus as unknown as ReturnType<typeof vi.fn>;

function req() {
  return { json: async () => ({}) } as unknown as Request;
}

beforeEach(() => {
  vi.clearAllMocks();
  reconcileMock.mockResolvedValue({ kind: 'applied', transition: 'succeeded' });
  statusMock.mockResolvedValue('succeeded');
});

describe('yookassa webhook', () => {
  it('payment.succeeded verifies remote status, then reconciles once', async () => {
    parseMock.mockReturnValue({ event: 'payment.succeeded', object: { id: 'pay_1' } });
    statusMock.mockResolvedValue('succeeded');

    const res = await POST(req() as never);

    expect(res.status).toBe(200);
    expect(statusMock).toHaveBeenCalledWith('pay_1');
    expect(reconcileMock).toHaveBeenCalledWith({
      paymentId: 'pay_1',
      remoteStatus: 'succeeded',
      source: 'webhook',
    });
  });

  it('payment.canceled verifies remote status, then reconciles once', async () => {
    parseMock.mockReturnValue({ event: 'payment.canceled', object: { id: 'pay_1' } });
    statusMock.mockResolvedValue('canceled');

    const res = await POST(req() as never);

    expect(res.status).toBe(200);
    expect(statusMock).toHaveBeenCalledWith('pay_1');
    expect(reconcileMock).toHaveBeenCalledWith({
      paymentId: 'pay_1',
      remoteStatus: 'canceled',
      source: 'webhook',
    });
  });

  it('passes non-final remote statuses to reconciliation as safe no-ops', async () => {
    parseMock.mockReturnValue({ event: 'payment.succeeded', object: { id: 'pay_1' } });
    statusMock.mockResolvedValue('pending');
    reconcileMock.mockResolvedValue({ kind: 'ignored', reason: 'remote-not-final' });

    const res = await POST(req() as never);

    expect(res.status).toBe(200);
    expect(reconcileMock).toHaveBeenCalledWith({
      paymentId: 'pay_1',
      remoteStatus: 'pending',
      source: 'webhook',
    });
  });

  it('returns ok for missing local payment reconciliation', async () => {
    parseMock.mockReturnValue({ event: 'payment.succeeded', object: { id: 'pay_missing' } });
    statusMock.mockResolvedValue('succeeded');
    reconcileMock.mockResolvedValue({ kind: 'missing' });

    const res = await POST(req() as never);

    expect(res.status).toBe(200);
  });

  it('ignores unsupported provider event after parsing', async () => {
    parseMock.mockReturnValue({ event: 'refund.succeeded', object: { id: 'refund_1' } });

    const res = await POST(req() as never);

    expect(res.status).toBe(200);
    expect(statusMock).not.toHaveBeenCalled();
    expect(reconcileMock).not.toHaveBeenCalled();
  });

  it('invalid payload returns 400', async () => {
    parseMock.mockImplementation(() => { throw new Error('bad'); });

    const res = await POST(req() as never);

    expect(res.status).toBe(400);
  });

  it('YooKassa status verification error returns 500 without reconciliation', async () => {
    parseMock.mockReturnValue({ event: 'payment.succeeded', object: { id: 'pay_1' } });
    statusMock.mockRejectedValue(new Error('yookassa down'));

    const res = await POST(req() as never);

    expect(res.status).toBe(500);
    expect(reconcileMock).not.toHaveBeenCalled();
  });

  it('unexpected reconciliation error returns 500', async () => {
    parseMock.mockReturnValue({ event: 'payment.succeeded', object: { id: 'pay_1' } });
    statusMock.mockResolvedValue('succeeded');
    reconcileMock.mockRejectedValue(new Error('db down'));

    const res = await POST(req() as never);

    expect(res.status).toBe(500);
  });
});
```

- [ ] **Step 2: Run webhook tests to verify they fail before route edit**

Run:

```powershell
npm run test -- tests/yookassa-webhook.test.ts
```

Expected: fail because the route still imports `applyPaymentSucceeded` and `applyPaymentCanceled`.

- [ ] **Step 3: Replace webhook route**

Use this full file:

```typescript
import { NextResponse } from 'next/server';
import { parseNotification } from '@webzaytsev/yookassa-ts-sdk';
import { logger } from '@/lib/logger';
import { reconcilePaymentStatus } from '@/lib/payment-sync';
import { getPaymentStatus } from '@/lib/yookassa';

export const runtime = 'nodejs';

const SUPPORTED_PAYMENT_EVENTS = new Set(['payment.succeeded', 'payment.canceled']);

export async function POST(req: Request) {
  let notification;
  try {
    const body = await req.json();
    notification = parseNotification(body);
  } catch (e) {
    logger.error('yookassa_webhook_parse_failed', e);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!SUPPORTED_PAYMENT_EVENTS.has(notification.event)) {
    logger.warn('yookassa_webhook_ignored_event', { event: notification.event });
    return NextResponse.json({ ok: true });
  }

  try {
    const remoteStatus = await getPaymentStatus(notification.object.id);
    await reconcilePaymentStatus({
      paymentId: notification.object.id,
      remoteStatus,
      source: 'webhook',
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    logger.error('yookassa_webhook_failed', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run webhook tests**

Run:

```powershell
npm run test -- tests/yookassa-webhook.test.ts
```

Expected: pass.

---

### Task 5: Route Order Return Page Through Reconciliation

**Files:**
- Modify: `app/(shop)/orders/[number]/page.tsx`

- [ ] **Step 1: Update imports**

In `app/(shop)/orders/[number]/page.tsx`, replace:

```typescript
import { applyPaymentSucceeded, applyPaymentCanceled } from '@/lib/payment-sync';
```

with:

```typescript
import { reconcilePaymentStatus } from '@/lib/payment-sync';
```

- [ ] **Step 2: Update pending payment sync block**

Replace the body inside:

```typescript
if (order.status === 'PENDING' && order.payment && order.payment.status === 'pending') {
```

with:

```typescript
  try {
    const remote = await getPaymentStatus(order.payment.id);
    const sync = await reconcilePaymentStatus({
      paymentId: order.payment.id,
      remoteStatus: remote,
      source: 'order-page',
    });
    if (sync.kind === 'applied') {
      order = await prisma.order.findUnique({ where: { orderNumber }, include: orderInclude });
    }
  } catch (e) {
    logger.error('order_payment_sync_failed', e, { orderNumber });
  }
  if (!order) notFound();
```

- [ ] **Step 3: Run TypeScript check for import and type safety**

Run:

```powershell
npm run typecheck
```

Expected: exit 0. If typecheck fails due to `remote` being typed as `string`, keep `remoteStatus: remote`; `reconcilePaymentStatus` intentionally accepts `string`.

---

### Task 6: Run Focused Regression Tests

**Files:**
- No additional source files unless tests fail and require fixes.

- [ ] **Step 1: Run payment and order focused tests**

Run:

```powershell
npm run test -- tests/payment-sync.test.ts tests/yookassa-webhook.test.ts tests/place-order-online.test.ts tests/cancel-order.test.ts tests/admin-orders-action.test.ts tests/yookassa-lib.test.ts
```

Expected: all selected tests pass.

- [ ] **Step 2: Run full Vitest suite**

Run:

```powershell
npm run test
```

Expected: all tests pass.

---

### Task 7: Final Safe Verification

**Files:**
- No source files unless verification exposes a real issue.

- [ ] **Step 1: Run Prisma generate**

Run:

```powershell
npm run prisma:generate
```

Expected: exit 0.

- [ ] **Step 2: Run typecheck**

Run:

```powershell
npm run typecheck
```

Expected: exit 0.

- [ ] **Step 3: Run production build**

Run:

```powershell
npm run build
```

Expected: exit 0. Record existing warnings if present.

---

### Task 8: Review, Commit, And Handoff

**Files:**
- Modified/created files from prior tasks.

- [ ] **Step 1: Inspect final diff**

Run:

```powershell
git diff -- lib/payment-sync.ts app/api/yookassa/webhook/route.ts app/(shop)/orders/[number]/page.tsx tests/payment-sync.test.ts tests/yookassa-webhook.test.ts docs/superpowers/specs/2026-07-02-ritm-payment-reliability-design.md docs/superpowers/plans/2026-07-02-ritm-payment-reliability.md
```

Expected: diff only covers Phase 2.1 reconciliation and docs.

- [ ] **Step 2: Check status and forbidden files**

Run:

```powershell
git status --short --branch
git diff --name-only -- .env.local .env.example MVP_MIGRATION_PLAN.md e-comerce-shop-prot ritm-assets .playwright-mcp .claude .agents node_modules .next
```

Expected: no forbidden files appear in the diff.

- [ ] **Step 3: Ask user before commit**

Do not commit until the user explicitly asks. If approved, use:

```powershell
$env:GIT_AUTHOR_NAME='ui-ux-promax'
$env:GIT_AUTHOR_EMAIL='ui-ux-promax@users.noreply.github.com'
$env:GIT_COMMITTER_NAME='ui-ux-promax'
$env:GIT_COMMITTER_EMAIL='ui-ux-promax@users.noreply.github.com'
git add -- lib/payment-sync.ts app/api/yookassa/webhook/route.ts "app/(shop)/orders/[number]/page.tsx" tests/payment-sync.test.ts tests/yookassa-webhook.test.ts docs/superpowers/specs/2026-07-02-ritm-payment-reliability-design.md docs/superpowers/plans/2026-07-02-ritm-payment-reliability.md
git commit -m 'fix: harden payment reconciliation'
```

- [ ] **Step 4: Ask user before push**

Do not push until the user explicitly asks. If approved:

```powershell
git push -u origin feat/payment-reliability
```

---

## Preview Handoff Checklist

After PR preview deploy:

- Open `/api/admin/health/warmup`; expect `{"ok":true}`.
- Create an online order on preview.
- Complete YooKassa test payment.
- Open `/orders/<number>`; expect paid state and no server error.
- Open admin order list/detail; expect payment succeeded and order processing.
- Reopen the same order page; expect no visible regression.
- Do not run local e2e against Neon.
