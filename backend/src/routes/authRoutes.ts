import { Router, type Request, type Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { loginUser, registerUser } from "../services/authService";

const router = Router();

interface RegisterBody {
  name?: string;
  email?: string;
  password?: string;
  schoolName?: string;
  city?: string;
  avatarId?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function setAuthCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

router.post(
  "/register",
  asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as RegisterBody;

    if (
      !isNonEmptyString(body.name) ||
      !isNonEmptyString(body.email) ||
      !isNonEmptyString(body.password) ||
      !isNonEmptyString(body.schoolName) ||
      !isNonEmptyString(body.city)
    ) {
      res.status(400).json({
        success: false,
        error: { code: "validation_error", message: "Missing required fields" },
      });
      return;
    }

    const result = await registerUser({
      name: body.name.trim(),
      email: body.email.trim(),
      password: body.password,
      schoolName: body.schoolName.trim(),
      city: body.city.trim(),
      avatarId: isNonEmptyString(body.avatarId) ? body.avatarId.trim() : undefined,
    });

    setAuthCookie(res, result.token);
    res.status(201).json({ success: true, user: result.user });
  })
);

router.post(
  "/login",
  asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as LoginBody;

    if (!isNonEmptyString(body.email) || !isNonEmptyString(body.password)) {
      res.status(400).json({
        success: false,
        error: { code: "validation_error", message: "Missing required fields" },
      });
      return;
    }

    const result = await loginUser({
      email: body.email.trim(),
      password: body.password,
    });

    setAuthCookie(res, result.token);
    res.status(200).json({ success: true, user: result.user });
  })
);

router.post(
  "/logout",
  asyncHandler(async (_req: Request, res: Response) => {
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("token", { httpOnly: true, secure: isProd, sameSite: "lax" });
    res.status(200).json({ success: true });
  })
);

export default router;
