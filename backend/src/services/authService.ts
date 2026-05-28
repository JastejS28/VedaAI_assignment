import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel, type UserDocument } from "../db/models/User";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  schoolName: string;
  city: string;
  avatarId?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  schoolName: string;
  city: string;
  avatarId: string;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
}

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

function createAppError(message: string, statusCode: number, code: string): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function toAuthUser(user: UserDocument): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    schoolName: user.schoolName,
    city: user.city,
    avatarId: user.avatarId,
  };
}

function createToken(userId: string): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw createAppError("JWT_SECRET is not set", 500, "config_error");
  }

  return jwt.sign({}, secret, { subject: userId, expiresIn: "7d" });
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();

  const existing = await UserModel.findOne({ email });
  if (existing) {
    throw createAppError("Email is already registered", 409, "email_in_use");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await UserModel.create({
    name: input.name,
    email,
    passwordHash,
    schoolName: input.schoolName,
    city: input.city,
    avatarId: input.avatarId ?? "avatar_01",
  });

  const token = createToken(user.id);

  return { user: toAuthUser(user), token };
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw createAppError("Invalid email or password", 401, "invalid_credentials");
  }

  const isMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!isMatch) {
    throw createAppError("Invalid email or password", 401, "invalid_credentials");
  }

  const token = createToken(user.id);

  return { user: toAuthUser(user), token };
}
