# Phase 5 Verification Record

Status: in progress. This record separates observed evidence from release requirements that still need an owner-controlled production check.

## Confirmed local evidence

- 2026-07-13: commit `600b6b6` passed Prisma generation, TypeScript typecheck, 98 Vitest files / 566 tests, production build, and `git diff --check` before push.
- 2026-07-13: `public/products/product-white-tee.png` was reduced from 7,590,721 bytes to 1,281,668 bytes; `tests/portfolio-assets.test.ts` enforces a 1.5 MB budget.

## Confirmed Preview evidence

- Deployment: `https://ritm-dfdsvwtc6-s1aw3ns-projects.vercel.app`
- Public routes checked: `/demo-admin`, `/demo-admin/catalog`, `/demo-admin/orders`, `/demo-admin/customers`, `/demo-admin/marketing`.
- Demo routes rendered synthetic read-only content with no forms or enabled write buttons.
- Portfolio capture produced desktop storefront/demo-admin and mobile catalog/demo-admin screenshots from this Preview.

## Pending external evidence

- Production deployment URL and reviewed commit SHA.
- GitHub Actions run URL and result.
- Production smoke timestamp and result.
- YooKassa sandbox order number, status, and timestamp.
- Sentry controlled-event correlation ID and owner alert result.
- Two authorized reset invariants.
- Neon recovery rehearsal result with RPO and RTO.

## Known Preview limitation

`/api/health` returned `503` on the checked Preview. This indicates the Preview environment does not have the required health dependencies, such as Upstash configuration. It is not accepted as production health evidence.
