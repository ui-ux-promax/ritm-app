import { Icon } from '@/components/admin/icon';
import { cn } from '@/lib/utils';
import type { Trend } from '@/lib/admin/analytics';

export function KpiCard({
  icon,
  label,
  value,
  trend,
  primary = false,
  spark = 'M4 34 C20 24, 30 31, 42 20 S61 8, 73 18 86 34, 116 12',
}: {
  icon: string;
  label: string;
  value: string;
  trend: Trend;
  primary?: boolean;
  spark?: string;
}) {
  return (
    <article
      className={cn(
        'relative flex min-h-[166px] flex-col gap-[15px] overflow-hidden rounded-[24px] border p-5 shadow-[var(--admin-shadow-tight)]',
        primary
          ? 'border-[var(--admin-sidebar)] bg-[var(--admin-sidebar)] text-white'
          : 'border-admin-outline-variant bg-admin-surface text-admin-on-surface',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className={cn(
            'grid h-11 w-11 place-items-center rounded-full',
            primary ? 'bg-white text-[var(--admin-sidebar)]' : 'bg-admin-surface-low text-admin-on-surface',
          )}
        >
          <Icon name={icon} className="text-[21px]" />
        </div>
      </div>
      <div>
        <div className={cn('text-[13px] font-bold', primary ? 'text-white/70' : 'text-admin-on-surface-variant')}>{label}</div>
        <div className="mt-2 font-admin-head text-[clamp(28px,2.3vw,38px)] font-extrabold leading-[.92] tracking-[-.055em] tabular-nums">
          {value}
        </div>
      </div>
      <TrendBadge trend={trend} primary={primary} />
      <svg className={cn('absolute bottom-3 right-3 h-[45px] w-28 opacity-80', primary ? 'text-white/55' : 'text-[var(--admin-money)]')} viewBox="0 0 120 48" aria-hidden="true">
        <path d={spark} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </article>
  );
}

function TrendBadge({ trend, primary }: { trend: Trend; primary: boolean }) {
  if (trend.pct === null) {
    return <span className={cn('mt-auto text-[13px] font-extrabold', primary ? 'text-white' : 'text-[var(--admin-money)]')}>новое</span>;
  }
  if (trend.dir === 'flat') {
    return <span className={cn('mt-auto text-[13px] font-extrabold', primary ? 'text-white/70' : 'text-admin-on-surface-variant')}>без изменений</span>;
  }
  const up = trend.dir === 'up';
  return (
    <span className={cn('mt-auto inline-flex items-center gap-1 text-[13px] font-extrabold', primary ? 'text-white' : up ? 'text-[var(--admin-money)]' : 'text-admin-error')}>
      <Icon name={up ? 'trending_up' : 'trending_down'} className="text-[16px]" />
      {up ? '+' : ''}{trend.pct}%
    </span>
  );
}
