import type { ReactNode } from 'react';

export function DemoDataTable({
  headings,
  rows,
}: {
  headings: readonly string[];
  rows: ReadonlyArray<readonly ReactNode[]>;
}) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-admin-outline-variant bg-admin-surface">
      <table className="w-full min-w-[720px] text-left">
        <thead className="bg-admin-surface-high">
          <tr>
            {headings.map((heading) => (
              <th
                key={heading}
                scope="col"
                className="whitespace-nowrap px-5 py-4 text-xs font-extrabold uppercase tracking-wider text-admin-on-surface-variant"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, rowIndex) => (
            <tr key={rowIndex} className="border-t border-admin-outline-variant">
              {cells.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-5 py-4 text-sm text-admin-on-surface">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
