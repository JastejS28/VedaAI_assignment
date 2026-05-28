import type { NextFunction, Request, Response } from "express";

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

function resolveError(err: unknown): { statusCode: number; code: string; message: string } {
  if (err && typeof err === "object") {
    const appError = err as AppError;
    const statusCode = appError.statusCode ?? 500;
    const code = appError.code ?? "server_error";
    const message = appError.message || "Unexpected error";
    return { statusCode, code, message };
  }

  return { statusCode: 500, code: "server_error", message: "Unexpected error" };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const { statusCode, code, message } = resolveError(err);

  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}
