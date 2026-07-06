'use client';
import { SORT_OPTIONS } from '@/constants/config';
import { useCatalogUrl } from '@/hooks/use-catalog-url';

export function SortSelect() {
  const { get, setParam } = useCatalogUrl();
  const value = get('sort') || 'new';
  return (
    <label className="inline-flex items-center">
      <span className="sr-only">Сортировка</span>
      <select className="h-[42px] max-w-[200px] px-4 rounded-full border border-line bg-surface text-sm font-semibold text-ink cursor-pointer hover:border-ink/35 transition-colors" value={value} onChange={(e) => setParam('sort', e.target.value === 'new' ? null : e.target.value)}>
        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
