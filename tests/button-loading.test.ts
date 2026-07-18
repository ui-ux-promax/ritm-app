// @vitest-environment jsdom

import * as React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Button } from '@/components/ui/button';
import { Button as AdminButton } from '@/components/admin/ui/button';

afterEach(cleanup);

describe('customer Button', () => {
  it('exposes an accessible busy state while loading', () => {
    render(React.createElement(Button, { loading: true }, 'Save'));

    expect(screen.getByRole('button').hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button').getAttribute('aria-busy')).toBe('true');
    expect(screen.getByRole('status', { name: 'Загрузка' })).not.toBeNull();
  });
});

describe('admin Button', () => {
  it('exposes an accessible busy state while loading', () => {
    render(React.createElement(AdminButton, { loading: true }, 'Save'));

    expect(screen.getByRole('button').hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button').getAttribute('aria-busy')).toBe('true');
    expect(screen.getByRole('status', { name: /Загрузка/ })).not.toBeNull();
  });
});
