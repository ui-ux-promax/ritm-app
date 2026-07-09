# Phase 4 Admin Operations Smoke + Prototype Alignment Design

## Purpose

Phase 4 makes the existing Ritm admin usable for daily store operations while preserving the mechanics that are already implemented. The work is not a rewrite: the HTML prototypes define the visual target, and the current Next.js/Prisma/server-action implementation defines the data and behavior contract.

## Source Of Truth

- Visual source of truth: `e-comerce-shop-prot/admin-dashboard.html`, `admin-catalog.html`, `admin-orders.html`, `admin-clients.html`, and `admin-promocodes.html`.
- Mechanical source of truth: current App Router pages under `app/(admin)/admin`, admin server actions under `app/actions/admin`, DTOs under `services/dto`, admin helpers under `lib/admin`, and media API routes under `app/api/admin/media`.
- When prototype JavaScript uses mock arrays or toast-only actions, replace them with real server data/actions when they already exist. Keep mock-only mechanics disabled or explicit if no backend exists yet.
- Do not run local Prisma push/seed or local Neon e2e.

## Prototype Mapping

- `admin-dashboard.html` maps to `/admin`.
- `admin-catalog.html` maps to `/admin/catalog`, `/admin/catalog/products`, `/admin/catalog/products/new`, `/admin/catalog/products/[id]/edit`, `/admin/catalog/categories`, `/admin/catalog/categories/new`, and `/admin/catalog/categories/[id]/edit`.
- `admin-orders.html` maps to `/admin/orders` and informs `/admin/orders/[id]`.
- `admin-clients.html` maps to `/admin/customers` and informs `/admin/customers/[id]`.
- `admin-promocodes.html` maps to `/admin/marketing`, `/admin/marketing/new`, and `/admin/marketing/[id]/edit`.

## Visual Contract

The admin UI should follow the prototypes closely:

- Shell uses a 286px dark sticky sidebar, mobile top bar, mobile slide-out nav, and a centered workspace `min(100% - 56px, 1360px)`.
- Tokens mirror the prototypes: warm off-white background, white surfaces, dark text/sidebar, muted text, green money/accent, 24px/32px radii, pill controls, soft shadows, Satoshi-style display and Inter-style body typography.
- Pages use prototype page headers, global search placement, admin avatar block, KPI cards, panels, tables, filter chips, status pills, pagination, bulk bars where the real workflow supports selection, and responsive behavior from the HTML.
- Use existing icon system where possible, but visual size, stroke weight, and placement should match the prototype.
- Avoid unrelated redesign, purple/dark-blue admin themes, and invented content. Numbers and rows must come from real data or be clearly omitted/disabled.

## Functional Contract

The existing mechanics remain:

- Auth guard stays in `app/(admin)/layout.tsx` via `requireAdminPage`.
- Mutations stay in existing server actions with `requireAdminAction`.
- Product/category/coupon forms keep current DTO validation.
- Order status transitions keep current guarded forward flow and admin cancellation behavior.
- Customer role changes keep current last-admin/self-demotion guards.
- Cloudinary signing/deletion stays behind admin API guards.
- Existing real filters, pagination, search params, route links, and detail pages stay canonical.

## Phase 4 Slice

This slice is `Smoke+blockers + prototype alignment`:

- Add or update admin route smoke coverage for all primary list/new/edit/detail surfaces.
- Align shell and shared admin primitives to the prototype tokens and layout before individual pages.
- Align catalog pages to the catalog prototype while keeping real product/category/variant/stock/media workflows.
- Align orders pages to the orders prototype while keeping order status, payment display, detail navigation, cancellation, and ownership-independent admin access.
- Align customers pages to the clients prototype while keeping real user/order/review/wishlist/cart data and role actions.
- Align marketing pages to the promocodes prototype while keeping real coupon CRUD/toggle/delete.
- Fix only blockers discovered while aligning: broken navigation, broken responsive layout, inaccessible placeholder actions, unsafe media deletion semantics, inconsistent status mapping, or smoke failures.

## Known Risks

- The current admin CSS and component copy show signs of encoding corruption in terminal output. Before changing strings, verify file contents in the editor or by rendering, not only through shell output.
- Some prototype actions are decorative or mock-only, such as report export, notifications, bulk marketing actions, and global search. These must not be wired to fake behavior. Use disabled/explicit pending UI or omit them if no real workflow exists.
- Removing an image from an edit form currently risks deleting the Cloudinary asset before the admin saves. The implementation plan must handle persisted versus newly uploaded assets carefully.
- Pixel-perfect alignment should not break server/client boundaries: Prisma remains server-side, and client components only own interaction state.

## Verification

- Run `npm run typecheck`.
- Run targeted admin Vitest coverage for actions, DTOs, media routes, nav, pagination, and analytics.
- Run `npm run build`.
- For visual changes, run the app locally and compare `/admin`, `/admin/catalog/products`, `/admin/orders`, `/admin/customers`, and `/admin/marketing` against their HTML prototypes at desktop and mobile widths.
- Do not treat skipped Neon/Prisma push/e2e as a pass; record those as external checks if needed.

## Out Of Scope

- New database schema for admin.
- Real export/reporting, notification center, CRM campaigns, or bulk marketing automation.
- Replacing YooKassa/payment flow.
- Replacing current server actions with API-only mutations.
- Local Prisma push/seed against Neon.
