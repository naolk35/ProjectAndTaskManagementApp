import { Router } from "express";
import { authRequired } from "../middleware/auth";
import { Task } from "../models/Task";
import { Project } from "../models/Project";
import { AppError } from "../middleware/error";

const router = Router();

// Create task: must belong to a project; owner of project or admin/manager can create
router.post("/", authRequired, async (req, res, next) => {
  try {
    const { title, description, status, project_id, assigned_to } =
      req.body as {
        title: string;
        description: string;
        status?: "pending" | "in_progress" | "completed";
        project_id: number;
        assigned_to: number;
      };
    if (!title || !description || !project_id || !assigned_to)
      throw new AppError("BAD_REQUEST", "Missing fields");
    const project = await Project.findByPk(project_id);
    if (!project) throw new AppError("BAD_REQUEST", "Invalid project");
    // Only admin, or project manager who owns the project
    const isAdmin = req.user!.role === "admin";
    const isManagerOwner =
      req.user!.role === "manager" && project.owner_id === req.user!.id;
    if (!isAdmin && !isManagerOwner)
      throw new AppError("FORBIDDEN", "Forbidden");
    const task = await Task.create({
      title,
      description,
      status: status || "pending",
      project_id,
      assigned_to,
    });
    return res.status(201).json(task);
  } catch (e) {
    next(e);
  }
});

// List tasks: if admin/manager -> all; else tasks for projects owned by user or assigned to user
router.get("/", authRequired, async (req, res, next) => {
  try {
    if (req.user!.role === "admin") {
      const tasks = await Task.findAll({
        order: [
          ["order_index", "ASC"],
          ["id", "ASC"],
        ],
      });
      return res.json(tasks);
    }
    if (req.user!.role === "manager") {
      // Tasks within manager's own projects
      const projects = await Project.findAll({
        where: { owner_id: req.user!.id },
      });
      const projectIds = projects.map((p) => p.id);
      if (projectIds.length === 0) return res.json([]);
      const tasks = await Task.findAll({
        where: { project_id: projectIds as any },
        order: [
          ["order_index", "ASC"],
          ["id", "ASC"],
        ],
      });
      return res.json(tasks);
    }
    // Employee: tasks assigned to them
    const tasks = await Task.findAll({
      where: { assigned_to: req.user!.id },
      order: [
        ["order_index", "ASC"],
        ["id", "ASC"],
      ],
    });
    return res.json(tasks);
  } catch (e) {
    next(e);
  }
});

// Get task by id: must be assigned to user, or project owner, or admin/manager
router.get("/:id", authRequired, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const task = await Task.findByPk(id);
    if (!task) throw new AppError("NOT_FOUND", "Task not found");
    if (req.user!.role === "admin") return res.json(task);
    if (req.user!.role === "manager") {
      const project = await Project.findByPk(task.project_id);
      if (project && project.owner_id === req.user!.id) return res.json(task);
      throw new AppError("FORBIDDEN", "Forbidden");
    }
    if (task.assigned_to !== req.user!.id)
      throw new AppError("FORBIDDEN", "Forbidden");
    return res.json(task);
  } catch (e) {
    next(e);
  }
});

// Update task: assignee or admin/manager
router.put("/:id", authRequired, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const task = await Task.findByPk(id);
    if (!task) throw new AppError("NOT_FOUND", "Task not found");
    const isAdmin = req.user!.role === "admin";
    const isManagerOwner =
      req.user!.role === "manager" &&
      (await Project.findByPk(task.project_id))?.owner_id === req.user!.id;
    const isAssigneeEmployee =
      req.user!.role === "employee" && task.assigned_to === req.user!.id;

    if (!isAdmin && !isManagerOwner && !isAssigneeEmployee) {
      throw new AppError("FORBIDDEN", "Forbidden");
    }
    const { title, description, status, assigned_to } = req.body as {
      title?: string;
      description?: string;
      status?: "pending" | "in_progress" | "completed";
      assigned_to?: number;
    };
    if (isAdmin || isManagerOwner) {
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
      if (assigned_to !== undefined) task.assigned_to = assigned_to;
    } else {
      // Employee (assignee) can only update status
      if (status === undefined) {
        throw new AppError(
          "BAD_REQUEST",
          "Only status can be updated by assignee"
        );
      }
      task.status = status;
    }
    await task.save();
    return res.json(task);
  } catch (e) {
    next(e);
  }
});

// Delete task: assignee or admin/manager
router.delete("/:id", authRequired, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const task = await Task.findByPk(id);
    if (!task) throw new AppError("NOT_FOUND", "Task not found");
    const project = await Project.findByPk(task.project_id);
    const isAdmin = req.user!.role === "admin";
    const isManagerOwner =
      req.user!.role === "manager" && project?.owner_id === req.user!.id;
    if (!isAdmin && !isManagerOwner)
      throw new AppError("FORBIDDEN", "Forbidden");
    await task.destroy();
    return res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
// Bulk reorder tasks within a project (admin or project owner)
router.post("/reorder", authRequired, async (req, res, next) => {
  try {
    const { project_id, ordered_ids } = req.body as {
      project_id: number;
      ordered_ids: number[];
    };
    if (!project_id || !Array.isArray(ordered_ids)) {
      throw new AppError(
        "BAD_REQUEST",
        "project_id and ordered_ids are required"
      );
    }
    const project = await Project.findByPk(project_id);
    if (!project) throw new AppError("BAD_REQUEST", "Invalid project");
    const isAdmin = req.user!.role === "admin";
    const isManagerOwner =
      req.user!.role === "manager" && project.owner_id === req.user!.id;
    if (!isAdmin && !isManagerOwner)
      throw new AppError("FORBIDDEN", "Forbidden");
    // write order_index sequentially
    let idx = 1;
    for (const id of ordered_ids) {
      await Task.update({ order_index: idx++ }, { where: { id, project_id } });
    }
    return res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
