# Catalog feedback design

## Scope

Improve two catalog interactions without changing the product or pagination data model.

## Add to cart feedback

When an enabled product-card add-to-cart button is clicked, its local action enters a pending state. The button becomes disabled, shows the existing circular spinner before the label, and changes its label to `Добавляем`. On completion, the existing cart update behavior resumes and the pending state clears. The control retains its current rounded shape and dimensions so the card layout does not shift.

## Pagination affordance

The current page keeps its dark primary background. Every selectable page-number or navigation button uses a white surface, dark text, and the existing subtle border. Disabled navigation controls retain their disabled visual state and cannot be selected.

## Accessibility and verification

The pending add-to-cart button remains disabled while processing and exposes a loading state to assistive technology. Pagination controls preserve their existing labels and disabled semantics. Automated tests will cover the pending button content/disabled state and selectable pagination surface styling; a focused browser check will confirm the rendered result.
