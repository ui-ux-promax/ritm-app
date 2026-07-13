import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('documents the live case, stack, proof, and limitations', () => {
  const readme = readFileSync('README.md', 'utf8');

  for (const value of [
    'https://ritm-app-eight.vercel.app',
    '/demo-admin',
    'Next.js 15',
    'Prisma',
    'Neon',
    'YooKassa sandbox',
    'Sentry',
    'GitHub Actions',
    'Portfolio limitations',
  ]) {
    expect(readme).toContain(value);
  }

  for (const image of [
    'storefront-desktop.png',
    'catalog-mobile.png',
    'demo-admin-desktop.png',
    'demo-admin-mobile.png',
  ]) {
    expect(readme).toContain(image);
  }
});
