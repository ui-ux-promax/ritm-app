import { DemoDataTable } from '@/components/demo-admin/demo-data-table';
import { getDemoAdminSnapshot } from '@/lib/demo-admin/fixtures';
import { formatPrice } from '@/lib/format';

export default function DemoCustomersPage() {
  const { customers } = getDemoAdminSnapshot();

  return (
    <section className="space-y-4">
      <h1 className="font-admin-head text-3xl font-extrabold">Клиенты</h1>
      <DemoDataTable
        headings={['Клиент', 'Email', 'Заказов', 'Потрачено', 'Регистрация']}
        rows={customers.map((customer) => [
          customer.name,
          customer.email,
          customer.orderCount,
          formatPrice(customer.totalSpent),
          customer.registeredLabel,
        ])}
      />
    </section>
  );
}
