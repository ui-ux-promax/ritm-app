import { DemoDataTable } from '@/components/demo-admin/demo-data-table';
import { getDemoAdminSnapshot } from '@/lib/demo-admin/fixtures';
import { formatPrice } from '@/lib/format';

export default function DemoCatalogPage() {
  const { products } = getDemoAdminSnapshot();

  return (
    <section className="space-y-4">
      <h1 className="font-admin-head text-3xl font-extrabold">Каталог</h1>
      <DemoDataTable
        headings={['Товар', 'SKU', 'Категория', 'Цена', 'Остаток', 'Статус']}
        rows={products.map((product) => [
          product.name,
          product.sku,
          product.category,
          formatPrice(product.price),
          product.stock,
          product.active ? 'Активен' : 'Скрыт',
        ])}
      />
    </section>
  );
}
