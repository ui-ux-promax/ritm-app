import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('NewsletterBanner focus style', () => {
  it('keeps the email input size stable and moves its focus ring to the form', async () => {
    const source = await readFile('components/shared/home/newsletter-banner.tsx', 'utf8');

    expect(source).toMatch(/<form[\s\S]*?focus-within:shadow-\[/);
    expect(source).toMatch(/<input[\s\S]*?focus-visible:!shadow-none/);
  });
});
