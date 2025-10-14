import {
  useGetProjectsQuery,
  useGetTasksQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../api/endpoints";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { normalizeRtkError } from "../api/baseApi";
import { useMemo, useState } from "react";
import {
  Layout,
  Button,
  Card,
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
  UserOutlined,
  FolderOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { DataTable } from "../components/DataTable";
import { FormModal } from "../components/FormModal";
import { StatusBadge } from "../components/StatusBadge";
import type { Project, Task, User } from "../api/endpoints";
import { useReorderTasksMutation } from "../api/endpoints";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"users" | "projects" | "tasks">(
    "users"
  );
  // Users
  const {
    data: users,
    isLoading: loadingUsers,
    error: loadUsersErr,
  } = useGetUsersQuery();
  const [createUser, cuState] = useCreateUserMutation();
  const [updateUser, uuState] = useUpdateUserMutation();
  const [deleteUser, duState] = useDeleteUserMutation();
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
  const [createProject, cpState] = useCreateProjectMutation();
  const [updateProject, upState] = useUpdateProjectMutation();
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
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee" as User["role"],
  });
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "in_progress" | "completed"
  >("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("");
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
  const usersError =
    normalizeRtkError(loadUsersErr) ||
    normalizeRtkError(cuState.error) ||
    normalizeRtkError(uuState.error) ||
    normalizeRtkError(duState.error);

  const statusToBadge = (s: Task["status"]) => <StatusBadge status={s} />;

  const projectIdToName = useMemo(() => {
    const map = new Map<number, string>();
    (projects || []).forEach((p) => map.set(p.id, p.name));
    return map;
  }, [projects]);
  const userIdToName = useMemo(() => {
    const map = new Map<number, string>();
    (users || []).forEach((u) => map.set(u.id, u.name));
    return map;
  }, [users]);

  const { Sider, Content } = Layout;
  const { Title, Text } = Typography;
  const { Option } = Select;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={240} style={{ background: "#fff" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #f0f0f0" }}>
          <Title level={4} style={{ margin: 0 }}>
            Admin
          </Title>
        </div>
        <div style={{ padding: "8px" }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button
              type={activeTab === "users" ? "primary" : "text"}
              icon={<UserOutlined />}
              onClick={() => setActiveTab("users")}
              style={{ width: "100%", textAlign: "left" }}
            >
              Users
            </Button>
            <Button
              type={activeTab === "projects" ? "primary" : "text"}
              icon={<FolderOutlined />}
              onClick={() => setActiveTab("projects")}
              style={{ width: "100%", textAlign: "left" }}
            >
              Projects
            </Button>
            <Button
              type={activeTab === "tasks" ? "primary" : "text"}
              icon={<CheckCircleOutlined />}
              onClick={() => setActiveTab("tasks")}
              style={{ width: "100%", textAlign: "left" }}
            >
              Tasks
            </Button>
          </Space>
        </div>
      </Sider>
      <Content style={{ padding: "24px" }}>
        <div style={{ marginBottom: "24px" }}>
          <Title level={2}>Admin Dashboard</Title>
          <Text type="secondary">Welcome, {user?.name}</Text>
        </div>

        <Row gutter={16} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Users"
                value={users?.length ?? 0}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Projects"
                value={projects?.length ?? 0}
                prefix={<FolderOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Tasks"
                value={tasks?.length ?? 0}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {activeTab === "users" && (
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
                Users
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingUser(null);
                  setNewUser({
                    name: "",
                    email: "",
                    password: "",
                    role: "employee",
                  });
                  setUserModalOpen(true);
                }}
              >
                New User
              </Button>
            </div>
            {usersError && (
              <Alert
                message={usersError.message}
                type="error"
                style={{ marginBottom: "16px" }}
              />
            )}
            {!usersError &&
              (loadingUsers ||
                cuState.isLoading ||
                uuState.isLoading ||
                duState.isLoading) && (
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <Spin />
                </div>
              )}
            <DataTable
              loading={loadingUsers}
              rows={users}
              columns={[
                { key: "name", header: "Name", render: (u: User) => u.name },
                { key: "email", header: "Email", render: (u: User) => u.email },
                { key: "role", header: "Role", render: (u: User) => u.role },
                {
                  key: "actions",
                  header: "Actions",
                  render: (u: User) => (
                    <Space>
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                          setEditingUser(u);
                          setNewUser({
                            name: u.name,
                            email: u.email,
                            password: "",
                            role: u.role,
                          });
                          setUserModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => deleteUser(u.id)}
                        loading={duState.isLoading}
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
                Projects
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingProject(null);
                  setNewProject({ name: "", description: "" });
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
              (loadingProjects ||
                cpState.isLoading ||
                upState.isLoading ||
                dpState.isLoading) && (
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <Spin />
                </div>
              )}
            <DataTable
              loading={loadingProjects}
              rows={projects}
              columns={[
                { key: "name", header: "Name", render: (p: Project) => p.name },
                {
                  key: "desc",
                  header: "Description",
                  render: (p: Project) => p.description,
                },
                {
                  key: "actions",
                  header: "Actions",
                  render: (p: Project) => (
                    <Space>
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                          setEditingProject(p);
                          setNewProject({
                            name: p.name,
                            description: p.description,
                          });
                          setProjectModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => deleteProject(p.id)}
                        loading={dpState.isLoading}
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
                Tasks
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingTask(null);
                  setNewTask({
                    title: "",
                    description: "",
                    project_id: 0,
                    assigned_to: 0,
                  });
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
              (loadingTasks ||
                ctState.isLoading ||
                utState.isLoading ||
                dtState.isLoading) && (
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <Spin />
                </div>
              )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <Text>Status:</Text>
              <Select
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                style={{ width: 120 }}
              >
                <Option value="all">All</Option>
                <Option value="pending">Pending</Option>
                <Option value="in_progress">In Progress</Option>
                <Option value="completed">Completed</Option>
              </Select>
              <Text>Assignee:</Text>
              <Select
                value={assigneeFilter}
                onChange={(value) => setAssigneeFilter(value)}
                style={{ width: 150 }}
                allowClear
              >
                {users?.map((u) => (
                  <Option key={u.id} value={String(u.id)}>
                    {u.name}
                  </Option>
                ))}
              </Select>
            </div>
            <DataTable
              loading={loadingTasks}
              rows={tasks
                ?.filter((t) =>
                  statusFilter === "all" ? true : t.status === statusFilter
                )
                .filter((t) =>
                  assigneeFilter
                    ? String(t.assigned_to) === assigneeFilter
                    : true
                )}
              columns={[
                { key: "title", header: "Title", render: (t: Task) => t.title },
                {
                  key: "project",
                  header: "Project",
                  render: (t: Task) =>
                    projectIdToName.get(t.project_id) || t.project_id,
                },
                {
                  key: "assignee",
                  header: "Assignee",
                  render: (t: Task) =>
                    userIdToName.get(t.assigned_to) || t.assigned_to,
                },
                {
                  key: "status",
                  header: "Status",
                  render: (t: Task) => statusToBadge(t.status),
                },
                {
                  key: "actions",
                  header: "Actions",
                  render: (t: Task) => (
                    <Space>
                      <Select
                        value={t.status}
                        onChange={(value) =>
                          updateTask({
                            id: t.id,
                            status: value as Task["status"],
                          })
                        }
                        style={{ width: 120 }}
                      >
                        <Option value="pending">Pending</Option>
                        <Option value="in_progress">In Progress</Option>
                        <Option value="completed">Completed</Option>
                      </Select>
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                          setEditingTask(t);
                          setTaskModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => deleteTask(t.id)}
                        loading={dtState.isLoading}
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
                  // Save order as currently rendered order
                  const ordered_ids = tasks
                    .filter((t) =>
                      statusFilter === "all" ? true : t.status === statusFilter
                    )
                    .filter((t) =>
                      assigneeFilter
                        ? String(t.assigned_to) === assigneeFilter
                        : true
                    )
                    .map((t) => t.id);
                  await reorderTasks({
                    project_id: ordered_ids.length ? tasks[0].project_id : 0,
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
          open={userModalOpen}
          title={editingUser ? "Edit User" : "New User"}
          onClose={() => setUserModalOpen(false)}
          onSubmit={async () => {
            if (editingUser) {
              await updateUser({
                id: editingUser.id,
                ...newUser,
                password: newUser.password || undefined,
              });
            } else {
              await createUser({
                name: newUser.name,
                email: newUser.email,
                password: newUser.password,
                role: newUser.role,
              });
            }
            setUserModalOpen(false);
          }}
        >
          <Form layout="vertical">
            <Form.Item label="Name">
              <Input
                placeholder="Name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser((s) => ({ ...s, name: e.target.value }))
                }
              />
            </Form.Item>
            <Form.Item label="Email">
              <Input
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser((s) => ({ ...s, email: e.target.value }))
                }
              />
            </Form.Item>
            <Form.Item label="Password">
              <Input.Password
                placeholder="Password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser((s) => ({ ...s, password: e.target.value }))
                }
              />
            </Form.Item>
            <Form.Item label="Role">
              <Select
                value={newUser.role}
                onChange={(value) =>
                  setNewUser((s) => ({
                    ...s,
                    role: value as User["role"],
                  }))
                }
              >
                <Option value="admin">Admin</Option>
                <Option value="manager">Manager</Option>
                <Option value="employee">Employee</Option>
              </Select>
            </Form.Item>
          </Form>
        </FormModal>

        <FormModal
          open={projectModalOpen}
          title={editingProject ? "Edit Project" : "New Project"}
          onClose={() => setProjectModalOpen(false)}
          onSubmit={async () => {
            if (editingProject) {
              await updateProject({ id: editingProject.id, ...newProject });
            } else {
              await createProject({ ...newProject });
            }
            setProjectModalOpen(false);
            setNewProject({ name: "", description: "" });
          }}
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
          title={editingTask ? "Edit Task" : "New Task"}
          onClose={() => setTaskModalOpen(false)}
          onSubmit={async () => {
            if (editingTask) {
              await updateTask({ id: editingTask.id, ...newTask });
            } else {
              await createTask({ ...newTask });
            }
            setTaskModalOpen(false);
            setNewTask({
              title: "",
              description: "",
              project_id: 0,
              assigned_to: 0,
            });
          }}
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
                  String(
                    (option as unknown as { children?: unknown })?.children ||
                      ""
                  )
                    .toLowerCase()
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
