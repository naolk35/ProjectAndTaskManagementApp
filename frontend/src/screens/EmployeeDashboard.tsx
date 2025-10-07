import {
  useGetTasksQuery,
  useUpdateTaskMutation,
  useGetProjectsQuery,
} from "../api/endpoints";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { normalizeRtkError } from "../api/baseApi";
import { useMemo } from "react";
import { Card, ErrorBanner, Spinner } from "../components/ui";
import { DataTable } from "../components/DataTable";
import { StatusBadge } from "../components/StatusBadge";

export default function EmployeeDashboard() {
  const { data: tasks, isLoading, error } = useGetTasksQuery();
  const { data: projects } = useGetProjectsQuery();
  const [updateTask, updateState] = useUpdateTaskMutation();
  const user = useSelector((s: RootState) => s.auth.user);
  const normalizedLoadError = normalizeRtkError(error);
  const normalizedUpdateError = normalizeRtkError(updateState.error);
  const projectIdToName = useMemo(() => {
    const map = new Map<number, string>();
    (projects || []).forEach((p) => map.set(p.id, p.name));
    return map;
  }, [projects]);

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Employee Dashboard</h2>
        <p className="text-gray-600">Welcome, {user?.name}</p>
      </div>
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="m-0 text-lg font-semibold">My Tasks</h3>
        </div>
        {normalizedLoadError && (
          <ErrorBanner message={normalizedLoadError.message} />
        )}
        {isLoading && (
          <div className="mb-2">
            <Spinner />
          </div>
        )}
        <DataTable
          loading={isLoading}
          rows={tasks}
          columns={[
            {
              key: "title",
              header: "Title",
              render: (t) => (
                <div>
                  <div className="font-semibold">{t.title}</div>
                  <div className="opacity-75 text-sm">{t.description}</div>
                </div>
              ),
            },
            {
              key: "project",
              header: "Project",
              render: (t) => projectIdToName.get(t.project_id) || t.project_id,
            },
            {
              key: "status",
              header: "Status",
              render: (t) => <StatusBadge status={t.status} />,
            },
            {
              key: "update",
              header: "Update",
              render: (t) => (
                <select
                  className="border rounded-md px-2 py-1"
                  value={t.status}
                  onChange={async (e) => {
                    const status = e.target.value as typeof t.status;
                    await updateTask({ id: t.id, status });
                  }}
                  disabled={updateState.isLoading}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              ),
            },
          ]}
        />
        {normalizedUpdateError && (
          <ErrorBanner message={normalizedUpdateError.message} />
        )}
      </Card>
    </div>
  );
}
