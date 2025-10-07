import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");
  const [payload, setPayload] = useState<unknown>(null);
  const [theme, setTheme] = useState<"light" | "dark">(
    (localStorage.getItem("theme") as "light" | "dark" | null) ?? "light"
  );

  useEffect(() => {
    const run = async () => {
      setStatus("loading");
      const baseUrl = import.meta.env.VITE_API_BASE || "http://localhost:4000";
      try {
        const res = await axios.get(`${baseUrl}/health`, { timeout: 5000 });
        setPayload(res.data);
        // Log for debugging
        // console.log("/health response:", res.status, res.data);
        const okVal = (res.data as { ok?: boolean | string })?.ok;
        if (okVal === true || okVal === "true") {
          setStatus("success");
          setMessage("Backend connection successful");
        } else {
          setStatus("error");
          setMessage("Backend responded but did not confirm ok");
        }
      } catch {
        setStatus("error");
        setMessage("Failed to connect to backend");
      }
    };
    run();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ position: "fixed", top: 8, right: 8 }}>
        <button
          onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        >
          Toggle {theme === "light" ? "Dark" : "Light"}
        </button>
      </div>
      <h1>Backend Connection Check</h1>
      {status === "idle" && <p>Idle</p>}
      {status === "loading" && <p>Checking connection...</p>}
      {status === "success" && (
        <p style={{ color: "green", fontWeight: 600 }}>Success: {message}</p>
      )}
      {status === "error" && (
        <p style={{ color: "crimson", fontWeight: 600 }}>Error: {message}</p>
      )}
      {Boolean(payload) && (
        <pre style={{ marginTop: 12, background: "#f6f8fa", padding: 12 }}>
          {JSON.stringify(payload, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;
