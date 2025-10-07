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
import { Sidebar, Card, Button, ErrorBanner, Spinner } from "../components/ui";
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

  return (
    <div className="grid grid-cols-[240px,1fr] min-h-[520px]">
      <Sidebar
        items={[
          {
            key: "projects",
            label: "My Projects",
            onClick: () => setActiveTab("projects"),
          },
          {
            key: "tasks",
            label: "My Tasks",
            onClick: () => setActiveTab("tasks"),
          },
        ]}
        activeKey={activeTab}
        header={<div>Project Manager</div>}
      />
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Project Manager Dashboard</h2>
          <p className="text-gray-600">Welcome, {user?.name}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <div className="text-sm text-gray-500">My Projects</div>
            <div className="text-2xl font-bold">{projects?.length ?? 0}</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-500">My Tasks</div>
            <div className="text-2xl font-bold">{tasks?.length ?? 0}</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-500">Completed Tasks</div>
            <div className="text-2xl font-bold">
              {tasks?.filter((t) => t.status === "completed").length ?? 0}
            </div>
          </Card>
        </div>

        {activeTab === "projects" && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="m-0 text-lg font-semibold">My Projects</h3>
              <Button
                onClick={() => {
                  setProjectModalOpen(true);
                }}
                className="bg-green-600 hover:bg-green-500"
              >
                New Project
              </Button>
            </div>
            {projError && <ErrorBanner message={projError.message} />}
            {!projError &&
              (loadingProjects || cpState.isLoading || dpState.isLoading) && (
                <div className="mb-2">
                  <Spinner />
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
                    <div className="flex gap-2">
                      <Button
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
                        disabled={dpState.isLoading}
                        onClick={() => deleteProject(p.id)}
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
              <h3 className="m-0 text-lg font-semibold">My Tasks</h3>
              <Button
                onClick={() => {
                  setTaskModalOpen(true);
                }}
                className="bg-green-600 hover:bg-green-500"
              >
                New Task
              </Button>
            </div>
            {taskError && <ErrorBanner message={taskError.message} />}
            {!taskError &&
              (loadingTasks || utState.isLoading || dtState.isLoading) && (
                <div className="mb-2">
                  <Spinner />
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
                        className="border rounded-md px-2 py-1 w-full"
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
                    <div className="flex items-center gap-2">
                      <select
                        className="border rounded-md px-2 py-1"
                        value={t.status}
                        onChange={(e) =>
                          updateTask({
                            id: t.id,
                            status: e.target.value as typeof t.status,
                          })
                        }
                        disabled={utState.isLoading}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <Button
                        disabled={dtState.isLoading}
                        onClick={() => deleteTask(t.id)}
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
          <label className="text-sm text-gray-700">Project</label>
          <select
            className="border rounded-md px-3 py-2"
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
          <label className="text-sm text-gray-700">Assignee</label>
          <div>
            <input
              list="mgr-users-create"
              className="border rounded-md px-3 py-2 w-full"
              placeholder="Type a name to search"
              onChange={(e) => {
                const entered = e.target.value.trim().toLowerCase();
                const match = (users || []).find(
                  (u) => u.name.toLowerCase() === entered
                );
                if (match) setNewTask((s) => ({ ...s, assigned_to: match.id }));
              }}
            />
            <datalist id="mgr-users-create">
              {users?.map((u) => (
                <option key={u.id} value={u.name} />
              ))}
            </datalist>
            <div className="text-xs text-gray-500 mt-1">
              Selected ID: {newTask.assigned_to || "-"}
            </div>
          </div>
        </FormModal>
      </div>
    </div>
  );
}
