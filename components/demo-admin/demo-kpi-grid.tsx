import { formatPrice } from '@/lib/format';

export function DemoKpiGrid({
  kpis,
}: {
  kpis: { revenue: number; orders: number; averageOrder: number; conversion: number };
}) {
  const cards = [
    ['Выручка', formatPrice(kpis.revenue)],
    ['Заказы', String(kpis.orders)],
    ['Средний чек', formatPrice(kpis.averageOrder)],
    ['Конверсия', `${kpis.conversion}%`],
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value]) => (
        <article key={label} className="rounded-3xl border border-admin-outline-variant bg-admin-surface p-5">
          <span className="text-sm text-admin-on-surface-variant">{label}</span>
          <strong className="mt-2 block text-3xl font-extrabold tabular-nums">{value}</strong>
        </article>
      ))}
    </div>
  );
}
