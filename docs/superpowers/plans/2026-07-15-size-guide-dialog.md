# Size Guide Dialog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Open one accessible size-guide modal from catalog cards and product pages.

**Architecture:** A client-side Radix Dialog component owns the trigger, focus handling, close actions, and size table. Both existing size-guide links render this shared component, so the content and interaction remain identical.

**Tech Stack:** Next.js, React, TypeScript, Radix Dialog, Tailwind CSS, Vitest.

## Global Constraints

- Use the existing `@radix-ui/react-dialog` dependency.
- Do not change selected colour, size, cart state, or the URL.
- Provide close controls through the dialog close button, overlay click, and Escape.

---

### Task 1: Shared size-guide dialog

**Files:**

- Create: `components/shared/product/size-guide-dialog.tsx`
- Test: `tests/size-guide-dialog.test.tsx`

**Interfaces:**

- Produces: `SizeGuideDialog({ className?: string })`, which renders its own trigger labelled `Таблица размеров`.

- [ ] Write a failing test that clicks `Таблица размеров`, asserts the dialog title and measurements, then closes it.
- [ ] Run `npm test -- --run tests/size-guide-dialog.test.tsx`; expect the module import to fail.
- [ ] Implement the Radix dialog with a Russian size table, a close button, and accessible title/description.
- [ ] Run the focused test; expect it to pass.

### Task 2: Connect catalog and product page triggers

**Files:**

- Modify: `components/shared/catalog/catalog-product-card.tsx`
- Modify: `components/shared/product/purchase-panel.tsx`

**Interfaces:**

- Consumes: `SizeGuideDialog` from Task 1.

- [ ] Replace each `Таблица размеров` placeholder link with `SizeGuideDialog`, preserving current visual classes.
- [ ] Run `npm run typecheck` and the focused dialog test.

### Task 3: Verify the integration

**Files:**

- Test: `tests/size-guide-dialog.test.tsx`

- [ ] Run `npm test` and `git diff --check`.
- [ ] Confirm the dialog has no navigation side effect and opens from its shared trigger.
