# Header Navigation Active State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the header's black active pill only for the navigation item matching the current catalog route, leaving the catalog badge unchanged.

**Architecture:** `CatalogHeaderNav` already reads the pathname and search parameters. It will use the same `catalogActive` result that drives `aria-current` to choose the catalog link's active or inactive pill styles. The source-level regression test will assert that both style branches exist and remain tied to `catalogActive`.

**Tech Stack:** Next.js 15, React 18, TypeScript, Tailwind CSS, Vitest.

## Global Constraints

- Do not change the existing blue catalog count badge.
- The catalog pill is black only for `/catalog` without catalog filter/search parameters.
- No page-specific style overrides or new dependencies.

---

### Task 1: Make the Catalog pill route-aware

**Files:**
- Modify: `tests/catalog-header-nav.test.ts:4-10`
- Modify: `components/shared/catalog-header-nav.tsx:22-31`

**Interfaces:**
- Consumes: `usePathname()`, `useSearchParams()`, and `catalogActive: boolean` from `CatalogHeaderNav`.
- Produces: a catalog link whose `aria-current` and active/inactive Tailwind classes are both derived from `catalogActive`.

- [ ] **Step 1: Write the failing test**

Replace the current unconditional black-surface assertion with:

```ts
expect(source).toMatch(/className=\{cn\([\s\S]*?catalogActive \? 'header-active-in border-primary bg-primary text-primary-foreground[\s\S]*?: 'border-line bg-surface text-ink-muted/);
expect(source).toContain("aria-current={catalogActive ? 'page' : undefined}");
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- tests/catalog-header-nav.test.ts`

Expected: FAIL because the catalog link is still assigned `bg-black text-white` unconditionally.

- [ ] **Step 3: Write the minimal implementation**

Replace the catalog `<Link>` class expression with:

```tsx
className={cn(
  baseClass,
  'h-[42px] w-[182px] justify-center',
  catalogActive
    ? 'header-active-in border-primary bg-primary text-primary-foreground shadow-[0_5px_14px_hsl(var(--color-text)/.13)]'
    : 'border-line bg-surface text-ink-muted hover:border-ink/35 hover:text-ink',
)}
```

Keep `href="/catalog"`, `aria-current={catalogActive ? 'page' : undefined}`, and the link label intact.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `npm test -- tests/catalog-header-nav.test.ts`

Expected: PASS with one test passing.

- [ ] **Step 5: Run type checking**

Run: `npm run typecheck`

Expected: PASS with exit code 0.

- [ ] **Step 6: Commit**

```bash
git add tests/catalog-header-nav.test.ts components/shared/catalog-header-nav.tsx
git commit -m "fix: scope catalog header active state"
```
