# Task 4 report: secondary customer request indicators

## Delivered

- Verification resend now owns a `resending` state through `try/finally`.
  Its control is disabled while resending or cooling down, exposes `aria-busy`
  only while resending, and replaces its label with a labelled `Loader2` only
  while the request is in flight.
- Promo-code application now uses `Loader2`, marks its action busy while
  pending, and retains its existing request and error handling.
- Newsletter submission no longer renders a loading ellipsis; the shared
  `Button` now supplies the loading indicator.
- ProfileView's local submit control now follows the busy-control contract:
  disabled, `aria-busy`, and a labelled `Loader2` while pending.

## TDD evidence

### RED

Added `tests/verification-gate-loading.test.ts` before the implementation.
`npm test -- tests/verification-gate-loading.test.ts` failed as intended:

`expected button.disabled to be true; received false`

The initial test run first exposed the component's existing test-environment
requirement for a global React binding; the test was updated to mirror the
existing jsdom test convention, then failed for the intended missing busy
behavior.

### GREEN

After the minimal resend loading implementation:

`npm test -- tests/verification-gate-loading.test.ts tests/promo-code-field.test.ts`

passed: 2 files, 2 tests.

## Final verification

- `npm test` — passed: 113 files, 589 tests.
- `git diff --check` — passed.
- `npm run typecheck` — not clean due to an existing unrelated incompatibility
  in `tests/button-loading.test.ts` between the admin and shared `Button`
  component variant types. Task 4 files did not appear in the error.

## Self-review

- Changed only the four files assigned by the brief and its requested new test.
- Preserved resend request/error/cooldown behavior and verification redirect.
- Kept cooldown independently disabling the resend control.
- Did not alter static disabled states or navigation behavior.
- Did not modify shared Button behavior or duplicate it in the excluded
  cancel/review/personal-data controls.
