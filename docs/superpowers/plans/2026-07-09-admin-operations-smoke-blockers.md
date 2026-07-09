# Admin Operations Smoke + Prototype Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the existing Ritm admin with the HTML prototypes while preserving current Prisma, server action, auth, media, order, customer, coupon, and catalog mechanics.

**Architecture:** Treat `e-comerce-shop-prot/admin-*.html` as the visual contract and current `app/(admin)` code as the behavior contract. First add a route/prototype contract and shared prototype-aligned admin primitives, then align each admin surface with focused changes and existing data. Keep Prisma in server pages/actions, keep filters/forms/toggles in client components, and avoid fake behavior for prototype-only actions.

**Tech Stack:** Next.js 15 App Router, React 18, TypeScript, Tailwind CSS, Prisma, NextAuth, Vitest, Cloudinary, existing admin UI primitives.

## Global Constraints

- Visual source of truth: `e-comerce-shop-prot/admin-dashboard.html`, `admin-catalog.html`, `admin-orders.html`, `admin-clients.html`, and `admin-promocodes.html`.
- Mechanical source of truth: current App Router pages under `app/(admin)/admin`, admin server actions under `app/actions/admin`, DTOs under `services/dto`, admin helpers under `lib/admin`, and media API routes under `app/api/admin/media`.
- When prototype JavaScript uses mock arrays or toast-only actions, replace them with real server data/actions when they already exist. Keep mock-only mechanics disabled or explicit if no backend exists yet.
- Do not run local Prisma push/seed or local Neon e2e.
- Auth guard stays in `app/(admin)/layout.tsx` via `requireAdminPage`.
- Mutations stay in existing server actions with `requireAdminAction`.
- Product/category/coupon forms keep current DTO validation.
- Order status transitions keep current guarded forward flow and admin cancellation behavior.
- Customer role changes keep current last-admin/self-demotion guards.
- Cloudinary signing/deletion stays behind admin API guards.
- Existing real filters, pagination, search params, route links, and detail pages stay canonical.

---

## File Structure

- Create `lib/admin/prototype-contract.ts`: single list of prototype files and route paths used by smoke contract tests.
- Create `tests/admin-route-contract.test.ts`: verifies prototype files exist, page files exist, and `ADMIN_NAV` maps to the expected primary routes.
- Modify `app/globals.css`: align `.admin-root` tokens and shared admin component CSS with the prototypes.
- Modify `tailwind.config.ts`: point admin font aliases at existing app font variables in the closest prototype-compatible way.
- Modify `components/admin/admin-shell.tsx`, `components/admin/admin-mobile-menu.tsx`, and `components/admin/admin-tab-bar.tsx`: shell layout, sidebar, mobile bar, disabled decorative actions.
- Create `components/admin/admin-page-header.tsx`: reusable prototype topbar/header block for list/detail/form pages.
- Create `components/admin/admin-kpi-card.tsx`: reusable prototype KPI card.
- Create `components/admin/admin-panel.tsx`: reusable prototype panel wrapper and table/search toolbar classes.
- Modify `lib/cloudinary/types.ts`, `components/admin/media/image-uploader.tsx`, `components/admin/media/image-preview-card.tsx`, `app/(admin)/admin/catalog/categories/_components/category-form.tsx`, `app/(admin)/admin/catalog/products/[id]/edit/page.tsx`, and `app/actions/admin/products.ts`: safe persisted media removal.
- Create `lib/cloudinary/admin-media.ts` and `tests/admin-media.test.ts`: pure helpers for persisted/new upload deletion semantics.
- Modify catalog files under `app/(admin)/admin/catalog/**`: prototype-aligned catalog, product, category list/form/table views.
- Modify order files under `app/(admin)/admin/orders/**`: prototype-aligned order list/detail while preserving status actions.
- Modify customer files under `app/(admin)/admin/customers/**`: prototype-aligned client list/detail while preserving role actions.
- Modify marketing files under `app/(admin)/admin/marketing/**`: prototype-aligned promocode list/form/table while preserving coupon actions.
- Modify dashboard files under `app/(admin)/admin/**/_components` where needed to match shared shell/panel/KPI primitives.

---

### Task 1: Admin Route And Prototype Contract

**Files:**
- Create: `lib/admin/prototype-contract.ts`
- Create: `tests/admin-route-contract.test.ts`
- Modify: `tests/admin-nav.test.ts`

**Interfaces:**
- Consumes: `ADMIN_NAV` from `lib/admin/nav.ts`
- Produces: `ADMIN_PROTOTYPES`, `ADMIN_ROUTE_SMOKE_TARGETS`, and `ADMIN_PRIMARY_ROUTE_ORDER`

- [ ] **Step 1: Add the failing route contract test**

Create `tests/admin-route-contract.test.ts`:

```ts
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ADMIN_PRIMARY_ROUTE_ORDER,
  ADMIN_PROTOTYPES,
  ADMIN_ROUTE_SMOKE_TARGETS,
} from '@/lib/admin/prototype-contract';
import { ADMIN_NAV } from '@/lib/admin/nav';

const root = process.cwd();

describe('admin prototype contract', () => {
  it('keeps every visual prototype file in the repo', () => {
    for (const file of ADMIN_PROTOTYPES) {
      expect(existsSync(join(root, file))).toBe(true);
    }
  });

  it('keeps every primary admin route backed by a page file', () => {
    for (const target of ADMIN_ROUTE_SMOKE_TARGETS) {
      expect(existsSync(join(root, target.pageFile))).toBe(true);
    }
  });

  it('keeps sidebar routes in prototype order', () => {
    expect(ADMIN_NAV.map((item) => item.href)).toEqual(ADMIN_PRIMARY_ROUTE_ORDER);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
npm run test -- admin-route-contract
```

Expected: FAIL because `@/lib/admin/prototype-contract` does not exist.

- [ ] **Step 3: Add the route contract module**

Create `lib/admin/prototype-contract.ts`:

```ts
export const ADMIN_PROTOTYPES = [
  'e-comerce-shop-prot/admin-dashboard.html',
  'e-comerce-shop-prot/admin-catalog.html',
  'e-comerce-shop-prot/admin-orders.html',
  'e-comerce-shop-prot/admin-clients.html',
  'e-comerce-shop-prot/admin-promocodes.html',
] as const;

export const ADMIN_PRIMARY_ROUTE_ORDER = [
  '/admin',
  '/admin/catalog',
  '/admin/orders',
  '/admin/customers',
  '/admin/marketing',
] as const;

export const ADMIN_ROUTE_SMOKE_TARGETS = [
  { route: '/admin', pageFile: 'app/(admin)/admin/page.tsx', prototype: 'e-comerce-shop-prot/admin-dashboard.html' },
  { route: '/admin/catalog', pageFile: 'app/(admin)/admin/catalog/page.tsx', prototype: 'e-comerce-shop-prot/admin-catalog.html' },
  { route: '/admin/catalog/products', pageFile: 'app/(admin)/admin/catalog/products/page.tsx', prototype: 'e-comerce-shop-prot/admin-catalog.html' },
  { route: '/admin/catalog/products/new', pageFile: 'app/(admin)/admin/catalog/products/new/page.tsx', prototype: 'e-comerce-shop-prot/admin-catalog.html' },
  { route: '/admin/catalog/products/[id]/edit', pageFile: 'app/(admin)/admin/catalog/products/[id]/edit/page.tsx', prototype: 'e-comerce-shop-prot/admin-catalog.html' },
  { route: '/admin/catalog/categories', pageFile: 'app/(admin)/admin/catalog/categories/page.tsx', prototype: 'e-comerce-shop-prot/admin-catalog.html' },
  { route: '/admin/catalog/categories/new', pageFile: 'app/(admin)/admin/catalog/categories/new/page.tsx', prototype: 'e-comerce-shop-prot/admin-catalog.html' },
  { route: '/admin/catalog/categories/[id]/edit', pageFile: 'app/(admin)/admin/catalog/categories/[id]/edit/page.tsx', prototype: 'e-comerce-shop-prot/admin-catalog.html' },
  { route: '/admin/orders', pageFile: 'app/(admin)/admin/orders/page.tsx', prototype: 'e-comerce-shop-prot/admin-orders.html' },
  { route: '/admin/orders/[id]', pageFile: 'app/(admin)/admin/orders/[id]/page.tsx', prototype: 'e-comerce-shop-prot/admin-orders.html' },
  { route: '/admin/customers', pageFile: 'app/(admin)/admin/customers/page.tsx', prototype: 'e-comerce-shop-prot/admin-clients.html' },
  { route: '/admin/customers/[id]', pageFile: 'app/(admin)/admin/customers/[id]/page.tsx', prototype: 'e-comerce-shop-prot/admin-clients.html' },
  { route: '/admin/marketing', pageFile: 'app/(admin)/admin/marketing/page.tsx', prototype: 'e-comerce-shop-prot/admin-promocodes.html' },
  { route: '/admin/marketing/new', pageFile: 'app/(admin)/admin/marketing/new/page.tsx', prototype: 'e-comerce-shop-prot/admin-promocodes.html' },
  { route: '/admin/marketing/[id]/edit', pageFile: 'app/(admin)/admin/marketing/[id]/edit/page.tsx', prototype: 'e-comerce-shop-prot/admin-promocodes.html' },
] as const;
```

- [ ] **Step 4: Update the existing nav test to consume the contract**

In `tests/admin-nav.test.ts`, replace the hard-coded route array in the first test with:

```ts
import { ADMIN_PRIMARY_ROUTE_ORDER } from '@/lib/admin/prototype-contract';

expect(ADMIN_NAV.map((n) => n.href)).toEqual([...ADMIN_PRIMARY_ROUTE_ORDER]);
```

- [ ] **Step 5: Verify**

Run:

```bash
npm run test -- admin-route-contract admin-nav
npm run typecheck
```

Expected: PASS for both test files and typecheck.

- [ ] **Step 6: Commit**

```bash
git add lib/admin/prototype-contract.ts tests/admin-route-contract.test.ts tests/admin-nav.test.ts
git commit -m "test: add admin route prototype contract"
```

---

### Task 2: Prototype Tokens, Shell, And Shared Admin Primitives

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`
- Modify: `components/admin/admin-shell.tsx`
- Modify: `components/admin/admin-mobile-menu.tsx`
- Modify: `components/admin/admin-tab-bar.tsx`
- Create: `components/admin/admin-page-header.tsx`
- Create: `components/admin/admin-kpi-card.tsx`
- Create: `components/admin/admin-panel.tsx`
- Test: `tests/admin-route-contract.test.ts`

**Interfaces:**
- Consumes: `ADMIN_NAV`, `isNavActive`
- Produces: `AdminPageHeader`, `AdminKpiCard`, `AdminPanel`

- [ ] **Step 1: Run current checks for the shell baseline**

Run:

```bash
npm run test -- admin-route-contract admin-nav
npm run typecheck
```

Expected: PASS.

- [ ] **Step 2: Align admin CSS variables to prototype tokens**

In `app/globals.css`, replace the `.admin-root` light token block with prototype values:

```css
.admin-root {
  --admin-bg: hsl(42 30% 97%);
  --admin-surface: hsl(0 0% 100%);
  --admin-surface-low: hsl(42 20% 94%);
  --admin-surface-container: hsl(42 20% 94%);
  --admin-surface-high: hsl(42 20% 94%);
  --admin-on-bg: hsl(220 12% 10%);
  --admin-on-surface: hsl(220 12% 10%);
  --admin-on-surface-variant: hsl(220 7% 42%);
  --admin-primary: hsl(220 12% 10%);
  --admin-on-primary: hsl(0 0% 100%);
  --admin-secondary-container: hsl(151 35% 38% / 0.12);
  --admin-on-secondary-container: hsl(151 35% 38%);
  --admin-error: hsl(4 70% 52%);
  --admin-on-error: hsl(0 0% 100%);
  --admin-outline: hsl(42 15% 88%);
  --admin-outline-variant: hsl(42 15% 88%);
  --admin-sidebar: hsl(220 16% 9%);
  --admin-money: hsl(151 35% 38%);
  --admin-warning: hsl(42 92% 50%);
  --admin-info: hsl(205 72% 48%);
  --admin-shadow-soft: 0 22px 70px hsl(220 12% 10% / .08);
  --admin-shadow-tight: 0 12px 36px hsl(220 12% 10% / .06);
  background:
    radial-gradient(circle at 16% -8%, hsl(42 20% 94%) 0, transparent 330px),
    var(--admin-bg);
  color: var(--admin-on-bg);
}
```

Keep the dark token block only if `ThemeToggle` remains visible. If dark mode remains, adjust it to be internally consistent but do not use purple, slate, or lime as the default light admin palette.

- [ ] **Step 3: Align admin font aliases**

In `tailwind.config.ts`, update `fontFamily` admin aliases:

```ts
fontFamily: {
  sans: ['var(--font-manrope)', 'sans-serif'],
  display: ['var(--font-unbounded)', 'sans-serif'],
  'admin-head': ['var(--font-manrope)', 'sans-serif'],
  'admin-body': ['var(--font-manrope)', 'sans-serif'],
},
```

Reason: the repo does not currently load Satoshi or Inter. Manrope is the closest loaded Cyrillic-safe body/display substitute. Do not add a new Google font in this task.

- [ ] **Step 4: Create the page header primitive**

Create `components/admin/admin-page-header.tsx`:

```tsx
import { Icon } from '@/components/admin/icon';
import { cn } from '@/lib/utils';

interface AdminPageHeaderProps {
  kicker: string;
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
  action?: React.ReactNode;
  className?: string;
}

export function AdminPageHeader({
  kicker,
  title,
  subtitle,
  searchPlaceholder,
  action,
  className,
}: AdminPageHeaderProps) {
  return (
    <header className={cn('flex items-start justify-between gap-[22px] max-[760px]:grid', className)}>
      <div className="min-w-0">
        <div className="text-[13px] font-bold uppercase tracking-[.06em] text-admin-on-surface-variant">{kicker}</div>
        <h1 className="mt-1 font-admin-head text-[clamp(32px,3.4vw,52px)] font-extrabold leading-[.96] tracking-[-.035em] text-admin-on-surface">
          {title}
        </h1>
        <p className="mt-[9px] max-w-[64ch] text-[15px] text-admin-on-surface-variant">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3 max-[760px]:justify-start">
        {searchPlaceholder && (
          <label className="flex h-14 w-[min(36vw,480px)] min-w-[330px] items-center gap-3 rounded-full border border-admin-outline-variant bg-admin-surface px-[18px] text-admin-on-surface-variant shadow-[var(--admin-shadow-tight)] max-[760px]:w-full max-[760px]:min-w-0">
            <Icon name="search" className="text-[20px]" />
            <input
              type="search"
              name="q"
              placeholder={searchPlaceholder}
              className="min-w-0 flex-1 bg-transparent text-[15px] text-admin-on-surface outline-none placeholder:text-admin-on-surface-variant"
            />
          </label>
        )}
        {action}
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Create KPI and panel primitives**

Create `components/admin/admin-kpi-card.tsx`:

```tsx
import { Icon } from '@/components/admin/icon';
import { cn } from '@/lib/utils';

interface AdminKpiCardProps {
  icon: string;
  label: string;
  value: string;
  delta?: string;
  tone?: 'default' | 'primary' | 'danger';
}

export function AdminKpiCard({ icon, label, value, delta, tone = 'default' }: AdminKpiCardProps) {
  const primary = tone === 'primary';
  return (
    <article
      className={cn(
        'relative flex min-h-[166px] flex-col gap-[15px] overflow-hidden rounded-[24px] border p-5 shadow-[var(--admin-shadow-tight)]',
        primary
          ? 'border-[var(--admin-sidebar)] bg-[var(--admin-sidebar)] text-admin-on-primary'
          : 'border-admin-outline-variant bg-admin-surface text-admin-on-surface',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className={cn(
            'grid h-11 w-11 place-items-center rounded-full',
            primary ? 'bg-admin-on-primary text-[var(--admin-sidebar)]' : 'bg-admin-surface-low text-admin-on-surface',
          )}
        >
          <Icon name={icon} className="text-[21px]" />
        </div>
      </div>
      <div>
        <div className={cn('text-[13px] font-bold', primary ? 'text-admin-on-primary/70' : 'text-admin-on-surface-variant')}>
          {label}
        </div>
        <div className="mt-2 font-admin-head text-[clamp(28px,2.3vw,38px)] font-extrabold leading-[.92] tracking-[-.055em] tabular-nums">
          {value}
        </div>
      </div>
      {delta && (
        <span className={cn('mt-auto text-[13px] font-extrabold', tone === 'danger' ? 'text-admin-error' : primary ? 'text-admin-on-primary' : 'text-[var(--admin-money)]')}>
          {delta}
        </span>
      )}
    </article>
  );
}
```

Create `components/admin/admin-panel.tsx`:

```tsx
import { cn } from '@/lib/utils';

interface AdminPanelProps {
  title?: string;
  note?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AdminPanel({ title, note, actions, children, className }: AdminPanelProps) {
  return (
    <section className={cn('rounded-[24px] border border-admin-outline-variant bg-admin-surface p-[22px] shadow-[var(--admin-shadow-tight)]', className)}>
      {(title || note || actions) && (
        <div className="mb-[18px] flex items-start justify-between gap-4 max-[760px]:grid">
          <div>
            {title && <h2 className="font-admin-head text-[22px] font-extrabold leading-none tracking-[-.035em] text-admin-on-surface">{title}</h2>}
            {note && <p className="mt-[7px] max-w-[72ch] text-[13px] text-admin-on-surface-variant">{note}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
```

- [ ] **Step 6: Align shell layout**

In `components/admin/admin-shell.tsx`:

- Set sidebar width to `w-[286px]`.
- Set sidebar background to `bg-[var(--admin-sidebar)]`.
- Set sidebar padding to `px-5 pb-[22px] pt-7`.
- Replace the top search read-only text field with a disabled visual quick search button:

```tsx
<button
  type="button"
  disabled
  aria-disabled="true"
  className="flex min-h-12 items-center gap-2 rounded-[18px] border border-white/10 bg-white/10 px-[13px] text-sm font-bold text-white/60"
>
  <Icon name="search" className="text-[20px]" />
  <span>Быстрый поиск</span>
  <kbd className="ml-auto rounded-lg bg-white/10 px-2 py-1 font-mono text-[11px] text-white/55">/</kbd>
</button>
```

- Replace `href="#"` help/settings anchors with disabled buttons:

```tsx
<button type="button" disabled className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/45">
  <Icon name="help" />
  <span>Помощь</span>
</button>
<button type="button" disabled className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/45">
  <Icon name="settings" />
  <span>Настройки</span>
</button>
```

- Set `<main>` inner wrapper to match prototype:

```tsx
<div className="mx-auto w-[min(100%-56px,1360px)] px-0 py-8 pb-28 md:pb-[52px]">
```

If Tailwind rejects `w-[min(100%-56px,1360px)]`, use:

```tsx
<div className="mx-auto w-[min(calc(100%-56px),1360px)] px-0 py-8 pb-28 md:pb-[52px]">
```

Then verify generated CSS. If both are awkward, use `className="admin-workspace"` and add this in `app/globals.css`:

```css
.admin-root .admin-workspace {
  width: min(100% - 56px, 1360px);
  margin-inline: auto;
  padding: 32px 0 52px;
}
@media (max-width: 640px) {
  .admin-root .admin-workspace {
    width: min(100% - 32px, 1360px);
    padding-top: 22px;
  }
}
```

- [ ] **Step 7: Align mobile menu and tab bar**

In `components/admin/admin-mobile-menu.tsx`, keep sign-out and theme toggle real. For Help/Settings menu items, keep them disabled with `onSelect={(e) => e.preventDefault()}` and add `aria-disabled="true"` plus muted class.

In `components/admin/admin-tab-bar.tsx`, keep existing `ADMIN_NAV` source. Use prototype-like pill nav:

```tsx
className="fixed inset-x-3 bottom-3 z-40 rounded-[24px] border border-admin-outline-variant bg-admin-surface/95 p-2 shadow-[var(--admin-shadow-soft)] backdrop-blur-lg md:hidden"
```

- [ ] **Step 8: Verify**

Run:

```bash
npm run test -- admin-route-contract admin-nav
npm run typecheck
```

Expected: PASS. Manually open `/admin` after later dev-server verification to confirm no unreadable dark-on-dark shell text.

- [ ] **Step 9: Commit**

```bash
git add app/globals.css tailwind.config.ts components/admin/admin-shell.tsx components/admin/admin-mobile-menu.tsx components/admin/admin-tab-bar.tsx components/admin/admin-page-header.tsx components/admin/admin-kpi-card.tsx components/admin/admin-panel.tsx
git commit -m "feat: align admin shell with prototypes"
```

---

### Task 3: Safe Admin Media Removal

**Files:**
- Modify: `lib/cloudinary/types.ts`
- Create: `lib/cloudinary/admin-media.ts`
- Create: `tests/admin-media.test.ts`
- Modify: `components/admin/media/image-uploader.tsx`
- Modify: `components/admin/media/image-preview-card.tsx`
- Modify: `app/(admin)/admin/catalog/categories/_components/category-form.tsx`
- Modify: `app/(admin)/admin/catalog/products/[id]/edit/page.tsx`
- Modify: `app/actions/admin/products.ts`
- Modify: `tests/admin-products-action.test.ts`

**Interfaces:**
- Produces: `UploadedImage.persisted?: boolean`
- Produces: `shouldDeleteImmediately(image: UploadedImage): boolean`
- Produces: product update cleanup of removed persisted Cloudinary `publicId`s after successful DB save

- [ ] **Step 1: Write the failing media helper test**

Create `tests/admin-media.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { shouldDeleteImmediately, removedPersistedPublicIds } from '@/lib/cloudinary/admin-media';
import type { UploadedImage } from '@/lib/cloudinary/types';

const persisted = (publicId: string): UploadedImage => ({
  publicId,
  url: `https://res.cloudinary.com/demo/image/upload/${publicId}`,
  width: 0,
  height: 0,
  format: '',
  bytes: 0,
  persisted: true,
});

const fresh = (publicId: string): UploadedImage => ({
  publicId,
  url: `https://res.cloudinary.com/demo/image/upload/${publicId}`,
  width: 100,
  height: 100,
  format: 'webp',
  bytes: 1000,
});

describe('admin media helpers', () => {
  it('deletes only fresh uploads immediately from the client uploader', () => {
    expect(shouldDeleteImmediately(fresh('ritm/products/new'))).toBe(true);
    expect(shouldDeleteImmediately(persisted('ritm/products/old'))).toBe(false);
  });

  it('computes persisted public ids removed during product save', () => {
    expect(
      removedPersistedPublicIds(
        [persisted('ritm/products/a'), persisted('ritm/products/b')],
        [persisted('ritm/products/b'), fresh('ritm/products/c')],
      ),
    ).toEqual(['ritm/products/a']);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
npm run test -- admin-media
```

Expected: FAIL because `@/lib/cloudinary/admin-media` does not exist and `UploadedImage.persisted` is not typed.

- [ ] **Step 3: Extend the upload type and add helper**

In `lib/cloudinary/types.ts`, add:

```ts
  /** true when this image already exists in DB and must only be deleted after a successful save/delete action. */
  persisted?: boolean;
```

Create `lib/cloudinary/admin-media.ts`:

```ts
import type { UploadedImage } from '@/lib/cloudinary/types';

export function shouldDeleteImmediately(image: UploadedImage): boolean {
  return Boolean(image.publicId) && image.persisted !== true;
}

export function removedPersistedPublicIds(before: UploadedImage[], after: UploadedImage[]): string[] {
  const kept = new Set(after.map((image) => image.publicId).filter(Boolean));
  return before
    .filter((image) => image.persisted === true && image.publicId && !kept.has(image.publicId))
    .map((image) => image.publicId);
}
```

- [ ] **Step 4: Use safe immediate deletion in the uploader**

In `components/admin/media/image-uploader.tsx`, import `shouldDeleteImmediately`:

```ts
import { shouldDeleteImmediately } from '@/lib/cloudinary/admin-media';
```

In `handleRemove`, replace unconditional fetch with:

```ts
if (shouldDeleteImmediately(img)) {
  void fetch('/api/admin/media/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId: img.publicId }),
  }).catch(() => {});
}
```

In `uploadOne`, return `persisted: false`:

```ts
return {
  publicId: data.public_id,
  url: data.secure_url,
  width: data.width,
  height: data.height,
  format: data.format,
  bytes: data.bytes,
  persisted: false,
};
```

- [ ] **Step 5: Mark DB images as persisted**

In `app/(admin)/admin/catalog/categories/_components/category-form.tsx`, add `persisted: true` to the initial cover:

```ts
? { publicId: initial.coverImagePublicId, url: initial.coverImage, width: 0, height: 0, format: '', bytes: 0, persisted: true }
```

In `app/(admin)/admin/catalog/products/[id]/edit/page.tsx`, add `persisted: true` to mapped images:

```ts
images: c.images.map((im) => ({
  url: im.url,
  publicId: im.publicId ?? undefined,
  alt: im.alt ?? undefined,
  width: 0,
  height: 0,
  format: '',
  bytes: 0,
  persisted: true,
})),
```

- [ ] **Step 6: Clean removed persisted product images after successful product update**

In `app/actions/admin/products.ts`, update the `existing` product query in `updateProduct` so images select `publicId`:

```ts
colorways: {
  select: {
    id: true,
    images: { select: { publicId: true } },
    variants: { select: { id: true } },
  },
},
```

Before the transaction, compute removed public IDs:

```ts
const existingPublicIds = existing.colorways.flatMap((c) =>
  c.images.map((image) => image.publicId).filter(Boolean) as string[],
);
const incomingPublicIds = new Set(
  v.colorways.flatMap((c) => c.images.map((image) => image.publicId).filter(Boolean) as string[]),
);
const removedPublicIds = existingPublicIds.filter((publicId) => !incomingPublicIds.has(publicId));
```

After the transaction succeeds and before `revalidatePath`, add best-effort cleanup:

```ts
for (const publicId of removedPublicIds) {
  try {
    await deleteAsset(publicId);
  } catch {
    /* best-effort */
  }
}
```

- [ ] **Step 7: Extend product action test for removed image cleanup**

In `tests/admin-products-action.test.ts`, add a test under `describe('updateProduct')`:

```ts
it('deletes removed persisted Cloudinary images after successful update', async () => {
  p.product.findUnique.mockResolvedValue({
    id: 'pr1',
    colorways: [
      {
        id: 'cw1',
        images: [{ publicId: 'ritm/products/old' }, { publicId: 'ritm/products/keep' }],
        variants: [{ id: 'v1' }],
      },
    ],
  });
  p.orderItem.findMany.mockResolvedValue([]);
  p.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => fn(p));

  const next = {
    ...fullProduct,
    colorways: [
      {
        ...colorway,
        id: 'cw1',
        images: [
          {
            url: 'https://res.cloudinary.com/test/image/upload/ritm/products/keep',
            publicId: 'ritm/products/keep',
          },
        ],
        variants: [{ ...variant, id: 'v1' }],
      },
    ],
  };

  const r = await updateProduct('pr1', next);

  expect(r).toEqual({ ok: true, id: 'pr1' });
  expect(deleteAssetMock).toHaveBeenCalledWith('ritm/products/old');
  expect(deleteAssetMock).not.toHaveBeenCalledWith('ritm/products/keep');
});
```

Use the existing mock variable name for `deleteAsset`; if the file currently names it differently, keep the existing name and only change the assertion target.

- [ ] **Step 8: Verify**

Run:

```bash
npm run test -- admin-media admin-products-action categories-action media-delete-route
npm run typecheck
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add lib/cloudinary/types.ts lib/cloudinary/admin-media.ts tests/admin-media.test.ts components/admin/media/image-uploader.tsx components/admin/media/image-preview-card.tsx app/(admin)/admin/catalog/categories/_components/category-form.tsx app/(admin)/admin/catalog/products/[id]/edit/page.tsx app/actions/admin/products.ts tests/admin-products-action.test.ts
git commit -m "fix: defer deletion of persisted admin media"
```

---

### Task 4: Catalog Prototype Alignment

**Files:**
- Modify: `app/(admin)/admin/catalog/page.tsx`
- Modify: `app/(admin)/admin/catalog/_components/catalog-tabs.tsx`
- Modify: `app/(admin)/admin/catalog/products/page.tsx`
- Modify: `app/(admin)/admin/catalog/products/_components/product-filters.tsx`
- Modify: `app/(admin)/admin/catalog/products/_components/product-table.tsx`
- Modify: `app/(admin)/admin/catalog/products/_components/product-form.tsx`
- Modify: `app/(admin)/admin/catalog/products/_components/colorway-card.tsx`
- Modify: `app/(admin)/admin/catalog/products/_components/variant-matrix.tsx`
- Modify: `app/(admin)/admin/catalog/categories/page.tsx`
- Modify: `app/(admin)/admin/catalog/categories/_components/category-table.tsx`
- Modify: `app/(admin)/admin/catalog/categories/_components/category-form.tsx`
- Test: `tests/admin-products-action.test.ts`, `tests/categories-action.test.ts`, `tests/product-dto.test.ts`, `tests/category-dto.test.ts`

**Interfaces:**
- Consumes: `AdminPageHeader`, `AdminKpiCard`, `AdminPanel`
- Preserves: `createProduct`, `updateProduct`, `deleteProduct`, `createCategory`, `updateCategory`, `deleteCategory`, `moveCategory`

- [ ] **Step 1: Run catalog behavior baseline**

Run:

```bash
npm run test -- admin-products-action categories-action product-dto category-dto
```

Expected: PASS.

- [ ] **Step 2: Align product list header and KPI cards**

In `app/(admin)/admin/catalog/products/page.tsx`:

- Replace the local heading block with `AdminPageHeader`.
- Keep the real `total`, `ViewToggle`, and add product button.
- Replace the bottom bento metric cards with `AdminKpiCard` in a `grid grid-cols-1 gap-[18px] md:grid-cols-3`.
- Keep all Prisma query fields and URL filters unchanged.

Use these strings:

```tsx
<AdminPageHeader
  kicker="Каталог"
  title={`Товары (${total})`}
  subtitle="Управление товарами, расцветками, размерами, остатками и видимостью на витрине."
  action={...}
/>
```

- [ ] **Step 3: Align product filters to prototype chips/search**

In `product-filters.tsx`, keep current search params and selects. Change only classes:

- Wrapper: `flex flex-wrap items-center gap-3 rounded-[24px] border border-admin-outline-variant bg-admin-surface p-[18px] shadow-[var(--admin-shadow-tight)]`.
- Search input wrapper: `min-h-[46px] rounded-full border border-admin-outline-variant bg-admin-surface px-4`.
- Select triggers: rounded full, height `h-[46px]`, border `border-admin-outline-variant`.
- On mobile, stack with `max-[760px]:grid max-[760px]:grid-cols-1`.

- [ ] **Step 4: Align product table/card view**

In `product-table.tsx`:

- Outer panel: `rounded-[24px] border border-admin-outline-variant bg-admin-surface shadow-[var(--admin-shadow-tight)]`.
- Table wrapper: `overflow-x-auto rounded-[20px] border border-admin-outline-variant`.
- Desktop table `min-w-[1000px] border-collapse text-sm`.
- Header cells: `bg-admin-surface-low px-5 py-4 text-[12px] font-extrabold uppercase tracking-[.06em] text-admin-on-surface-variant`.
- Rows: hover `hover:bg-admin-surface-low/60`.
- Product thumbnails: `h-12 w-12 rounded-[14px] bg-admin-surface-low object-cover`.
- Pagination: prototype `page-btn` style: `grid h-9 w-9 place-items-center rounded-full border border-admin-outline-variant`.
- Keep delete guard modal and `deleteProduct` behavior.

Replace plain `<a href>` product edit links with `Link` from `next/link`.

- [ ] **Step 5: Align product form cards**

In `product-form.tsx`, wrap scalar fields, specs, toggles, colorways, and submit actions in `AdminPanel` sections:

- `Основное`: name, slug, brand, gender, category, sort order.
- `Описание`: description, fit note, specs.
- `Витрина`: bestseller and active switches.
- `Расцветки`: current colorway cards.

Keep `productSchema`, `createProduct`, `updateProduct`, `referencedVariantIds`, and `onInvalid`.

- [ ] **Step 6: Align colorway and variant matrix**

In `colorway-card.tsx`:

- Outer card: `rounded-[24px] border border-admin-outline-variant bg-admin-surface p-[18px]`.
- Default radio row: pill style with real radio input.
- Gallery uses existing `ImageUploader`.

In `variant-matrix.tsx`:

- Size buttons: rounded full, active dark primary, inactive surface.
- Variant rows: rounded `[18px]`, border, two-column mobile grid, desktop compact grid.
- Keep locked referenced variants non-removable.

- [ ] **Step 7: Align category list and form**

In `categories/page.tsx`, use:

```tsx
<AdminPageHeader
  kicker="Каталог"
  title={`Категории (${categories.length})`}
  subtitle="Разделы витрины, обложки и порядок отображения в меню магазина."
  action={<Button asChild><Link href="/admin/catalog/categories/new">Добавить категорию</Link></Button>}
/>
```

In `category-table.tsx`, align table/card classes with the product table and keep move/edit/delete behavior.

In `category-form.tsx`, wrap fields and cover upload in `AdminPanel`, keep `categorySchema`, `createCategory`, `updateCategory`, and safe cover semantics from Task 3.

- [ ] **Step 8: Verify**

Run:

```bash
npm run test -- admin-products-action categories-action product-dto category-dto admin-route-contract
npm run typecheck
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add 'app/(admin)/admin/catalog' 'app/(admin)/admin/catalog/products' 'app/(admin)/admin/catalog/categories'
git commit -m "feat: align admin catalog with prototype"
```

---

### Task 5: Orders Prototype Alignment

**Files:**
- Modify: `app/(admin)/admin/orders/page.tsx`
- Modify: `app/(admin)/admin/orders/_components/order-filters.tsx`
- Modify: `app/(admin)/admin/orders/_components/order-table.tsx`
- Modify: `app/(admin)/admin/orders/_components/order-status-actions.tsx`
- Modify: `app/(admin)/admin/orders/[id]/page.tsx`
- Modify: `lib/order-admin.ts` only if a display helper is needed
- Test: `tests/admin-orders-action.test.ts`, `tests/order-admin.test.ts`

**Interfaces:**
- Consumes: `AdminPageHeader`, `AdminKpiCard`, `AdminPanel`
- Preserves: `advanceOrderStatus`, `cancelOrderByAdmin`, `nextOrderStatus`, `canCancelOrder`

- [ ] **Step 1: Run orders behavior baseline**

Run:

```bash
npm run test -- admin-orders-action order-admin
```

Expected: PASS.

- [ ] **Step 2: Align orders page header and real KPI cards**

In `orders/page.tsx`, keep the existing `where` logic and queries. Add aggregate data for real KPI cards:

- Total matching orders: existing `total`.
- Revenue matching current filter: `prisma.order.aggregate({ where, _sum: { totalAmount: true } })`.
- Pending payment count: count where `payment.status = 'pending'`.
- Cancelled count: count where `status = 'CANCELLED'`.

Render four `AdminKpiCard`s after `AdminPageHeader`:

```tsx
<AdminPageHeader
  kicker="Управление заказами"
  title="Заказы"
  subtitle="Поток заказов Ritm: оплаты, сборка, отгрузка и отмены. Используйте поиск и фильтры, чтобы быстро находить нужные заказы."
  searchPlaceholder="Поиск заказа, клиента, товара"
/>
```

Do not invent week-over-week deltas. Omit `delta` unless a real value is computed.

- [ ] **Step 3: Align status chips and toolbar**

In `order-filters.tsx`, keep URL-driven `q`, `status`, and `payment`. Use prototype chip classes:

- Chips: `min-h-[35px] rounded-full border border-admin-outline-variant bg-admin-surface px-4 text-sm font-bold`.
- Active chip: `bg-admin-primary text-admin-on-primary`.
- Search row: `flex flex-wrap items-center gap-3`.

In `orders/page.tsx`, render count text:

```tsx
<div className="text-[13px] font-bold text-admin-on-surface-variant">
  Показано {rows.length} из {total}
</div>
```

- [ ] **Step 4: Align orders table**

In `order-table.tsx`:

- Use `AdminPanel` around the table.
- Keep row click/detail navigation to `/admin/orders/${row.id}`.
- Use prototype columns: order number/product thumb, customer, date, payment, status, total, actions.
- Payment status pill must use existing `paymentStatusView`.
- Order status pill must use existing `orderStatusView` or `ORDER_STATUS_META`; do not add new status values not in Prisma.
- Replace any non-real bulk action with disabled UI or omit it.

- [ ] **Step 5: Align order detail**

In `orders/[id]/page.tsx`:

- Keep `notFound`, Prisma include, `OrderStatusActions`, `formatPrice`, `formatDateTime`.
- Wrap customer, delivery, payment, items, totals in `AdminPanel`.
- Header should match prototype topbar density and include status/payment pills.
- Keep admin status actions visible and functional.

- [ ] **Step 6: Verify**

Run:

```bash
npm run test -- admin-orders-action order-admin admin-route-contract
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add 'app/(admin)/admin/orders' lib/order-admin.ts
git commit -m "feat: align admin orders with prototype"
```

---

### Task 6: Customers And Marketing Prototype Alignment

**Files:**
- Modify: `app/(admin)/admin/customers/page.tsx`
- Modify: `app/(admin)/admin/customers/_components/customer-filters.tsx`
- Modify: `app/(admin)/admin/customers/_components/customer-table.tsx`
- Modify: `app/(admin)/admin/customers/_components/role-toggle.tsx`
- Modify: `app/(admin)/admin/customers/[id]/page.tsx`
- Modify: `app/(admin)/admin/marketing/page.tsx`
- Modify: `app/(admin)/admin/marketing/_components/coupon-filters.tsx`
- Modify: `app/(admin)/admin/marketing/_components/coupon-table.tsx`
- Modify: `app/(admin)/admin/marketing/_components/coupon-form.tsx`
- Modify: `app/(admin)/admin/marketing/new/page.tsx`
- Modify: `app/(admin)/admin/marketing/[id]/edit/page.tsx`
- Test: `tests/admin-customers-action.test.ts`, `tests/customer-admin.test.ts`, `tests/admin-coupons-action.test.ts`, `tests/coupon-status.test.ts`

**Interfaces:**
- Consumes: `AdminPageHeader`, `AdminKpiCard`, `AdminPanel`
- Preserves: `changeUserRole`, `createCoupon`, `updateCoupon`, `toggleCoupon`, `deleteCoupon`

- [ ] **Step 1: Run customers and coupons behavior baseline**

Run:

```bash
npm run test -- admin-customers-action customer-admin admin-coupons-action coupon-status
```

Expected: PASS.

- [ ] **Step 2: Align customers page with clients prototype using real data**

In `customers/page.tsx`:

- Keep current SQL, search, role filter, sort, pagination.
- Use `AdminPageHeader`:

```tsx
<AdminPageHeader
  kicker="Клиентская база"
  title="Клиенты"
  subtitle="Покупатели Ritm, история заказов, LTV и управление ролями."
  searchPlaceholder="Поиск клиента: имя, телефон, e-mail"
/>
```

- Add KPI cards from existing query data:
  - `Всего клиентов`: total.
  - `Администраторы`: count role ADMIN using a separate `prisma.user.count`.
  - `Заказов в базе`: sum `order_count` for current page and label as `На странице`, or query global count if needed.
  - `Выручка клиентов`: sum `total_spent` for current page and label as `На странице`.

Do not show fake month deltas.

- [ ] **Step 3: Align customer filters and table**

In customer filters/table:

- Use prototype status chips for roles: `Все`, `Клиенты`, `Админы`.
- Preserve current query params `q`, `role`, `sort`.
- Use prototype table classes and row avatar initials.
- Keep row links to `/admin/customers/${row.id}`.
- Keep `RoleToggle` behavior and guard messages.

- [ ] **Step 4: Align customer detail**

In `customers/[id]/page.tsx`:

- Keep all current Prisma data.
- Render identity, metrics, recent orders, newsletter state, wishlist/cart counts in `AdminPanel`.
- Keep role toggle.
- Avoid adding send campaign/export actions.

- [ ] **Step 5: Align marketing page with promocodes prototype**

In `marketing/page.tsx`:

- Keep current `where`, `couponStatus`, and `CouponTable`.
- Use `AdminPageHeader`:

```tsx
<AdminPageHeader
  kicker="Маркетинг"
  title="Промокоды"
  subtitle="Процентные промокоды на сумму товаров: создание, включение, отключение и срок действия."
  searchPlaceholder="Поиск по коду"
  action={<Button asChild><Link href="/admin/marketing/new"><Icon name="add" className="text-[18px]" />Добавить промокод</Link></Button>}
/>
```

- Add real KPI cards:
  - `Всего кодов`: all coupons count.
  - `Активные`: active and non-expired.
  - `Истекли`: expired.
  - `Выключены`: inactive.

- [ ] **Step 6: Align coupon filters, table, and form**

In coupon filters/table/form:

- Use prototype pill filters for `Все`, `Активные`, `Выключены`, `Истекли`.
- Keep current URL param `status`.
- Keep inline toggle, edit, delete, and guard dialogs.
- Form sections use `AdminPanel`, pill submit buttons, and existing `couponSchema`.

- [ ] **Step 7: Verify**

Run:

```bash
npm run test -- admin-customers-action customer-admin admin-coupons-action coupon-status admin-route-contract
npm run typecheck
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add 'app/(admin)/admin/customers' 'app/(admin)/admin/marketing'
git commit -m "feat: align admin customers and marketing"
```

---

### Task 7: Dashboard Alignment And Final Verification

**Files:**
- Modify: `app/(admin)/admin/page.tsx`
- Modify: `app/(admin)/admin/_components/kpi-card.tsx`
- Modify: `app/(admin)/admin/_components/revenue-chart.tsx`
- Modify: `app/(admin)/admin/_components/status-donut.tsx`
- Modify: `app/(admin)/admin/_components/best-sellers.tsx`
- Modify: `app/(admin)/admin/_components/low-stock.tsx`
- Modify: `app/(admin)/admin/_components/recent-orders.tsx`
- Test: `tests/admin-analytics.test.ts`, `tests/admin-route-contract.test.ts`

**Interfaces:**
- Consumes: `AdminPageHeader`, `AdminKpiCard`, `AdminPanel`
- Preserves: `getKpis`, `getRevenueSeries`, `getStatusDistribution`, `getBestSellers`, `getLowStock`, `getRecentOrders`

- [ ] **Step 1: Run dashboard analytics baseline**

Run:

```bash
npm run test -- admin-analytics admin-route-contract
```

Expected: PASS.

- [ ] **Step 2: Align dashboard header and KPI grid**

In `app/(admin)/admin/page.tsx`:

- Replace current heading with:

```tsx
<AdminPageHeader
  kicker="Performance Hub"
  title="Дашборд"
  subtitle="Метрики магазина Ritm за выбранный период: выручка, заказы, клиенты, остатки и популярные товары."
  action={<PeriodToggle />}
/>
```

- Replace local `KpiCard` usage with shared `AdminKpiCard` or restyle the existing `KpiCard` to match `AdminKpiCard`. Prefer shared component if no chart-specific logic is lost.
- Grid: `grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-5`.

- [ ] **Step 3: Align dashboard panels**

Wrap revenue chart, status distribution, best sellers, low stock, and recent orders in `AdminPanel`.

Use prototype panel classes:

```tsx
<AdminPanel title="Выручка по дням" note="Динамика оплаченных и неотменённых заказов за период.">
```

Keep all existing data and chart components.

- [ ] **Step 4: Full automated verification**

Run:

```bash
npm run test -- admin admin-route-contract categories-action category-dto product-dto cloudinary customer-admin coupon-status order-admin
npm run typecheck
npm run build
```

Expected:

- All selected Vitest files pass.
- Typecheck passes.
- Build completes.

- [ ] **Step 5: Visual verification against prototypes**

Start dev server:

```bash
npm run dev
```

Open these routes and compare to matching prototypes:

- `/admin` against `e-comerce-shop-prot/admin-dashboard.html`
- `/admin/catalog/products` against `e-comerce-shop-prot/admin-catalog.html`
- `/admin/orders` against `e-comerce-shop-prot/admin-orders.html`
- `/admin/customers` against `e-comerce-shop-prot/admin-clients.html`
- `/admin/marketing` against `e-comerce-shop-prot/admin-promocodes.html`

Check desktop width 1440px and mobile width 390px:

- Sidebar width and dark color match.
- Mobile top bar and nav do not overlap content.
- Workspace width and page top spacing match.
- KPI cards are 4/5-column desktop where relevant, 2-column tablet, 1-column mobile.
- Tables scroll horizontally on mobile rather than clipping.
- Real actions still work: edit links, delete guards, status actions, role toggle, coupon toggle.
- Decorative prototype actions are disabled or absent, not fake.

- [ ] **Step 6: Commit**

```bash
git add 'app/(admin)/admin' components/admin app/globals.css tailwind.config.ts lib/admin/prototype-contract.ts tests/admin-route-contract.test.ts
git commit -m "feat: finish admin prototype alignment"
```

---

## Self-Review Checklist

- Spec coverage: tasks cover route smoke, shell/shared primitives, media blocker, catalog, orders, customers, marketing, dashboard, automated checks, and visual checks.
- Type consistency: `AdminPageHeader`, `AdminKpiCard`, `AdminPanel`, `shouldDeleteImmediately`, and `removedPersistedPublicIds` are defined before use.
- Scope control: no new DB schema, no Prisma push/seed, no new export/reporting/notification workflows.
- Verification coverage: targeted admin tests, typecheck, build, and manual prototype comparison are included.
