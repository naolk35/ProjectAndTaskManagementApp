import request from "supertest";
import { app } from "../src/index";
import { sequelize } from "../src/config/sequelize";

async function adminToken() {
  const reg = await request(app).post("/api/auth/register").send({
    name: "Admin",
    email: "admin@example.com",
    password: "adminpass",
    role: "admin",
  });
  return reg.body.token as string;
}

describe("users CRUD (admin)", () => {
  let token: string;
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    await sequelize.sync({ force: true });
    token = await adminToken();
  });
  afterAll(async () => {
    await sequelize.close();
  });

  it("creates, lists, updates, and deletes users", async () => {
    const create = await request(app)
      .post("/api/users")
      .set("authorization", `Bearer ${token}`)
      .send({
        name: "Bob",
        email: "bob@example.com",
        password: "bobpass",
        role: "employee",
      });
    expect(create.status).toBe(201);
    const userId = create.body.id as number;

    const list = await request(app)
      .get("/api/users")
      .set("authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(
      list.body.find((u: any) => u.email === "bob@example.com")
    ).toBeTruthy();

    const update = await request(app)
      .put(`/api/users/${userId}`)
      .set("authorization", `Bearer ${token}`)
      .send({ name: "Bobby" });
    expect(update.status).toBe(200);
    expect(update.body.name).toBe("Bobby");

    const del = await request(app)
      .delete(`/api/users/${userId}`)
      .set("authorization", `Bearer ${token}`);
    expect(del.status).toBe(204);
  });
});
