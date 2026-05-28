import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

function readCookieToken(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) {
    return null;
  }

  const parts = cookieHeader.split(";");

  for (const part of parts) {
    const [name, value] = part.trim().split("=");
    if (name === "token" && value) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

function readBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice(7).trim() || null;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const token =
    readBearerToken(req.headers.authorization) || readCookieToken(req.headers.cookie);

  if (!token) {
    res.status(401).json({
      success: false,
      error: { code: "unauthorized", message: "Authentication required" },
    });
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      success: false,
      error: { code: "config_error", message: "JWT_SECRET is not set" },
    });
    return;
  }

  try {
    const payload = jwt.verify(token, secret);

    if (typeof payload === "string") {
      res.status(401).json({
        success: false,
        error: { code: "unauthorized", message: "Invalid token" },
      });
      return;
    }

    const data = payload as JwtPayload;
    const userId =
      (typeof data.sub === "string" && data.sub) ||
      (typeof data.userId === "string" && data.userId) ||
      null;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: "unauthorized", message: "Invalid token" },
      });
      return;
    }

    req.userId = userId;
    next();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid token";
    res.status(401).json({
      success: false,
      error: { code: "unauthorized", message },
    });
  }
}
