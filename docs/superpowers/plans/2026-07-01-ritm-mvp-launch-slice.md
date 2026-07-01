# Ritm MVP Launch Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a Vercel preview where the basic Ritm storefront path loads: `/` -> `/catalog` -> `/product/ritm-white-tee-oversize` -> `/cart` -> `/checkout`.

**Architecture:** Keep local Windows work limited to safe build confidence and source changes. Let Vercel handle schema push during deploy via `vercel.json`, and use generated SQL through Neon SQL Editor for preview seed data. Verify the final user journey against the deployed preview URL with browser automation, not local e2e against Neon.

**Tech Stack:** Next.js 15, React 18, Prisma 6, Neon, Vercel, Vitest, Playwright MCP/browser automation, PowerShell on Windows.

---

## Non-Negotiable Rules

- Do not run `npm run prisma:push`, `npm run prisma:seed`, `prisma db push`, `prisma db seed`, or `npm run e2e` locally on Windows.
- Do not read, write, or hand-edit `.env*` files.
- Allowed local commands: `npm run prisma:generate`, `npm run typecheck`, `npm run test`, `npm run build`, and read-only git/source inspections.
- Commit only when the user asks. Push only when the user asks.
- Commit messages and PR titles must be English conventional commits, single author `ui-ux-promax`, no `Co-Authored-By` or assistant attribution.
- New work branches must be created from `main`; never commit directly on `main`.

## File Structure

- Modify: `prisma/gen-seed-sql.ts` - make preview seed SQL cover the same launch-slice data as `prisma/seed.ts`, including coupons.
- Create: `tests/gen-seed-sql.test.ts` - unit-test generated SQL text without touching a database.
- Create: `docs/superpowers/plans/2026-07-01-ritm-mvp-launch-slice.md` - this implementation plan.
- Optional create during execution: `docs/deploy/ritm-preview-checklist.md` - human checklist for Vercel/Neon preview steps if the user wants the checklist committed.
- No changes: `.env*` files.

---

### Task 1: Start Phase 1 Work Branch

**Files:**
- No source files.

- [ ] **Step 1: Inspect current branch and cleanliness**

Run:

```powershell
git status --short --branch
```

Expected: current branch and any uncommitted docs are visible. If uncommitted docs from planning exist, ask the user whether to keep them uncommitted, commit them, or stash them before branching.

- [ ] **Step 2: Fetch and branch from `main`**

Run only after the user confirms how to handle uncommitted planning docs:

```powershell
git fetch origin
git switch main
git pull --ff-only origin main
git switch -c feat/mvp-launch-slice
```

Expected: branch `feat/mvp-launch-slice` exists and is based on `main`.

- [ ] **Step 3: Confirm branch**

Run:

```powershell
git status --short --branch
```

Expected: `## feat/mvp-launch-slice`.

---

### Task 2: Add Seed SQL Coverage For Coupons

**Files:**
- Modify: `prisma/gen-seed-sql.ts`
- Create: `tests/gen-seed-sql.test.ts`

- [ ] **Step 1: Write failing test for coupon SQL**

Create `tests/gen-seed-sql.test.ts` with this test structure:

```typescript
import { describe, expect, it } from 'vitest';
import { generateSeedSql } from '@/prisma/gen-seed-sql';

describe('generateSeedSql', () => {
  it('includes launch-slice coupons in preview SQL', () => {
    const sql = generateSeedSql();

    expect(sql).toContain('INSERT INTO "Coupon"');
    expect(sql).toContain("RITM10");
    expect(sql).toContain("WELCOME15");
    expect(sql).toContain("EXPIRED");
    expect(sql).toContain('ON CONFLICT (code) DO UPDATE');
  });

  it('keeps the seeded PDP product visible in preview SQL', () => {
    const sql = generateSeedSql();

    expect(sql).toContain('ritm-white-tee-oversize');
    expect(sql).toContain('/products/product-white-tee.png');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
npm run test -- tests/gen-seed-sql.test.ts
```

Expected: fail because `generateSeedSql` is not exported or coupon SQL is missing.

- [ ] **Step 3: Refactor generator into exported function**

Modify `prisma/gen-seed-sql.ts` so it exports `generateSeedSql()` and only writes to stdout when run directly:

```typescript
import { CLOTHING_SIZE_ORDER } from '../constants/config';
import { productDenormFromColorways } from '../lib/product-aggregates';
import { categories, products } from './seed-data';

const q = (s: string | null | undefined) => (s == null ? 'NULL' : `'${s.replace(/'/g, "''")}'`);
const j = (o: unknown) => `'${JSON.stringify(o).replace(/'/g, "''")}'::jsonb`;

const coupons = [
  { code: 'RITM10', percent: 10, active: true, expiresAt: null },
  { code: 'WELCOME15', percent: 15, active: true, expiresAt: null },
  { code: 'EXPIRED', percent: 50, active: true, expiresAt: '2020-01-01T00:00:00.000Z' },
] as const;

export function generateSeedSql() {
  const out: string[] = [];

  out.push('BEGIN;');
  out.push(
    'TRUNCATE TABLE "CartItem","Cart","ProductImage","ProductVariant","ProductColorway","Product","Category" RESTART IDENTITY CASCADE;',
  );

  for (const c of categories) {
    out.push(
      `INSERT INTO "Category" (id,name,slug,tagline,"sortOrder") VALUES ('cat_${c.slug}',${q(c.name)},${q(c.slug)},${q(c.tagline)},${c.sortOrder});`,
    );
  }

  for (const p of products) {
    const pid = `prod_${p.slug}`;
    const denorm = productDenormFromColorways(p.colorways);
    out.push(
      `INSERT INTO "Product" (id,name,slug,brand,gender,"categoryId",description,"fitNote",specs,"isBestseller",active,"sortOrder","salesCount","minPrice","discountPct","createdAt") ` +
        `VALUES (${q(pid)},${q(p.name)},${q(p.slug)},${q(p.brand)},'${p.gender}','cat_${p.categorySlug}',${q(p.description)},${q(p.fitNote)},${j(p.specs)},${p.isBestseller},true,${p.sortOrder},0,${denorm.minPrice},${denorm.discountPct},now());`,
    );

    for (const cw of p.colorways) {
      const cwid = `cw_${p.slug}__${cw.slug}`;
      out.push(
        `INSERT INTO "ProductColorway" (id,"productId",name,slug,"swatchHex","isDefault","sortOrder") ` +
          `VALUES (${q(cwid)},${q(pid)},${q(cw.name)},${q(cw.slug)},${q(cw.swatchHex)},${cw.isDefault},${cw.sortOrder});`,
      );

      for (const im of cw.images) {
        const imid = `${p.slug}__${cw.slug}__img${im.sortOrder}`;
        out.push(
          `INSERT INTO "ProductImage" (id,"colorwayId",url,alt,"sortOrder") ` +
            `VALUES (${q(imid)},${q(cwid)},${q(im.url)},${q(im.alt)},${im.sortOrder});`,
        );
      }

      for (const v of cw.variants) {
        out.push(
          `INSERT INTO "ProductVariant" (id,"colorwayId",size,"sizeOrder",sku,price,"compareAtPrice",stock,active) ` +
            `VALUES ('var_${v.sku}',${q(cwid)},${q(v.size)},${CLOTHING_SIZE_ORDER[v.size]},${q(v.sku)},${v.price},${v.compareAtPrice == null ? 'NULL' : v.compareAtPrice},${v.stock},true);`,
        );
      }
    }
  }

  for (const coupon of coupons) {
    out.push(
      `INSERT INTO "Coupon" (code,percent,active,"expiresAt") VALUES (${q(coupon.code)},${coupon.percent},${coupon.active},${q(coupon.expiresAt)}) ` +
        `ON CONFLICT (code) DO UPDATE SET percent = EXCLUDED.percent, active = EXCLUDED.active, "expiresAt" = EXCLUDED."expiresAt";`,
    );
  }

  out.push('COMMIT;');

  return out.join('\n');
}

if (require.main === module) {
  console.log(generateSeedSql());
}
```

- [ ] **Step 4: Run targeted test**

Run:

```powershell
npm run test -- tests/gen-seed-sql.test.ts
```

Expected: pass.

- [ ] **Step 5: Run safe regression checks for generator change**

Run:

```powershell
npm run test -- tests/product-dto.test.ts tests/coupon.test.ts tests/order-coupon.test.ts tests/gen-seed-sql.test.ts
npm run typecheck
```

Expected: all pass.

---

### Task 3: Generate Preview Seed SQL For Manual Neon Application

**Files:**
- No committed source files unless user requests saving generated SQL.
- Do not create or commit SQL dumps by default.

- [ ] **Step 1: Generate SQL to a temporary ignored file**

Run:

```powershell
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/gen-seed-sql.ts > D:\tmp\ritm-preview-seed.sql
```

Expected: `D:\tmp\ritm-preview-seed.sql` exists. This command does not touch the database.

- [ ] **Step 2: Inspect only non-secret SQL markers**

Run:

```powershell
Select-String -Path D:\tmp\ritm-preview-seed.sql -Pattern 'BEGIN;|COMMIT;|ritm-white-tee-oversize|RITM10|INSERT INTO "Coupon"|INSERT INTO "Product"' | Select-Object -First 20
```

Expected: markers show product and coupon inserts. Do not paste huge SQL into chat unless the user asks.

- [ ] **Step 3: Hand off SQL application to user**

Tell the user:

```text
Open Neon SQL Editor for the preview database and run D:\tmp\ritm-preview-seed.sql there. Do not run prisma db seed locally. After Neon confirms success, send me the Vercel preview URL.
```

Expected: user applies SQL manually or chooses CI/Vercel seed alternative.

---

### Task 4: Verify Vercel Preview Configuration

**Files:**
- Modify only if necessary: `vercel.json`
- Do not touch: `.env*`

- [ ] **Step 1: Confirm Vercel build command in source**

Run:

```powershell
Get-Content vercel.json
```

Expected:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "prisma db push --skip-generate && next build"
}
```

- [ ] **Step 2: Ask user to confirm Vercel project env is configured**

Ask the user to confirm Vercel has preview env vars set. Do not ask them to paste secrets. Use this checklist:

```text
Please confirm in Vercel Project Settings -> Environment Variables that preview has database, auth, payment/email, Cloudinary, and site URL variables configured. Do not paste values here; just say configured/not configured.
```

Expected: user confirms configured, or identifies missing groups.

- [ ] **Step 3: Trigger preview deployment**

Use the user's chosen GitHub/Vercel flow. If committing/pushing is needed, ask explicitly because commit/push require user request.

Expected: Vercel preview URL exists.

---

### Task 5: Preview Storefront Smoke

**Files:**
- No source files.

- [ ] **Step 1: Open preview URL**

Use Playwright MCP or browser automation against the Vercel preview URL, not local e2e.

Expected: home page returns 200 and shows Ritm branding.

- [ ] **Step 2: Smoke the route contract**

Visit these routes:

```text
/
/catalog
/product/ritm-white-tee-oversize
/cart
/checkout
```

Expected:

- No route returns a 500.
- PDP does not show "product not found".
- Public routes do not show old STRIDE/sneaker runtime brand copy.
- Product images render from `/products/...` or approved Cloudinary URLs.
- Cart and checkout pages load even if cart is empty.

- [ ] **Step 3: Check mobile and desktop widths**

Use at least:

```text
390x844
1440x900
```

Expected: no blank page, no major overlapping text, no broken image placeholders on the launch-slice route path.

- [ ] **Step 4: Record skipped checks**

If admin, payment, email, or full purchase checks are skipped, record them as Phase 2+ risks rather than treating them as Phase 1 failures.

---

### Task 6: Final Local Safe Verification

**Files:**
- No source files unless previous tasks changed generator/tests.

- [ ] **Step 1: Run Prisma generate**

Run:

```powershell
npm run prisma:generate
```

Expected: exit 0.

- [ ] **Step 2: Run typecheck**

Run:

```powershell
npm run typecheck
```

Expected: exit 0.

- [ ] **Step 3: Run unit/integration tests**

Run:

```powershell
npm run test
```

Expected: all Vitest tests pass.

- [ ] **Step 4: Run production build**

Run:

```powershell
npm run build
```

Expected: exit 0. Existing Tailwind/Edge Runtime warnings may remain; record them if still present.

---

### Task 7: Phase 1 Completion Report

**Files:**
- Optional create: `docs/deploy/ritm-preview-checklist.md` if user wants a committed checklist.

- [ ] **Step 1: Summarize evidence**

Report:

```text
Branch:
Commit(s):
Preview URL:
Seed delivery path used:
Preview routes checked:
Local checks:
Warnings:
Skipped checks and why:
Next phase recommendation:
```

- [ ] **Step 2: Ask before commit/push**

If source changes were made, ask the user before committing or pushing.

Commit template when explicitly approved:

```powershell
$env:GIT_AUTHOR_NAME='ui-ux-promax'
$env:GIT_AUTHOR_EMAIL='ui-ux-promax@users.noreply.github.com'
$env:GIT_COMMITTER_NAME='ui-ux-promax'
$env:GIT_COMMITTER_EMAIL='ui-ux-promax@users.noreply.github.com'
git commit -m 'feat: prepare Ritm MVP launch slice'
```

Expected: commit has a conventional English subject, single author `ui-ux-promax`, and no attribution footer.