"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const sequelize_1 = require("./config/sequelize");
const auth_1 = __importDefault(require("./routes/auth"));
const projects_1 = __importDefault(require("./routes/projects"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const users_1 = __importDefault(require("./routes/users"));
const error_1 = require("./middleware/error");
const requestLogger_1 = require("./middleware/requestLogger");
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.use(requestLogger_1.requestLogger);
exports.app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "backend", time: new Date().toISOString() });
});
exports.app.use("/api/auth", auth_1.default);
exports.app.use("/api/users", users_1.default);
exports.app.use("/api/projects", projects_1.default);
exports.app.use("/api/tasks", tasks_1.default);
// 404 for unknown routes
exports.app.use(error_1.notFoundHandler);
// Centralized error handler
exports.app.use(error_1.errorHandler);
async function start() {
    try {
        await (0, sequelize_1.testConnection)();
        console.log("Database connection OK");
        await sequelize_1.sequelize.sync({ alter: true });
        console.log("Database schema synced (alter)");
    }
    catch (err) {
        console.error("Database init failed", err);
        process.exit(1);
    }
    const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
    exports.app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
// Only start server if run directly (not during tests)
if (require.main === module) {
    start();
}
//# sourceMappingURL=index.js.map