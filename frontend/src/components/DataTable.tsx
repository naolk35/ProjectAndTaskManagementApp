import type { ReactNode } from "react";
import { Table } from "antd";

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

  const antdColumns = columns.map((c) => ({
    key: c.key,
    title: c.header,
    dataIndex: c.key,
    render: (_: unknown, row: T) => c.render(row),
  }));

  return (
    <Table
      rowKey={(r) => String(r.id)}
      columns={antdColumns as any}
      dataSource={(rows || []) as any}
      loading={loading}
      pagination={false}
      locale={{ emptyText }}
    />
  );
}
