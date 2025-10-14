import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "antd/dist/reset.css";
import { store } from "./store";
import { AppRouter } from "./router";
import { ThemeProvider } from "./contexts/ThemeContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
