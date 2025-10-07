import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "./store";
import LoginPage from "./screens/LoginPage";
import RegisterPage from "./screens/RegisterPage";
import AdminDashboard from "./screens/AdminDashboard";
import ManagerDashboard from "./screens/ManagerDashboard";
import EmployeeDashboard from "./screens/EmployeeDashboard";
import AppLayout from "./layouts/AppLayout";
import type { ReactElement } from "react";

function RequireAuth({
  children,
  roles,
}: {
  children: ReactElement;
  roles?: Array<"admin" | "manager" | "employee">;
}) {
  const auth = useSelector((s: RootState) => s.auth);
  if (!auth.token || !auth.user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(auth.user.role))
    return <Navigate to="/login" replace />;
  return children;
}

export function AppRouter() {
  const router = createBrowserRouter([
    { path: "/", element: <Navigate to="/login" replace /> },
    {
      element: <AppLayout />,
      children: [
        { path: "/login", element: <LoginPage /> },
        { path: "/register", element: <RegisterPage /> },
        {
          path: "/admin",
          element: (
            <RequireAuth roles={["admin"]}>
              <AdminDashboard />
            </RequireAuth>
          ),
        },
        {
          path: "/manager",
          element: (
            <RequireAuth roles={["admin", "manager"]}>
              <ManagerDashboard />
            </RequireAuth>
          ),
        },
        {
          path: "/employee",
          element: (
            <RequireAuth roles={["admin", "manager", "employee"]}>
              <EmployeeDashboard />
            </RequireAuth>
          ),
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}
