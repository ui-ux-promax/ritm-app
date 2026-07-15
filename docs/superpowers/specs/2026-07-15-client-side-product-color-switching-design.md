# Client-Side Product Color Switching Design

## Goal

Switch a product colour immediately on the product page without changing the scroll position, while retaining the selected colour in the address bar.

## Root Cause

The current colour controls are links to `/product/[slug]?color=…`. Each click starts a server navigation. The active colour, gallery, sizes and price only change after the server response; the route transition can restore the page at the top. `PurchasePanel` is also keyed by the server-selected colour, forcing a remount.

## Design

`ProductPage` will provide all colourway-specific gallery images and variants to the client `ProductView`. `ProductView` will own the selected colour and switch it synchronously. It will reset the gallery to the first image, update the purchase panel and replace the `color` search parameter with `window.history.replaceState`; this does not invoke Next.js navigation or scroll restoration.

`PurchasePanel` will render colour controls as buttons and notify `ProductView` through an `onColorChange` callback. It will still remount only itself per colour, so a size selected for one colour cannot carry to another.

## Constraints

- Do not change the visual design of product cards or the product page.
- Do not introduce new dependencies or client-side product fetches.
- Preserve shareable `?color=` URLs and initially honour them on server render.
- Add a jsdom regression test proving a colour click changes the gallery and calls `history.replaceState`, not route navigation.
