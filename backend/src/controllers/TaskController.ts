import { Request, Response, NextFunction } from "express";
import { TaskService } from "../services/TaskService";
import { Project } from "../models/Project";
import { validate } from "../validation/util";
import {
  createTaskSchema,
  reorderTasksSchema,
  taskIdParamSchema,
  updateTaskSchema,
} from "../validation/tasks";

export class TaskController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = validate(createTaskSchema, req.body);
      const project = await Project.findByPk(body.project_id);
      if (!project)
        return res
          .status(400)
          .json({ type: "BAD_REQUEST", message: "Invalid project" });
      const isAdmin = req.user!.role === "admin";
      const isManagerOwner =
        req.user!.role === "manager" && project.owner_id === req.user!.id;
      if (!isAdmin && !isManagerOwner)
        return res
          .status(403)
          .json({ type: "FORBIDDEN", message: "Forbidden" });
      const task = await TaskService.create(body);
      return res.status(201).json(task);
    } catch (e) {
      next(e);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user!.role === "admin") {
        const tasks = await TaskService.listForAdmin();
        return res.json(tasks);
      }
      if (req.user!.role === "manager") {
        const tasks = await TaskService.listForManager(req.user!.id);
        return res.json(tasks);
      }
      const tasks = await TaskService.listForEmployee(req.user!.id);
      return res.json(tasks);
    } catch (e) {
      next(e);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = validate(taskIdParamSchema, req.params);
      const task = await TaskService.getById(id);
      if (req.user!.role === "admin") return res.json(task);
      if (req.user!.role === "manager") {
        const project = await Project.findByPk(task.project_id);
        if (project && project.owner_id === req.user!.id) return res.json(task);
        return res
          .status(403)
          .json({ type: "FORBIDDEN", message: "Forbidden" });
      }
      if (task.assigned_to !== req.user!.id)
        return res
          .status(403)
          .json({ type: "FORBIDDEN", message: "Forbidden" });
      return res.json(task);
    } catch (e) {
      next(e);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = validate(taskIdParamSchema, req.params);
      const task = await TaskService.getById(id);
      const isAdmin = req.user!.role === "admin";
      const isManagerOwner =
        req.user!.role === "manager" &&
        (await Project.findByPk(task.project_id))?.owner_id === req.user!.id;
      const isAssigneeEmployee =
        req.user!.role === "employee" && task.assigned_to === req.user!.id;
      if (!isAdmin && !isManagerOwner && !isAssigneeEmployee) {
        return res
          .status(403)
          .json({ type: "FORBIDDEN", message: "Forbidden" });
      }
      if (isAssigneeEmployee) {
        const { status } = validate(
          updateTaskSchema.pick({ status: true }),
          req.body
        );
        if (status === undefined)
          return res.status(400).json({
            type: "BAD_REQUEST",
            message: "Only status can be updated by assignee",
          });
        const updated = await TaskService.update(id, { status });
        return res.json(updated);
      }
      const input = validate(updateTaskSchema, req.body);
      const updated = await TaskService.update(id, input);
      return res.json(updated);
    } catch (e) {
      next(e);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = validate(taskIdParamSchema, req.params);
      const task = await TaskService.getById(id);
      const project = await Project.findByPk(task.project_id);
      const isAdmin = req.user!.role === "admin";
      const isManagerOwner =
        req.user!.role === "manager" && project?.owner_id === req.user!.id;
      if (!isAdmin && !isManagerOwner)
        return res
          .status(403)
          .json({ type: "FORBIDDEN", message: "Forbidden" });
      await TaskService.remove(id);
      return res.status(204).send();
    } catch (e) {
      next(e);
    }
  }

  static async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const { project_id, ordered_ids } = validate(
        reorderTasksSchema,
        req.body
      );
      const project = await Project.findByPk(project_id);
      if (!project)
        return res
          .status(400)
          .json({ type: "BAD_REQUEST", message: "Invalid project" });
      const isAdmin = req.user!.role === "admin";
      const isManagerOwner =
        req.user!.role === "manager" && project.owner_id === req.user!.id;
      if (!isAdmin && !isManagerOwner)
        return res
          .status(403)
          .json({ type: "FORBIDDEN", message: "Forbidden" });
      const result = await TaskService.reorder(project_id, ordered_ids);
      return res.json(result);
    } catch (e) {
      next(e);
    }
  }
}
