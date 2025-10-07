import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Header, Button } from "../components/ui";

export default function AppLayout() {
  const [theme, setTheme] = useState<"light" | "dark">(
    (localStorage.getItem("theme") as "light" | "dark" | null) ?? "light"
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr] bg-gray-50 dark:bg-slate-950">
      <Header>
        <Button
          onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        >
          Toggle {theme === "light" ? "Dark" : "Light"}
        </Button>
      </Header>
      <div className="grid place-items-start p-6">
        <Container>
          <Outlet />
        </Container>
      </div>
    </div>
  );
}
