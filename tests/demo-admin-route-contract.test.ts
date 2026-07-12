import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEMO_ADMIN_NAV, isDemoNavActive } from '@/lib/demo-admin/nav';

const root = process.cwd();
const routes = ['page.tsx', 'catalog/page.tsx', 'orders/page.tsx', 'customers/page.tsx', 'marketing/page.tsx'];

describe('demo admin route contract', () => {
  it('contains every public demo route', () => {
    for (const route of routes) expect(existsSync(join(root, 'app/(demo-admin)/demo-admin', route))).toBe(true);
  });

  it('keeps the layout independent from Auth.js and the real admin shell', () => {
    const source = readFileSync(join(root, 'app/(demo-admin)/demo-admin/layout.tsx'), 'utf8');
    expect(source).not.toMatch(/requireAdmin|@\/auth|components\/admin\/admin-shell/);
  });

  it('keeps the dashboard nav item exact while nested items use prefix matching', () => {
    const [dashboard, catalog] = DEMO_ADMIN_NAV;

    expect(isDemoNavActive(dashboard, '/demo-admin')).toBe(true);
    expect(isDemoNavActive(dashboard, '/demo-admin/catalog')).toBe(false);
    expect(isDemoNavActive(catalog, '/demo-admin/catalog/products')).toBe(true);
  });
});
