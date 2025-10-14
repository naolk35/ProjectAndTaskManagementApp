import { Router } from "express";
// import bcrypt from "bcryptjs";
// import { User } from "../models/User";
// import { signToken } from "../middleware/auth";
// import { AppError } from "../middleware/error";
import { AuthController } from "../controllers/AuthController";

const router = Router();

// Old inline handler commented out per refactor to controller/service layers
// router.post("/register", async (req, res, next) => {
//   try {
//     const { name, email, password, role } = req.body as {
//       name: string;
//       email: string;
//       password: string;
//       role?: "admin" | "manager" | "employee";
//     };
//     if (!name || !email || !password) {
//       throw new AppError("BAD_REQUEST", "Missing required fields");
//     }
//     const existing = await User.findOne({ where: { email } });
//     if (existing) throw new AppError("CONFLICT", "Email already used");
//     const hash = await bcrypt.hash(password, 10);
//     const user = await User.create({
//       name,
//       email,
//       password: hash,
//       role: role || "employee",
//     });
//     const token = signToken({ id: user.id, role: user.role });
//     return res.status(201).json({
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (e) {
//     next(e);
//   }
// });
router.post("/register", AuthController.register);

// Old inline handler commented out per refactor
// router.post("/login", async (req, res, next) => {
//   try {
//     const { email, password } = req.body as { email: string; password: string };
//     if (!email || !password)
//       throw new AppError("BAD_REQUEST", "Missing credentials");
//     const user = await User.findOne({ where: { email } });
//     if (!user) throw new AppError("UNAUTHORIZED", "Invalid email or password");
//     const ok = await bcrypt.compare(password, user.password);
//     if (!ok) throw new AppError("UNAUTHORIZED", "Invalid email or password");
//     const token = signToken({ id: user.id, role: user.role });
//     return res.json({
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (e) {
//     next(e);
//   }
// });
router.post("/login", AuthController.login);

export default router;
