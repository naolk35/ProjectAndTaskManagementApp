import request from "supertest";
import { app } from "../src/index";
import { sequelize } from "../src/config/sequelize";

describe("auth", () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    await sequelize.sync({ force: true });
  });
  afterAll(async () => {
    await sequelize.close();
  });

  it("registers and logs in a user", async () => {
    const register = await request(app).post("/api/auth/register").send({
      name: "Alice",
      email: "alice@example.com",
      password: "P@ssw0rd!",
      role: "admin",
    });
    expect(register.status).toBe(201);
    expect(register.body).toHaveProperty("token");
    expect(register.body).toHaveProperty("user.email", "alice@example.com");

    const login = await request(app).post("/api/auth/login").send({
      email: "alice@example.com",
      password: "P@ssw0rd!",
    });
    expect(login.status).toBe(200);
    expect(login.body).toHaveProperty("token");
    expect(login.body).toHaveProperty("user.role", "admin");
  });
});
