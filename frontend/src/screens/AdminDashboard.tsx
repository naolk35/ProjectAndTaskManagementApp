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
import { Sidebar, Button, Card, ErrorBanner, Spinner } from "../components/ui";
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

  return (
    <div className="grid grid-cols-[240px,1fr] min-h-[520px]">
      <Sidebar
        items={[
          {
            key: "users",
            label: "Users",
            onClick: () => setActiveTab("users"),
          },
          {
            key: "projects",
            label: "Projects",
            onClick: () => setActiveTab("projects"),
          },
          {
            key: "tasks",
            label: "Tasks",
            onClick: () => setActiveTab("tasks"),
          },
        ]}
        activeKey={activeTab}
        header={<div>Admin</div>}
      />
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
          <p className="text-gray-600">Welcome, {user?.name}</p>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total Users</div>
                <div className="text-2xl font-bold">{users?.length ?? 0}</div>
              </div>
              <div className="text-gray-400">👤</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total Projects</div>
                <div className="text-2xl font-bold">
                  {projects?.length ?? 0}
                </div>
              </div>
              <div className="text-gray-400">📁</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total Tasks</div>
                <div className="text-2xl font-bold">{tasks?.length ?? 0}</div>
              </div>
              <div className="text-gray-400">✅</div>
            </div>
          </Card>
        </div>

        {activeTab === "users" && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="m-0 text-lg font-semibold">Users</h3>
              <Button
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
                className="bg-green-600 hover:bg-green-500"
              >
                New User
              </Button>
            </div>
            {usersError && <ErrorBanner message={usersError.message} />}
            {!usersError &&
              (loadingUsers ||
                cuState.isLoading ||
                uuState.isLoading ||
                duState.isLoading) && (
                <div className="mb-2">
                  <Spinner />
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
                    <div className="flex gap-2">
                      <Button
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
                        onClick={() => deleteUser(u.id)}
                        disabled={duState.isLoading}
                        className="bg-red-600 hover:bg-red-500"
                      >
                        Delete
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        )}

        {activeTab === "projects" && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="m-0 text-lg font-semibold">Projects</h3>
              <Button
                onClick={() => {
                  setEditingProject(null);
                  setNewProject({ name: "", description: "" });
                  setProjectModalOpen(true);
                }}
                className="bg-green-600 hover:bg-green-500"
              >
                New Project
              </Button>
            </div>
            {projError && <ErrorBanner message={projError.message} />}
            {!projError &&
              (loadingProjects ||
                cpState.isLoading ||
                upState.isLoading ||
                dpState.isLoading) && (
                <div className="mb-2">
                  <Spinner />
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
                    <div className="flex gap-2">
                      <Button
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
                        onClick={() => deleteProject(p.id)}
                        disabled={dpState.isLoading}
                        className="bg-red-600 hover:bg-red-500"
                      >
                        Delete
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        )}

        {activeTab === "tasks" && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="m-0 text-lg font-semibold">Tasks</h3>
              <Button
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
                className="bg-green-600 hover:bg-green-500"
              >
                New Task
              </Button>
            </div>
            {taskError && <ErrorBanner message={taskError.message} />}
            {!taskError &&
              (loadingTasks ||
                ctState.isLoading ||
                utState.isLoading ||
                dtState.isLoading) && (
                <div className="mb-2">
                  <Spinner />
                </div>
              )}
            <div className="flex items-center gap-3 my-2">
              <label className="text-sm text-gray-600">Status</label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as
                      | "all"
                      | "pending"
                      | "in_progress"
                      | "completed"
                  )
                }
                className="border rounded-md px-2 py-1"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <label className="text-sm text-gray-600">Assignee</label>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="border rounded-md px-2 py-1"
              >
                <option value="">All</option>
                {users?.map((u) => (
                  <option key={u.id} value={String(u.id)}>
                    {u.name}
                  </option>
                ))}
              </select>
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
                    <div className="flex items-center gap-2">
                      <select
                        value={t.status}
                        onChange={(e) =>
                          updateTask({
                            id: t.id,
                            status: e.target.value as Task["status"],
                          })
                        }
                        className="border rounded-md px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <Button
                        onClick={() => {
                          setEditingTask(t);
                          setTaskModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => deleteTask(t.id)}
                        disabled={dtState.isLoading}
                        className="bg-red-600 hover:bg-red-500"
                      >
                        Delete
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
            <div className="flex justify-end mt-2">
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
          <label className="text-sm text-gray-700">Name</label>
          <input
            className="border rounded-md px-3 py-2"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) =>
              setNewUser((s) => ({ ...s, name: e.target.value }))
            }
          />
          <label className="text-sm text-gray-700">Email</label>
          <input
            className="border rounded-md px-3 py-2"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) =>
              setNewUser((s) => ({ ...s, email: e.target.value }))
            }
          />
          <label className="text-sm text-gray-700">Password</label>
          <input
            className="border rounded-md px-3 py-2"
            placeholder="Password"
            type="password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser((s) => ({ ...s, password: e.target.value }))
            }
          />
          <label className="text-sm text-gray-700">Role</label>
          <select
            className="border rounded-md px-3 py-2"
            value={newUser.role}
            onChange={(e) =>
              setNewUser((s) => ({
                ...s,
                role: e.target.value as User["role"],
              }))
            }
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
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
          <label className="text-sm text-gray-700">Name</label>
          <input
            className="border rounded-md px-3 py-2"
            placeholder="Name"
            value={newProject.name}
            onChange={(e) =>
              setNewProject((s) => ({ ...s, name: e.target.value }))
            }
          />
          <label className="text-sm text-gray-700">Description</label>
          <input
            className="border rounded-md px-3 py-2"
            placeholder="Description"
            value={newProject.description}
            onChange={(e) =>
              setNewProject((s) => ({ ...s, description: e.target.value }))
            }
          />
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
          <label className="text-sm text-gray-700">Title</label>
          <input
            className="border rounded-md px-3 py-2"
            placeholder="Title"
            value={newTask.title}
            onChange={(e) =>
              setNewTask((s) => ({ ...s, title: e.target.value }))
            }
          />
          <label className="text-sm text-gray-700">Description</label>
          <input
            className="border rounded-md px-3 py-2"
            placeholder="Description"
            value={newTask.description}
            onChange={(e) =>
              setNewTask((s) => ({ ...s, description: e.target.value }))
            }
          />
          <label className="text-sm text-gray-700 dark:text-slate-200">
            Project
          </label>
          <select
            className="border rounded-md px-3 py-2 bg-white text-gray-900 border-gray-300 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600"
            value={String(newTask.project_id || "")}
            onChange={(e) =>
              setNewTask((s) => ({ ...s, project_id: Number(e.target.value) }))
            }
          >
            <option value="">Select a project</option>
            {projects?.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>
          <label className="text-sm text-gray-700 dark:text-slate-200">
            Assignee
          </label>
          <div>
            <input
              list="admin-user-options"
              className="border rounded-md px-3 py-2 w-full bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-600 dark:placeholder:text-slate-400"
              placeholder="Type a name to search"
              onChange={(e) => {
                const entered = e.target.value.trim().toLowerCase();
                const match = (users || []).find(
                  (u) => u.name.toLowerCase() === entered
                );
                if (match) setNewTask((s) => ({ ...s, assigned_to: match.id }));
              }}
            />
            <datalist id="admin-user-options">
              {users?.map((u) => (
                <option
                  key={u.id}
                  value={u.name}
                  className="bg-white text-gray-900 dark:bg-slate-900 dark:text-slate-100"
                />
              ))}
            </datalist>
            <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Selected ID: {newTask.assigned_to || "-"}
            </div>
          </div>
        </FormModal>
      </div>
    </div>
  );
}
