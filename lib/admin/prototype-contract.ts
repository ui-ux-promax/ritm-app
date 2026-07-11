export const ADMIN_PROTOTYPES = [
  'e-comerce-shop-prot/admin-dashboard.html',
  'e-comerce-shop-prot/admin-catalog.html',
  'e-comerce-shop-prot/admin-orders.html',
  'e-comerce-shop-prot/admin-clients.html',
  'e-comerce-shop-prot/admin-promocodes.html',
] as const;

export const ADMIN_PRIMARY_ROUTE_ORDER = [
  '/admin',
  '/admin/orders',
  '/admin/catalog',
  '/admin/customers',
  '/admin/marketing',
] as const;

export const ADMIN_ROUTE_SMOKE_TARGETS = [
  { route: '/admin', pageFile: 'app/(admin)/admin/page.tsx', prototype: 'e-comerce-shop-prot/admin-dashboard.html' },
  { route: '/admin/catalog', pageFile: 'app/(admin)/admin/catalog/page.tsx', prototype: 'e-comerce-shop-prot/admin-catalog.html' },
  { route: '/admin/catalog/products', pageFile: 'app/(admin)/admin/catalog/products/page.tsx', prototype: 'e-comerce-shop-prot/admin-catalog.html' },
  { route: '/admin/catalog/products/new', pageFile: 'app/(admin)/admin/catalog/products/new/page.tsx', prototype: 'e-comerce-shop-prot/admin-catalog.html' },
  { route: '/admin/catalog/products/[id]/edit', pageFile: 'app/(admin)/admin/catalog/products/[id]/edit/page.tsx', prototype: 'e-comerce-shop-prot/admin-catalog.html' },
  { route: '/admin/catalog/categories', pageFile: 'app/(admin)/admin/catalog/categories/page.tsx', prototype: 'e-comerce-shop-prot/admin-catalog.html' },
  { route: '/admin/catalog/categories/new', pageFile: 'app/(admin)/admin/catalog/categories/new/page.tsx', prototype: 'e-comerce-shop-prot/admin-catalog.html' },
  { route: '/admin/catalog/categories/[id]/edit', pageFile: 'app/(admin)/admin/catalog/categories/[id]/edit/page.tsx', prototype: 'e-comerce-shop-prot/admin-catalog.html' },
  { route: '/admin/orders', pageFile: 'app/(admin)/admin/orders/page.tsx', prototype: 'e-comerce-shop-prot/admin-orders.html' },
  { route: '/admin/orders/[id]', pageFile: 'app/(admin)/admin/orders/[id]/page.tsx', prototype: 'e-comerce-shop-prot/admin-orders.html' },
  { route: '/admin/customers', pageFile: 'app/(admin)/admin/customers/page.tsx', prototype: 'e-comerce-shop-prot/admin-clients.html' },
  { route: '/admin/customers/[id]', pageFile: 'app/(admin)/admin/customers/[id]/page.tsx', prototype: 'e-comerce-shop-prot/admin-clients.html' },
  { route: '/admin/marketing', pageFile: 'app/(admin)/admin/marketing/page.tsx', prototype: 'e-comerce-shop-prot/admin-promocodes.html' },
  { route: '/admin/marketing/new', pageFile: 'app/(admin)/admin/marketing/new/page.tsx', prototype: 'e-comerce-shop-prot/admin-promocodes.html' },
  { route: '/admin/marketing/[id]/edit', pageFile: 'app/(admin)/admin/marketing/[id]/edit/page.tsx', prototype: 'e-comerce-shop-prot/admin-promocodes.html' },
] as const;
