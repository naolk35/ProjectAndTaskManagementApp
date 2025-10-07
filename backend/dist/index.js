"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_js_1 = require("./config/database.js");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "backend", time: new Date().toISOString() });
});
async function start() {
    try {
        await (0, database_js_1.testConnection)();
        console.log("Database connection OK");
    }
    catch (err) {
        console.error("Database init failed", err);
        process.exit(1);
    }
    const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
start();
//# sourceMappingURL=index.js.map