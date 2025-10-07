import request from "supertest";
import { app } from "../src/index";
import { sequelize } from "../src/config/sequelize";

describe("health endpoint", () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    await sequelize.sync({ force: true });
  });
  afterAll(async () => {
    await sequelize.close();
  });
  it("returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("ok", true);
    expect(res.body).toHaveProperty("service", "backend");
  });
});
