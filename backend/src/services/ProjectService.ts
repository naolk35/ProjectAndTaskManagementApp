import { Project } from "../models/Project";
import { AppError } from "../middleware/error";

export class ProjectService {
  static async create(input: {
    name: string;
    description: string;
    owner_id: number;
  }) {
    const project = await Project.create({
      name: input.name,
      description: input.description,
      owner_id: input.owner_id,
    });
    return project;
  }

  static async list(options?: { owner_id?: number }) {
    if (options?.owner_id) {
      return Project.findAll({ where: { owner_id: options.owner_id } });
    }
    return Project.findAll();
  }

  static async getById(id: number) {
    const project = await Project.findByPk(id);
    if (!project) throw new AppError("NOT_FOUND", "Project not found");
    return project;
  }

  static async update(
    id: number,
    input: { name?: string | undefined; description?: string | undefined }
  ) {
    const project = await Project.findByPk(id);
    if (!project) throw new AppError("NOT_FOUND", "Project not found");
    if (input.name !== undefined) project.name = input.name;
    if (input.description !== undefined)
      project.description = input.description;
    await project.save();
    return project;
  }

  static async remove(id: number) {
    const project = await Project.findByPk(id);
    if (!project) throw new AppError("NOT_FOUND", "Project not found");
    await project.destroy();
  }
}
