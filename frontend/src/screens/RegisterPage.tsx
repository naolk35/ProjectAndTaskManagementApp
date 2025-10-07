import { useState } from "react";
import { useRegisterMutation } from "../api/endpoints";
import { normalizeRtkError } from "../api/baseApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  ErrorBanner,
  Spinner,
  SuccessBanner,
} from "../components/ui";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "manager" | "employee">(
    "employee"
  );
  const [register, { isLoading, error, isSuccess }] = useRegisterMutation();
  const normalizedError = normalizeRtkError(error);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await register({ name, email, password, role }).unwrap();
    dispatch(setCredentials(res));
    if (res.user.role === "admin") navigate("/admin");
    else if (res.user.role === "manager") navigate("/manager");
    else navigate("/employee");
  };

  return (
    <Container>
      <div className="max-w-lg mx-auto mt-16">
        <Card>
          <h2 className="text-xl font-semibold mt-0">Register</h2>
          <form onSubmit={onSubmit} className="grid gap-3">
            {normalizedError && (
              <ErrorBanner
                message={
                  normalizedError.type === "CONFLICT"
                    ? "Email is already in use"
                    : normalizedError.type === "BAD_REQUEST" ||
                      normalizedError.type === "VALIDATION_ERROR"
                    ? normalizedError.message
                    : normalizedError.type === "INTERNAL"
                    ? "Server error. Please try again later."
                    : normalizedError.message
                }
              />
            )}
            {isSuccess && <SuccessBanner message="Registered successfully" />}
            <label className="grid gap-1">
              <span className="text-sm font-medium">Name</span>
              <input
                className="border rounded-md px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Email</span>
              <input
                className="border rounded-md px-3 py-2"
                value={email}
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Password</span>
              <input
                className="border rounded-md px-3 py-2"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Role</span>
              <select
                className="border rounded-md px-3 py-2"
                value={role}
                onChange={(e) => setRole(e.target.value as typeof role)}
              >
                <option value="employee">Employee</option>
                <option value="manager">Project Manager</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <div className="flex items-center justify-center sm:justify-end gap-2 mt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-500 min-w-32"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner /> Registering...
                  </span>
                ) : (
                  "Register"
                )}
              </Button>
            </div>
          </form>
        </Card>
        <p className="mt-3 text-sm">
          Have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </Container>
  );
}
