# RITM SEO Visibility And Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the public portfolio demo admin out of search results and reduce homepage image preload and transfer waste without changing public copy or route indexing policy outside the demo admin.

**Architecture:** The `/demo-admin` layout supplies inherited Next.js robots metadata for all child routes. Homepage optimization preserves existing components and adjusts only `next/image` priority and responsive `sizes` declarations.

**Tech Stack:** Next.js 15 App Router, React 18, TypeScript, `next/image`, Vitest 2.

## Global Constraints

- Do not change storefront copy, title tags, descriptions, canonicals, sitemap, `robots.ts`, structured data, navigation, or portfolio positioning.
- Do not block direct visitor access to `/demo-admin/*`.
- Preserve hero autoplay, controls, all image sources, and existing visual layout.
- Test behavior before implementation, then run focused tests, the full suite, typecheck, and production build.

---

### Task 1: Keep Demo Admin Out Of Search Results

**Files:**
- Modify: `app/(demo-admin)/demo-admin/layout.tsx:1-13`
- Modify: `tests/demo-admin-route-contract.test.ts:1-25`

**Interfaces:**
- Consumes: Next.js `Metadata` type from `next`.
- Produces: inherited `metadata.robots` with `index: false` and `follow: false` for `/demo-admin/*`.

- [ ] **Step 1: Write the failing test**

Add this assertion to `tests/demo-admin-route-contract.test.ts`:

```ts
it('marks every public demo-admin route as non-indexable', () => {
  const source = readFileSync(join(root, 'app/(demo-admin)/demo-admin/layout.tsx'), 'utf8');
  expect(source).toMatch(/robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/demo-admin-route-contract.test.ts`

Expected: the new test fails because the layout does not declare `robots` metadata.

- [ ] **Step 3: Write minimal implementation**

Replace the untyped metadata export in `app/(demo-admin)/demo-admin/layout.tsx` with:

```ts
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Demo Admin · RITM', template: '%s · Demo Admin · RITM' },
  robots: { index: false, follow: false },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/demo-admin-route-contract.test.ts`

Expected: all demo-admin route-contract tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/(demo-admin)/demo-admin/layout.tsx tests/demo-admin-route-contract.test.ts
git commit -m "fix(seo): noindex demo admin"
```

### Task 2: Reduce Homepage Image Priority And Payload

**Files:**
- Modify: `components/shared/home/hero.tsx:9-71`
- Modify: `components/shared/home/editorial-bento.tsx:116-132`
- Create: `tests/home-image-performance.test.ts`

**Interfaces:**
- Consumes: the existing `slides` and `items` image arrays plus `next/image` props.
- Produces: only hero slide zero has `priority`; each editorial card uses a `sizes` value matching its grid span.

- [ ] **Step 1: Write the failing tests**

Create `tests/home-image-performance.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), 'utf8');

describe('homepage image performance contract', () => {
  it('preloads only the first hero slide', () => {
    const source = read('components/shared/home/hero.tsx');
    expect(source).toContain('priority={index === 0}');
    expect(source).not.toContain('priority={index === active}');
  });

  it('matches editorial image sizes to card spans', () => {
    const source = read('components/shared/home/editorial-bento.tsx');
    expect(source).toContain('sizes: \'(max-width: 639px) 100vw, 50vw\'');
    expect(source).toContain('sizes: \'(max-width: 639px) 50vw, 25vw\'');
    expect(source).toContain('sizes: \'(max-width: 639px) 50vw, 50vw\'');
    expect(source).toContain('sizes={item.sizes}');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/home-image-performance.test.ts`

Expected: the hero assertion fails because `priority={index === 0}` is not present; the editorial sizing assertion fails because the component uses a broader breakpoint string.

- [ ] **Step 3: Write minimal implementation**

In `components/shared/home/hero.tsx`, replace the priority condition:

```tsx
priority={index === 0}
```

In `components/shared/home/editorial-bento.tsx`, add a `sizes: string` field to `BentoItem`. The first card has `col-span-2` at every breakpoint, so use `'(max-width: 639px) 100vw, 50vw'`. Every other card is one column below 640px; use `'(max-width: 639px) 50vw, 25vw'` for those that occupy one desktop column. For the three cards whose `col-span-2` begins at `min-[640px]`, use `'(max-width: 639px) 50vw, 50vw'`. Pass the field to the image:

```tsx
sizes={item.sizes}
```

Do not modify `components/shared/home/season-parallax.tsx`: its existing `sizes="100vw"` is already correct for the full-bleed layout.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/home-image-performance.test.ts`

Expected: both homepage image performance tests pass.

- [ ] **Step 5: Verify the complete change**

Run:

```bash
npm test -- tests/demo-admin-route-contract.test.ts tests/home-image-performance.test.ts
npm test
npm run typecheck
npm run build
```

Expected: every command exits with code 0.

- [ ] **Step 6: Commit**

```bash
git add components/shared/home/hero.tsx components/shared/home/editorial-bento.tsx components/shared/home/season-parallax.tsx tests/home-image-performance.test.ts
git commit -m "perf(home): narrow image preloads"
```

## Plan Self-Review

- Scope coverage: Task 1 implements inherited demo-admin `noindex, nofollow`; Task 2 implements all approved image-priority and responsive-sizing changes.
- Explicit exclusions: no task changes sitemap, robots, canonical URLs, titles, descriptions, structured data, navigation, or copy.
- No placeholders: every task names exact files, implementation expressions, test code, commands, and expected outcomes.
