// @vitest-environment jsdom

import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VerificationGate } from '@/components/shared/auth/verification-gate';

Object.assign(globalThis, { React });

const { resendVerificationCode } = vi.hoisted(() => ({ resendVerificationCode: vi.fn() }));

vi.mock('@/app/actions/verification', () => ({
  verifyEmailCode: vi.fn(),
  resendVerificationCode,
}));

afterEach(() => {
  resendVerificationCode.mockReset();
});

describe('VerificationGate resend loading state', () => {
  it('keeps resend disabled and busy while its request is unresolved', () => {
    resendVerificationCode.mockImplementation(() => new Promise(() => undefined));
    render(React.createElement(VerificationGate, { email: 'user@example.com' }));

    const resend = screen.getByRole('button', { name: /отправить код снова/i });
    fireEvent.click(resend);

    expect(resend).toHaveProperty('disabled', true);
    expect(resend.getAttribute('aria-busy')).toBe('true');
    expect(screen.getByRole('status', { name: 'Отправляем код снова' })).toBeTruthy();
  });
});
