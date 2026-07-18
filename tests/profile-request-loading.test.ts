// @vitest-environment jsdom

import * as React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProfileView } from '@/components/shared/profile/profile-view';

const mocks = vi.hoisted(() => ({
  addAddress: vi.fn(),
  deleteAddress: vi.fn(),
  setDefaultAddress: vi.fn(),
  updateProfile: vi.fn(),
  updatePassword: vi.fn(),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => React.createElement('img', { src, alt }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href, ...props }, children),
}));

vi.mock('next-auth/react', () => ({ signOut: vi.fn() }));
vi.mock('@/app/actions/wishlist', () => ({ toggleWishlist: vi.fn() }));
vi.mock('@/app/actions/profile', () => ({
  updateProfile: mocks.updateProfile,
  updatePassword: mocks.updatePassword,
}));
vi.mock('@/app/actions/address', () => ({
  addAddress: mocks.addAddress,
  deleteAddress: mocks.deleteAddress,
  setDefaultAddress: mocks.setDefaultAddress,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  window.history.replaceState(null, '', '/');
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((next) => {
    resolve = next;
  });
  return { promise, resolve };
}

function renderProfile() {
  return render(React.createElement(ProfileView, {
    user: {
      email: 'user@example.com',
      name: 'Иван Петров',
      phone: '',
      birthdate: '',
      createdAt: '2025-01-01T00:00:00.000Z',
    },
    initial: { name: 'Иван Петров', phone: '', birthdate: '' },
    isAdmin: false,
    orders: [],
    wishlist: [],
    addresses: [
      { id: 'address-1', label: 'Дом', city: 'Москва', street: 'Тверская, 1', comment: null, isDefault: false },
      { id: 'address-2', label: 'Работа', city: 'Москва', street: 'Арбат, 2', comment: null, isDefault: false },
    ],
  }));
}

describe('profile request loading', () => {
  it('keeps add-address busy with a labelled spinner until the request settles', async () => {
    const request = deferred<unknown>();
    mocks.addAddress.mockReturnValue(request.promise);
    renderProfile();

    fireEvent.click(screen.getByRole('button', { name: 'Добавить адрес' }));
    fireEvent.change(screen.getByPlaceholderText('Город'), { target: { value: 'Москва' } });
    fireEvent.change(screen.getByPlaceholderText('Улица, дом, квартира'), { target: { value: 'Ленина, 1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    const submit = screen.getByRole('button', { name: 'Сохраняем адрес' });
    expect(submit.getAttribute('aria-busy')).toBe('true');
    expect(screen.getByRole('status', { name: 'Сохраняем адрес' })).not.toBeNull();
    await act(async () => Promise.resolve());
    expect(submit.getAttribute('aria-busy')).toBe('true');

    await act(async () => request.resolve(undefined));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Сохраняем адрес' })).toBeNull());
  });

  it('tracks make-default and delete address actions independently', async () => {
    const makeDefault = deferred<unknown>();
    const remove = deferred<unknown>();
    mocks.setDefaultAddress.mockReturnValue(makeDefault.promise);
    mocks.deleteAddress.mockReturnValue(remove.promise);
    renderProfile();

    const defaultButtons = screen.getAllByRole('button', { name: 'По умолчанию' });
    const deleteButtons = screen.getAllByRole('button', { name: 'Удалить' });
    fireEvent.click(defaultButtons[0]);
    fireEvent.click(deleteButtons[1]);

    await waitFor(() => {
      expect(defaultButtons[0].getAttribute('aria-busy')).toBe('true');
      expect(deleteButtons[1].getAttribute('aria-busy')).toBe('true');
    });
    expect(screen.getByRole('status', { name: 'Делаем адрес основным' })).not.toBeNull();
    expect(screen.getByRole('status', { name: 'Удаляем адрес' })).not.toBeNull();

    await act(async () => makeDefault.resolve(undefined));
    await waitFor(() => expect(defaultButtons[0].getAttribute('aria-busy')).not.toBe('true'));
    expect(deleteButtons[1].getAttribute('aria-busy')).toBe('true');

    await act(async () => remove.resolve(undefined));
    await waitFor(() => expect(deleteButtons[1].getAttribute('aria-busy')).not.toBe('true'));
  });

  it('keeps personal and password submissions busy for their full requests', async () => {
    const profile = deferred<{ ok: true }>();
    const password = deferred<{ ok: true }>();
    mocks.updateProfile.mockReturnValue(profile.promise);
    mocks.updatePassword.mockReturnValue(password.promise);
    renderProfile();

    fireEvent.click(screen.getByRole('button', { name: 'Сохранить изменения' }));
    const personalSubmit = screen.getAllByRole('button', { name: 'Загрузка' })[0];
    expect(personalSubmit.getAttribute('aria-busy')).toBe('true');
    expect(personalSubmit.textContent).toContain('Сохранить изменения');
    expect(personalSubmit.querySelector('[aria-hidden="true"]')?.className).toContain('invisible');
    expect(personalSubmit.querySelector('[role="status"]')?.getAttribute('class')).toContain('absolute');
    await act(async () => Promise.resolve());
    expect(personalSubmit.getAttribute('aria-busy')).toBe('true');

    await act(async () => profile.resolve({ ok: true }));
    await waitFor(() => expect(personalSubmit.getAttribute('aria-busy')).not.toBe('true'));

    fireEvent.change(screen.getByLabelText('Текущий пароль'), { target: { value: 'old-password' } });
    fireEvent.change(screen.getByLabelText('Новый пароль'), { target: { value: 'new-password' } });
    fireEvent.change(screen.getByLabelText('Повторите пароль'), { target: { value: 'new-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Обновить пароль' }));

    const passwordSubmit = screen.getByRole('button', { name: 'Загрузка' });
    expect(passwordSubmit.getAttribute('aria-busy')).toBe('true');
    await act(async () => Promise.resolve());
    expect(passwordSubmit.getAttribute('aria-busy')).toBe('true');

    await act(async () => password.resolve({ ok: true }));
    await waitFor(() => expect(passwordSubmit.getAttribute('aria-busy')).not.toBe('true'));
  });
});
