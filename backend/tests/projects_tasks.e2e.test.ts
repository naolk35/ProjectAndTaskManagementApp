import request from "supertest";
import { app } from "../src/index";
import { sequelize } from "../src/config/sequelize";

describe("projects and tasks", () => {
  let adminToken: string;
  let managerToken: string;
  let employeeToken: string;
  let projectId: number;
  let taskId: number;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    await sequelize.sync({ force: true });
    adminToken = (
      await request(app).post("/api/auth/register").send({
        name: "Admin",
        email: "admin@example.com",
        password: "adminpass",
        role: "admin",
      })
    ).body.token;
    managerToken = (
      await request(app).post("/api/auth/register").send({
        name: "Manager",
        email: "manager@example.com",
        password: "managerpass",
        role: "manager",
      })
    ).body.token;
    employeeToken = (
      await request(app).post("/api/auth/register").send({
        name: "Emp",
        email: "emp@example.com",
        password: "emppass",
        role: "employee",
      })
    ).body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("admin creates project, manager creates task, reorder, and employee updates status", async () => {
    const proj = await request(app)
      .post("/api/projects")
      .set("authorization", `Bearer ${adminToken}`)
      .send({ name: "P1", description: "Proj 1" });
    expect(proj.status).toBe(201);
    projectId = proj.body.id;

    const task = await request(app)
      .post("/api/tasks")
      .set("authorization", `Bearer ${managerToken}`)
      .send({
        title: "T1",
        description: "Task 1",
        project_id: projectId,
        assigned_to: 3,
      });
    expect(task.status).toBe(201);
    taskId = task.body.id;

    const listBefore = await request(app)
      .get("/api/tasks")
      .set("authorization", `Bearer ${adminToken}`);
    expect(listBefore.status).toBe(200);

    const reorder = await request(app)
      .post("/api/tasks/reorder")
      .set("authorization", `Bearer ${adminToken}`)
      .send({
        project_id: projectId,
        ordered_ids: listBefore.body.map((t: any) => t.id),
      });
    expect(reorder.status).toBe(200);

    const empUpdate = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("authorization", `Bearer ${employeeToken}`)
      .send({ status: "in_progress" });
    expect(empUpdate.status).toBe(200);
    expect(empUpdate.body.status).toBe("in_progress");
  });
});
