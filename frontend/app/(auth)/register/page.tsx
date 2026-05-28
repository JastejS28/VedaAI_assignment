"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/authStore";

const registerSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/\d/, "Password must include a number"),
  schoolName: z.string().min(2, "Enter your school name"),
  city: z.string().min(2, "Enter your city"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Page(): JSX.Element {
  const router = useRouter();
  const setRegistrationDraft = useAuthStore((state) => state.setRegistrationDraft);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues): Promise<void> => {
    setSubmitError(null);

    try {
      setRegistrationDraft(values);
      router.push("/register/avatar");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Registration failed";
      setSubmitError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10 text-gray-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900">VedaAI</div>
          <Link className="text-sm font-medium text-gray-600" href="/login">
            Already have an account
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-none">
          <div className="text-xl font-semibold text-gray-900">Create your account</div>
          <p className="mt-1 text-sm text-gray-500">
            Start generating assessments for your classes.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-900">Full Name</label>
                <input
                  className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                  placeholder="John Doe"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

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
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">Password</label>
              <input
                className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                placeholder="Minimum 8 characters"
                type="password"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-900">School Name</label>
                <input
                  className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                  placeholder="Delhi Public School"
                  {...register("schoolName")}
                />
                {errors.schoolName && (
                  <p className="mt-1 text-xs text-red-500">{errors.schoolName.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">City</label>
                <input
                  className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                  placeholder="Bokaro"
                  {...register("city")}
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>
                )}
              </div>
            </div>

            {submitError && <p className="text-sm text-red-500">{submitError}</p>}

            <button
              className="h-10 w-full rounded-lg bg-[#111111] text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Continue to Avatar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
