"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiPost } from "@/lib/api";
import { useAuthStore, type AuthUser } from "@/stores/authStore";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface AuthResponse {
  success: boolean;
  user: AuthUser;
}

export default function Page(): JSX.Element {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    setSubmitError(null);

    try {
      const data = await apiPost<AuthResponse>("/api/auth/login", values);
      setUser(data.user);
      router.push("/assignments");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      setSubmitError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10 text-gray-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900">VedaAI</div>
          <Link className="text-sm font-medium text-gray-600" href="/register">
            Create an account
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-none">
          <div className="text-xl font-semibold text-gray-900">Welcome back</div>
          <p className="mt-1 text-sm text-gray-500">
            Log in to continue creating assessments.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm font-medium text-gray-900">Email</label>
              <input
                className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                placeholder="teacher@school.edu"
                type="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">Password</label>
              <input
                className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                placeholder="Enter your password"
                type="password"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {submitError && <p className="text-sm text-red-500">{submitError}</p>}

            <button
              className="h-10 w-full rounded-lg bg-[#111111] text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Log In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
