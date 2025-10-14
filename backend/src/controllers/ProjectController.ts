import { Request, Response, NextFunction } from "express";
import { ProjectService } from "../services/ProjectService";
import { validate } from "../validation/util";
import {
  createProjectSchema,
  projectIdParamSchema,
  updateProjectSchema,
} from "../validation/projects";

export class ProjectController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = validate(createProjectSchema, req.body);
      const ownerId = body.owner_id ?? req.user!.id;
      const project = await ProjectService.create({
        name: body.name,
        description: body.description,
        owner_id: ownerId,
      });
      return res.status(201).json(project);
    } catch (e) {
      next(e);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const isPrivileged =
        req.user!.role === "admin" || req.user!.role === "manager";
      const projects = await ProjectService.list(
        isPrivileged ? undefined : { owner_id: req.user!.id }
      );
      return res.json(projects);
    } catch (e) {
      next(e);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = validate(projectIdParamSchema, req.params);
      const project = await ProjectService.getById(id);
      const isPrivileged =
        req.user!.role === "admin" || req.user!.role === "manager";
      if (!isPrivileged && project.owner_id !== req.user!.id) {
        return res
          .status(403)
          .json({ type: "FORBIDDEN", message: "Forbidden" });
      }
      return res.json(project);
    } catch (e) {
      next(e);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = validate(projectIdParamSchema, req.params);
      const project = await ProjectService.getById(id);
      const isPrivileged =
        req.user!.role === "admin" || req.user!.role === "manager";
      if (!isPrivileged && project.owner_id !== req.user!.id) {
        return res
          .status(403)
          .json({ type: "FORBIDDEN", message: "Forbidden" });
      }
      const input = validate(updateProjectSchema, req.body);
      const updated = await ProjectService.update(id, input);
      return res.json(updated);
    } catch (e) {
      next(e);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = validate(projectIdParamSchema, req.params);
      const project = await ProjectService.getById(id);
      const isPrivileged =
        req.user!.role === "admin" || req.user!.role === "manager";
      if (!isPrivileged && project.owner_id !== req.user!.id) {
        return res
          .status(403)
          .json({ type: "FORBIDDEN", message: "Forbidden" });
      }
      await ProjectService.remove(id);
      return res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
}
