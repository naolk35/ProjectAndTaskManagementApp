import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { setupStore } from "../../store";
import LoginPage from "../LoginPage";
import * as endpoints from "../../api/endpoints";

vi.mock("../../api/endpoints");

test("renders Login form and submits", async () => {
  const store = setupStore?.();
  (endpoints as any).useLoginMutation.mockReturnValue([
    () => ({ unwrap: async () => ({ token: "t", user: { role: "admin" } }) }),
    { isLoading: false, error: null, isSuccess: true },
  ]);

  render(
    <Provider store={store}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </Provider>
  );

  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: "a@a.com" },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: "x" },
  });
  fireEvent.click(screen.getByRole("button", { name: /login/i }));

  await waitFor(() =>
    expect(screen.getByText(/logged in/i)).toBeInTheDocument()
  );
});
