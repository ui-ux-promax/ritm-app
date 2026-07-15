# Client-Side Product Color Switching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make product-page colour selection instant and preserve scroll position.

**Architecture:** The server passes each colourway's images and variants once. The client product view owns the active colour, updates the visible data synchronously, and uses `history.replaceState` to retain the query parameter without navigation.

**Tech Stack:** Next.js 15, React 18, TypeScript, Vitest, Testing Library.

## Global Constraints

- Preserve `?color=<slug>` URLs without using `Link` or `router.push` for an in-page colour change.
- Reset selected gallery image and selected size when the colour changes.
- Avoid extra data requests and dependencies.

---

### Task 1: Test client-side colour selection

**Files:**
- Create: `tests/product-view-color-selection.test.ts`
- Test: `tests/product-view-color-selection.test.ts`

- [ ] **Step 1: Write the failing test**

Render `ProductView` with graphite and terracotta colourway data, click the terracotta control exposed by a mocked purchase panel, and assert that the main image is terracotta and `window.history.replaceState` received a URL ending in `?color=terracotta`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/product-view-color-selection.test.ts`

Expected: FAIL because `ProductView` currently accepts only server-selected gallery and variants.

### Task 2: Move product-page colour selection to the client

**Files:**
- Modify: `app/(shop)/product/[slug]/page.tsx`
- Modify: `components/shared/product/product-view.tsx`
- Modify: `components/shared/product/purchase-panel.tsx`
- Test: `tests/product-view-color-selection.test.ts`

- [ ] **Step 1: Pass all colourway gallery and variant data from `ProductPage` to `ProductView`**

Map every product colourway to its gallery images and active variants, retaining the server-selected colour slug as the initial state.

- [ ] **Step 2: Derive product view content from local selected colour state**

On colour selection, set the colour state and gallery index to zero, then call `window.history.replaceState` with the selected `color` query value. Use the selected colourway's images, variants and price for rendering.

- [ ] **Step 3: Make purchase-panel colour controls callbacks**

Replace colour `Link` elements with buttons calling the supplied `onColorChange`. Keep the purchase panel key tied to the selected colour so its local selected size resets.

- [ ] **Step 4: Run focused test and typecheck**

Run: `npm test -- tests/product-view-color-selection.test.ts`

Run: `npm run typecheck`

Expected: both commands exit 0.

### Task 3: Regression verification

**Files:**
- Test: `tests/product-view-color-selection.test.ts`

- [ ] **Step 1: Run the full test suite**

Run: `npm test`

Expected: all test files pass.

- [ ] **Step 2: Check the diff**

Run: `git diff --check`

Expected: exit 0 with no whitespace errors.
