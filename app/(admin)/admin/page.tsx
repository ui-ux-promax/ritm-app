import { prisma } from '@/lib/prisma-client';
import { formatPrice } from '@/lib/format';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import {
  resolvePeriod,
  getKpis,
  getRevenueSeries,
  getStatusDistribution,
  getBestSellers,
  getLowStock,
  getRecentOrders,
} from '@/lib/admin/analytics';
import { PeriodToggle } from './_components/period-toggle';
import { KpiCard } from './_components/kpi-card';
import { RevenueChart } from './_components/revenue-chart';
import { StatusDonut } from './_components/status-donut';
import { BestSellers } from './_components/best-sellers';
import { RecentOrders } from './_components/recent-orders';

export const metadata = { title: 'Дашборд' };
export const dynamic = 'force-dynamic';

type SP = Record<string, string | string[] | undefined>;

export default async function DashboardPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const range = resolvePeriod(sp, new Date());

  const [kpis, revenueSeries, statusDist, bestSellers, lowStock, recentOrders, stockAgg, pendingPayments] = await Promise.all([
    getKpis(prisma, range),
    getRevenueSeries(prisma, range),
    getStatusDistribution(prisma),
    getBestSellers(prisma, range),
    getLowStock(prisma),
    getRecentOrders(prisma),
    prisma.productVariant.aggregate({ _sum: { stock: true }, where: { active: true, colorway: { product: { active: true } } } }),
    prisma.order.count({ where: { payment: { is: { status: 'pending' } }, status: 'PENDING' } }),
  ]);
  const statusCount = (status: string) => statusDist.segments.find((segment) => segment.status === status)?.count ?? 0;
  const chartPeak = revenueSeries.reduce((peak, point) => (point.revenue > peak.revenue ? point : peak), { label: '', revenue: 0 });

  return (
    <div className="space-y-[24px]">
      <AdminPageHeader
        kicker="Обзор магазина"
        title="Дашборд"
        subtitle="Метрики магазина RITM за выбранный период: продажи, заказы, склад и клиенты."
        searchPlaceholder="Поиск заказа, товара или клиента"
      />

      {/* KPI */}
      <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-4">
        <KpiCard primary icon="payments" label="Выручка" value={formatPrice(kpis.revenue.value)} trend={kpis.revenue.trend} spark="M4 36 C20 30, 25 22, 42 24 S58 15, 70 18 86 9, 116 13" />
        <KpiCard icon="shopping_bag" label="Заказов" value={String(kpis.orders.value)} trend={kpis.orders.trend} spark="M4 38 C20 34, 24 20, 37 22 S55 10, 70 17 83 31, 116 18" />
        <KpiCard icon="inventory_2" label="Товаров в наличии" value={(stockAgg._sum.stock ?? 0).toLocaleString('ru-RU')} trend={{ pct: lowStock.length > 0 ? -lowStock.length : 0, dir: lowStock.length > 0 ? 'down' : 'flat' }} spark="M4 20 C19 15, 27 30, 42 24 S58 9, 71 18 90 35, 116 27" />
        <KpiCard icon="person_add" label="Новых клиентов" value={String(kpis.newCustomers.value)} trend={kpis.newCustomers.trend} spark="M4 38 C15 26, 27 30, 37 20 S54 9, 66 18 81 34, 116 10" />
      </div>

      <div className="grid items-start gap-[24px] xl:grid-cols-[minmax(0,1.62fr)_minmax(330px,.96fr)]">
        <article className="grid min-h-[346px] grid-rows-[auto_1fr] rounded-[32px] border border-admin-outline-variant bg-admin-surface p-6 shadow-[var(--admin-shadow-tight)]">
          <div className="mb-[22px] flex items-start justify-between gap-[18px] max-[760px]:grid">
            <div>
              <h2 className="font-admin-head text-[clamp(22px,1.7vw,30px)] font-extrabold leading-[1.05] tracking-[-.035em] text-admin-on-surface">
                Продажи по дням
              </h2>
              <p className="mt-1.5 text-[13px] text-admin-on-surface-variant">
                {range.days === 7 ? 'Последние 7 дней' : range.days === 30 ? 'Последние 30 дней' : 'Последние 90 дней'}, все каналы продаж
              </p>
            </div>
            <PeriodToggle />
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-[13px]">
            <div className="font-admin-head text-[clamp(36px,3vw,50px)] font-extrabold leading-none tracking-[-.06em] text-admin-on-surface tabular-nums">
              {formatPrice(kpis.revenue.value)}
            </div>
            <span className="inline-flex min-h-8 items-center rounded-full bg-[hsl(var(--color-accent)/.12)] px-[11px] text-[13px] font-extrabold text-[var(--admin-money)]">
              {kpis.revenue.trend.pct === null ? 'новое' : `${kpis.revenue.trend.pct > 0 ? '+' : ''}${kpis.revenue.trend.pct}%`}
            </span>
          </div>
          <div className="relative">
            <RevenueChart data={revenueSeries} />
            {chartPeak.revenue > 0 && (
              <div className="absolute left-[44%] top-[24%] inline-flex min-h-8 items-center rounded-full bg-[var(--admin-money)] px-3 text-[12px] font-extrabold text-white shadow-[0_14px_30px_hsl(var(--color-accent)/.22)] tabular-nums">
                {chartPeak.label} · {formatPrice(chartPeak.revenue)}
              </div>
            )}
          </div>
        </article>

        <div className="grid gap-[24px]">
          <article className="rounded-[32px] border border-admin-outline-variant bg-admin-surface p-6 shadow-[var(--admin-shadow-tight)]">
            <div className="mb-[22px] flex items-start justify-between gap-[18px]">
              <div>
                <h2 className="font-admin-head text-[clamp(22px,1.7vw,30px)] font-extrabold leading-[1.05] tracking-[-.035em] text-admin-on-surface">
                  Статусы
                </h2>
                <p className="mt-1.5 text-[13px] text-admin-on-surface-variant">Доля заказов по статусам</p>
              </div>
              <span className="inline-flex min-h-[38px] items-center rounded-full border border-admin-outline-variant bg-admin-surface-low px-[13px] text-[13px] font-bold text-admin-on-surface">
                Все
              </span>
            </div>
            <StatusDonut segments={statusDist.segments} total={statusDist.total} />
          </article>

          <article className="rounded-[32px] border border-admin-outline-variant bg-admin-surface p-6 shadow-[var(--admin-shadow-tight)]">
            <div className="mb-[22px]">
              <h2 className="font-admin-head text-[clamp(22px,1.7vw,30px)] font-extrabold leading-[1.05] tracking-[-.035em] text-admin-on-surface">
                Операции
              </h2>
              <p className="mt-1.5 text-[13px] text-admin-on-surface-variant">Что нужно закрыть до конца дня</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <QuickCard label="К сборке" value={statusCount('PROCESSING')} />
              <QuickCard label="Отменены" value={statusCount('CANCELLED')} />
              <QuickCard label="Мало остатков" value={lowStock.length} />
              <QuickCard label="Ожидают оплаты" value={pendingPayments} />
            </div>
          </article>
        </div>
      </div>

      {/* Нижний ряд */}
      <div className="grid gap-[24px] xl:grid-cols-[minmax(300px,.82fr)_minmax(0,1.38fr)]">
        <BestSellers items={bestSellers} />
        <RecentOrders rows={recentOrders} />
      </div>
    </div>
  );
}

function QuickCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] border border-admin-outline-variant bg-admin-surface p-4 shadow-[var(--admin-shadow-tight)]">
      <span className="text-[12px] font-bold text-admin-on-surface-variant">{label}</span>
      <strong className="mt-2 block font-admin-head text-[25px] font-extrabold leading-none tracking-[-.045em] text-admin-on-surface tabular-nums">
        {value}
      </strong>
    </div>
  );
}
