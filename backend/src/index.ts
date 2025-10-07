import "dotenv/config";
import express from "express";
import cors from "cors";
import { testConnection, sequelize } from "./config/sequelize";
import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";
import taskRoutes from "./routes/tasks";
import userRoutes from "./routes/users";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { requestLogger } from "./middleware/requestLogger";

export const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "backend", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// 404 for unknown routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

async function start() {
  try {
    await testConnection();
    console.log("Database connection OK");
    await sequelize.sync({ alter: true });
    console.log("Database schema synced (alter)");
  } catch (err) {
    console.error("Database init failed", err);
    process.exit(1);
  }

  const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only start server if run directly (not during tests)
if (require.main === module) {
  start();
}
