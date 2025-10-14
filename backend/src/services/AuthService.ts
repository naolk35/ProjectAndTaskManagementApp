import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { AppError } from "../middleware/error";
import { signToken } from "../middleware/auth";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "manager" | "employee";
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  static async register(input: RegisterInput) {
    const existing = await User.findOne({ where: { email: input.email } });
    if (existing) throw new AppError("CONFLICT", "Email already used");

    const hash = await bcrypt.hash(input.password, 10);
    const user = await User.create({
      name: input.name,
      email: input.email,
      password: hash,
      role: input.role || "employee",
    });
    const token = signToken({ id: user.id, role: user.role });
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async login(input: LoginInput) {
    const user = await User.findOne({ where: { email: input.email } });
    if (!user) throw new AppError("UNAUTHORIZED", "Invalid email or password");
    const ok = await bcrypt.compare(input.password, user.password);
    if (!ok) throw new AppError("UNAUTHORIZED", "Invalid email or password");
    const token = signToken({ id: user.id, role: user.role });
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
