import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { AppError } from "../middleware/error";

export class UserService {
  static async listAll() {
    return User.findAll({
      attributes: ["id", "name", "email", "role", "createdAt", "updatedAt"],
    });
  }

  static async create(input: {
    name: string;
    email: string;
    password: string;
    role: "admin" | "manager" | "employee";
  }) {
    const existing = await User.findOne({ where: { email: input.email } });
    if (existing) throw new AppError("CONFLICT", "Email already used");
    const hash = await bcrypt.hash(input.password, 10);
    const user = await User.create({
      name: input.name,
      email: input.email,
      password: hash,
      role: input.role,
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static async update(
    id: number,
    input: {
      name?: string | undefined;
      email?: string | undefined;
      password?: string | undefined;
      role?: "admin" | "manager" | "employee" | undefined;
    }
  ) {
    const user = await User.findByPk(id);
    if (!user) throw new AppError("NOT_FOUND", "User not found");
    if (input.name !== undefined) user.name = input.name;
    if (input.email !== undefined) user.email = input.email;
    if (input.role !== undefined) user.role = input.role;
    if (input.password !== undefined && input.password.trim().length > 0) {
      user.password = await bcrypt.hash(input.password, 10);
    }
    await user.save();
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static async remove(id: number) {
    const user = await User.findByPk(id);
    if (!user) throw new AppError("NOT_FOUND", "User not found");
    await user.destroy();
  }
}
