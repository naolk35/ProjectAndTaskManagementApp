import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  owner_id: z.number().int().positive().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
});

export const projectIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateProjectDTO = z.infer<typeof createProjectSchema>;
export type UpdateProjectDTO = z.infer<typeof updateProjectSchema>;


