# Product Colour Image Preload Design

## Goal

Make a product's gallery change immediately on the first selection of any available colour.

## Root cause

`ProductView` renders only the active colourway's gallery. Consequently, the browser has not requested the main-image rendition for another colourway until it becomes active. The first change waits for that network and image decode; later changes use the browser cache.

## Design

After the first page render, `ProductView` will render non-visible Next Image instances for each image that can become the main gallery image. They use the same `sizes` value as the visible main image so Next.js requests the exact optimized rendition required after a colour change. They are marked non-priority, so they do not compete with the current LCP image's preload.

The visible gallery and colour-selection state remain unchanged. The browser downloads the alternate images in the background and retains them in its ordinary cache; selecting a colour simply swaps to an already decoded or cached image.

## Constraints

- Keep the first visible image as the only priority image.
- Do not add network requests for duplicate URLs.
- Do not change URLs, scrolling, colour selection, or page layout.
- Add a regression test asserting that non-active colourway main images are rendered for preload using the main-image responsive size.

## Verification

Run the focused ProductView test, TypeScript check, and the relevant production build or automated browser check. Confirm a cold-load first colour selection displays the already requested image without a new image request.
