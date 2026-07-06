'use client';
import { SORT_OPTIONS } from '@/constants/config';
import { useCatalogUrl } from '@/hooks/use-catalog-url';

export function SortSelect() {
  const { get, setParam } = useCatalogUrl();
  const value = get('sort') || 'new';
  return (
    <label className="inline-flex items-center">
      <span className="sr-only">Сортировка</span>
      <select
        className="h-[42px] max-w-[200px] pl-4 pr-10 rounded-full border border-line bg-surface text-sm font-semibold text-ink cursor-pointer hover:border-ink/35 transition-colors appearance-none -webkit-appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2316181d' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
        }}
        value={value}
        onChange={(e) => setParam('sort', e.target.value === 'new' ? null : e.target.value)}
      >
        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
