# Catalog feedback design

## Scope

Improve two catalog interactions without changing the product or pagination data model.

## Add to cart feedback

When an enabled product-card add-to-cart button is clicked, its local action enters a pending state. The button becomes disabled, shows the existing circular spinner before the label, and changes its label to `Добавляем`. On completion, the existing cart update behavior resumes and the pending state clears. The control retains its current rounded shape and dimensions so the card layout does not shift.

## Pagination affordance

The current page keeps its dark primary background. Every selectable page-number or navigation button uses a white surface, dark text, and the existing subtle border. Disabled navigation controls retain their disabled visual state and cannot be selected.

## Cart feedback

While a cart-line quantity update is pending, only that line's minus and plus controls are disabled and the quantity number is replaced by a compact spinner. The previous quantity stays visible again when the request completes or fails. The related-product add button similarly disables only itself and replaces its plus icon with a spinner during its `addCartItem` request. Other cart lines and related-product cards remain interactive.

## Product-page feedback

The primary product-page add-to-cart button follows the same feedback pattern: while its existing cart request is pending, it is disabled, changes from its dark primary surface to a neutral muted surface, and renders a spinner with `Добавляем`. Once the request settles, the existing successful `Добавлено ✓` or default state is shown again, preserving the button's size and all current cooldown behavior.

## Buy now checkout

`Купить сейчас` requires a selected, in-stock variant. It opens `/checkout?buyNow=<variantId>` without adding the product to the cart. The checkout page and order action independently load and validate that variant, then display and create an order containing quantity one of that variant only. The existing cart is neither read into the buy-now checkout nor changed when its order succeeds; standard cart checkout remains unchanged.

## Accessibility and verification

The pending add-to-cart controls remain disabled while processing and expose a loading state to assistive technology. Pagination controls preserve their existing labels and disabled semantics. Automated tests will cover catalog, cart, product-page, and buy-now isolation behavior; a focused browser check will confirm the rendered result.
