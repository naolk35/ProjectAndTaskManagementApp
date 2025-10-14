import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/UserService";
import { validate } from "../validation/util";
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from "../validation/users";

export class UserController {
  static async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.listAll();
      return res.json(users);
    } catch (e) {
      next(e);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = validate(createUserSchema, req.body);
      const user = await UserService.create(input);
      return res.status(201).json(user);
    } catch (e) {
      next(e);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = validate(userIdParamSchema, req.params);
      const input = validate(updateUserSchema, req.body);
      const user = await UserService.update(id, input);
      return res.json(user);
    } catch (e) {
      next(e);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = validate(userIdParamSchema, req.params);
      await UserService.remove(id);
      return res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
}
