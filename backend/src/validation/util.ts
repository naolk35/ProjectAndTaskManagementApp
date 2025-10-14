import { ZodSchema } from "zod";
import { AppError } from "../middleware/error";

export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new AppError("BAD_REQUEST", message || "Invalid request payload");
  }
  return result.data;
}


