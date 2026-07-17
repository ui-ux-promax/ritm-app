# RITM SEO Visibility And Performance Design

## Goal

Prevent public indexing of the portfolio demo admin area and reduce unnecessary image work on the storefront homepage without changing portfolio copy, sitemap coverage, canonical URLs, or public page metadata.

## Scope

- Add route-level `noindex, nofollow` metadata to `/demo-admin` so the directive is inherited by every `/demo-admin/*` route.
- Keep the demo routes publicly viewable by direct link; this change only affects search indexing and link following by crawlers.
- Load only the initially visible hero slide as high priority. Render the remaining slides without preload or priority hints.
- Preserve the current hero interactions, autoplay, visual design, image sources, and Russian copy.
- Tighten image `sizes` values for homepage image grids and full-width imagery so Next.js can serve narrower variants where the layout permits.

## Explicit Non-Goals

- Do not change homepage, catalog, product, blog, FAQ, legal, cart, profile, or auth metadata.
- Do not change `robots.ts`, `sitemap.ts`, canonical URLs, title tags, descriptions, structured data, copy, navigation, or portfolio positioning.
- Do not change the public availability of the demo admin.
- Do not redesign or replace image assets in this task.

## Architecture

The `/demo-admin` layout owns crawler directives because every demo-admin route is nested beneath it. Using Next.js `Metadata` keeps the directive in the rendered document head and avoids using `robots.txt` as an indexing control.

The homepage hero keeps all slides mounted to preserve its existing opacity transition. Only slide zero receives `priority`; inactive slides receive no preload hint. Image sizing is changed only at existing `next/image` call sites and follows the established responsive layout breakpoints.

## Verification

- A focused metadata test confirms that the demo-admin layout exposes `robots: { index: false, follow: false }`.
- A focused hero render test confirms that only the first slide is marked high priority and remaining slides preserve the current sources.
- Run focused tests, the full Vitest suite, `npm run typecheck`, and `npm run build`.
- Inspect the production build output or rendered metadata to confirm that `/demo-admin` emits `noindex, nofollow`.

## Risks And Mitigations

- `noindex` only takes effect after crawlers recrawl the route. The directive is deliberately placed in page metadata rather than `robots.txt`, so compliant crawlers can observe it.
- Changing hero mounting strategy could cause visual flashes or interrupt carousel transitions. The implementation retains the current mounted-slide model and adjusts only preload priority.
- The audit's Core Web Vitals numbers were heuristic rather than field data. Changes target clear transfer and preload waste; performance impact will be rechecked with the production build and, when rate limits permit, PageSpeed Insights.
