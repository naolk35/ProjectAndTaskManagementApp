import { Task, TaskStatus } from "../models/Task";
import { Project } from "../models/Project";
import { AppError } from "../middleware/error";

export class TaskService {
  static async create(input: {
    title: string;
    description: string;
    status?: TaskStatus;
    project_id: number;
    assigned_to: number;
  }) {
    const project = await Project.findByPk(input.project_id);
    if (!project) throw new AppError("BAD_REQUEST", "Invalid project");
    const task = await Task.create({
      title: input.title,
      description: input.description,
      status: input.status || "pending",
      project_id: input.project_id,
      assigned_to: input.assigned_to,
    });
    return task;
  }

  static async listForAdmin() {
    return Task.findAll({
      order: [
        ["order_index", "ASC"],
        ["id", "ASC"],
      ],
    });
  }

  static async listForManager(owner_id: number) {
    const projects = await Project.findAll({ where: { owner_id } });
    const projectIds = projects.map((p) => p.id);
    if (projectIds.length === 0) return [] as Task[];
    return Task.findAll({
      where: { project_id: projectIds as any },
      order: [
        ["order_index", "ASC"],
        ["id", "ASC"],
      ],
    });
  }

  static async listForEmployee(user_id: number) {
    return Task.findAll({
      where: { assigned_to: user_id },
      order: [
        ["order_index", "ASC"],
        ["id", "ASC"],
      ],
    });
  }

  static async getById(id: number) {
    const task = await Task.findByPk(id);
    if (!task) throw new AppError("NOT_FOUND", "Task not found");
    return task;
  }

  static async update(
    id: number,
    input: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      assigned_to?: number;
    }
  ) {
    const task = await Task.findByPk(id);
    if (!task) throw new AppError("NOT_FOUND", "Task not found");
    if (input.title !== undefined) task.title = input.title;
    if (input.description !== undefined) task.description = input.description;
    if (input.status !== undefined) task.status = input.status;
    if (input.assigned_to !== undefined) task.assigned_to = input.assigned_to;
    await task.save();
    return task;
  }

  static async remove(id: number) {
    const task = await Task.findByPk(id);
    if (!task) throw new AppError("NOT_FOUND", "Task not found");
    await task.destroy();
  }

  static async reorder(project_id: number, ordered_ids: number[]) {
    let idx = 1;
    for (const id of ordered_ids) {
      await Task.update({ order_index: idx++ }, { where: { id, project_id } });
    }
    return { ok: true };
  }
}
