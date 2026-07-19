# Header navigation active-state design

## Goal

Make the primary header navigation reflect the current storefront route: only the matching navigation item uses the black active pill. The existing blue count badge on the `Каталог` link remains unchanged.

## Scope

- `/` renders `Каталог`, `Новинки`, and `Sale` as inactive light pills.
- `/catalog` renders `Каталог` as the black active pill.
- `/catalog?sort=new` renders `Новинки` as the black active pill.
- `/catalog?filter=sale` renders `Sale` as the black active pill.

## Design

The shared desktop header navigation remains the single owner of active-state styling. Each item derives activity from the current pathname and query parameters, then selects the existing active or inactive pill class. No page-specific style overrides or badge changes are introduced.

## Verification

Add a focused component/logic assertion for the route matching and run the targeted test suite plus a browser check of `/` and `/catalog`.
