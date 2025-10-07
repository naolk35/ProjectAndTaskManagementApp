import "dotenv/config";
import express from "express";
import cors from "cors";
import { testConnection } from "./config/database.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "backend", time: new Date().toISOString() });
});

async function start() {
  try {
    await testConnection();
    console.log("Database connection OK");
  } catch (err) {
    console.error("Database init failed", err);
    process.exit(1);
  }

  const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();

