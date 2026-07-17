import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), 'utf8');

describe('homepage image performance contract', () => {
  it('preloads only the first hero slide', () => {
    const source = read('components/shared/home/hero.tsx');
    expect(source).toContain('priority={index === 0}');
    expect(source).not.toContain('priority={index === active}');
  });

  it('uses responsive image sizes for the editorial grid', () => {
    expect(read('components/shared/home/editorial-bento.tsx')).toContain(
      'sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"',
    );
  });
});
