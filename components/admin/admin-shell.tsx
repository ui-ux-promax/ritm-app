'use client';

import Link from 'next/link';
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
  children: React.ReactNode;
  /** РўРµРјР° РёР· cookie admin-theme (С‡РёС‚Р°РµС‚СЃСЏ РІ (admin)/layout) вЂ” СЃС‚Р°СЂС‚РѕРІРѕРµ Р·РЅР°С‡РµРЅРёРµ С‚РѕРіРіР»Р°. */
  initialTheme: 'light' | 'dark';
}

/** Р§РµР»РѕРІРµРєРѕС‡РёС‚Р°РµРјС‹Рµ РЅР°Р·РІР°РЅРёСЏ СЂРѕР»РµР№ */
const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'РђРґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂ',
  CUSTOMER: 'РљР»РёРµРЅС‚',
};

/** РРЅРёС†РёР°Р»С‹ РёР· РёРјРµРЅРё РёР»Рё email (РґР»СЏ Р°РІР°С‚Р°СЂР°-Р·Р°РіР»СѓС€РєРё) */
function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(' ')
      .map((w) => w[0])
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
      {/* в”Ђв”Ђ Р‘РѕРєРѕРІР°СЏ РїР°РЅРµР»СЊ 280px в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-[280px] z-40',
          'flex flex-col py-6 px-4',
          'bg-admin-surface border-r border-admin-outline-variant',
          // РќР° РѕС‡РµРЅСЊ РјР°Р»РµРЅСЊРєРёС… СЌРєСЂР°РЅР°С… РїСЂСЏС‡РµРј (desktop-first; РјРѕР±РёР»СЊРЅС‹Р№ nav вЂ” Phase 3.x)
          'hidden md:flex',
        )}
      >
        {/* РћРІРµСЂР»РµР№-СЃРєРµР»РµС‚РѕРЅ СЃР°Р№РґР±Р°СЂР° РЅР° РїРµСЂРІРѕР№ Р·Р°РіСЂСѓР·РєРµ (РїРѕРєР° РіСЂСѓР·РёС‚СЃСЏ РёРєРѕРЅРѕС‡РЅС‹Р№ С€СЂРёС„С‚).
            <aside> вЂ” fixed в†’ СЃР»СѓР¶РёС‚ containing block РґР»СЏ absolute-РѕРІРµСЂР»РµСЏ. */}
        <SidebarSkeletonGate />

        {/* в”Ђв”Ђ Р‘СЂРµРЅРґ-Р±Р»РѕРє в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */}
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-admin-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon name="bolt" filled className="text-admin-on-primary font-bold" />
          </div>
          <div>
            <p className="font-admin-head font-bold text-lg leading-none text-admin-on-surface">
              RITM
            </p>
            <p className="text-xs text-admin-on-surface-variant mt-0.5">Одежда на каждый день</p>
          </div>
        </div>

        {/* в”Ђв”Ђ РќР°РІРёРіР°С†РёСЏ в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */}
        <nav className="flex-1 flex flex-col gap-1">
          {ADMIN_NAV.map((item) => {
            const active = isNavActive(item, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150',
                  active
                    ? 'bg-admin-primary text-admin-on-primary font-bold'
                    : 'text-admin-on-surface-variant hover:bg-admin-surface-high hover:text-admin-on-surface',
                )}
              >
                <Icon name={item.icon} filled={active} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* в”Ђв”Ђ РќРёР¶РЅРёР№ Р±Р»РѕРє: С‚РµРјР° + СЃСЃС‹Р»РєРё + РїСЂРѕС„РёР»СЊ в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */}
        <div className="mt-auto flex flex-col gap-1 pt-6 border-t border-admin-outline-variant">
          {/* РџРµСЂРµРєР»СЋС‡Р°С‚РµР»СЊ С‚РµРјС‹ */}
          <div className="px-2 py-2">
            <p className="text-[10px] uppercase tracking-widest text-admin-on-surface-variant mb-2">
              РћС„РѕСЂРјР»РµРЅРёРµ
            </p>
            <ThemeToggle initialTheme={initialTheme} />
          </div>

          {/* РЎР»СѓР¶РµР±РЅС‹Рµ СЃСЃС‹Р»РєРё */}
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-admin-on-surface-variant hover:text-admin-on-surface transition-colors rounded-xl hover:bg-admin-surface-high"
          >
            <Icon name="help" />
            <span className="text-sm">РџРѕРјРѕС‰СЊ</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-admin-on-surface-variant hover:text-admin-on-surface transition-colors rounded-xl hover:bg-admin-surface-high"
          >
            <Icon name="settings" />
            <span className="text-sm">РќР°СЃС‚СЂРѕР№РєРё</span>
          </a>

          {/* РџСЂРѕС„РёР»СЊ-РєР°СЂС‚РѕС‡РєР° */}
          <div className="mt-3 p-3 bg-admin-surface-container rounded-xl flex items-center gap-3">
            {/* РђРІР°С‚Р°СЂ РёР»Рё РёРЅРёС†РёР°Р»С‹ */}
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-admin-primary flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-admin-on-primary">
                  {getInitials(user.name, user.email)}
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-admin-on-surface truncate">
                {user.name ?? user.email ?? 'Admin'}
              </p>
              <p className="text-xs text-admin-on-surface-variant truncate">
                {ROLE_LABELS[user.role] ?? user.role}
              </p>
            </div>

            {/* РљРЅРѕРїРєР° РІС‹С…РѕРґР° */}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/login' })}
              aria-label="Р’С‹Р№С‚Рё"
              className="text-admin-on-surface-variant hover:text-red-500 transition-colors flex-shrink-0"
            >
              <Icon name="logout" />
            </button>
          </div>
        </div>
      </aside>

      {/* в”Ђв”Ђ Р’РµСЂС…РЅСЏСЏ РїР°РЅРµР»СЊ (topbar) в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */}
      <header
        className={cn(
          'fixed top-0 right-0 h-16 z-30',
          'flex items-center gap-4 px-4 md:px-8',
          'bg-admin-surface/80 backdrop-blur border-b border-admin-outline-variant',
          // РЎРјРµС‰Р°РµРј РІРїСЂР°РІРѕ РѕС‚ sidebar РЅР° РґРµСЃРєС‚РѕРїРµ
          'left-0 md:left-[280px]',
        )}
      >
        {/* Р‘СЂРµРЅРґ вЂ” С‚РѕР»СЊРєРѕ РјРѕР±РёР»СЊРЅС‹Р№ (РЅР° РґРµСЃРєС‚РѕРїРµ Р±СЂРµРЅРґ РІ СЃР°Р№РґР±Р°СЂРµ) */}
        <div className="md:hidden flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 bg-admin-primary rounded-xl flex items-center justify-center">
            <Icon name="bolt" filled className="text-admin-on-primary" />
          </div>
        </div>

        {/* РџРѕРёСЃРє-Р·Р°РіР»СѓС€РєР° */}
        <div className="relative flex-1 max-w-xl">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-on-surface-variant text-[20px]"
          />
          <input
            type="text"
            placeholder="РџРѕРёСЃРє Р·Р°РєР°Р·РѕРІ, РєР»РёРµРЅС‚РѕРІ, С‚РѕРІР°СЂРѕРІвЂ¦"
            readOnly
            className={cn(
              'w-full pl-10 pr-4 py-2 rounded-full text-sm',
              'bg-admin-surface-container border-none',
              'text-admin-on-surface placeholder:text-admin-on-surface-variant',
              'focus:outline-none focus:ring-2 focus:ring-admin-primary',
              'cursor-default',
            )}
          />
        </div>

        {/* РђРІР°С‚Р°СЂ-РјРµРЅСЋ вЂ” С‚РѕР»СЊРєРѕ РјРѕР±РёР»СЊРЅС‹Р№ */}
        <AdminMobileMenu user={user} initialTheme={initialTheme} />
      </header>

      {/* в”Ђв”Ђ РћСЃРЅРѕРІРЅРѕР№ РєРѕРЅС‚РµРЅС‚ (РµРґРёРЅСЃС‚РІРµРЅРЅС‹Р№ СЃРєСЂРѕР»Р»РµСЂ; body Р·Р°С„РёРєСЃРёСЂРѕРІР°РЅ С‡РµСЂРµР· :has) в”Ђв”Ђв”Ђв”Ђ */}
      <main className="md:ml-[280px] pt-16 h-screen overflow-y-auto overscroll-contain bg-admin-bg [scrollbar-gutter:stable]">
        <div className="max-w-[1440px] mx-auto p-4 sm:p-8 pb-28 md:pb-8">
          <ContentReadyGate>{children}</ContentReadyGate>
        </div>
      </main>

      {/* в”Ђв”Ђ РњРѕР±РёР»СЊРЅС‹Р№ РЅРёР¶РЅРёР№ С‚Р°Р±-Р±Р°СЂ (С‚РѕР»СЊРєРѕ <md) в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ */}
      <AdminTabBar />
    </>
  );
}
