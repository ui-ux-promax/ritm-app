# Ritm MVP Launch Slice Design

## Goal

Define the next development direction for Ritm app as a launch-risk-first roadmap, with Phase 1 focused on a working preview storefront journey rather than a full production launch.

## Selected Roadmap Approach

Use **MVP Launch Slice**.

Phase 1 must produce a live preview where the basic storefront path is usable:

```text
/ -> /catalog -> /product/<seeded-slug> -> /cart -> /checkout
```

This phase does not prove the full payment lifecycle. It proves that deployment, configuration, data delivery, seeded product visibility, public routes, and basic cart/checkout surfaces are ready for focused reliability work.

## Hard Project Rules

- Never run `prisma db push`, `prisma db seed`, or e2e locally on Windows against Neon.
- Locally run only safe checks: `npm run prisma:generate`, `npm run typecheck`, `npm run test`, and `npm run build`.
- Never hand-edit or read/write `.env*` files. Keep `.env.example` changes deliberate and review by diff only when needed.
- Commits and PRs must be English, conventional-commits style, single author `ui-ux-promax`, and contain no `Co-Authored-By` or assistant attribution.
- Commit or push only when the user asks.
- Branch from `main` for new work; never commit directly on `main`.
- Schema changes must be additive-safe because deploy uses `db push` without `--accept-data-loss`.

## Roadmap Phases

### Phase 1: MVP Launch Slice

Deliver a green preview deployment and verify the basic storefront path:

- GitHub and Vercel baseline are connected.
- Build command and deployment target are understood.
- Required runtime environment contract is documented without exposing secrets.
- Preview database schema and seed delivery path is selected and executed through an approved route.
- Seeded product slug used for smoke checks is known.
- Homepage, catalog, seeded PDP, cart, and checkout routes load on preview.
- Runtime smoke catches missing seeded products, broken images, stale brand names, and checkout/cart page failures.

### Phase 2: Purchase Reliability

Stabilize the money path after preview is alive:

- Checkout validation and order creation.
- YooKassa redirect/payment state handling.
- Webhook processing and idempotency.
- Email flows and verification states.
- Cancel/refund/failure paths.

### Phase 3: Storefront Brand Polish

Make the public experience feel intentional:

- Wide hero/drop assets or layout adjustments for portrait-only assets.
- Catalog/PDP visual polish.
- Mobile layout pass.
- Loading, empty, and error states.
- Accessibility and browser visual smoke.

### Phase 4: Admin Operations

Make the store manageable:

- Product, category, order, customer, coupon, and media workflows.
- Stock and variant management.
- Admin route smoke checks.
- Operational UX cleanup.

### Phase 5: Production Readiness

Prepare for real launch:

- Monitoring and Sentry review.
- Rate limits and security headers.
- Backup and rollback posture.
- Production data and seed policy.
- Release checklist and runbook.

## Phase 1 Scope

### In Scope

- Confirm repo branch and GitHub/Vercel deployment flow.
- Define the preview environment contract without exposing secrets.
- Choose one approved schema/seed path:
  - CI on Ubuntu runners,
  - Vercel deploy build command using `prisma db push --skip-generate && next build`, or
  - `gen-seed-sql.ts` output applied through Neon SQL Editor.
- Confirm seeded catalog contract:
  - Product slug for smoke: `ritm-white-tee-oversize`.
  - Clothing sizes: `XS`, `S`, `M`, `L`, `XL`, `XXL`.
  - Coupon: `RITM10`.
- Verify preview routes:
  - `/`
  - `/catalog`
  - `/product/ritm-white-tee-oversize`
  - `/cart`
  - `/checkout`
- Check for broken product images and old runtime brand leakage on public routes.
- Run local safe checks before PR/deploy handoff:
  - `npm run prisma:generate`
  - `npm run typecheck`
  - `npm run test`
  - `npm run build`

### Out of Scope

- Full payment success/failure proof.
- YooKassa webhook reliability.
- Local e2e execution.
- Local `prisma db push` or `prisma db seed`.
- Broad storefront redesign.
- Admin operations polish beyond any blocker needed for preview data.

## Verification Strategy

Use local checks only for build confidence. Use deployed preview for route smoke.

Local allowed checks:

```powershell
npm run prisma:generate
npm run typecheck
npm run test
npm run build
```

Preview checks:

- Use browser automation or Playwright MCP against the Vercel preview URL.
- Check desktop and mobile widths where practical.
- Do not run local e2e against Neon.
- Record any skipped check with the reason.

## Skill Usage Policy

- Use SuperPowers brainstorming before changing scope or feature behavior.
- Use SuperPowers writing-plans before implementing Phase 1.
- Use SuperPowers verification-before-completion before claiming a phase is complete.
- Use systematic-debugging for failing builds, preview errors, database delivery issues, or missing product routes.
- Use frontend-design and ui-ux-pro-max for visual storefront changes.
- Use vercel-react-best-practices for React/Next.js routing, data fetching, metadata, and component work.
- Use Context7 only when current external docs are needed.
- Use Playwright MCP for preview visual smoke after meaningful UI-visible changes.

## Acceptance Criteria

Phase 1 is done when:

- Preview deployment exists for the Phase 1 branch or PR.
- The approved schema/seed delivery route has been used or a precise manual Neon SQL path has been documented.
- The seeded PDP route does not show "product not found" on preview.
- `/`, `/catalog`, `/product/ritm-white-tee-oversize`, `/cart`, and `/checkout` load on preview.
- Product images referenced by runtime data are present.
- Local safe checks pass.
- No local Prisma push/seed or local e2e was run.
- Remaining warnings, skipped checks, and next-phase risks are listed.