'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/admin/icon';
import { DEMO_ADMIN_NAV, isDemoNavActive } from '@/lib/demo-admin/nav';
import { cn } from '@/lib/utils';
import { DemoReadonlyBanner } from './demo-readonly-banner';

export function DemoAdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="admin-root min-h-screen bg-admin-bg font-admin-body text-admin-on-surface">
      <header className="border-b border-admin-outline-variant bg-admin-surface px-4 py-4 lg:px-8">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <Link href="/demo-admin" className="font-admin-head text-xl font-extrabold">
            RITM · demo admin
          </Link>
          <Link href="/" className="text-sm font-bold underline underline-offset-4">
            Вернуться в магазин
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-5 px-4 py-5 lg:grid-cols-[230px_minmax(0,1fr)] lg:px-8">
        <aside className="rounded-3xl bg-[var(--admin-sidebar)] p-3 text-white">
          <nav className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-1">
            {DEMO_ADMIN_NAV.map((item) => {
              const active = isDemoNavActive(item, pathname);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-colors',
                    active ? 'bg-white/15 text-admin-on-primary' : 'text-white/70 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <Icon name={item.icon} filled={active} className="text-[21px]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 space-y-5">
          <DemoReadonlyBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
