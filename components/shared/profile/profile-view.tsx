'use client';

import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useEffect, useMemo, useState, useTransition, type ReactNode } from 'react';
import { updateProfile } from '@/app/actions/profile';
import { OrderStatusBadge } from '@/components/shared/orders/order-status-badge';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import { ORDER_STATUS_META } from '@/lib/order';
import { profileSchema, type ProfileValues } from '@/services/dto/auth.dto';

// ── Types ──────────────────────────────────────────────────────────────────

type OrderStatusKey = keyof typeof ORDER_STATUS_META;
type PanelKey = 'overview' | 'orders' | 'favorites' | 'addresses' | 'payments' | 'settings';
type FilterKey = 'all' | 'processing' | 'transit' | 'delivered' | 'returned' | 'cancelled';

export interface ProfileOrderItem {
  productName: string;
  productNameFromVariant: string;
  brand: string;
  colorwayName: string;
  size: string;
  imageUrl: string | null;
  qty: number;
  price: number;
  lineTotal: number;
}

export interface ProfileOrder {
  orderNumber: number;
  status: OrderStatusKey;
  createdAt: string;
  itemsTotal: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  paymentMethod: string;
  shippingMethod: string;
  city: string;
  addressLine: string;
  paymentStatus: string | null;
  items: ProfileOrderItem[];
}

interface ProfileUser {
  email: string;
  name: string;
  phone: string;
  birthdate: string;
  createdAt: string;
}

interface ProfileViewProps {
  user: ProfileUser;
  initial: ProfileValues;
  orders: ProfileOrder[];
}

interface SavedAddress {
  id: string;
  name: string;
  role: string;
  city: string;
  line: string;
  note: string;
  isDefault: boolean;
}

interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────

const PANELS: Array<{ key: PanelKey; label: string }> = [
  { key: 'overview', label: 'Обзор' },
  { key: 'orders', label: 'Заказы' },
  { key: 'favorites', label: 'Избранное' },
  { key: 'addresses', label: 'Адреса' },
  { key: 'payments', label: 'Способы оплаты' },
  { key: 'settings', label: 'Настройки' },
];

const FILTERS: Array<{ key: FilterKey; label: string; dot: string }> = [
  { key: 'all', label: 'Все', dot: 'bg-ink-muted' },
  { key: 'processing', label: 'Собирается', dot: 'bg-warning' },
  { key: 'transit', label: 'В пути', dot: 'bg-info' },
  { key: 'delivered', label: 'Доставлен', dot: 'bg-accent' },
  { key: 'returned', label: 'Возврат', dot: 'bg-warm' },
  { key: 'cancelled', label: 'Отменён', dot: 'bg-danger' },
];

// TEMP: mock data until address/payment APIs exist.
const ADDRESSES: SavedAddress[] = [
  { id: 'home', name: 'Дом', role: 'Основной адрес', city: 'Москва', line: 'ул. Лесная, 8, кв. 42', note: 'Курьеру звонить за 20 минут', isDefault: true },
  { id: 'work', name: 'Работа', role: 'Будние дни', city: 'Москва', line: 'БЦ Север, 12 этаж', note: 'Получение на ресепшене', isDefault: false },
];

const CARDS: SavedCard[] = [
  { id: 'visa', brand: 'Visa', last4: '2482', expiry: '09/28', isDefault: true },
  { id: 'mir', brand: 'Мир', last4: '7710', expiry: '03/27', isDefault: false },
];

const POINTS = 1240;
const fmtDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

// ── Main component ─────────────────────────────────────────────────────────

export function ProfileView({ user, initial, orders }: ProfileViewProps) {
  const [panel, setPanel] = useState<PanelKey>('overview');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set());
  const [favorites] = useState<Array<never>>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [prefs, setPrefs] = useState({ orders: true, drops: true, sales: false });

  const name = user.name.trim() || user.email.split('@')[0] || 'Покупатель Ritm';
  const totalSpent = useMemo(
    () => orders.filter((o) => o.status !== 'CANCELLED').reduce((s, o) => s + o.totalAmount, 0),
    [orders],
  );
  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = { all: orders.length, processing: 0, transit: 0, delivered: 0, returned: 0, cancelled: 0 };
    orders.forEach((o) => { c[toFilter(o.status)] += 1; });
    return c;
  }, [orders]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const matchStatus = filter === 'all' || toFilter(o.status) === filter;
      const searchText = [
        `ritm-${o.orderNumber}`, ORDER_STATUS_META[o.status].label, o.city, o.addressLine,
        ...o.items.flatMap((i) => [i.productName, i.productNameFromVariant, i.brand, i.colorwayName, i.size]),
      ].join(' ').toLowerCase();
      return matchStatus && (!q || searchText.includes(q));
    });
  }, [filter, orders, query]);

  // Hash deep-linking
  useEffect(() => {
    const sync = () => {
      const hash = location.hash.slice(1);
      if (isPanel(hash)) setPanel(hash as PanelKey);
    };
    sync();
    if (location.hash) {
      history.scrollRestoration = 'manual';
      scrollTo(0, 0);
    }
    addEventListener('hashchange', sync);
    return () => removeEventListener('hashchange', sync);
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(id);
  }, [toast]);

  const go = (key: PanelKey) => {
    setPanel(key);
    history.replaceState(null, '', `#${key}`);
    requestAnimationFrame(() => document.getElementById(key)?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  };

  const toggleOrder = (id: number) => setOpen((old) => {
    const next = new Set(old);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <main className="mx-auto w-[min(100%-48px,1200px)] pb-20 pt-[26px] max-[560px]:w-[min(100%-28px,1200px)]">
      <style>{'@keyframes panelIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}'}</style>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[13px] text-ink-muted">
        <Link href="/" className="hover:text-ink">Главная</Link>
        <span>/</span>
        <span>Профиль</span>
      </nav>

      {/* Account hero */}
      <section className="mt-3.5 grid grid-cols-[minmax(0,1fr)_360px] items-center gap-6 max-[980px]:grid-cols-1 max-[980px]:gap-[18px]">
        <div className="flex min-w-0 flex-wrap items-center gap-5">
          {/* Avatar */}
          <div className="grid h-[76px] w-[76px] place-items-center rounded-full border border-line bg-surface-soft font-display text-[28px] font-extrabold tracking-tight">
            {initials(name, user.email)}
          </div>
          {/* Identity */}
          <div>
            <h1 className="font-display text-[clamp(28px,3.6vw,40px)] font-extrabold leading-none tracking-[-0.035em]">
              {name}
            </h1>
            <div className="mt-[9px] flex flex-wrap items-center gap-2.5 text-[13.5px] text-ink-muted">
              <span className="rounded-full bg-accent/12 px-3 py-1 text-xs font-bold text-[hsl(151_45%_26%)]">
                Gold
              </span>
              <span>{user.email}</span>
              <span>·</span>
              <span>С нами с {fmtDate.format(new Date(user.createdAt))}</span>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="mt-3.5 h-[38px] rounded-full border border-line bg-surface px-4 text-[13px] font-bold text-ink-muted hover:border-danger/40 hover:text-danger"
            >
              Выйти
            </button>
          </div>
        </div>

        {/* Loyalty card */}
        <Loyalty />
      </section>

      {/* Layout: sidebar + panels */}
      <div className="mt-[30px] grid grid-cols-[248px_minmax(0,1fr)] items-start gap-7 max-[900px]:mt-2 max-[900px]:grid-cols-1 max-[900px]:gap-0">
        {/* Sidebar */}
        <aside className="sticky top-[88px] grid gap-1.5 rounded-[24px] border border-line bg-surface p-3.5 max-[900px]:hidden">
          {PANELS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => go(p.key)}
              aria-current={panel === p.key ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-[14px] px-[13px] py-[11px] text-left text-sm font-semibold hover:bg-surface-soft/70',
                panel === p.key && 'bg-primary text-primary-foreground hover:bg-primary',
              )}
            >
              <span className="flex-1">{p.label}</span>
              {p.key === 'orders' && <NavCount active={panel === p.key}>{orders.length}</NavCount>}
              {p.key === 'favorites' && <NavCount active={panel === p.key}>{favorites.length}</NavCount>}
            </button>
          ))}
          <span className="mx-1 my-2 h-px bg-line" />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="rounded-[14px] px-[13px] py-[11px] text-left text-sm font-semibold text-danger hover:bg-danger/10"
          >
            Выйти
          </button>
        </aside>

        {/* Mobile panel switcher */}
        <div className="mt-[22px] hidden gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] max-[900px]:flex [&::-webkit-scrollbar]:hidden">
          {PANELS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => go(p.key)}
              aria-current={panel === p.key ? 'page' : undefined}
              className={cn(
                'min-h-10 whitespace-nowrap rounded-full border border-line bg-surface px-4 text-[13px] font-bold',
                panel === p.key && 'border-primary bg-primary text-primary-foreground',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Panels */}
        <div className="min-w-0">
          <Panel id="overview" active={panel === 'overview'} title="Обзор" text="Главное по аккаунту, заказам и сохранённым данным.">
            <Overview user={user} orders={orders} totalSpent={totalSpent} favs={favorites.length} />
          </Panel>

          <Panel id="orders" active={panel === 'orders'} title="Заказы" text="История покупок, трекинг доставки и детали каждого заказа.">
            <Orders
              orders={orders}
              visible={visible}
              counts={counts}
              filter={filter}
              query={query}
              open={open}
              setFilter={setFilter}
              setQuery={setQuery}
              toggle={toggleOrder}
            />
          </Panel>

          <Panel id="favorites" active={panel === 'favorites'} title="Избранное" text="Сохранённые товары — добавьте в корзину, пока есть размеры.">
            <Empty title="Добавьте товары в избранное" text="Сохраняйте понравившиеся позиции из каталога, чтобы быстро вернуться к ним позже." href="/catalog" />
          </Panel>

          <Panel id="addresses" active={panel === 'addresses'} title="Адреса" text="Адреса доставки для оформления заказов.">
            <Tiles addresses />
          </Panel>

          <Panel id="payments" active={panel === 'payments'} title="Способы оплаты" text="Сохранённые карты и платёжные методы.">
            <Tiles />
          </Panel>

          <Panel id="settings" active={panel === 'settings'} title="Настройки" text="Личные данные, уведомления и безопасность аккаунта.">
            <Settings user={user} initial={initial} prefs={prefs} setPrefs={setPrefs} toast={setToast} />
          </Panel>
        </div>
      </div>

      {/* Toast */}
      <div className={cn(
        'pointer-events-none fixed bottom-[26px] left-1/2 z-[80] -translate-x-1/2 translate-y-5 rounded-full bg-footer px-5 py-3 text-[13.5px] font-bold text-primary-foreground opacity-0 shadow-[0_22px_70px_hsl(var(--color-text)/.08)] transition-all',
        toast && 'translate-y-0 opacity-100',
      )}>
        {toast ?? 'Сохранено'}
      </div>
    </main>
  );
}

// ── Panel wrapper ─────────────────────────────────────────────────────────

function Panel({ id, active, title, text, children }: {
  id: PanelKey;
  active: boolean;
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      tabIndex={-1}
      className={cn('hidden scroll-mt-[86px]', active && 'block [animation:panelIn_.32s_cubic-bezier(.3,.7,.2,1)_both]')}
    >
      <div className="mb-[18px]">
        <h2 className="font-display text-[clamp(22px,2.6vw,28px)] font-extrabold tracking-[-0.035em]">{title}</h2>
        <p className="mt-1 text-[13.5px] text-ink-muted">{text}</p>
      </div>
      {children}
    </section>
  );
}

// ── Loyalty card ──────────────────────────────────────────────────────────

function Loyalty() {
  const p = Math.min(100, Math.round((POINTS / 2000) * 100));
  return (
    <div className="relative isolate grid gap-3.5 overflow-hidden rounded-[24px] bg-footer px-[22px] py-5 text-primary-foreground shadow-[0_22px_70px_hsl(var(--color-text)/.08)] max-[980px]:max-w-[460px]">
      {/* Watermark */}
      <div className="absolute -right-3.5 -bottom-[18px] font-display text-[140px] font-extrabold leading-none opacity-[.08]">
        R
      </div>

      {/* Top: eyebrow + gold badge */}
      <div className="z-[1] flex justify-between">
        <span className="text-[10.5px] font-extrabold uppercase tracking-[.18em] text-primary-foreground/70">
          Ritm Club
        </span>
        <span className="rounded-full border border-warm/40 bg-warm/15 px-[11px] py-[3px] text-[11px] font-bold text-[hsl(42_92%_72%)]">
          Gold
        </span>
      </div>

      {/* Points */}
      <div className="z-[1] flex items-baseline gap-2.5">
        <span className="tnum font-display text-[38px] font-extrabold leading-none tracking-tight text-warm">
          {POINTS.toLocaleString('ru-RU')}
        </span>
        <span className="text-[12.5px] font-semibold text-primary-foreground/70">баллов</span>
      </div>

      {/* Meta */}
      <div className="z-[1] text-[12.5px] text-primary-foreground/80">
        До Platinum: <b className="text-primary-foreground">{2000 - POINTS} баллов</b> · Кэшбэк 7%
      </div>

      {/* Progress bar */}
      <div className="z-[1] grid gap-2">
        <div className="flex justify-between text-[11.5px] text-primary-foreground/80">
          <span>Прогресс уровня</span>
          <b>{p}%</b>
        </div>
        <div className="h-[7px] overflow-hidden rounded-full bg-primary-foreground/15">
          <div className="h-full rounded-full bg-gradient-to-r from-warm/75 to-warm" style={{ width: `${p}%` }} />
        </div>
      </div>
    </div>
  );
}

// ── Overview panel ────────────────────────────────────────────────────────

function Overview({ user, orders, totalSpent, favs }: {
  user: ProfileUser;
  orders: ProfileOrder[];
  totalSpent: number;
  favs: number;
}) {
  const a = ADDRESSES[0];
  const c = CARDS[0];
  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3.5 max-[1024px]:grid-cols-2">
        <Stat n={orders.length} t="Заказов" />
        <Stat n={formatPrice(totalSpent)} t="Потрачено" />
        <Stat n={favs} t="В избранном" />
        <Stat n={POINTS.toLocaleString('ru-RU')} t="Баллов Ritm Club" />
      </div>

      {/* Columns: recent orders + profile summary */}
      <div className="mt-[18px] grid grid-cols-[1.4fr_1fr] gap-[18px] max-[1024px]:grid-cols-1">
        <Card>
          <h3 className="mb-3.5 font-display text-base font-extrabold">Последние заказы</h3>
          {orders.slice(0, 3).map((o) => <MiniOrder key={o.orderNumber} order={o} />)}
          {orders.length === 0 && (
            <p className="rounded-[18px] border border-dashed border-line bg-surface-soft p-4 text-sm text-ink-muted">
              Заказов пока нет.
            </p>
          )}
        </Card>

        <Card>
          <h3 className="mb-3.5 font-display text-base font-extrabold">Профиль</h3>
          <Row k="Имя" v={user.name || 'Не указано'} />
          <Row k="E-mail" v={user.email} />
          <Row k="Телефон" v={user.phone || 'Не указан'} />
          <Row k="Адрес" v={`${a.city}, ${a.line}`} />
          <Row k="Карта" v={`${c.brand} •••• ${c.last4}`} />
        </Card>
      </div>
    </>
  );
}

// ── Orders panel ──────────────────────────────────────────────────────────

function Orders(p: {
  orders: ProfileOrder[];
  visible: ProfileOrder[];
  counts: Record<FilterKey, number>;
  filter: FilterKey;
  query: string;
  open: ReadonlySet<number>;
  setFilter: (f: FilterKey) => void;
  setQuery: (q: string) => void;
  toggle: (id: number) => void;
}) {
  return (
    <>
      {/* Toolbar */}
      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] gap-3.5 max-[760px]:grid-cols-1">
        <label className="grid h-11 max-w-[320px] grid-cols-[auto_minmax(0,1fr)] items-center gap-2.5 rounded-full border border-line bg-surface px-4 text-ink-muted max-[760px]:max-w-none">
          <span aria-hidden="true" className="h-[17px] w-[17px] rounded-full border border-ink-muted/60" />
          <input
            value={p.query}
            onChange={(e) => p.setQuery(e.target.value)}
            placeholder="Найти заказ или товар..."
            className="min-w-0 bg-transparent text-sm text-ink outline-none"
          />
        </label>
        <span className="text-[13px] font-semibold text-ink-muted">
          <b className="text-ink">{p.visible.length}</b> заказов
        </span>
      </div>

      {/* Filter chips */}
      <div className="mb-[18px] flex gap-[9px] overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => p.setFilter(f.key)}
            aria-pressed={p.filter === f.key}
            className={cn(
              'inline-flex min-h-[38px] items-center gap-2 whitespace-nowrap rounded-full border border-line bg-surface px-4 text-[13px] font-semibold',
              p.filter === f.key && 'border-primary bg-primary text-primary-foreground',
            )}
          >
            {f.key !== 'all' && <span className={cn('h-[7px] w-[7px] rounded-full', f.dot)} />}
            {f.label}
            <span className="tnum text-[11px] opacity-70">{p.counts[f.key]}</span>
          </button>
        ))}
      </div>

      {/* Order cards */}
      <div className="grid gap-3.5">
        {p.visible.map((o) => (
          <OrderCard key={o.orderNumber} order={o} open={p.open.has(o.orderNumber)} toggle={() => p.toggle(o.orderNumber)} />
        ))}
      </div>

      {/* Empty states */}
      {p.orders.length === 0 && (
        <Empty title="Заказов пока нет" text="Когда вы оформите первый заказ, здесь появятся детали, трекинг и состав покупки." href="/catalog" />
      )}
      {p.orders.length > 0 && p.visible.length === 0 && (
        <Empty title="Ничего не нашлось" text="Попробуйте изменить фильтр или поисковый запрос." />
      )}
    </>
  );
}

function OrderCard({ order, open, toggle }: {
  order: ProfileOrder;
  open: boolean;
  toggle: () => void;
}) {
  const thumbs = order.items.slice(0, 3);
  return (
    <article className="overflow-hidden rounded-[24px] border border-line bg-surface">
      {/* Summary row (clickable) */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 p-4 text-left max-[560px]:grid-cols-[minmax(0,1fr)_auto]"
      >
        {/* Thumbnails */}
        <div className="flex max-[560px]:hidden">
          {thumbs.map((i, n) => (
            <span
              key={n}
              className={cn(
                'relative h-14 w-[50px] overflow-hidden rounded-xl border border-line bg-surface-soft shadow-[0_0_0_3px_hsl(var(--color-surface))]',
                n > 0 && '-ml-3.5',
              )}
            >
              {i.imageUrl && <Image src={i.imageUrl} alt="" fill sizes="50px" className="object-cover" />}
            </span>
          ))}
          {order.items.length > thumbs.length && (
            <span className="-ml-3.5 grid h-14 w-[50px] place-items-center rounded-xl border border-line bg-surface-soft text-xs font-bold text-ink-muted">
              +{order.items.length - thumbs.length}
            </span>
          )}
        </div>

        {/* Meta */}
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-display text-base font-extrabold tracking-tight">
              RITM-{order.orderNumber}
            </span>
            <OrderStatusBadge status={order.status} paymentStatus={order.paymentStatus} />
          </div>
          <p className="mt-[5px] text-[12.5px] text-ink-muted">
            {fmtDate.format(new Date(order.createdAt))} · <b className="text-ink">{order.items.length} поз.</b>
          </p>
        </div>

        {/* Right: total + chevron */}
        <div className="flex items-center gap-3.5">
          <div className="text-right">
            <div className="text-[11px] text-ink-muted">Итого</div>
            <div className="tnum font-display text-lg font-extrabold">{formatPrice(order.totalAmount)}</div>
          </div>
          <span className={cn(
            'grid h-[34px] w-[34px] place-items-center rounded-full border border-line bg-surface text-ink-muted transition-transform',
            open && 'rotate-180 bg-surface-soft text-ink',
          )}>
            <span aria-hidden="true" className="h-2 w-2 rotate-45 border-b-2 border-r-2 border-current" />
          </span>
        </div>
      </button>

      {/* Expanded detail */}
      <div className={cn('grid transition-[grid-template-rows] duration-300', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-[26px] border-t border-line p-5 max-[760px]:grid-cols-1">
            {/* Timeline */}
            <Timeline status={order.status} date={order.createdAt} />

            {/* Line items + totals */}
            <div>
              <h4 className="mb-3.5 text-xs font-extrabold uppercase tracking-[.06em] text-ink-muted">
                Состав заказа
              </h4>
              {order.items.map((item, i) => <Line key={i} item={item} />)}

              {/* Mini totals */}
              <div className="mt-[22px] border-t border-line pt-4">
                <h4 className="mb-3 text-xs font-extrabold uppercase tracking-[.06em] text-ink-muted">Итоги</h4>
                <Total label="Подытог" value={order.itemsTotal} />
                {order.discountAmount > 0 && <Total label="Скидка" value={-order.discountAmount} />}
                <Total label="Доставка" value={order.shippingAmount} />
                <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3">
                  <span className="font-display text-[15px] font-extrabold">Итого</span>
                  <span className="tnum font-display text-xl font-extrabold">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-[18px] flex flex-wrap gap-2.5">
                <button type="button" className="inline-flex h-[42px] items-center gap-2 rounded-full bg-primary px-[18px] text-[13px] font-bold text-primary-foreground">
                  Повторить заказ
                </button>
                <button type="button" className="inline-flex h-[42px] items-center gap-2 rounded-full border border-line bg-surface px-[18px] text-[13px] font-bold">
                  Накладная
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function Timeline({ status, date }: { status: OrderStatusKey; date: string }) {
  const steps = status === 'CANCELLED' ? ['Оформлен', 'Отменён'] : ['Оформлен', 'Собирается', 'В пути', 'Доставлен'];
  const cur = status === 'PENDING' ? 0
    : status === 'PROCESSING' ? 1
    : status === 'SHIPPED' ? 2
    : status === 'DELIVERED' ? 3
    : 1;

  return (
    <div>
      <h4 className="mb-3.5 text-xs font-extrabold uppercase tracking-[.06em] text-ink-muted">Трекинг</h4>
      {steps.map((s, i) => {
        const done = status === 'DELIVERED' || i < cur;
        const current = i === cur && !done;
        const cancelled = status === 'CANCELLED' && i === 1;
        return (
          <div key={s} className="grid grid-cols-[22px_1fr] gap-3">
            {/* Rail */}
            <div className="grid justify-items-center">
              <span className={cn(
                'z-[1] mt-px h-[18px] w-[18px] rounded-full border-2 border-line bg-surface',
                done && 'border-accent bg-accent',
                current && 'border-accent shadow-[0_0_0_4px_hsl(var(--color-accent)/.16)]',
                cancelled && 'border-danger bg-danger',
              )} />
              {i < steps.length - 1 && (
                <span className={cn('min-h-[26px] w-0.5 flex-1 bg-line', done && 'bg-accent')} />
              )}
            </div>
            {/* Body */}
            <div className="pb-[18px]">
              <div className={cn('text-[13.5px] font-bold', !done && !current && !cancelled && 'text-ink-muted')}>
                {s}
              </div>
              <div className="text-xs text-ink-muted">
                {i === 0 ? fmtDate.format(new Date(date)) : !done && !current && !cancelled ? 'Ожидается' : 'Обновлено'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Tiles (addresses / payments) ───────────────────────────────────────────

function Tiles({ addresses }: { addresses?: boolean }) {
  const addLabel = addresses ? 'Добавить адрес' : 'Добавить карту';
  return (
    <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
      {addresses
        ? ADDRESSES.map((a) => (
            <Tile key={a.id} def={a.isDefault} title={a.name} sub={a.role}
              body={<><b className="text-ink">{a.city}</b><br />{a.line}<br />{a.note}</>} />
          ))
        : CARDS.map((c) => (
            <Tile key={c.id} def={c.isDefault} title={c.brand} sub={`•••• ${c.last4}`}
              body={<>Действует до <b className="text-ink">{c.expiry}</b></>} />
          ))}
      <button
        type="button"
        className="grid min-h-[150px] place-items-center gap-2.5 rounded-[24px] border border-dashed border-line text-[13.5px] font-bold text-ink-muted hover:bg-surface/50"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-surface-soft text-ink">+</span>
        {addLabel}
      </button>
    </div>
  );
}

function Tile({ def, title, sub, body }: { def: boolean; title: string; sub: string; body: ReactNode }) {
  return (
    <div className={cn('relative grid gap-2 rounded-[24px] border border-line bg-surface p-5', def && 'border-accent/45 shadow-[inset_0_0_0_1px_hsl(var(--color-accent)/.2)]')}>
      {def && (
        <span className="absolute right-4 top-4 rounded-full border border-accent/30 bg-accent/12 px-[9px] py-[3px] text-[10.5px] font-bold uppercase tracking-[.04em] text-[hsl(151_48%_24%)]">
          По умолчанию
        </span>
      )}
      <div>
        <div className="text-[14.5px] font-extrabold">{title}</div>
        <div className="text-xs text-ink-muted">{sub}</div>
      </div>
      <p className="text-[13px] leading-[1.55] text-ink-muted">{body}</p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {['Изменить', 'По умолчанию', 'Удалить'].map((a) => (
          <button key={a} type="button" className="h-9 rounded-full border border-line bg-surface px-3.5 text-[12.5px] font-bold hover:border-ink/30">
            {a}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Settings panel ─────────────────────────────────────────────────────────

function Settings({ user, initial, prefs, setPrefs, toast }: {
  user: ProfileUser;
  initial: ProfileValues;
  prefs: { orders: boolean; drops: boolean; sales: boolean };
  setPrefs: (p: { orders: boolean; drops: boolean; sales: boolean }) => void;
  toast: (s: string) => void;
}) {
  return (
    <>
      <Personal user={user} initial={initial} toast={toast} />
      <Password toast={toast} />

      {/* Notifications */}
      <Card>
        <h3 className="mb-1 text-base font-extrabold">Уведомления</h3>
        <Pref title="Статусы заказов" text="Push и e-mail о сборке, отправке и доставке."
          checked={prefs.orders} toggle={() => setPrefs({ ...prefs, orders: !prefs.orders })} />
        <Pref title="Новые дропы и restock" text="Первыми узнавайте о новых капсулах и возврате размеров."
          checked={prefs.drops} toggle={() => setPrefs({ ...prefs, drops: !prefs.drops })} />
        <Pref title="Закрытые скидки" text="Промо для участников Ritm Club и персональные предложения."
          checked={prefs.sales} toggle={() => setPrefs({ ...prefs, sales: !prefs.sales })} />
      </Card>

      {/* Danger zone */}
      <div className="mt-[18px] flex flex-wrap items-center justify-between gap-[18px] rounded-[24px] border border-danger/30 bg-danger/5 px-[22px] py-5">
        <div>
          <h4 className="text-[14.5px] font-extrabold text-[hsl(4_64%_38%)]">Удаление аккаунта</h4>
          <p className="mt-1 max-w-[52ch] text-[12.5px] text-ink-muted">
            Аккаунт, история заказов и сохранённые данные будут удалены без возможности восстановления.
          </p>
        </div>
        <button
          type="button"
          className="h-11 rounded-full border border-danger/50 bg-surface px-5 text-[13.5px] font-bold text-danger hover:bg-danger hover:text-primary-foreground"
        >
          Удалить аккаунт
        </button>
      </div>
    </>
  );
}

function Personal({ user, initial, toast }: {
  user: ProfileUser;
  initial: ProfileValues;
  toast: (s: string) => void;
}) {
  const [first, last] = splitName(initial.name ?? '');
  const [f, setF] = useState({ name: first, surname: last, phone: initial.phone ?? '', birthdate: initial.birthdate ?? '', email: user.email });
  const [err, setErr] = useState(false);
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = profileSchema.safeParse({
      name: [f.name, f.surname].filter(Boolean).join(' ').trim(),
      phone: f.phone,
      birthdate: f.birthdate,
    });
    if (!parsed.success) { setErr(true); return; }
    setErr(false);
    start(async () => {
      const r = await updateProfile(parsed.data);
      toast(r.ok ? 'Изменения сохранены' : r.error);
    });
  };

  return (
    <Card className="mb-[18px]">
      <h3 className="mb-4 text-base font-extrabold">Личные данные</h3>
      <form onSubmit={submit} className="grid max-w-[560px] gap-[18px]">
        <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
          <Field id="set-name" label="Имя" value={f.name} set={(v) => setF({ ...f, name: v })} error={err} />
          <Field id="set-surname" label="Фамилия" value={f.surname} set={(v) => setF({ ...f, surname: v })} />
          <Field id="set-phone" label="Телефон" value={f.phone} set={(v) => setF({ ...f, phone: v })} />
          <Field id="set-birthdate" label="Дата рождения" value={f.birthdate} set={(v) => setF({ ...f, birthdate: v })} type="date" />
        </div>
        <Field id="set-email" label="E-mail" value={f.email} set={(v) => setF({ ...f, email: v })} type="email" disabled />
        <Submit pending={pending}>{pending ? 'Сохраняем...' : 'Сохранить изменения'}</Submit>
      </form>
    </Card>
  );
}

function Password({ toast }: { toast: (s: string) => void }) {
  const [v, setV] = useState({ current: '', next: '', repeat: '' });
  const [show, setShow] = useState({ current: false, next: false, repeat: false });
  const [bad, setBad] = useState<ReadonlySet<keyof typeof v>>(() => new Set());
  const str = strength(v.next);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const b = new Set<keyof typeof v>();
    if (!v.current) b.add('current');
    if (v.next.length < 8) b.add('next');
    if (v.repeat !== v.next || v.repeat.length < 8) b.add('repeat');
    setBad(b);
    if (b.size === 0) {
      setV({ current: '', next: '', repeat: '' });
      toast('Пароль обновлён');
    }
  };

  return (
    <Card className="mb-[18px]">
      <h3 className="mb-4 text-base font-extrabold">Смена пароля</h3>
      <form onSubmit={submit} className="grid max-w-[560px] gap-[18px]">
        <Pass id="pw-current" label="Текущий пароль" value={v.current}
          set={(x) => setV({ ...v, current: x })} show={show.current}
          toggle={() => setShow({ ...show, current: !show.current })} error={bad.has('current')} />
        <Pass id="pw-new" label="Новый пароль" value={v.next}
          set={(x) => setV({ ...v, next: x })} show={show.next}
          toggle={() => setShow({ ...show, next: !show.next })} error={bad.has('next')} />
        {/* Strength meter */}
        <div className="-mt-4 flex items-center gap-2">
          <div className="flex flex-1 gap-1">
            {[1, 2, 3, 4].map((n) => (
              <i key={n} className={cn('h-1 flex-1 rounded-full bg-line', str.level >= n && str.color)} />
            ))}
          </div>
          <span className="min-w-14 text-right text-[11px] font-bold text-ink-muted">{str.label}</span>
        </div>
        <Pass id="pw-repeat" label="Повторите пароль" value={v.repeat}
          set={(x) => setV({ ...v, repeat: x })} show={show.repeat}
          toggle={() => setShow({ ...show, repeat: !show.repeat })} error={bad.has('repeat')} />
        <Submit>Обновить пароль</Submit>
      </form>
    </Card>
  );
}

// ── Small primitives ───────────────────────────────────────────────────────

function Field({ id, label, value, set, type = 'text', disabled, error }: {
  id: string;
  label: string;
  value: string;
  set: (v: string) => void;
  type?: string;
  disabled?: boolean;
  error?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-xs font-bold uppercase tracking-[.04em] text-ink-muted">{label}</label>
      <div className="relative flex items-center">
        <LeadIcon />
        <input
          id={id}
          value={value}
          onChange={(e) => set(e.target.value)}
          type={type}
          disabled={disabled}
          className={cn(
            'h-12 w-full rounded-[14px] border border-line bg-surface pl-[42px] pr-3.5 text-sm outline-none hover:border-ink/25 disabled:opacity-70',
            error && 'border-danger',
          )}
        />
      </div>
      {error && <span className="text-xs font-semibold text-danger">Проверьте поля</span>}
    </div>
  );
}

function Pass(p: {
  id: string;
  label: string;
  value: string;
  set: (v: string) => void;
  show: boolean;
  toggle: () => void;
  error: boolean;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={p.id} className="text-xs font-bold uppercase tracking-[.04em] text-ink-muted">{p.label}</label>
      <div className="relative flex items-center">
        <LeadIcon />
        <input
          id={p.id}
          type={p.show ? 'text' : 'password'}
          value={p.value}
          onChange={(e) => p.set(e.target.value)}
          className={cn(
            'h-12 w-full rounded-[14px] border border-line bg-surface pl-[42px] pr-[46px] text-sm outline-none hover:border-ink/25',
            p.error && 'border-danger',
          )}
        />
        <button
          type="button"
          onClick={p.toggle}
          className="absolute right-2 grid h-[34px] w-[34px] place-items-center rounded-full text-ink-muted hover:bg-surface-soft"
        >
          {p.show ? 'Скрыть' : 'Показать'}
        </button>
      </div>
      {p.error && <span className="text-xs font-semibold text-danger">Проверьте пароль</span>}
    </div>
  );
}

function LeadIcon() {
  return (
    <svg className="pointer-events-none absolute left-3.5 h-[18px] w-[18px] text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

function Pref({ title, text, checked, toggle }: {
  title: string;
  text: string;
  checked: boolean;
  toggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-line py-4 first:border-t-0">
      <div>
        <h4 className="text-sm font-bold">{title}</h4>
        <p className="mt-[3px] max-w-[46ch] text-[12.5px] text-ink-muted">{text}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={toggle}
        className={cn(
          'relative h-[27px] w-[46px] rounded-full bg-line after:absolute after:left-[3px] after:top-[3px] after:h-[21px] after:w-[21px] after:rounded-full after:bg-surface after:shadow-[0_1px_3px_hsl(var(--color-text)/.25)] after:transition-transform',
          checked && 'bg-accent after:translate-x-[19px]',
        )}
      />
    </div>
  );
}

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-[24px] border border-line bg-surface p-[22px]', className)}>{children}</div>;
}

function Stat({ n, t }: { n: string | number; t: string }) {
  return (
    <div className="grid gap-2 rounded-[18px] border border-line bg-surface p-[18px]">
      <span className="grid h-[38px] w-[38px] place-items-center rounded-xl bg-surface-soft">
        <span aria-hidden="true" className="h-[18px] w-[18px] rounded-full border border-ink-muted/40" />
      </span>
      <span className="tnum font-display text-[26px] font-extrabold tracking-tight">{n}</span>
      <span className="text-[12.5px] font-semibold text-ink-muted">{t}</span>
    </div>
  );
}

function MiniOrder({ order }: { order: ProfileOrder }) {
  const first = order.items[0];
  return (
    <div className="flex items-center gap-3.5 border-t border-line py-3 first:border-t-0">
      <div className="relative h-[50px] w-[46px] overflow-hidden rounded-[11px] border border-line bg-surface-soft">
        {first?.imageUrl && <Image src={first.imageUrl} alt={first.productName} fill sizes="46px" className="object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-bold">RITM-{order.orderNumber}</div>
        <div className="text-xs text-ink-muted">
          {fmtDate.format(new Date(order.createdAt))} · {order.items.length} поз.
        </div>
      </div>
      <div className="tnum text-sm font-extrabold">{formatPrice(order.totalAmount)}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-t border-line py-[13px] first:border-t-0">
      <span className="text-[13px] text-ink-muted">{k}</span>
      <span className="text-right text-[13.5px] font-semibold">{v}</span>
    </div>
  );
}

function Line({ item }: { item: ProfileOrderItem }) {
  return (
    <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 border-t border-line py-[9px] first:border-t-0">
      <div className="relative h-[50px] w-11 overflow-hidden rounded-[10px] border border-line bg-surface-soft">
        {item.imageUrl && <Image src={item.imageUrl} alt={item.productName} fill sizes="44px" className="object-cover" />}
      </div>
      <div>
        <div className="text-[13.5px] font-bold">{item.productName}</div>
        <div className="text-xs text-ink-muted">{item.brand} · {item.colorwayName} · {item.size}</div>
      </div>
      <div className="text-right">
        <div className="tnum text-sm font-extrabold">{formatPrice(item.price)}</div>
        <div className="text-xs text-ink-muted">x{item.qty}</div>
      </div>
    </div>
  );
}

function Total({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between py-1 text-[13px] text-ink-muted">
      <span>{label}</span>
      <span className="tnum text-ink">{value < 0 ? `-${formatPrice(Math.abs(value))}` : formatPrice(value)}</span>
    </div>
  );
}

function Empty({ title, text, href }: { title: string; text: string; href?: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-line bg-surface px-6 py-[60px] text-center">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-surface-soft text-ink-muted">
        <span aria-hidden="true" className="h-7 w-7 rounded-full border border-ink-muted/40" />
      </div>
      <h3 className="font-display text-[22px] font-bold tracking-tight">{title}</h3>
      <p className="mx-auto mt-2 max-w-[38ch] text-sm text-ink-muted">{text}</p>
      {href && (
        <Link href={href} className="mt-5 inline-flex h-[50px] items-center gap-2.5 rounded-full bg-primary px-6 text-[15px] font-bold text-primary-foreground">
          В каталог
        </Link>
      )}
    </div>
  );
}

function Submit({ children, pending }: { children: ReactNode; pending?: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-[52px] items-center justify-center gap-2.5 justify-self-start rounded-full bg-primary px-7 text-[15px] font-bold text-primary-foreground hover:bg-footer disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function NavCount({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <span className={cn(
      'tnum rounded-full px-2 py-px text-[11px] font-bold',
      active ? 'bg-primary-foreground text-primary' : 'bg-surface-soft text-ink-muted',
    )}>
      {children}
    </span>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function isPanel(v: string): v is PanelKey {
  return PANELS.some((p) => p.key === v);
}

function toFilter(status: OrderStatusKey): FilterKey {
  if (status === 'PENDING' || status === 'PROCESSING') return 'processing';
  if (status === 'SHIPPED') return 'transit';
  if (status === 'DELIVERED') return 'delivered';
  return 'cancelled';
}

function splitName(name: string): [string, string] {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return [p[0] ?? '', p.slice(1).join(' ')];
}

function initials(name: string, email: string) {
  const p = (name || email).trim().split(/\s+/);
  return p.length > 1 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : (name || email).slice(0, 2).toUpperCase();
}

function strength(v: string) {
  let level = 0;
  if (v.length >= 8) level++;
  if (v.length >= 12) level++;
  if (/[A-ZА-Я]/.test(v) && /[a-zа-я]/.test(v)) level++;
  if (/\d/.test(v) && /[^\w\s]/.test(v)) level++;
  level = Math.min(level, 4);
  return {
    level,
    label: ['—', 'Слабый', 'Средний', 'Хороший', 'Надёжный'][level],
    color: ['bg-line', 'bg-danger', 'bg-warning', 'bg-warning', 'bg-accent'][level],
  };
}