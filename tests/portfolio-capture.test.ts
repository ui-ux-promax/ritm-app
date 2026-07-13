import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('captures the agreed public portfolio screens', () => {
  const source = readFileSync('scripts/capture-portfolio.mjs', 'utf8');

  for (const value of [
    '/',
    '/catalog',
    '/demo-admin',
    'storefront-desktop.png',
    'catalog-mobile.png',
    'demo-admin-desktop.png',
    'demo-admin-mobile.png',
  ]) {
    expect(source).toContain(value);
  }

  expect(source).toContain('if (!response?.ok)');
});
