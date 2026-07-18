# Task 3 report: per-control request loading

## Delivered

- Added local pending state and a labelled `Loader2` to product-detail, catalog-card, and related-cart add actions. Each pending action is disabled, muted, and exposes `aria-busy` without changing request, error, success-copy, or cooldown behavior.
- Added `pendingAction` to the cart store for quantity and removal requests. It is set before the existing API call and cleared in `finally`.
- Cart rows now identify their active request, disable their quantity/remove controls, and replace only the clicked quantity icon or active remove icon with a labelled spinner.
- Wishlist hearts now use their existing React transition state to disable, mark busy, mute, and replace the heart SVG with a labelled spinner.

## TDD evidence

### RED

Added two regressions before production changes and ran:

```powershell
npm test -- tests/catalog-product-card.test.ts tests/cart-line-item-loading.test.ts
```

Result: 2 failures, 3 existing tests passed.

- Catalog test failed because the pending add request left the button named `Добавить в корзину`; the required busy action named `Добавляем в корзину` did not exist.
- Cart-row test failed because no `status` named `Удаляем товар` existed while a mocked `pendingAction` was active.

### GREEN

After the minimal implementation, re-ran the same focused command:

```text
Test Files  2 passed (2)
Tests  5 passed (5)
```

Re-ran after the small cleanup/refactor with the same result.

## Verification

```powershell
npm test
```

Result:

```text
Test Files  111 passed (111)
Tests  586 passed (586)
```

`git diff --check` completed without whitespace errors. `npm run typecheck` was also run; it remains blocked by an unrelated existing error in `tests/button-loading.test.ts:16` where `React.createElement` receives a union of two `ForwardRefExoticComponent` button types with incompatible `variant` props. No Task 3 file is referenced by that diagnostic.

## Self-review

- Confirmed every loading control is disabled, muted, has `aria-busy`, and swaps normal content for `Loader2` with a Russian accessible label.
- Confirmed product success copy and 429 cooldown handling remain in place.
- Confirmed cart API methods, item-disable behavior, and error handling remain unchanged except for bracketing per-row pending state.
- Confirmed the new tests cover the requested pending catalog action and active cart-remove spinner/disabled controls.

## Review follow-up: concurrent, control-scoped cart pending state

Review identified that the original single `pendingAction` value could be overwritten by a second row request, and that a row-wide `disabled` flag muted controls that did not start the request.

### Root cause and correction

- Replaced the single value with `pendingActions`, keyed by request control. Each cart request adds only its own descriptor and removes that descriptor in `finally`, so another row remains pending when the first request settles.
- Quantity requests carry their initiating direction (`increase` or `decrease`). `CartLineItem` renders the labelled `Loader2` and disables only that matching control; the other quantity control and removal action remain usable.
- Removal no longer mutates the row's `disabled` flag. It marks only its own remove button busy/disabled, preserving the API/error flow while avoiding unrelated disabled controls.

### RED

Before the correction, ran:

```powershell
npm test -- tests/cart-line-item-loading.test.ts tests/cart-pending-actions.test.ts
```

Result: 3 failures. The store had no `pendingActions` collection, and cart rows ignored the concurrent/control-specific pending descriptors, so the expected labelled spinners were absent.

### GREEN and final verification

After the targeted fix, ran:

```powershell
npm test -- tests/cart-line-item-loading.test.ts tests/cart-pending-actions.test.ts tests/cart.test.ts
```

Result: 3 files / 9 tests passed.

Then ran:

```powershell
npm test
```

Result: 112 files / 588 tests passed.

`git diff --check` passed. `npm run typecheck` remains blocked only by the pre-existing `tests/button-loading.test.ts:16` incompatible `ForwardRefExoticComponent` union diagnostic; no Task 3 file appears in that output.

## Review follow-up: quantity button busy state

Added `aria-busy` to both quantity controls, bound to their respective `decreaseBusy` and `increaseBusy` states. The loading regression now asserts that the active increase control exposes `aria-busy="true"`; removal behavior was left unchanged.

TDD evidence:

```powershell
npm test -- tests/cart-line-item-loading.test.ts tests/cart-pending-actions.test.ts
```

RED: the new assertion received `null` instead of `"true"` for `aria-busy`.

GREEN: 2 files / 3 tests passed after the minimal attribute additions.
