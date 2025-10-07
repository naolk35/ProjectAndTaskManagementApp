import { Sequelize } from "sequelize";

const dbName = process.env.DB_NAME || "project_task_db";
const dbUser = process.env.DB_USER || "root";
const dbPass = process.env.DB_PASS || "";
const dbHost = process.env.DB_HOST || "127.0.0.1";
const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

export const sequelize =
  process.env.NODE_ENV === "test"
    ? new Sequelize({ dialect: "sqlite", storage: ":memory:", logging: false })
    : new Sequelize(dbName, dbUser, dbPass, {
        host: dbHost,
        port: dbPort,
        dialect: "mysql",
        logging: false,
      });

export async function testConnection(): Promise<void> {
  await sequelize.authenticate();
}
