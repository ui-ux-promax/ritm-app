import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('CatalogHeaderNav', () => {
  it('renders the Catalog header button with a black surface', async () => {
    const source = await readFile('components/shared/catalog-header-nav.tsx', 'utf8');

    expect(source).toMatch(/href="\/catalog"[\s\S]*?bg-black text-white/);
  });
});
