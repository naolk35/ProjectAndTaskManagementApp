import {
  useGetProjectsQuery,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetUsersQuery,
} from "../api/endpoints";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { normalizeRtkError } from "../api/baseApi";
import { useMemo, useState } from "react";
import {
  Layout,
  Card,
  Button,
  Alert,
  Spin,
  Space,
  Typography,
  Select,
  Row,
  Col,
  Statistic,
  Form,
  Input,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useReorderTasksMutation } from "../api/endpoints";
import { DataTable } from "../components/DataTable";
import { FormModal } from "../components/FormModal";
import { StatusBadge } from "../components/StatusBadge";

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState<"projects" | "tasks">("projects");
  const {
    data: projects,
    isLoading: loadingProjects,
    error: loadProjErr,
  } = useGetProjectsQuery();
  const {
    data: tasks,
    isLoading: loadingTasks,
    error: loadTaskErr,
  } = useGetTasksQuery();
  const { data: users } = useGetUsersQuery();
  const [createProject, cpState] = useCreateProjectMutation();
  const [, upState] = useUpdateProjectMutation();
  const [deleteProject, dpState] = useDeleteProjectMutation();
  const [createTask, ctState] = useCreateTaskMutation();
  const [updateTask, utState] = useUpdateTaskMutation();
  const [deleteTask, dtState] = useDeleteTaskMutation();
  const [reorderTasks] = useReorderTasksMutation();
  const user = useSelector((s: RootState) => s.auth.user);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    project_id: 0,
    assigned_to: 0,
  });
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  // Removed unused filters for status and assignee to satisfy linter
  const projError =
    normalizeRtkError(loadProjErr) ||
    normalizeRtkError(cpState.error) ||
    normalizeRtkError(upState.error) ||
    normalizeRtkError(dpState.error);
  const taskError =
    normalizeRtkError(loadTaskErr) ||
    normalizeRtkError(ctState.error) ||
    normalizeRtkError(utState.error) ||
    normalizeRtkError(dtState.error);

  const projectIdToName = useMemo(() => {
    const map = new Map<number, string>();
    (projects || []).forEach((p) => map.set(p.id, p.name));
    return map;
  }, [projects]);
  // Removed unused userIdToName mapping to satisfy linter
  const statusToBadge = (s: "pending" | "in_progress" | "completed") => (
    <StatusBadge status={s} />
  );

  const { Sider, Content } = Layout;
  const { Title, Text } = Typography;
  const { Option } = Select;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={240} style={{ background: "#fff" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #f0f0f0" }}>
          <Title level={4} style={{ margin: 0 }}>
            Project Manager
          </Title>
        </div>
        <div style={{ padding: "8px" }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button
              type={activeTab === "projects" ? "primary" : "text"}
              icon={<FolderOutlined />}
              onClick={() => setActiveTab("projects")}
              style={{ width: "100%", textAlign: "left" }}
            >
              My Projects
            </Button>
            <Button
              type={activeTab === "tasks" ? "primary" : "text"}
              icon={<CheckCircleOutlined />}
              onClick={() => setActiveTab("tasks")}
              style={{ width: "100%", textAlign: "left" }}
            >
              My Tasks
            </Button>
          </Space>
        </div>
      </Sider>
      <Content style={{ padding: "24px" }}>
        <div style={{ marginBottom: "24px" }}>
          <Title level={2}>Project Manager Dashboard</Title>
          <Text type="secondary">Welcome, {user?.name}</Text>
        </div>
        <Row gutter={16} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="My Projects"
                value={projects?.length ?? 0}
                prefix={<FolderOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="My Tasks"
                value={tasks?.length ?? 0}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Completed Tasks"
                value={
                  tasks?.filter((t) => t.status === "completed").length ?? 0
                }
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {activeTab === "projects" && (
          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <Title level={3} style={{ margin: 0 }}>
                My Projects
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setProjectModalOpen(true);
                }}
              >
                New Project
              </Button>
            </div>
            {projError && (
              <Alert
                message={projError.message}
                type="error"
                style={{ marginBottom: "16px" }}
              />
            )}
            {!projError &&
              (loadingProjects || cpState.isLoading || dpState.isLoading) && (
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <Spin />
                </div>
              )}
            <DataTable
              loading={loadingProjects}
              rows={projects}
              columns={[
                { key: "name", header: "Name", render: (p) => p.name },
                {
                  key: "description",
                  header: "Description",
                  render: (p) => p.description,
                },
                {
                  key: "actions",
                  header: "Actions",
                  render: (p) => (
                    <Space>
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                          setProjectModalOpen(true);
                          setNewProject({
                            name: p.name,
                            description: p.description,
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        disabled={dpState.isLoading}
                        onClick={() => deleteProject(p.id)}
                      >
                        Delete
                      </Button>
                    </Space>
                  ),
                },
              ]}
            />
          </Card>
        )}

        {activeTab === "tasks" && (
          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <Title level={3} style={{ margin: 0 }}>
                My Tasks
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setTaskModalOpen(true);
                }}
              >
                New Task
              </Button>
            </div>
            {taskError && (
              <Alert
                message={taskError.message}
                type="error"
                style={{ marginBottom: "16px" }}
              />
            )}
            {!taskError &&
              (loadingTasks || utState.isLoading || dtState.isLoading) && (
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <Spin />
                </div>
              )}
            <DataTable
              loading={loadingTasks}
              rows={tasks}
              columns={[
                { key: "title", header: "Title", render: (t) => t.title },
                {
                  key: "project",
                  header: "Project",
                  render: (t) =>
                    projectIdToName.get(t.project_id) || t.project_id,
                },
                {
                  key: "assignee",
                  header: "Assignee",
                  render: (t) => (
                    <div>
                      <input
                        list={`mgr-users-${t.id}`}
                        style={{
                          border: "1px solid #d9d9d9",
                          borderRadius: 6,
                          padding: "4px 8px",
                          width: "100%",
                        }}
                        placeholder="Type name"
                        onChange={(e) => {
                          const entered = e.target.value.trim().toLowerCase();
                          const match = (users || []).find(
                            (u) => u.name.toLowerCase() === entered
                          );
                          if (match)
                            updateTask({ id: t.id, assigned_to: match.id });
                        }}
                      />
                      <datalist id={`mgr-users-${t.id}`}>
                        {users?.map((u) => (
                          <option key={u.id} value={u.name} />
                        ))}
                      </datalist>
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (t) => statusToBadge(t.status),
                },
                {
                  key: "actions",
                  header: "Actions",
                  render: (t) => (
                    <Space>
                      <Select
                        value={t.status}
                        onChange={(value) =>
                          updateTask({
                            id: t.id,
                            status: value as typeof t.status,
                          })
                        }
                        disabled={utState.isLoading}
                        style={{ width: 120 }}
                      >
                        <Option value="pending">Pending</Option>
                        <Option value="in_progress">In Progress</Option>
                        <Option value="completed">Completed</Option>
                      </Select>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        disabled={dtState.isLoading}
                        onClick={() => deleteTask(t.id)}
                      >
                        Delete
                      </Button>
                    </Space>
                  ),
                },
              ]}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "16px",
              }}
            >
              <Button
                onClick={async () => {
                  if (!projects?.length || !tasks?.length) return;
                  const ordered_ids = tasks.map((t) => t.id);
                  await reorderTasks({
                    project_id: tasks[0].project_id,
                    ordered_ids,
                  });
                }}
              >
                Save Order
              </Button>
            </div>
          </Card>
        )}

        <FormModal
          open={projectModalOpen}
          title="Project"
          onClose={() => setProjectModalOpen(false)}
          onSubmit={async () => {
            if (newProject.name && newProject.description) {
              await createProject({ ...newProject });
              setNewProject({ name: "", description: "" });
              setProjectModalOpen(false);
            }
          }}
          disabled={
            cpState.isLoading || !newProject.name || !newProject.description
          }
        >
          <Form layout="vertical">
            <Form.Item label="Name">
              <Input
                placeholder="Name"
                value={newProject.name}
                onChange={(e) =>
                  setNewProject((s) => ({ ...s, name: e.target.value }))
                }
              />
            </Form.Item>
            <Form.Item label="Description">
              <Input
                placeholder="Description"
                value={newProject.description}
                onChange={(e) =>
                  setNewProject((s) => ({ ...s, description: e.target.value }))
                }
              />
            </Form.Item>
          </Form>
        </FormModal>

        <FormModal
          open={taskModalOpen}
          title="Task"
          onClose={() => setTaskModalOpen(false)}
          onSubmit={async () => {
            if (
              newTask.title &&
              newTask.description &&
              newTask.project_id &&
              newTask.assigned_to
            ) {
              await createTask({ ...newTask });
              setNewTask({
                title: "",
                description: "",
                project_id: 0,
                assigned_to: 0,
              });
              setTaskModalOpen(false);
            }
          }}
          disabled={
            ctState.isLoading ||
            !newTask.title ||
            !newTask.description ||
            !newTask.project_id ||
            !newTask.assigned_to
          }
        >
          <Form layout="vertical">
            <Form.Item label="Title">
              <Input
                placeholder="Title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask((s) => ({ ...s, title: e.target.value }))
                }
              />
            </Form.Item>
            <Form.Item label="Description">
              <Input
                placeholder="Description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask((s) => ({ ...s, description: e.target.value }))
                }
              />
            </Form.Item>
            <Form.Item label="Project">
              <Select
                placeholder="Select a project"
                value={newTask.project_id || undefined}
                onChange={(value) =>
                  setNewTask((s) => ({ ...s, project_id: Number(value) }))
                }
              >
                {projects?.map((p) => (
                  <Option key={p.id} value={p.id}>
                    {p.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Assignee">
              <Select
                placeholder="Select an assignee"
                value={newTask.assigned_to || undefined}
                onChange={(value) =>
                  setNewTask((s) => ({ ...s, assigned_to: Number(value) }))
                }
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {users?.map((u) => (
                  <Option key={u.id} value={u.id}>
                    {u.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </FormModal>
      </Content>
    </Layout>
  );
}
