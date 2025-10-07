import { baseApi } from "./baseApi";
import type { AuthUser } from "../slices/authSlice";
import type { Project as TProject, Task as TTask } from "../types";

export interface LoginRequest {
  email: string;
  password: string;
}
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "manager" | "employee";
}

export type User = AuthUser;
export type Project = TProject;
export type Task = TTask;

export const api = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<{ token: string; user: User }, LoginRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    register: build.mutation<{ token: string; user: User }, RegisterRequest>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    // Users
    getUsers: build.query<User[], void>({
      query: () => ({ url: "/users", method: "GET" }),
      providesTags: ["User"],
    }),
    createUser: build.mutation<
      User,
      {
        name: string;
        email: string;
        password: string;
        role: "admin" | "manager" | "employee";
      }
    >({
      query: (body) => ({ url: "/users", method: "POST", body }),
      invalidatesTags: ["User"],
    }),
    updateUser: build.mutation<
      User,
      {
        id: number;
        name?: string;
        email?: string;
        password?: string;
        role?: "admin" | "manager" | "employee";
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: build.mutation<void, number>({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["User"],
    }),
    // Projects
    getProjects: build.query<Project[], void>({
      query: () => ({ url: "/projects", method: "GET" }),
      providesTags: ["Project"],
    }),
    createProject: build.mutation<
      Project,
      { name: string; description: string; owner_id?: number }
    >({
      query: (body) => ({ url: "/projects", method: "POST", body }),
      invalidatesTags: ["Project"],
    }),
    updateProject: build.mutation<
      Project,
      { id: number; name?: string; description?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/projects/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Project"],
    }),
    deleteProject: build.mutation<void, number>({
      query: (id) => ({ url: `/projects/${id}`, method: "DELETE" }),
      invalidatesTags: ["Project"],
    }),
    // Tasks
    getTasks: build.query<Task[], void>({
      query: () => ({ url: "/tasks", method: "GET" }),
      providesTags: ["Task"],
    }),
    createTask: build.mutation<
      Task,
      {
        title: string;
        description: string;
        status?: "pending" | "in_progress" | "completed";
        project_id: number;
        assigned_to: number;
      }
    >({
      query: (body) => ({ url: "/tasks", method: "POST", body }),
      invalidatesTags: ["Task"],
    }),
    updateTask: build.mutation<
      Task,
      {
        id: number;
        title?: string;
        description?: string;
        status?: "pending" | "in_progress" | "completed";
        assigned_to?: number;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/tasks/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Task"],
    }),
    deleteTask: build.mutation<void, number>({
      query: (id) => ({ url: `/tasks/${id}`, method: "DELETE" }),
      invalidatesTags: ["Task"],
    }),
    // Reorder tasks within a project
    reorderTasks: build.mutation<
      { ok: true },
      { project_id: number; ordered_ids: number[] }
    >({
      query: (body) => ({ url: "/tasks/reorder", method: "POST", body }),
      invalidatesTags: ["Task"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useReorderTasksMutation,
} = api;
