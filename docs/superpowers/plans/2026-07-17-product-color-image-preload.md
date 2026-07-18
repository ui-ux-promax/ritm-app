# Product Colour Image Preload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure the first switch to any product colour uses an already requested main-gallery image.

**Architecture:** `ProductView` already receives all colourway gallery data. It will keep the current visible gallery unchanged and additionally render a hidden `next/image` for every non-active gallery image. These preloads use the same responsive `sizes` value as the main image, so the requested Next.js optimization URL is reusable when that image becomes main.

**Tech Stack:** Next.js 15 `Image`, React 18, Vitest, Testing Library.

## Global Constraints

- Keep the first visible image as the only priority image.
- Do not add network requests for duplicate URLs.
- Do not change URLs, scrolling, colour selection, or page layout.
- Test the preload contract in `tests/product-view-color-selection.test.ts`.

---

### Task 1: Preload alternate colourway gallery images

**Files:**
- Modify: `components/shared/product/product-view.tsx:58-62, 90-91`
- Modify: `tests/product-view-color-selection.test.ts:35-81`

**Interfaces:**
- Consumes: `colorways: ProductColorwayView[]`, where every item contains `galleryImages: Array<{ url: string; alt: string }>`.
- Produces: hidden non-priority `Image` nodes with `sizes="(min-width: 1024px) 600px, 100vw"` for unique, non-active URLs.

- [ ] **Step 1: Write the failing test**

Update the `next/image` mock so it forwards its remaining props, then add this assertion to the existing first-colour-switch test after `render(...)` and before clicking `Terracotta`:

```ts
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string }) =>
    React.createElement('img', { src, alt, ...props }),
}));

const preloadedImage = document.querySelector('img[data-preload-image="/terracotta.jpg"]');

expect(preloadedImage).toHaveAttribute('sizes', '(min-width: 1024px) 600px, 100vw');
expect(preloadedImage).not.toHaveAttribute('fetchpriority', 'high');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/product-view-color-selection.test.ts`

Expected: FAIL because the non-active `terracotta.jpg` image is not rendered before colour selection.

- [ ] **Step 3: Write minimal implementation**

In `ProductView`, derive the URLs that do not belong to the active gallery and are not duplicates. Render them in an `aria-hidden` zero-size container after the visible main image:

```tsx
const activeImageUrls = new Set(galleryImages.map((image) => image.url));
const preloadImages = colorways.flatMap((colorway) => colorway.galleryImages)
  .filter((image, index, images) =>
    !activeImageUrls.has(image.url) && images.findIndex(({ url }) => url === image.url) === index,
  );

// inside the main-gallery container
<div aria-hidden className="sr-only">
  {preloadImages.map((image) => (
    <Image
      key={image.url}
      src={image.url}
      alt=""
      data-preload-image={image.url}
      width={1}
      height={1}
      sizes="(min-width: 1024px) 600px, 100vw"
    />
  ))}
</div>
```

- [ ] **Step 4: Run focused test to verify it passes**

Run: `npm test -- tests/product-view-color-selection.test.ts`

Expected: PASS with both existing colour-selection behavior and the preload assertion green.

- [ ] **Step 5: Run type check**

Run: `npm run typecheck`

Expected: exit code 0 with no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add components/shared/product/product-view.tsx tests/product-view-color-selection.test.ts
git commit -m "perf: preload product colour images"
```
