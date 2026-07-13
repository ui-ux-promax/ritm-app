import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('ties the Sentry alert to the project configured by the production DSN', () => {
  const source = readFileSync('docs/operations/security-verification.md', 'utf8');
  expect(source).toContain('project configured by the Production DSN');
});
