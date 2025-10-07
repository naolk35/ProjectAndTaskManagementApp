import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  className?: string;
};

export function DataTable<T extends { id: number | string }>(props: {
  columns: Array<Column<T>>;
  rows: T[] | undefined | null;
  loading?: boolean;
  emptyText?: string;
}) {
  const { columns, rows, loading, emptyText = "No data" } = props;
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 dark:bg-slate-950">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={`text-left font-semibold text-gray-700 dark:text-slate-200 px-3 py-2 ${
                  c.className || ""
                }`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-4 text-center text-gray-500"
              >
                Loading...
              </td>
            </tr>
          ) : !rows || rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-4 text-center text-gray-500"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={String(row.id)}
                className={
                  idx % 2 === 0
                    ? "bg-white dark:bg-slate-900"
                    : "bg-gray-50/60 dark:bg-slate-950/60"
                }
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`px-3 py-2 align-top ${c.className || ""}`}
                  >
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
