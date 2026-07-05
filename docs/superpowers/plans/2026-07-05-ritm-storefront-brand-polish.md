# Ritm Storefront Brand Polish Implementation Plan (Home + Catalog)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring home (`/`) and catalog (`/catalog`) to pixel-match parity with HTML prototypes in `e-comerce-shop-prot/`.

**Architecture:** Component-by-component restyle. Each component is modified individually, verified with typecheck + build, committed separately. Shared components (header, footer, product card) are done first since both pages depend on them.

**Tech Stack:** Next.js 15 App Router, React 18, Tailwind CSS v3, next/image, Vitest.

---

## Non-Negotiable Rules

- Do not run `npm run prisma:push`, `npm run prisma:seed`, `prisma db push`, `prisma db seed`, or local e2e on Windows against Neon.
- Do not read, write, or hand-edit `.env*` files.
- Allowed local commands: `npm run prisma:generate`, `npm run typecheck`, `npm run test`, `npm run build`, and read-only source/git inspections.
- Commit only when the user asks. Push only when the user asks.
- Commit messages and PR titles must be English conventional commits, single author `ui-ux-promax`, no `Co-Authored-By` or assistant attribution.
- New work is on `feat/storefront-brand-polish`, branched from `origin/main`. Never commit directly on `main`.
- No schema changes.
- Prototypes in `e-comerce-shop-prot/` are the visual contract: match layout geometry, typography, spacing, color tokens, radii, shadows, and states.

## File Structure

### Create
- `public/ritm-logo.svg` — brand logo (copy from `e-comerce-shop-prot/assets/ritm-logo.svg`)
- `public/ritm-logo-light.svg` — light footer logo (copy from `e-comerce-shop-prot/assets/ritm-logo-light.svg`)
- `public/home/hero-photo.png` — hero background (copy from `e-comerce-shop-prot/assets/hero-photo.png`)
- `public/home/collection-rail.png` — editorial + catalog hero (copy from `e-comerce-shop-prot/assets/collection-rail.png`)
- `public/home/coming-card.png` — coming-soon card (copy from `e-comerce-shop-prot/assets/coming-card.png`)
- `public/home/season-collage.png` — season full-bleed (copy from `e-comerce-shop-prot/assets/season-collage.png`)
- `public/home/blog-arrival.png` — blog card 1 (copy from `e-comerce-shop-prot/assets/blog-arrival.png`)
- `public/home/blog-chic.png` — blog card 2 (copy from `e-comerce-shop-prot/assets/blog-chic.png`)
- `public/home/blog-wardrobe.png` — blog card 3 (copy from `e-comerce-shop-prot/assets/blog-wardrobe.png`)
- `components/shared/home/editorial-section.tsx` — editorial grid (image + coming card)
- `components/shared/home/season-section.tsx` — full-bleed season collage + seal
- `components/shared/home/blog-section.tsx` — 3-col blog cards
- `components/shared/home/intro-section.tsx` — centered heading + lead text
- `components/shared/catalog/catalog-hero.tsx` — split layout with image + copy + stats
- `app/(shop)/blog/page.tsx` — stub page
- `app/(shop)/faq/page.tsx` — stub page

### Modify
- `components/shared/site-header.tsx` — two-row nav, SVG logo, icons, quick chips, search
- `components/shared/site-footer.tsx` — dark footer grid, logo, newsletter, bottom bar
- `components/shared/mobile-nav.tsx` — update drawer links
- `components/shared/header-search.tsx` — pill search shell
- `components/shared/home/hero.tsx` — full-bleed photo hero with CTA
- `components/shared/home/bestsellers-section.tsx` — filter tabs + 3-col grid + view more
- `app/(shop)/page.tsx` — new section composition
- `app/(shop)/catalog/page.tsx` — catalog hero + breadcrumbs + restyled grid
- `components/shared/catalog/filter-sidebar.tsx` — restyle filter rail
- `components/shared/catalog/filter-controls.tsx` — restyle filter groups
- `components/shared/catalog/mobile-filter-drawer.tsx` — restyle mobile drawer
- `components/shared/catalog/price-filter.tsx` — dual range slider style
- `components/shared/catalog/color-filter.tsx` — color swatches
- `components/shared/catalog/size-filter.tsx` — pill chips
- `components/shared/catalog/sort-select.tsx` — pill style
- `components/shared/catalog/pagination.tsx` — pill style
- `components/shared/product-card.tsx` — full restyle to match prototype

### Remove from home composition (files kept, just not imported)
- `components/shared/home/category-bento.tsx`
- `components/shared/home/drop-promo.tsx`
- `components/shared/home/engineered-feature.tsx`
- `components/shared/home/trust-strip.tsx`

---

### Task 1: Bootstrap Branch And Copy Assets

**Files:**
- Create: all assets listed in File Structure

- [ ] **Step 1: Create branch from main**

Run:

```powershell
git fetch origin
git switch main
git pull --ff-only origin main
git switch -c feat/storefront-brand-polish
```

- [ ] **Step 2: Copy logo assets**

Run:

```powershell
cp e-comerce-shop-prot/assets/ritm-logo.svg public/ritm-logo.svg
cp e-comerce-shop-prot/assets/ritm-logo-light.svg public/ritm-logo-light.svg
```

- [ ] **Step 3: Create home assets directory and copy images**

Run:

```powershell
mkdir -p public/home
cp e-comerce-shop-prot/assets/hero-photo.png public/home/
cp e-comerce-shop-prot/assets/collection-rail.png public/home/
cp e-comerce-shop-prot/assets/coming-card.png public/home/
cp e-comerce-shop-prot/assets/season-collage.png public/home/
cp e-comerce-shop-prot/assets/blog-arrival.png public/home/
cp e-comerce-shop-prot/assets/blog-chic.png public/home/
cp e-comerce-shop-prot/assets/blog-wardrobe.png public/home/
```

- [ ] **Step 4: Verify assets exist**

Run:

```powershell
ls -la public/ritm-logo.svg public/ritm-logo-light.svg public/home/
```

Expected: all 9 files present.

- [ ] **Step 5: Run typecheck to confirm clean baseline**

Run:

```powershell
npm run typecheck
```

Expected: exit 0.

---

### Task 2: Site Header

**Files:**
- Modify: `components/shared/site-header.tsx`
- Modify: `components/shared/mobile-nav.tsx`
- Modify: `components/shared/header-search.tsx`

**Interfaces:**
- Consumes: `Link` from `next/link`, `Image` from `next/image`, `MainNav`, `MobileNav`, `HeaderSearch`, `CartBadge`, `WishlistBadge`, `AuthNav`
- Produces: `SiteHeader` component (used in `app/layout.tsx`)

**Prototype reference:** `ritm-home.html` lines 917–974 (topbar section)

- [ ] **Step 1: Replace site-header.tsx**

Replace the entire file with:

```tsx
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MainNav, MainNavFallback } from './main-nav';
import { MobileNav } from './mobile-nav';
import { HeaderSearch } from './header-search';
import { CartBadge } from './cart-badge';
import { WishlistBadge } from './wishlist/wishlist-badge';
import { AuthNav } from './auth/auth-nav';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 glass-header">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        {/* Row 1: nav-primary */}
        <div className="relative flex items-center gap-3 h-16">
          <Suspense fallback={<div className="md:hidden w-10 h-10 -ml-2" aria-hidden />}>
            <MobileNav />
          </Suspense>
          <Link href="/" className="flex items-center" aria-label="RITM — на главную">
            <Image src="/ritm-logo.svg" alt="RITM" width={98} height={28} priority className="h-7 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-5 ml-4" aria-label="Разделы сайта">
            <Link href="/blog" className="text-sm font-medium text-ink/80 hover:text-ink transition-colors">Блог</Link>
            <Link href="/faq" className="text-sm font-medium text-ink/80 hover:text-ink transition-colors">FAQ</Link>
          </nav>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Suspense fallback={<MainNavFallback />}>
              <MainNav />
            </Suspense>
            <HeaderSearch />
            <AuthNav />
            <WishlistBadge />
            <CartBadge />
          </div>
        </div>
        {/* Row 2: nav-secondary — hidden on mobile, visible md+ */}
        <div className="hidden md:flex items-center gap-3 pb-3 -mt-1">
          <div className="flex items-center gap-2">
            <Link href="/catalog?sort=new" className="chip pill-button is-active text-xs font-semibold px-3 py-1.5 rounded-full bg-primary text-primary-foreground">Новинки</Link>
            <Link href="/catalog?filter=sale" className="chip pill-button text-xs font-semibold px-3 py-1.5 rounded-full border border-line bg-surface text-ink hover:border-ink transition-colors">Sale</Link>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <span className="chip text-xs font-medium px-3 py-1.5 rounded-full border border-line bg-surface text-ink-muted hover:text-ink transition-colors cursor-default">Мужчины</span>
            <span className="chip text-xs font-medium px-3 py-1.5 rounded-full border border-line bg-surface text-ink-muted hover:text-ink transition-colors cursor-default">Женщины</span>
            <span className="chip text-xs font-medium px-3 py-1.5 rounded-full border border-line bg-surface text-ink-muted hover:text-ink transition-colors cursor-default">Дети</span>
            <span className="chip text-xs font-medium px-3 py-1.5 rounded-full border border-line bg-surface text-ink-muted hover:text-ink transition-colors cursor-default">Бренд</span>
          </div>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Update header-search.tsx to match pill style**

Read current `header-search.tsx` and update the search input to use a pill style with `rounded-full border border-line bg-surface` matching the prototype's `search-shell`. Keep existing search behavior (redirect to `/catalog?q=...`).

- [ ] **Step 3: Run typecheck**

Run:

```powershell
npm run typecheck
```

Expected: exit 0.

- [ ] **Step 4: Run build**

Run:

```powershell
npm run build
```

Expected: exit 0.

---

### Task 3: Site Footer

**Files:**
- Modify: `components/shared/site-footer.tsx`

**Prototype reference:** `ritm-home.html` lines 707–763 (footer section)

- [ ] **Step 1: Replace site-footer.tsx**

Replace the logo section to use SVG instead of text "R":

```tsx
// Replace this block in the footer:
//   <span className="grid place-items-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-display font-bold text-sm">R</span>
//   <span className="font-display font-bold text-lg">RITM</span>
// With:
<Image src="/ritm-logo-light.svg" alt="RITM" width={98} height={28} className="h-7 w-auto" />
```

Add `import Image from 'next/image';` at the top if not already imported.

Keep existing link columns, newsletter form, and bottom bar — they are already close to the prototype. Only change the logo to SVG.

- [ ] **Step 2: Run typecheck**

Run:

```powershell
npm run typecheck
```

Expected: exit 0.

- [ ] **Step 3: Run build**

Run:

```powershell
npm run build
```

Expected: exit 0.

---

### Task 4: Blog And FAQ Stub Pages

**Files:**
- Create: `app/(shop)/blog/page.tsx`
- Create: `app/(shop)/faq/page.tsx`

- [ ] **Step 1: Create blog stub**

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Блог — RITM',
  description: 'Скоро здесь будут статьи о стиле, новинках и коллекциях RITM.',
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-24">
      <div className="text-center">
        <h1 className="font-display font-bold text-[32px] sm:text-[44px]">Блог</h1>
        <p className="text-ink-muted mt-4 text-lg">Скоро будет интересно. Следите за обновлениями.</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create FAQ stub**

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — RITM',
  description: 'Часто задаваемые вопросы о заказах, доставке и возврате RITM.',
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-24">
      <div className="text-center">
        <h1 className="font-display font-bold text-[32px] sm:text-[44px]">FAQ</h1>
        <p className="text-ink-muted mt-4 text-lg">Раздел заполняется. Если есть вопросы — напишите нам.</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run typecheck and build**

Run:

```powershell
npm run typecheck && npm run build
```

Expected: exit 0.

---

### Task 5: Home Hero

**Files:**
- Modify: `components/shared/home/hero.tsx`

**Prototype reference:** `ritm-home.html` lines 278–368 (hero-card CSS), lines 977–1001 (hero HTML)

- [ ] **Step 1: Replace hero.tsx**

Replace the entire file with:

```tsx
import Link from 'next/link';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="mx-auto max-w-[1240px] px-4 sm:px-6 pt-3.5">
      <div
        className="relative rounded-[22px] overflow-hidden min-h-[380px] md:min-h-[604px] flex items-center"
        style={{ isolation: 'isolate' }}
      >
        {/* Background image */}
        <Image
          src="/home/hero-photo.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          aria-hidden
        />
        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, hsl(220 12% 10% / 0.8), hsl(220 12% 10% / 0.28) 48%, hsl(220 12% 10% / 0.1))',
          }}
          aria-hidden
        />
        {/* Content */}
        <div className="relative z-10 w-[70%] max-w-[680px] px-6 md:px-16 text-white">
          <h1 className="font-display font-bold text-[42px] md:text-[64px] leading-[1.05] text-white">Ritm.</h1>
          <p className="mt-4 max-w-[560px] text-[15px] leading-[1.6] font-medium text-white/88">
            Откройте широкий выбор актуальных вещей для повседневного гардероба. Подберите любимый комплект, который отражает ваш стиль и настроение.
          </p>
        </div>
        {/* Arrows — top right */}
        <div className="absolute right-7 top-12 z-10 hidden md:flex gap-2" aria-label="Переключение промо">
          <button type="button" aria-label="Предыдущее промо" className="w-[34px] h-[34px] rounded-full border-0 grid place-items-center text-white" style={{ background: 'hsl(0 0% 100% / 0.22)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button type="button" aria-label="Следующее промо" className="w-[34px] h-[34px] rounded-full border-0 grid place-items-center bg-surface text-ink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
        {/* CTA — centered bottom */}
        <div className="absolute left-1/2 bottom-12 md:bottom-20 -translate-x-1/2 z-10 grid gap-3 justify-items-center">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-3 rounded-full bg-surface text-ink font-bold pl-7 pr-4 py-3 shadow-[0_18px_45px_hsl(220_12%_10%_/_0.25)] hover:-translate-y-0.5 transition-transform"
          >
            Начать покупки
            <span className="w-[38px] h-[38px] rounded-full bg-primary text-primary-foreground grid place-items-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1"><path d="M7 17 17 7M9 7h8v8"/></svg>
            </span>
          </Link>
          <span className="text-white/72 text-[13px] font-semibold">Топ коллекция</span>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run typecheck and build**

Run:

```powershell
npm run typecheck && npm run build
```

Expected: exit 0.

---

### Task 6: Home Intro, Editorial, Season, Blog Sections

**Files:**
- Create: `components/shared/home/intro-section.tsx`
- Create: `components/shared/home/editorial-section.tsx`
- Create: `components/shared/home/season-section.tsx`
- Create: `components/shared/home/blog-section.tsx`

**Prototype reference:** `ritm-home.html` lines 370–580, 1003–1135

- [ ] **Step 1: Create intro-section.tsx**

```tsx
export function IntroSection() {
  return (
    <section className="pt-20 md:pt-[88px] pb-12 md:pb-[54px]">
      <div className="mx-auto max-w-[760px] text-center px-4 sm:px-6">
        <h2 className="font-display font-bold text-[28px] md:text-[42px] leading-[1.05]">Свежая мода в современных вайбах</h2>
        <p className="mt-3 text-ink-muted text-[15px] leading-[1.6] max-w-[600px] mx-auto">
          Коллекция постоянно обновляется последними фасонами, чтобы вы всегда оставались в своей точке стиля. Покупайте сейчас и позвольте гардеробу выглядеть свежо.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create editorial-section.tsx**

```tsx
import Image from 'next/image';

export function EditorialSection() {
  return (
    <section className="mx-auto max-w-[1240px] px-4 sm:px-6 pb-14 md:pb-20">
      <div className="grid md:grid-cols-[1.18fr_0.82fr] gap-5">
        {/* Image card */}
        <figure className="rounded-[16px] overflow-hidden bg-surface-soft">
          <div className="relative h-[280px] md:h-[450px]">
            <Image
              src="/home/collection-rail.png"
              alt="Рейл с пальто, куртками и сумками новой коллекции"
              fill
              sizes="(max-width: 768px) 100vw, 58vw"
              className="object-cover"
            />
          </div>
          <figcaption className="p-6 md:p-7 bg-surface-soft">
            <h3 className="font-display font-bold italic text-[22px] md:text-[31px] leading-tight">Откройте безлимитность</h3>
            <p className="mt-2 text-ink-muted text-sm">Переосмысление новых fashion-трендов</p>
          </figcaption>
        </figure>
        {/* Coming card */}
        <article className="rounded-[16px] bg-surface-soft overflow-hidden p-8 md:p-12 flex flex-col justify-between min-h-[420px] md:min-h-[575px]">
          <div>
            <h3 className="font-display font-bold italic text-[22px] md:text-[31px] leading-tight">Держитесь, новый продукт уже близко!</h3>
            <p className="mt-2 text-ink-muted text-sm">Приносим новую эру простых и выразительных вещей.</p>
          </div>
          <div className="self-center w-full max-w-[440px] mt-8 rounded-[22px] overflow-hidden bg-surface shadow-lg">
            <div className="relative h-[260px] md:h-[300px]">
              <Image
                src="/home/coming-card.png"
                alt="Превью новой одежды 2026 года"
                fill
                sizes="(max-width: 768px) 100vw, 42vw"
                className="object-cover"
              />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create season-section.tsx**

```tsx
import Image from 'next/image';

export function SeasonSection() {
  return (
    <section className="py-16 md:py-[78px] overflow-hidden">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 mb-10">
        <div className="text-center max-w-[720px] mx-auto">
          <h2 className="font-display font-bold text-[32px] md:text-[50px] leading-[1.05]">Сезон в деталях</h2>
          <p className="mt-3 text-ink-muted text-[15px] leading-[1.6]">
            Каждая вещь собрана из тканей, которые носятся легко и долго. Спокойная палитра, чистый силуэт, ничего лишнего.
          </p>
        </div>
      </div>
      <div className="relative min-h-[280px] md:min-h-[390px] w-screen md:w-screen" style={{ marginLeft: 'calc(50% - 50vw)' }}>
        <Image
          src="/home/season-collage.png"
          alt="Коллаж сезона RITM"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute left-1/2 bottom-8 -translate-x-1/2 w-[116px] h-[116px] rounded-full grid place-items-center text-center bg-surface/92 border-2 border-surface shadow-lg">
          <span className="font-mono text-[11px] leading-[1.2] font-bold text-ink">RITM<br />SS26<br />COLLECTION</span>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create blog-section.tsx**

```tsx
import Image from 'next/image';

const posts = [
  { img: '/home/blog-arrival.png', tag: 'Тренды', title: 'Новый сезон: как носить многослойность', date: '02.07.2026' },
  { img: '/home/blog-chic.png', tag: 'Гардероб', title: 'Капсула на неделю: 5 вещей, 10 образов', date: '28.06.2026' },
  { img: '/home/blog-wardrobe.png', tag: 'Гайд', title: 'Уход за хлопком: просто и надолго', date: '20.06.2026' },
];

export function BlogSection() {
  return (
    <section className="mx-auto max-w-[1240px] px-4 sm:px-6 pt-16 md:pt-[78px] pb-16 md:pb-20">
      <div className="text-center max-w-[760px] mx-auto mb-10">
        <h2 className="font-display font-bold text-[28px] md:text-[42px] leading-[1.05]">Журнал RITM</h2>
        <p className="mt-3 text-ink-muted text-[15px] leading-[1.6]">
          Истории о стиле, уходе и новой одежде. Читайте, выбирайте, собирайте свой гардероб осознанно.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article key={post.title} className="rounded-[16px] overflow-hidden bg-surface border border-line">
            <div className="relative h-[220px] md:h-[260px]">
              <Image src={post.img} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
            </div>
            <div className="p-5">
              <span className="inline-block text-[11px] font-semibold uppercase tracking-wide text-accent">{post.tag}</span>
              <h3 className="font-display font-bold text-[18px] mt-1.5 leading-tight">{post.title}</h3>
              <p className="text-xs text-ink-muted mt-2 tnum">{post.date}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run typecheck**

Run:

```powershell
npm run typecheck
```

Expected: exit 0.

---

### Task 7: Home Product Grid (Bestsellers)

**Files:**
- Modify: `components/shared/home/bestsellers-section.tsx`

**Prototype reference:** `ritm-home.html` lines 432–562, 1031–1120

- [ ] **Step 1: Replace bestsellers-section.tsx**

Replace the entire file with:

```tsx
import Link from 'next/link';
import { ProductCard } from '@/components/shared/product-card';
import type { ProductCardData } from '@/lib/product-summary';

const FILTER_TABS = [
  { label: 'Все', filter: 'all' },
  { label: 'Верхняя одежда', filter: 'outerwear' },
  { label: 'Низ', filter: 'bottom' },
  { label: 'Топы', filter: 'tops' },
  { label: 'Loungewear', filter: 'loungewear' },
  { label: 'Кроссовки', filter: 'sneakers' },
];

export function BestsellersSection({ products, wishlistedIds }: { products: ProductCardData[]; wishlistedIds: Set<string> }) {
  return (
    <section id="products" className="mx-auto max-w-[1240px] px-4 sm:px-6 pt-14 md:pt-[78px]">
      {/* Heading */}
      <div className="grid justify-items-center gap-5 mb-9">
        <h2 className="font-display font-bold text-[28px] md:text-[38px] leading-[1.05] text-center">Просмотрите все, что нужно.</h2>
        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-2" aria-label="Фильтр товаров">
          {FILTER_TABS.map((tab, i) => (
            <Link
              key={tab.filter}
              href={tab.filter === 'all' ? '/catalog' : `/catalog?category=${tab.filter}`}
              className={`text-xs font-semibold px-4 py-2 rounded-full transition-colors ${
                i === 0
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-line bg-surface text-ink hover:border-ink'
              }`}
              aria-pressed={i === 0}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
      {/* Product grid — 3 columns */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <ProductCard key={p.slug} data={p} wishlisted={wishlistedIds.has(p.id)} />
        ))}
      </div>
      {/* View more */}
      <div className="flex justify-center mt-10">
        <Link
          href="/catalog"
          className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground min-h-[48px] px-7 font-bold hover:-translate-y-px transition-transform"
        >
          Смотреть больше
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run typecheck and build**

Run:

```powershell
npm run typecheck && npm run build
```

Expected: exit 0.

---

### Task 8: Home Page Composition

**Files:**
- Modify: `app/(shop)/page.tsx`

- [ ] **Step 1: Replace page.tsx**

Replace the entire file with:

```tsx
import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma-client';
import { productCardInclude, buildProductCardData } from '@/lib/product-summary';
import { getWishlistProductIds } from '@/lib/wishlist';
import { wishlistCookieName } from '@/lib/wishlist-cookie';
import { NEW_PRODUCT_WINDOW_DAYS, LOW_STOCK_THRESHOLD } from '@/constants/config';
import { Hero } from '@/components/shared/home/hero';
import { IntroSection } from '@/components/shared/home/intro-section';
import { EditorialSection } from '@/components/shared/home/editorial-section';
import { BestsellersSection } from '@/components/shared/home/bestsellers-section';
import { SeasonSection } from '@/components/shared/home/season-section';
import { BlogSection } from '@/components/shared/home/blog-section';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const now = new Date();
  const cfg = { newWindowDays: NEW_PRODUCT_WINDOW_DAYS, lowStock: LOW_STOCK_THRESHOLD };

  const [bestRaw, session, store] = await Promise.all([
    prisma.product.findMany({ where: { active: true }, take: 6, orderBy: [{ isBestseller: 'desc' }, { createdAt: 'desc' }], include: productCardInclude }),
    auth(),
    cookies(),
  ]);

  const bestsellers = bestRaw.map((p) => buildProductCardData(p, now, cfg));
  const wishlistedIds = await getWishlistProductIds(session, store.get(wishlistCookieName)?.value);

  return (
    <>
      <Hero />
      <IntroSection />
      <EditorialSection />
      <BestsellersSection products={bestsellers} wishlistedIds={wishlistedIds} />
      <SeasonSection />
      <BlogSection />
    </>
  );
}
```

Note: `take: 6` (was `take: 4`) to fill 3-column grid with 2 rows. Removed imports for `CategoryBento`, `DropPromo`, `EngineeredFeature`, `TrustStrip` and their data queries.

- [ ] **Step 2: Run typecheck and build**

Run:

```powershell
npm run typecheck && npm run build
```

Expected: exit 0.

---

### Task 9: Product Card

**Files:**
- Modify: `components/shared/product-card.tsx`

**Prototype reference:** `ritm-home.html` lines 446–531, `catalog.html` lines 734–759

- [ ] **Step 1: Replace product-card.tsx**

Replace the entire file with:

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui';
import { PriceTag } from './price-tag';
import { WishlistHeart } from '@/components/shared/wishlist/wishlist-heart';
import type { ProductCardData } from '@/lib/product-summary';

const BEIGE_BLUR =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='8'%20height='8'%3E%3Crect%20width='8'%20height='8'%20fill='%23f1ece1'/%3E%3C/svg%3E";

export function ProductCard({ data, wishlisted = false }: { data: ProductCardData; wishlisted?: boolean }) {
  const href = `/product/${data.slug}`;
  return (
    <article className="group border border-line bg-surface rounded-[10px] p-2.5 pb-4 transition-transform duration-200 hover:-translate-y-[3px] hover:border-ink/20 hover:shadow-[0_18px_45px_hsl(220_12%_10%_/_0.08)]">
      {/* Media */}
      <div className="relative aspect-[1.3/1] overflow-hidden rounded-[10px] bg-surface-soft">
        {data.badges[0] && (
          <span className="absolute top-2.5 left-2.5 z-10">
            <Badge tone={data.badges[0].tone}>{data.badges[0].label}</Badge>
          </span>
        )}
        <Link href={href} aria-label={data.name} className="absolute inset-0">
          {data.imageUrl ? (
            <Image
              src={data.imageUrl}
              alt={data.imageAlt}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              placeholder="blur"
              blurDataURL={BEIGE_BLUR}
              className={`object-cover transition-transform duration-300 group-hover:scale-105 ${data.soldOut ? 'opacity-50 grayscale' : ''}`}
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-ink-muted text-xs">нет фото</div>
          )}
        </Link>
        {!data.soldOut && (
          <WishlistHeart productId={data.id} initialActive={wishlisted} variant="card" />
        )}
      </div>
      {/* Body */}
      <div className="px-1 pt-4">
        <h3 className="font-display font-bold text-[21px] leading-[1.12]">
          <Link href={href} className="hover:underline underline-offset-2">{data.name}</Link>
        </h3>
        <p className="mt-2 text-ink-muted text-[13px] leading-[1.45]">{data.categoryName}</p>
        {/* Actions */}
        <div className="flex items-center justify-between gap-2.5 mt-4">
          <PriceTag
            price={data.minPrice}
            compareAtPrice={data.minCompareAtPrice}
            className="!min-w-[112px] !h-9 !rounded-full !border !border-line !text-xs !font-bold !px-4"
          />
          <div className="flex items-center gap-2">
            {!data.soldOut && (
              <Link
                href={href}
                aria-label={`Выбрать размер: ${data.name}`}
                className="w-[34px] h-[34px] rounded-full border border-line bg-surface text-ink grid place-items-center hover:border-ink transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                  <path d="M6 8h14l-2 11H8L6 8Z"/>
                  <path d="M6 8 5 4H2"/>
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
```

Note: `WishlistHeart` keeps its existing position (top-right of media). The price pill uses `PriceTag` with override classes to match prototype (h36px, min-w112px, rounded-full, border). The cart button is a round 34px button with a bag SVG.

- [ ] **Step 2: Run typecheck**

Run:

```powershell
npm run typecheck
```

Expected: exit 0.

- [ ] **Step 3: Run build**

Run:

```powershell
npm run build
```

Expected: exit 0.

- [ ] **Step 4: Run tests**

Run:

```powershell
npm run test
```

Expected: all 524+ tests pass.

---

### Task 10: Catalog Hero

**Files:**
- Create: `components/shared/catalog/catalog-hero.tsx`
- Modify: `app/(shop)/catalog/page.tsx`

**Prototype reference:** `catalog.html` lines 611–647

- [ ] **Step 1: Create catalog-hero.tsx**

```tsx
import Image from 'next/image';

export function CatalogHero({ total }: { total: number }) {
  return (
    <section className="mx-auto max-w-[1240px] px-4 sm:px-6 pt-4 md:pt-6" aria-label="Коллекция Ritm">
      <div className="grid md:grid-cols-2 gap-5 rounded-[22px] overflow-hidden bg-surface-soft">
        {/* Image */}
        <div className="relative h-[240px] md:h-[400px]">
          <Image
            src="/home/collection-rail.png"
            alt="Вешалка с одеждой коллекции Ritm"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
            <b className="mr-1">•</b>Коллекция · Лето 2026
          </span>
        </div>
        {/* Copy */}
        <div className="p-6 md:p-10 flex flex-col justify-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">Ritm Collection</span>
          <h1 className="font-display font-bold text-[28px] md:text-[42px] leading-[1.05] mt-2">Откройте для себя коллекции Ritm</h1>
          <p className="mt-3 text-ink-muted text-[15px] leading-[1.6] max-w-[480px]">
            Капсулы сезона, базовый гардероб и лимитированные дропы — собранные в одном каталоге. Найдите вещь под свой стиль.
          </p>
          <div className="flex gap-8 mt-6">
            <div>
              <b className="font-display font-bold text-xl tnum">{total}</b>
              <span className="block text-xs text-ink-muted mt-0.5">товаров</span>
            </div>
            <div>
              <b className="font-display font-bold text-xl tnum">1</b>
              <span className="block text-xs text-ink-muted mt-0.5">бренд</span>
            </div>
            <div>
              <b className="font-display font-bold text-xl tnum">14</b>
              <span className="block text-xs text-ink-muted mt-0.5">дней на возврат</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Update catalog page.tsx**

Add import and render the hero. Read the current `app/(shop)/catalog/page.tsx` and make these changes:

1. Add import at top:

```tsx
import { CatalogHero } from '@/components/shared/catalog/catalog-hero';
```

2. Replace the `<h1>...Каталог</h1>` line and add hero + breadcrumbs before the filter grid:

Replace:

```tsx
      <h1 className="font-display font-bold text-[28px] sm:text-[40px] mb-6">Каталог</h1>
      <div className="grid md:grid-cols-[240px_1fr] gap-6 lg:gap-8">
```

With:

```tsx
      <CatalogHero total={total} />
      <nav className="flex items-center gap-2 text-xs text-ink-muted mt-4 mb-2" aria-label="Хлебные крошки">
        <Link href="/" className="hover:text-ink">Главная</Link>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>
        <span className="text-ink font-semibold">Каталог</span>
      </nav>
      <div className="grid md:grid-cols-[240px_1fr] gap-6 lg:gap-8">
```

Add `import Link from 'next/link';` if not already present.

3. Remove the standalone `<h1>` — the catalog hero now contains the h1.

- [ ] **Step 3: Run typecheck and build**

Run:

```powershell
npm run typecheck && npm run build
```

Expected: exit 0.

---

### Task 11: Catalog Filter Rail Restyle

**Files:**
- Modify: `components/shared/catalog/filter-sidebar.tsx`
- Modify: `components/shared/catalog/filter-controls.tsx`
- Modify: `components/shared/catalog/price-filter.tsx`
- Modify: `components/shared/catalog/color-filter.tsx`
- Modify: `components/shared/catalog/size-filter.tsx`
- Modify: `components/shared/catalog/sort-select.tsx`
- Modify: `components/shared/catalog/pagination.tsx`

**Prototype reference:** `catalog.html` lines 650–731

This task is primarily CSS class updates to match the prototype's visual style. The existing filter components already have correct functionality — only the visual presentation needs updating.

- [ ] **Step 1: Update filter-sidebar.tsx**

The sidebar needs "Фильтры" heading and "Сбросить всё" button at top. Update the `FilterSidebar` component:

```tsx
import { FilterControls } from './filter-controls';
import type { CatalogResult } from '@/lib/find-products';

export function FilterSidebar({ facets }: { facets: CatalogResult['facets'] }) {
  return (
    <aside className="hidden md:block">
      <div className="sticky top-20 rounded-[16px] border border-line bg-surface p-5 lg:p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg">Фильтры</h3>
        </div>
        <FilterControls facets={facets} />
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Update filter-controls.tsx**

Read the current file and update the filter group titles to use `font-display font-bold text-sm` and add `mb-4` spacing between groups. Keep all existing filter logic, only adjust spacing and typography.

- [ ] **Step 3: Update price-filter.tsx**

Update the price readout and slider to match prototype styling: readout uses `text-sm font-semibold tnum` with `₽` suffix. Slider thumbs get `accent-primary` color. Keep existing dual-range behavior.

- [ ] **Step 4: Update color-filter.tsx**

Update color swatches to `w-7 h-7 rounded-full border-2 border-line` with `hover:border-ink transition-colors`. Selected state adds `ring-2 ring-offset-2 ring-primary`.

- [ ] **Step 5: Update size-filter.tsx**

Update size chips to `px-3 py-1.5 rounded-full border border-line text-sm font-medium hover:border-ink transition-colors`. Selected state: `bg-primary text-primary-foreground border-primary`.

- [ ] **Step 6: Update sort-select.tsx**

Update select to pill style: `rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium`.

- [ ] **Step 7: Update pagination.tsx**

Update pagination buttons to `w-9 h-9 rounded-full border border-line grid place-items-center text-sm hover:border-ink`. Active page: `bg-primary text-primary-foreground border-primary`.

- [ ] **Step 8: Run typecheck and build**

Run:

```powershell
npm run typecheck && npm run build
```

Expected: exit 0.

---

### Task 12: Full Regression And Verification

**Files:**
- No source files.

- [ ] **Step 1: Run all tests**

Run:

```powershell
npm run test
```

Expected: all 524+ tests pass.

- [ ] **Step 2: Run typecheck**

Run:

```powershell
npm run typecheck
```

Expected: exit 0.

- [ ] **Step 3: Run production build**

Run:

```powershell
npm run build
```

Expected: exit 0.

- [ ] **Step 4: Check for sneaker remnants**

Run:

```powershell
rg -i "sneaker|кросс|stride" app/ components/ public/ --glob "!*.git*" --glob "!node_modules" --glob "!.next" --glob "!e-comerce-shop-prot"
```

Expected: no matches (except possibly in `e-comerce-shop-prot` which is excluded).

- [ ] **Step 5: Check no old home components are imported**

Run:

```powershell
rg "CategoryBento|DropPromo|EngineeredFeature|TrustStrip" app/ --glob "!node_modules" --glob "!.next"
```

Expected: no matches in `app/`.

---

### Task 13: Review, Commit, And Handoff

**Files:**
- All modified/created files from prior tasks.

- [ ] **Step 1: Inspect final diff**

Run:

```powershell
git status --short --branch
git diff --stat
```

- [ ] **Step 2: Check forbidden files**

Run:

```powershell
git diff --name-only -- .env.local .env.example node_modules .next
```

Expected: no forbidden files appear.

- [ ] **Step 3: Ask user before commit**

Do not commit until the user explicitly asks. If approved:

```powershell
git -c user.name="ui-ux-promax" -c user.email="ui-ux-promax@users.noreply.github.com" add -A
git -c user.name="ui-ux-promax" -c user.email="ui-ux-promax@users.noreply.github.com" commit -m "feat: storefront brand polish for home and catalog"
```

- [ ] **Step 4: Ask user before push**

Do not push until the user explicitly asks. If approved:

```powershell
git push -u origin feat/storefront-brand-polish
```

---

## Responsive Verification Checklist

After deploy or local dev server:

- [ ] 390x844: no horizontal overflow, mobile nav works, hero text readable, product grid 1-2 cols
- [ ] 820x1180: filter rail visible, grid 2 cols, hero scales correctly
- [ ] 1440x900: full 3-col grid, two-row header, filter rail sticky, hero full height