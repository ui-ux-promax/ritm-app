import type { OrderStatus } from '@prisma/client';
import type { StatusSegment } from '@/lib/admin/analytics';

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: 'hsl(var(--color-warning))',
  PROCESSING: 'hsl(var(--color-info))',
  SHIPPED: 'hsl(205 60% 40%)',
  DELIVERED: 'hsl(var(--color-success))',
  CANCELLED: 'hsl(var(--color-border))',
};

export function StatusDonut({ segments, total }: { segments: StatusSegment[]; total: number }) {
  if (total === 0) {
    return <p className="text-sm text-admin-on-surface-variant">Заказов пока нет.</p>;
  }

  let cursor = 0;
  const stops = segments.map((segment) => {
    const start = cursor;
    const width = (segment.count / total) * 100;
    cursor += width;
    return `${STATUS_COLOR[segment.status]} ${start}% ${cursor}%`;
  });

  return (
    <div className="grid grid-cols-[192px_minmax(0,1fr)] items-center gap-[22px] max-[640px]:grid-cols-1">
      <div
        className="grid aspect-square w-48 place-items-center rounded-full shadow-[inset_0_0_0_1px_hsl(var(--color-border)/.6)]"
        style={{
          background: `radial-gradient(circle, var(--admin-surface) 0 48%, transparent 49%), conic-gradient(${stops.join(', ')})`,
        }}
        aria-label="Диаграмма статусов заказов"
      >
        <div className="text-center">
          <strong className="block font-admin-head text-[34px] font-extrabold leading-[.95] tracking-[-.05em] text-admin-on-surface tabular-nums">
            {total}
          </strong>
          <span className="mt-1 block text-[12px] font-bold text-admin-on-surface-variant">заказов</span>
        </div>
      </div>
      <div className="grid gap-[11px]">
        {segments.map((segment) => (
          <div key={segment.status} className="grid grid-cols-[11px_1fr_auto] items-center gap-[10px] text-[13px] text-admin-on-surface-variant">
            <span className="h-[11px] w-[11px] rounded-full" style={{ background: STATUS_COLOR[segment.status] }} />
            <span>{segment.label}</span>
            <strong className="font-mono text-[12px] text-admin-on-surface tabular-nums">
              {Math.round((segment.count / total) * 100)}%
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}
