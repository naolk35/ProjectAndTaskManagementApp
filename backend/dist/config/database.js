"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
exports.testConnection = testConnection;
exports.ensureDatabaseAndSchema = ensureDatabaseAndSchema;
const sequelize_1 = require("sequelize");
const promise_1 = require("mysql2/promise");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const dbName = process.env.DB_NAME || "project_task_db";
const dbUser = process.env.DB_USER || "root";
const dbPass = process.env.DB_PASS || "";
const dbHost = process.env.DB_HOST || "127.0.0.1";
const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
exports.sequelize = new sequelize_1.Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    port: dbPort,
    dialect: "mysql",
    logging: false,
});
async function testConnection() {
    await exports.sequelize.authenticate();
}
async function ensureDatabaseAndSchema() {
    // Create a lightweight connection without selecting a default database
    const pool = (0, promise_1.createPool)({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPass,
        multipleStatements: true,
    });
    try {
        await pool.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        // Apply schema if present; resolve relative to backend working directory
        const schemaPath = (0, path_1.resolve)(process.cwd(), "db", "schema.sql");
        try {
            const sql = await (0, promises_1.readFile)(schemaPath, "utf8");
            if (sql && sql.trim().length > 0) {
                await pool.query(sql);
            }
        }
        catch {
            // No schema file; skip silently
        }
    }
    finally {
        await pool.end();
    }
}
//# sourceMappingURL=database.js.map