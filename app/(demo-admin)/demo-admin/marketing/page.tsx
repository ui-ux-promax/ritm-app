import { DemoDataTable } from '@/components/demo-admin/demo-data-table';
import { getDemoAdminSnapshot } from '@/lib/demo-admin/fixtures';

export default function DemoMarketingPage() {
  const { coupons } = getDemoAdminSnapshot();

  return (
    <section className="space-y-4">
      <h1 className="font-admin-head text-3xl font-extrabold">Маркетинг</h1>
      <DemoDataTable
        headings={['Код', 'Скидка', 'Статус', 'Действует до']}
        rows={coupons.map((coupon) => [
          coupon.code,
          `${coupon.percent}%`,
          coupon.active ? 'Активен' : 'Отключён',
          coupon.expiresLabel,
        ])}
      />
    </section>
  );
}
