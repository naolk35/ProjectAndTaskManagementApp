import { Router } from "express";
import { authRequired, requireRoles } from "../middleware/auth";
import { Project } from "../models/Project";
import { User } from "../models/User";
import { AppError } from "../middleware/error";

const router = Router();

// Create project (admin, manager)
router.post(
  "/",
  authRequired,
  requireRoles("admin", "manager"),
  async (req, res, next) => {
    try {
      const { name, description, owner_id } = req.body as {
        name: string;
        description: string;
        owner_id?: number;
      };
      if (!name || !description)
        throw new AppError("BAD_REQUEST", "Missing fields");
      const ownerId = owner_id ?? req.user!.id;
      const project = await Project.create({
        name,
        description,
        owner_id: ownerId,
      });
      return res.status(201).json(project);
    } catch (e) {
      next(e);
    }
  }
);

// List projects (any authenticated): own or all if admin/manager
router.get("/", authRequired, async (req, res, next) => {
  try {
    const isPrivileged =
      req.user!.role === "admin" || req.user!.role === "manager";
    const where = isPrivileged ? undefined : { owner_id: req.user!.id };
    const projects = await Project.findAll({ where });
    return res.json(projects);
  } catch (e) {
    next(e);
  }
});

// Get project by id
router.get("/:id", authRequired, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const project = await Project.findByPk(id);
    if (!project) throw new AppError("NOT_FOUND", "Project not found");
    const isPrivileged =
      req.user!.role === "admin" || req.user!.role === "manager";
    if (!isPrivileged && project.owner_id !== req.user!.id)
      throw new AppError("FORBIDDEN", "Forbidden");
    return res.json(project);
  } catch (e) {
    next(e);
  }
});

// Update project (owner or admin/manager)
router.put("/:id", authRequired, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const project = await Project.findByPk(id);
    if (!project) throw new AppError("NOT_FOUND", "Project not found");
    const isPrivileged =
      req.user!.role === "admin" || req.user!.role === "manager";
    if (!isPrivileged && project.owner_id !== req.user!.id)
      throw new AppError("FORBIDDEN", "Forbidden");
    const { name, description } = req.body as {
      name?: string;
      description?: string;
    };
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    await project.save();
    return res.json(project);
  } catch (e) {
    next(e);
  }
});

// Delete project (owner or admin/manager)
router.delete("/:id", authRequired, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const project = await Project.findByPk(id);
    if (!project) throw new AppError("NOT_FOUND", "Project not found");
    const isPrivileged =
      req.user!.role === "admin" || req.user!.role === "manager";
    if (!isPrivileged && project.owner_id !== req.user!.id)
      throw new AppError("FORBIDDEN", "Forbidden");
    await project.destroy();
    return res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
