import { useState } from "react";
import { useLoginMutation } from "../api/endpoints";
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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading, error, isSuccess }] = useLoginMutation();
  const normalizedError = normalizeRtkError(error);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await login({ email, password }).unwrap();
    dispatch(setCredentials(res));
    if (res.user.role === "admin") navigate("/admin");
    else if (res.user.role === "manager") navigate("/manager");
    else navigate("/employee");
  };

  return (
    <Container>
      <div className="max-w-md mx-auto mt-16">
        <Card>
          <h2 className="text-xl font-semibold mt-0">Login</h2>
          <form onSubmit={onSubmit} className="grid gap-3">
            {normalizedError && (
              <ErrorBanner
                message={
                  normalizedError.type === "UNAUTHORIZED"
                    ? "Invalid email or password"
                    : normalizedError.type === "BAD_REQUEST"
                    ? normalizedError.message
                    : normalizedError.type === "INTERNAL"
                    ? "Server error. Please try again later."
                    : normalizedError.message
                }
              />
            )}
            {isSuccess && <SuccessBanner message="Logged in" />}
            <label className="grid gap-1">
              <span className="text-sm font-medium">Email</span>
              <input
                className="border rounded-md px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
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
            <div className="flex items-center justify-center sm:justify-end gap-2 mt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-500 min-w-28"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner /> Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </Button>
            </div>
          </form>
        </Card>
        <p className="mt-3 text-sm">
          No account?{" "}
          <Link to="/register" className="text-indigo-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </Container>
  );
}
