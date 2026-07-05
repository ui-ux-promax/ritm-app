# Ritm Storefront Brand Polish Design (Home + Catalog)

## Goal

Bring the home page (`/`) and catalog page (`/catalog`) to pixel-match parity with the HTML prototypes in `e-comerce-shop-prot/`. This is Phase 3 of the Ritm roadmap.

## Fidelity Contract

Prototypes are the visual contract. Match layout geometry, typography scale, spacing rhythm, color tokens, border radii, shadows, motion timing, and component states from the exported HTML. Replace static placeholder data with real seed data where available; keep real copy from the export.

## Scope

### Screens
- Home: `/`
- Catalog: `/catalog`

### Components (in implementation order)
1. Site Header — two-row nav, SVG logo, icons, quick chips, search
2. Site Footer — dark footer, link grid, newsletter, bottom bar
3. Home Hero — full-bleed photo hero with CTA
4. Home Editorial — image card + coming-soon card
5. Home Product Grid — filter tabs + 3-col grid + view more
6. Home Season — full-bleed collage + collection seal
7. Home Blog — 3-col blog cards (stub content)
8. Catalog Hero — split layout with image, copy, stats, search
9. Catalog Filter Rail — left aside: brand, category, price, color, size, stock
10. Catalog Product Grid — grid + sort + pagination
11. Product Card — shared component: media, body, price pill, round buttons
12. Blog/FAQ stub pages — simple server components at `/blog` and `/faq`

### Out of scope
- PDP, cart, checkout visual polish (Phase 3b)
- Admin visual polish (Phase 4)
- Blog/FAQ real content (just stub pages)
- Payment/auth logic changes
- Schema changes

## Approach

Component-by-component. Each component is restyled individually, verified with typecheck + build, committed separately. This minimizes risk and enables precise rollback.

## Non-Negotiable Rules

Inherited from MVP_MIGRATION_PLAN.md and prior plans:
- Do not run `prisma db push`, `prisma db seed`, or local e2e on Windows against Neon.
- Do not read, write, or hand-edit `.env*` files.
- Allowed local commands: `npm run prisma:generate`, `npm run typecheck`, `npm run test`, `npm run build`, read-only source/git inspections.
- Commit only when the user asks. Push only when the user asks.
- Commit messages and PR titles: English conventional commits, author `ui-ux-promax`, no `Co-Authored-By` or assistant attribution.
- New work on `feat/storefront-brand-polish`, branched from `origin/main`.
- No schema changes.

## Responsive Contract

Validate at:
- Mobile: 390x844 (primary mobile)
- Tablet: 820x1180
- Desktop: 1440x900

## Asset Strategy

Copy prototype assets to `public/home/` and use `next/image` with automatic WebP/AVIF optimization. Assets needed:

- `hero-photo.png` (~8MB) → `public/home/hero-photo.png`
- `collection-rail.png` (~8MB) → `public/home/collection-rail.png`
- `coming-card.png` (~7MB) → `public/home/coming-card.png`
- `season-collage.png` (~8MB) → `public/home/season-collage.png`
- `blog-arrival.png` (~8MB) → `public/home/blog-arrival.png`
- `blog-chic.png` (~8MB) → `public/home/blog-chic.png`
- `blog-wardrobe.png` (~7MB) → `public/home/blog-wardrobe.png`
- `ritm-logo.svg` → `public/ritm-logo.svg`
- `ritm-logo-light.svg` → `public/ritm-logo-light.svg`

Existing product images in `public/products/` remain unchanged.

---

## Component Specs

### 1. Site Header

**Source:** `ritm-home.html` topbar, `catalog.html` topbar

**Structure — Row 1 (nav-primary):**
- Menu button (mobile only, hamburger SVG, 18px)
- Logo: `ritm-logo.svg` (98px width), link to `/`
- Nav links: Блог → `/blog`, FAQ → `/faq`
- Icon row (34px round buttons, surface bg, 1px border, shadow):
  - Уведомления (bell SVG)
  - Корзина (cart SVG + badge dot, link to `/cart`)
  - Профиль (user SVG, link to `/profile` or `/login`)

**Structure — Row 2 (nav-secondary):**
- Category select button: "Одежда" + chevron SVG (dropdown to category links)
- Quick chips row: Новинки (active → `/catalog?sort=new`), Sale (→ `/catalog?filter=sale`)
- Search shell: pill input + search SVG, links to `/catalog?q=...`
- Quick chips row 2: Мужчины, Женщины, Дети, Бренд (visual chips, no backend filter in MVP)

**Mobile (390px):**
- nav-links hidden, replaced by mobile-panel drawer
- Search shell remains in nav-secondary
- Icon row remains
- Row 2 quick chips: scrollable horizontal

**Files:**
- Modify: `components/shared/site-header.tsx`
- Modify: `components/shared/mobile-nav.tsx`
- Modify: `components/shared/header-search.tsx`
- Create: `public/ritm-logo.svg` (copy from prototype)

### 2. Site Footer

**Source:** `ritm-home.html` footer

**Structure:**
- Dark background: `hsl(var(--color-footer))`
- Footer grid (4 cols desktop, 1 col mobile):
  - Col 1: `ritm-logo-light.svg` + brand description
  - Col 2: "Каталог" — links: Футболки (`/catalog?category=tees`), Худи, Верхняя одежда, Брюки, Аксессуары
  - Col 3: "Помощь" — links: Доставка (`/legal/delivery`), Возврат (`/legal/refund`), Размеры, FAQ (`/faq`)
  - Col 4: Newsletter signup (email input + submit button) + social links
- Footer bottom: © 2026 Ritm + payment icons + privacy/terms links

**Files:**
- Modify: `components/shared/site-footer.tsx`
- Create: `public/ritm-logo-light.svg` (copy from prototype)

### 3. Home Hero

**Source:** `ritm-home.html` hero section

**Layout:**
- Full-bleed card, min-height 604px (desktop), min-height 380px (mobile)
- Background: `hero-photo.png` center/cover + dark gradient overlay (left 80% → right 10% opacity)
- Content (positioned left, 70% width, max 680px):
  - h1 "Ritm." (64px desktop / 42px mobile, white, display font)
  - p (15px, white/88%, max 560px)
- CTA: centered bottom (absolute, 50% left, translateX):
  - White pill button: "Начать покупки" + black arrow circle (38px)
  - "Топ коллекция" label below
- Arrows: top-right, 2 circular buttons (34px, prev/next) — visual only in MVP

**Files:**
- Modify: `components/shared/home/hero.tsx`

### 4. Home Editorial

**Source:** `ritm-home.html` editorial-cards section

**Layout:**
- 2-column grid (1.18fr / 0.82fr), gap 20px
- Left card: image `collection-rail.png` (450px height, cover) + figcaption (italic h3 31px, muted p 14px)
- Right card: "coming soon" — text block (h3 + p) + `coming-card.png` (300px height, rounded radius-lg)
- Mobile: 1 column, stacked

**Files:**
- Create: `components/shared/home/editorial-section.tsx`

### 5. Home Product Grid (Bestsellers)

**Source:** `ritm-home.html` product-grid section

**Layout:**
- Centered h2 "Просмотрите все, что нужно." (38px desktop / 28px mobile)
- Filter tabs (pill buttons, horizontally scrollable): Все, Верхняя одежда, Низ, Топы, Loungewear, Кроссовки
  - Active state: primary bg, primary-foreground text
  - Inactive: surface bg, border, text color
  - Visual filtering only in MVP — maps to category slugs
- 3-column grid (desktop), 2-column (tablet), 1-column (mobile), gap 24px
- Product cards (see Component 11)
- "View more" centered solid-pill button → `/catalog`

**Files:**
- Modify: `components/shared/home/bestsellers-section.tsx`

### 6. Home Season

**Source:** `ritm-home.html` season section

**Layout:**
- Full-bleed `season-collage.png` (min-height 390px, center/cover)
- Collection seal: circular badge 116px, centered bottom, surface bg, mono font 11px
- Mobile: min-height 280px

**Files:**
- Create: `components/shared/home/season-section.tsx`

### 7. Home Blog

**Source:** `ritm-home.html` blog section

**Layout:**
- h2 + lead paragraph
- 3-column grid, gap 24px
- Blog cards: image (cover, rounded) + category tag + h3 + date
- Images: `blog-arrival.png`, `blog-chic.png`, `blog-wardrobe.png`
- Content is static placeholder text (real blog later)
- Mobile: 1 column

**Files:**
- Create: `components/shared/home/blog-section.tsx`

### 8. Catalog Hero

**Source:** `catalog.html` hero section

**Layout:**
- Split layout (2-column grid):
  - Left: `collection-rail.png` with "Коллекция · Лето 2026" tag overlay
  - Right: eyebrow "Ritm Collection" + h1 + paragraph + search field (pill) + stats row
- Stats: "248 товаров", "32 бренда", "14 дней на возврат" (real counts from DB where possible)
- Breadcrumbs: Главная → Каталог → Коллекция Ritm

**Files:**
- Create: `components/shared/catalog/catalog-hero.tsx`
- Modify: `app/(shop)/catalog/page.tsx`

### 9. Catalog Filter Rail

**Source:** `catalog.html` filter-shell

**Layout:**
- Left aside, 180-200px width (desktop), sticky
- Groups:
  - Бренд: checkbox list with qty badges (static list: RITM only for MVP, but keep visual structure)
  - Категория: checkbox list (from DB categories)
  - Цена: dual range slider + readout (min/max in ₽)
  - Цвет: color swatches (round, from DB product colorways)
  - Размер: XS-XXL pill chips
  - В наличии: toggle switch
- "Сбросить всё" button at top
- Mobile: drawer/sheet (slide from left), triggered by filter button

**Files:**
- Modify: `components/shared/catalog/filter-sidebar.tsx`
- Modify: `components/shared/catalog/filter-controls.tsx`
- Modify: `components/shared/catalog/mobile-filter-drawer.tsx`
- Modify: `components/shared/catalog/price-filter.tsx`
- Modify: `components/shared/catalog/color-filter.tsx`
- Modify: `components/shared/catalog/size-filter.tsx`
- Modify: `components/shared/catalog/in-stock-toggle.tsx`
- Modify: `components/shared/catalog/active-filter-chips.tsx`

### 10. Catalog Product Grid

**Source:** `catalog.html` product grid

**Layout:**
- Catalog head: h2 "Коллекция Ritm" + count "Показано X из Y товаров"
- Sort select (top-right, pill style)
- 3-column grid (desktop), 2-column (tablet), 1-column (mobile)
- Product cards (see Component 11)
- Pagination at bottom

**Files:**
- Modify: `components/shared/catalog/sort-select.tsx`
- Modify: `components/shared/catalog/pagination.tsx`
- Modify: `app/(shop)/catalog/page.tsx`

### 11. Product Card

**Source:** `ritm-home.html` product-card, `catalog.html` product-card

**Layout:**
- Card: white bg (`--surface`), 1px border (`--border`), radius 10px, padding 10px 10px 16px
- Media: aspect-ratio 1.3/1, overflow hidden, radius 10px, `surface-soft` bg
  - Image: `object-cover`, full width/height
  - Badges (top-left): "New" (primary), "Sale" (danger), "Нет в наличии" (muted)
- Body: padding 16px 4px 0
  - h3: 21px, display font, line-height 1.12
  - p: 13px, muted, line-height 1.45 (category or short description)
  - Actions row (margin-top 18px):
    - Price pill: h36px, min-w112px, padding 15px, radius 999px, 1px border, 12px font, 760 weight
      - Old price: strikethrough, muted, inline before price pill
    - Tool buttons: gap 8px
      - Fav button: 34px round, 1px border, surface bg; active: danger bg + white icon
      - Cart button: 34px round, 1px border, surface bg; active: primary bg + white icon
- Hover: translateY(-3px), border darken, box-shadow `0 18px 45px color-mix(fg 8%, transparent)`
- Transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease

**Files:**
- Modify: `components/shared/product-card.tsx`

### 12. Blog/FAQ Stub Pages

**Layout:**
- Simple server components
- Centered content: logo + "Скоро" / "Раздел в разработке"
- Minimal styling matching brand tokens
- `/blog` — h1 "Блог", "Скоро будет интересно"
- `/faq` — h1 "FAQ", "Раздел заполняется"

**Files:**
- Create: `app/(shop)/blog/page.tsx`
- Create: `app/(shop)/faq/page.tsx`

---

## Home Page Composition

Final order of sections on `/`:

1. Site Header (shared)
2. Hero
3. Intro section ("Свежая мода в современных вайбах" — centered heading + lead)
4. Editorial grid (image card + coming card)
5. Product grid (filter tabs + bestsellers + view more)
6. Season section (full-bleed collage + seal)
7. Blog section (3 cards)
8. Site Footer (shared)

**Removed from current home:** `CategoryBento`, `DropPromo`, `EngineeredFeature`, `TrustStrip` — replaced by prototype sections.

## Catalog Page Composition

1. Site Header (shared)
2. Catalog Hero (split image + copy + stats)
3. Breadcrumbs
4. Catalog head (h2 + count)
5. Filter shell (rail + grid + sort)
6. Pagination
7. Site Footer (shared)

---

## Verification

After each component:
- `npm run typecheck` — exit 0
- `npm run build` — exit 0

After all components:
- `npm run test` — all 524+ tests pass
- `npm run build` — exit 0
- Visual smoke at 390x844, 820x1180, 1440x900 (browser tools or manual)
- No sneaker copy, sneaker sizes, or sneaker images remain
- No horizontal overflow on mobile
- All links point to real routes or stubs (`/blog`, `/faq`)

## Risks

- Large PNG assets (~8MB each) may slow build — `next/image` optimization handles this at request time, not build time.
- Filter tabs on home product grid are visual-only in MVP — no backend category filtering on home; clicking a tab could scroll to catalog with that filter.
- Brand filter shows only RITM — visual structure preserved but single entry.
- Quick chips (Мужчины/Женщины/Дети/Бренд) are visual-only — no backend gender/audience filter in MVP.