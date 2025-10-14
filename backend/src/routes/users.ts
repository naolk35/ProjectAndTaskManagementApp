import { Router } from "express";
// import bcrypt from "bcryptjs";
import { authRequired, requireRoles } from "../middleware/auth";
// import { User } from "../models/User";
// import { AppError } from "../middleware/error";
import { UserController } from "../controllers/UserController";

const router = Router();

// List all users (admin only)
// Old inline handler commented out per refactor
// router.get(
//   "/",
//   authRequired,
//   requireRoles("admin"),
//   async (_req, res, next) => {
//     try {
//       const users = await User.findAll({
//         attributes: ["id", "name", "email", "role", "createdAt", "updatedAt"],
//       });
//       return res.json(users);
//     } catch (e) {
//       next(e);
//     }
//   }
// );
router.get("/", authRequired, requireRoles("admin"), UserController.list);

// Create user (admin only)
// Old inline handler commented out per refactor
// router.post(
//   "/",
//   authRequired,
//   requireRoles("admin"),
//   async (req, res, next) => {
//     try {
//       const { name, email, password, role } = req.body as {
//         name: string;
//         email: string;
//         password: string;
//         role: "admin" | "manager" | "employee";
//       };
//       if (!name || !email || !password || !role) {
//         throw new AppError("BAD_REQUEST", "Missing required fields");
//       }
//       const existing = await User.findOne({ where: { email } });
//       if (existing) throw new AppError("CONFLICT", "Email already used");
//       const hash = await bcrypt.hash(password, 10);
//       const user = await User.create({ name, email, password: hash, role });
//       return res.status(201).json({
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         createdAt: user.createdAt,
//         updatedAt: user.updatedAt,
//       });
//     } catch (e) {
//       next(e);
//     }
//   }
// );
router.post("/", authRequired, requireRoles("admin"), UserController.create);

// Update user (admin only)
// Old inline handler commented out per refactor
// router.put(
//   "/:id",
//   authRequired,
//   requireRoles("admin"),
//   async (req, res, next) => {
//     try {
//       const id = Number(req.params.id);
//       const user = await User.findByPk(id);
//       if (!user) throw new AppError("NOT_FOUND", "User not found");
//       const { name, email, password, role } = req.body as {
//         name?: string;
//         email?: string;
//         password?: string;
//         role?: "admin" | "manager" | "employee";
//       };
//       if (name !== undefined) user.name = name;
//       if (email !== undefined) user.email = email;
//       if (role !== undefined) user.role = role;
//       if (password !== undefined && password.trim().length > 0) {
//         user.password = await bcrypt.hash(password, 10);
//       }
//       await user.save();
//       return res.json({
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         createdAt: user.createdAt,
//         updatedAt: user.updatedAt,
//       });
//     } catch (e) {
//       next(e);
//     }
//   }
// );
router.put("/:id", authRequired, requireRoles("admin"), UserController.update);

// Delete user (admin only)
// Old inline handler commented out per refactor
// router.delete(
//   "/:id",
//   authRequired,
//   requireRoles("admin"),
//   async (req, res, next) => {
//     try {
//       const id = Number(req.params.id);
//       const user = await User.findByPk(id);
//       if (!user) throw new AppError("NOT_FOUND", "User not found");
//       await user.destroy();
//       return res.status(204).send();
//     } catch (e) {
//       next(e);
//     }
//   }
// );
router.delete(
  "/:id",
  authRequired,
  requireRoles("admin"),
  UserController.remove
);

export default router;
