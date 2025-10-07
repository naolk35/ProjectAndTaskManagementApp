import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { setupStore } from "../../store";
import RegisterPage from "../RegisterPage";
import * as endpoints from "../../api/endpoints";

vi.mock("../../api/endpoints");

test("renders Register form and submits", async () => {
  const store = setupStore?.();
  (endpoints as any).useRegisterMutation.mockReturnValue([
    () => ({
      unwrap: async () => ({ token: "t", user: { role: "employee" } }),
    }),
    { isLoading: false, error: null, isSuccess: true },
  ]);

  render(
    <Provider store={store}>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </Provider>
  );

  fireEvent.change(screen.getByLabelText(/name/i), {
    target: { value: "Bob" },
  });
  fireEvent.change(screen.getByLabelText(/^email$/i), {
    target: { value: "b@b.com" },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: "x" },
  });
  fireEvent.click(screen.getByRole("button", { name: /register/i }));

  await waitFor(() =>
    expect(screen.getByText(/registered/i)).toBeInTheDocument()
  );
});
