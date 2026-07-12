import { DemoDataTable } from '@/components/demo-admin/demo-data-table';
import { DemoKpiGrid } from '@/components/demo-admin/demo-kpi-grid';
import { getDemoAdminSnapshot } from '@/lib/demo-admin/fixtures';
import { formatPrice } from '@/lib/format';

export default function DemoDashboardPage() {
  const snapshot = getDemoAdminSnapshot();
  const peak = Math.max(...snapshot.revenueSeries.map((point) => point.revenue));

  return (
    <section className="space-y-5">
      <div>
        <h1 className="font-admin-head text-3xl font-extrabold">Дашборд</h1>
        <p className="text-sm text-admin-on-surface-variant">{snapshot.generatedLabel}</p>
      </div>

      <DemoKpiGrid kpis={snapshot.kpis} />

      <article className="rounded-3xl border border-admin-outline-variant bg-admin-surface p-5">
        <h2 className="mb-4 text-xl font-extrabold">Продажи за неделю</h2>
        <div className="flex h-48 items-end gap-3">
          {snapshot.revenueSeries.map((point) => (
            <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-xl bg-admin-primary"
                style={{ height: `${Math.max(8, Math.round((point.revenue / peak) * 100))}%` }}
              />
              <span className="text-xs text-admin-on-surface-variant">{point.label}</span>
            </div>
          ))}
        </div>
      </article>

      <DemoDataTable
        headings={['Заказ', 'Клиент', 'Статус', 'Сумма']}
        rows={snapshot.orders.map((order) => [
          order.number,
          order.customerName,
          order.status,
          formatPrice(order.totalAmount),
        ])}
      />
    </section>
  );
}
