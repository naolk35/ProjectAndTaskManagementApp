import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";
import { validate } from "../validation/util";
import { loginSchema, registerSchema } from "../validation/auth";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = validate(registerSchema, req.body);
      const result = await AuthService.register(input);
      return res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = validate(loginSchema, req.body);
      const result = await AuthService.login(input);
      return res.json(result);
    } catch (e) {
      next(e);
    }
  }
}
