'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/admin/icon';
import { ThemeToggle } from '@/components/admin/theme-toggle';
import SidebarSkeletonGate from '@/components/admin/sidebar-skeleton-gate';
import { ContentReadyGate } from '@/components/admin/content-ready-gate';
import { ADMIN_NAV, isNavActive } from '@/lib/admin/nav';
import { AdminTabBar } from '@/components/admin/admin-tab-bar';
import { AdminMobileMenu } from '@/components/admin/admin-mobile-menu';

interface AdminShellProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
    image?: string | null;
  };
  children: ReactNode;
  initialTheme: 'light' | 'dark';
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Администратор',
  CUSTOMER: 'Клиент',
};

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(' ')
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
  return (email?.[0] ?? '?').toUpperCase();
}

export function AdminShell({ user, children, initialTheme }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-full w-[286px] flex-col gap-5 overflow-y-auto px-5 pb-[22px] pt-7 md:flex',
          'border-r border-white/10 bg-[var(--admin-sidebar)] text-admin-on-primary',
        )}
      >
        <SidebarSkeletonGate />

        <div className="flex items-center gap-3 px-1 pb-1">
          <div>
            <Image src="/ritm-logo-light.svg" alt="Ritm" width={112} height={40} priority className="h-auto w-28" />
            <p className="mt-0.5 text-xs font-bold text-white/50">админка магазина</p>
          </div>
        </div>

        <button
          type="button"
          disabled
          aria-disabled="true"
          className="flex min-h-12 cursor-default items-center gap-2 rounded-[18px] border border-white/10 bg-white/10 px-[13px] text-sm font-bold text-white/60"
        >
          <Icon name="search" className="text-[20px]" />
          <span>Быстрый поиск</span>
          <kbd className="ml-auto rounded-lg bg-white/10 px-2 py-1 font-mono text-[11px] text-white/55">/</kbd>
        </button>

        <nav className="flex flex-1 flex-col gap-1">
          <div className="px-2 pt-1 text-[11px] font-extrabold uppercase tracking-[.06em] text-white/40">
            Главное
          </div>
          {ADMIN_NAV.map((item) => {
            const active = isNavActive(item, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex min-h-[43px] items-center gap-3 rounded-[13px] px-[13px] text-sm font-bold transition-colors',
                  active
                    ? 'bg-white/10 text-admin-on-primary'
                    : 'text-white/65 hover:bg-white/10 hover:text-admin-on-primary',
                )}
              >
                <Icon name={item.icon} filled={active} className="text-[21px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="relative mt-auto overflow-hidden rounded-[18px] border border-white/10 bg-white/10 p-4">
          <div className="pointer-events-none absolute -bottom-10 -right-8 h-[132px] w-[132px] rounded-full bg-[var(--admin-money)]/30 blur-md" />
          <h3 className="relative font-admin-head text-base font-extrabold tracking-[-.02em] text-admin-on-primary">Нужна сверка смены?</h3>
          <p className="relative mt-1 text-xs text-white/60">
            Соберите отчёт по заказам, остаткам и возвратам за день.
          </p>
          <button type="button" disabled className="relative mt-4 flex min-h-[42px] w-full items-center justify-center rounded-full border border-white/10 bg-white/15 px-4 text-sm font-extrabold text-white">
            Собрать отчёт
          </button>
        </div>

        <div className="rounded-[18px] bg-white/10 p-3">
          <div className="mb-3">
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-white/45">Оформление</p>
            <ThemeToggle initialTheme={initialTheme} />
          </div>
          <div className="flex items-center gap-3 border-t border-white/10 pt-3">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-admin-on-primary text-sm font-extrabold text-[var(--admin-sidebar)]">
                {getInitials(user.name, user.email)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-admin-on-primary">{user.name ?? user.email ?? 'Admin'}</p>
              <p className="truncate text-xs text-white/55">{ROLE_LABELS[user.role] ?? user.role}</p>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/login' })}
              aria-label="Выйти"
              className="shrink-0 text-white/55 transition-colors hover:text-admin-error"
            >
              <Icon name="logout" />
            </button>
          </div>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center gap-4 border-b border-admin-outline-variant bg-admin-surface/90 px-[18px] backdrop-blur-lg md:hidden">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-admin-primary text-admin-on-primary">
            <Icon name="bolt" filled />
          </div>
          <span className="font-admin-head text-xl font-extrabold tracking-[-.06em] text-admin-on-surface">RITM</span>
        </div>
        <div className="ml-auto">
          <AdminMobileMenu user={user} initialTheme={initialTheme} />
        </div>
      </header>

      <main className="h-screen overflow-y-auto overscroll-contain bg-admin-bg pt-16 [scrollbar-gutter:stable] md:ml-[286px] md:pt-0">
        <div className="admin-workspace">
          <ContentReadyGate>{children}</ContentReadyGate>
        </div>
      </main>

      <AdminTabBar />
    </>
  );
}
