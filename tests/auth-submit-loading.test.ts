// @vitest-environment jsdom

import * as React from 'react';
import { createElement } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginForm } from '@/components/shared/auth/login-form';

Object.assign(globalThis, { React });

const { signIn } = vi.hoisted(() => ({ signIn: vi.fn() }));

vi.mock('next-auth/react', () => ({ signIn }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('@/app/actions/verification', () => ({ ensureVerificationGate: vi.fn() }));

describe('LoginForm submit loading state', () => {
  beforeEach(() => {
    signIn.mockReset();
  });

  it('marks its submit control busy while credentials are pending', async () => {
    signIn.mockImplementation(() => new Promise(() => undefined));
    render(createElement(LoginForm));

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

    const submit = await screen.findByRole('button', { name: 'Вход выполняется' });
    await waitFor(() => expect(signIn).toHaveBeenCalledOnce());
    expect(submit).toHaveProperty('disabled', true);
    expect(submit.getAttribute('aria-busy')).toBe('true');
  });
});
