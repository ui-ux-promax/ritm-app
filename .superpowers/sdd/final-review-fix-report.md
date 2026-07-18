# Final review fix report

## Scope delivered

All Important findings in `final-review-fix-brief.md` were addressed without changing unrelated request, navigation, success, error, stock, selection, or cooldown behavior.

### React 18 async request lifetime

- Replaced the wishlist heart's async `useTransition` callback with an explicit `pending` boolean set before the optimistic mutation and cleared in `finally` after `toggleWishlist` settles.
- Preserved the wishlist optimistic heart/count update, authoritative count refresh, router refresh, and both server-result and thrown-error rollback paths.
- Replaced the profile address-add, personal-profile, and password-form async transitions with explicit booleans and `try/finally`, so each submit stays disabled, busy, muted, and spinner-backed for its full server request.

### Concurrent request ownership

- Related-cart add actions now use a `ReadonlySet<string>` of product slugs. Starting or settling one product request adds/removes only that slug, leaving all other initiated requests visibly pending.
- Category move actions now use keys composed from row id and direction. A row remains locked while its own move is pending, its initiating direction owns the busy spinner, and requests on other rows remain independently pending.
- Coupon toggle actions now use a set of pending row ids, so one toggle settling cannot clear another row's busy state.
- All keyed state removal uses functional state updates in `finally`, including rejected requests.

### Product add-button visual states

- Removed the blanket `disabled:opacity-50 disabled:cursor-not-allowed` loading treatment from catalog-card and PDP add buttons.
- Applied the muted `opacity-50 cursor-not-allowed` treatment directly from `adding` only.
- Retained the catalog card's original unavailable/selection palette (`bg-ink/20 text-surface cursor-not-allowed`).
- Retained the PDP's original no-selection/sold-out opacity and its existing cooldown behavior; cooldown remains disabled without inheriting request-loading opacity.

### Profile address actions

- Address creation uses a dedicated `adding` state, `aria-busy`, disabled styling, and a labelled `Loader2` named `Сохраняем адрес`.
- Make-default and delete actions use independent keys (`default:<id>` and `delete:<id>`), each with its own disabled/busy state and labelled `Loader2` (`Делаем адрес основным` / `Удаляем адрес`).
- Loading controls render spinners rather than text-only progress labels.

## Tests added or strengthened

- `tests/request-loading-concurrency.test.ts`
  - Wishlist heart remains busy after React has yielded and until its deferred server promise resolves.
  - Two related-product adds remain independently busy; resolving the first does not clear the second.
- `tests/profile-request-loading.test.ts`
  - Add-address remains busy with a labelled spinner for a deferred request.
  - Make-default and delete address requests remain independently busy under staggered resolution.
  - Personal-profile and password submits remain busy across their full deferred requests.
- `tests/admin-button-loading.test.ts`
  - Added staggered-resolution concurrency coverage for category moves and coupon toggles on separate rows.
- `tests/catalog-product-card.test.ts`
  - Verifies request-only opacity and preservation of the static unavailable/selection style.
- `tests/purchase-panel-loading-style.test.ts`
  - Verifies PDP request-only opacity with a real deferred add request and absence of the blanket disabled loading variant.

## TDD evidence

The deferred-promise concurrency tests were written before the state fixes. After resolving the JSX test-harness import requirement, the focused RED run reported 7 failed tests and 2 existing passes:

```powershell
npm test -- tests/request-loading-concurrency.test.ts tests/profile-request-loading.test.ts tests/admin-button-loading.test.ts
```

The failures showed the expected defects: wishlist/profile transitions no longer exposed busy state after the async callback yielded, related-cart retained only the second slug, and category/coupon scalar state retained only the second row.

The style regressions were also run RED before the class changes:

```powershell
npm test -- tests/catalog-product-card.test.ts tests/purchase-panel-loading-style.test.ts
```

Catalog assertions failed because loading opacity came from a blanket disabled variant and leaked into the static disabled state. After making the JSX harness executable, the PDP assertion failed for the same blanket disabled variant.

The final focused GREEN run passed all 15 tests:

```powershell
npm test -- tests/request-loading-concurrency.test.ts tests/profile-request-loading.test.ts tests/admin-button-loading.test.ts tests/catalog-product-card.test.ts tests/purchase-panel-loading-style.test.ts
```

Result: 5 test files passed, 15 tests passed.

## Full verification

```powershell
npm run typecheck
```

Result: passed (`tsc --noEmit`, exit 0).

```powershell
npm test
```

Result: 117 test files passed, 600 tests passed, exit 0. The run emitted the existing Radix Dialog warning from `tests/verification-gate-loading.test.ts` about a missing description; it did not fail any test and is outside this fix scope.

```powershell
git diff --check
```

Result: passed with no whitespace errors. Git emitted only the repository's Windows LF-to-CRLF conversion notices.

## Concerns

- No known functional or type-safety concerns remain in the owned scope.
- The pre-existing Radix Dialog accessibility warning noted above remains intentionally unchanged because it is not required by an Important finding.
- An independent final diff review reported no Critical or Important findings. Its two optional minors (React imports required by the current Vitest JSX transform, and additional rejected-promise coverage) were not changed because the brief explicitly excludes minors unless needed by an Important fix.
