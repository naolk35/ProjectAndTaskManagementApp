import { z } from "zod";

export const taskStatusEnum = z.enum(["pending", "in_progress", "completed"]);

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  status: taskStatusEnum.optional(),
  project_id: z.coerce.number().int().positive(),
  assigned_to: z.coerce.number().int().positive(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: taskStatusEnum.optional(),
  assigned_to: z.coerce.number().int().positive().optional(),
});

export const taskIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const reorderTasksSchema = z.object({
  project_id: z.coerce.number().int().positive(),
  ordered_ids: z.array(z.coerce.number().int().positive()).min(1),
});

export type CreateTaskDTO = z.infer<typeof createTaskSchema>;
export type UpdateTaskDTO = z.infer<typeof updateTaskSchema>;
export type ReorderTasksDTO = z.infer<typeof reorderTasksSchema>;


