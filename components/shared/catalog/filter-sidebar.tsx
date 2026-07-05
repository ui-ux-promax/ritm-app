import { FilterControls } from './filter-controls';
import type { CatalogResult } from '@/lib/find-products';

// Инлайн-сайдбар с md (768px): на 1023px фильтр на месте рядом с 2-кол сеткой.
// Ниже md фасеты живут в MobileFilterDrawer. Узкий (~240px колонка задаётся гридом страницы).
export function FilterSidebar({ facets }: { facets: CatalogResult['facets'] }) {
  return (
    <aside className="hidden md:block">
      <div className="sticky top-20 rounded-[16px] border border-line bg-surface p-5 lg:p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg">Фильтры</h3>
        </div>
        <FilterControls facets={facets} />
      </div>
    </aside>
  );
}
