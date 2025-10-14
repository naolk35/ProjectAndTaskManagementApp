import {
  useGetTasksQuery,
  useUpdateTaskMutation,
  useGetProjectsQuery,
} from "../api/endpoints";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { normalizeRtkError } from "../api/baseApi";
import { useMemo } from "react";
import { Card, Alert, Spin, Typography, Select } from "antd";
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

  const { Title, Text } = Typography;
  const { Option } = Select;

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>Employee Dashboard</Title>
        <Text type="secondary">Welcome, {user?.name}</Text>
      </div>
      <Card>
        <div style={{ marginBottom: "16px" }}>
          <Title level={3} style={{ margin: 0 }}>
            My Tasks
          </Title>
        </div>
        {normalizedLoadError && (
          <Alert
            message={normalizedLoadError.message}
            type="error"
            style={{ marginBottom: "16px" }}
          />
        )}
        {isLoading && (
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <Spin />
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
                  <div style={{ fontWeight: 600 }}>{t.title}</div>
                  <div style={{ opacity: 0.75, fontSize: 12 }}>
                    {t.description}
                  </div>
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
                <Select
                  value={t.status}
                  onChange={async (value) => {
                    const status = value as typeof t.status;
                    await updateTask({ id: t.id, status });
                  }}
                  disabled={updateState.isLoading}
                  style={{ width: 120 }}
                >
                  <Option value="pending">Pending</Option>
                  <Option value="in_progress">In Progress</Option>
                  <Option value="completed">Completed</Option>
                </Select>
              ),
            },
          ]}
        />
        {normalizedUpdateError && (
          <Alert
            message={normalizedUpdateError.message}
            type="error"
            style={{ marginTop: "16px" }}
          />
        )}
      </Card>
    </div>
  );
}
