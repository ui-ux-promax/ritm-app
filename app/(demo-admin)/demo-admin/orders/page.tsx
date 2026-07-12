import { DemoDataTable } from '@/components/demo-admin/demo-data-table';
import { getDemoAdminSnapshot } from '@/lib/demo-admin/fixtures';
import { formatPrice } from '@/lib/format';

export default function DemoOrdersPage() {
  const { orders } = getDemoAdminSnapshot();

  return (
    <section className="space-y-4">
      <h1 className="font-admin-head text-3xl font-extrabold">Заказы</h1>
      <DemoDataTable
        headings={['Заказ', 'Клиент', 'Статус', 'Сумма', 'Создан']}
        rows={orders.map((order) => [
          order.number,
          order.customerName,
          order.status,
          formatPrice(order.totalAmount),
          order.createdLabel,
        ])}
      />
    </section>
  );
}
