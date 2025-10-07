import type { Request, Response, NextFunction } from "express";

export type ErrorType =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "INTERNAL";

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(
    type: ErrorType,
    message: string,
    options?: { status?: number; details?: unknown }
  ) {
    super(message);
    this.type = type;
    this.status = options?.status ?? AppError.mapTypeToStatus(type);
    this.details = options?.details;
  }

  static mapTypeToStatus(type: ErrorType): number {
    switch (type) {
      case "BAD_REQUEST":
      case "VALIDATION_ERROR":
        return 400;
      case "UNAUTHORIZED":
        return 401;
      case "FORBIDDEN":
        return 403;
      case "NOT_FOUND":
        return 404;
      case "CONFLICT":
        return 409;
      default:
        return 500;
    }
  }
}

export function notFoundHandler(req: Request, res: Response) {
  const payload = buildErrorPayload({
    type: "NOT_FOUND",
    message: "Route not found",
    status: 404,
    path: req.originalUrl,
  });
  res.status(404).json(payload);
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Normalize
  const appError = normalizeError(err);
  const payload = buildErrorPayload({
    type: appError.type,
    message: appError.message,
    status: appError.status,
    path: req.originalUrl,
    details: (appError as any).details,
  });

  // eslint-disable-next-line no-console
  if (appError.status >= 500) console.error("Unhandled error:", err);
  res.status(appError.status).json(payload);
}

function normalizeError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  if (isSequelizeUniqueConstraintError(err)) {
    return new AppError("CONFLICT", "Resource already exists", {
      details: { fields: err.errors?.map((e: any) => e.path) ?? [] },
    });
  }
  if (isSequelizeValidationError(err)) {
    return new AppError("VALIDATION_ERROR", "Validation failed", {
      details: {
        errors: err.errors?.map((e: any) => ({
          path: e.path,
          message: e.message,
          value: e.value,
        })),
      },
    });
  }
  if (err && typeof err === "object" && "status" in err && "message" in err) {
    const anyErr = err as { status?: number; message?: string };
    const status = anyErr.status ?? 500;
    return new AppError(statusToType(status), anyErr.message || "Error", {
      status,
    });
  }
  if (err instanceof Error) {
    return new AppError("INTERNAL", err.message);
  }
  return new AppError("INTERNAL", "Unexpected error");
}

function statusToType(status: number): ErrorType {
  if (status === 400) return "BAD_REQUEST";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status >= 500) return "INTERNAL";
  return "BAD_REQUEST";
}

function buildErrorPayload(input: {
  type: ErrorType;
  message: string;
  status: number;
  path?: string;
  details?: unknown;
}) {
  return {
    error: {
      type: input.type,
      message: input.message,
      status: input.status,
      path: input.path,
      details: input.details,
      timestamp: new Date().toISOString(),
    },
  };
}

function isSequelizeValidationError(err: unknown): any {
  return (
    err &&
    typeof err === "object" &&
    (err as any).name === "SequelizeValidationError"
  );
}

function isSequelizeUniqueConstraintError(err: unknown): any {
  return (
    err &&
    typeof err === "object" &&
    (err as any).name === "SequelizeUniqueConstraintError"
  );
}




