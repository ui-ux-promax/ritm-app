// @vitest-environment jsdom

import * as React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CategoryTable } from '@/app/(admin)/admin/catalog/categories/_components/category-table';
import { CouponTable } from '@/app/(admin)/admin/marketing/_components/coupon-table';

const { moveCategoryMock, toggleCouponMock } = vi.hoisted(() => ({
  moveCategoryMock: vi.fn(),
  toggleCouponMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock('@/app/actions/admin/categories', () => ({
  deleteCategory: vi.fn(),
  moveCategory: moveCategoryMock,
}));

vi.mock('@/app/actions/admin/coupons', () => ({
  deleteCoupon: vi.fn(),
  toggleCoupon: toggleCouponMock,
}));

vi.mock('@/components/admin/icon', () => ({
  Icon: ({ name }: { name: string }) => name,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((next) => {
    resolve = next;
  });
  return { promise, resolve };
}

describe('admin row loading states', () => {
  it('marks only the pending category move control busy and replaces its arrow with a status', async () => {
    const request = deferred<{ ok: true }>();
    moveCategoryMock.mockReturnValue(request.promise);

    render(React.createElement(CategoryTable, {
      rows: [
        { id: 'cat-1', name: 'First', slug: 'first', tagline: null, coverImage: null, productCount: 0 },
        { id: 'cat-2', name: 'Second', slug: 'second', tagline: null, coverImage: null, productCount: 0 },
      ],
    }));

    const downButtons = screen.getAllByRole('button', { name: /вниз/i });
    fireEvent.click(downButtons[0]);

    await waitFor(() => expect(downButtons[0].getAttribute('aria-busy')).toBe('true'));
    expect(downButtons[0].hasAttribute('disabled')).toBe(true);
    expect(downButtons[0].querySelector('[role="status"]')).not.toBeNull();
    expect(screen.getAllByRole('status', { name: /перемещаем категорию/i })).toHaveLength(2);
    expect(downButtons[1].getAttribute('aria-busy')).not.toBe('true');
    expect(downButtons[1].querySelector('[role="status"]')).toBeNull();

    request.resolve({ ok: true });
    await waitFor(() => expect(downButtons[0].getAttribute('aria-busy')).not.toBe('true'));
  });

  it('shows a labelled status beside only the pending coupon switch', async () => {
    const request = deferred<{ ok: true }>();
    toggleCouponMock.mockReturnValue(request.promise);

    render(React.createElement(CouponTable, {
      rows: [
        {
          id: 'coupon-1',
          code: 'SAVE10',
          percent: 10,
          active: true,
          status: 'active',
          expiresLabel: 'Never',
          createdLabel: 'Today',
        },
        {
          id: 'coupon-2',
          code: 'SAVE20',
          percent: 20,
          active: false,
          status: 'inactive',
          expiresLabel: 'Never',
          createdLabel: 'Today',
        },
      ],
    }));

    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]);

    await waitFor(() => expect(switches[0].hasAttribute('disabled')).toBe(true));
    expect(switches[0].getAttribute('aria-busy')).toBe('true');
    expect(screen.getAllByRole('status', { name: /загрузка статуса купона/i })).toHaveLength(2);
    expect(switches[1].hasAttribute('disabled')).toBe(false);

    request.resolve({ ok: true });
    await waitFor(() => expect(switches[0].hasAttribute('disabled')).toBe(false));
  });

  it('keeps each concurrent category row busy until its own move settles', async () => {
    const first = deferred<{ ok: true }>();
    const second = deferred<{ ok: true }>();
    moveCategoryMock
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);

    render(React.createElement(CategoryTable, {
      rows: [
        { id: 'cat-1', name: 'First', slug: 'first', tagline: null, coverImage: null, productCount: 0 },
        { id: 'cat-2', name: 'Second', slug: 'second', tagline: null, coverImage: null, productCount: 0 },
        { id: 'cat-3', name: 'Third', slug: 'third', tagline: null, coverImage: null, productCount: 0 },
      ],
    }));

    const desktopDownButtons = screen.getAllByRole('button', { name: /вниз/i }).slice(0, 3);
    fireEvent.click(desktopDownButtons[0]);
    fireEvent.click(desktopDownButtons[1]);

    await waitFor(() => {
      expect(desktopDownButtons[0].getAttribute('aria-busy')).toBe('true');
      expect(desktopDownButtons[1].getAttribute('aria-busy')).toBe('true');
    });

    first.resolve({ ok: true });
    await waitFor(() => expect(desktopDownButtons[0].getAttribute('aria-busy')).not.toBe('true'));
    expect(desktopDownButtons[1].getAttribute('aria-busy')).toBe('true');

    second.resolve({ ok: true });
    await waitFor(() => expect(desktopDownButtons[1].getAttribute('aria-busy')).not.toBe('true'));
  });

  it('keeps each concurrent coupon row busy until its own toggle settles', async () => {
    const first = deferred<{ ok: true }>();
    const second = deferred<{ ok: true }>();
    toggleCouponMock
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);

    render(React.createElement(CouponTable, {
      rows: [
        { id: 'coupon-1', code: 'SAVE10', percent: 10, active: true, status: 'active', expiresLabel: 'Never', createdLabel: 'Today' },
        { id: 'coupon-2', code: 'SAVE20', percent: 20, active: false, status: 'inactive', expiresLabel: 'Never', createdLabel: 'Today' },
      ],
    }));

    const desktopSwitches = screen.getAllByRole('switch').slice(0, 2);
    fireEvent.click(desktopSwitches[0]);
    fireEvent.click(desktopSwitches[1]);

    await waitFor(() => {
      expect(desktopSwitches[0].getAttribute('aria-busy')).toBe('true');
      expect(desktopSwitches[1].getAttribute('aria-busy')).toBe('true');
    });

    first.resolve({ ok: true });
    await waitFor(() => expect(desktopSwitches[0].getAttribute('aria-busy')).not.toBe('true'));
    expect(desktopSwitches[1].getAttribute('aria-busy')).toBe('true');

    second.resolve({ ok: true });
    await waitFor(() => expect(desktopSwitches[1].getAttribute('aria-busy')).not.toBe('true'));
  });
});
