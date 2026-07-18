# Task 2 report — native checkout and authentication submit loaders

## Scope delivered

- Updated the checkout submit and the standalone login/register submits.
- Updated both inline submit controls in `auth-card`.
- Pending submissions now render only the required `Loader2` status icon, stay disabled, set `aria-busy="true"`, and provide an action-specific accessible button name.
- Registration retry cooldown remains disabled without setting `aria-busy`.
- Non-pending labels, totals, and arrows remain unchanged.

## TDD evidence

### RED

Created `tests/auth-submit-loading.test.ts` with jsdom coverage that keeps `signIn` pending and asserts the LoginForm submit control is disabled, busy, and named `Вход выполняется`.

Command:

```text
npm test -- tests/auth-submit-loading.test.ts
```

Expected pre-implementation failure observed:

```text
Unable to find role="button" and name "Вход выполняется"
```

The rendered pending button was disabled but contained the old `Входим…` text and had no `aria-busy` attribute.

### GREEN

Applied the minimal UI changes to the four owned components, then reran:

```text
npm test -- tests/auth-submit-loading.test.ts
```

Result: `1 passed (1)`.

## Verification

- Focused test: `npm test -- tests/auth-submit-loading.test.ts` — 1/1 passed.
- Full suite: `npm test` — 110 files and 584 tests passed.
- Diff check: `git diff --check` — no whitespace errors.
- `npm run typecheck` was attempted. It is blocked by an unrelated pre-existing type mismatch in `tests/button-loading.test.ts` between the admin and storefront `Button` forward-ref component prop types; this task's files do not appear in its diagnostic.

## Self-review

- Confirmed all five required native submit controls use `Loader2` only with the exact `h-5 w-5 animate-spin`, `role="status"`, and `aria-label="Загрузка"` attributes.
- Confirmed each submit uses `aria-busy={isSubmitting || undefined}` (or its form-state equivalent) and an action-specific pending label.
- Confirmed no request, error, cooldown, redirect, static-disabled, or navigation behavior changed.
