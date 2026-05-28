"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { useAuthStore, type AuthUser } from "@/stores/authStore";

interface AuthResponse {
  success: boolean;
  user: AuthUser;
}

export default function Page(): JSX.Element {
  const router = useRouter();
  const registrationDraft = useAuthStore((state) => state.registrationDraft);
  const clearRegistrationDraft = useAuthStore((state) => state.clearRegistrationDraft);
  const setUser = useAuthStore((state) => state.setUser);
  const [selectedAvatar, setSelectedAvatar] = useState<string>("avatar_01");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatarIds = useMemo(
    () => [
      "avatar_01",
      "avatar_02",
      "avatar_03",
      "avatar_04",
      "avatar_05",
      "avatar_06",
      "avatar_07",
      "avatar_08",
    ],
    []
  );

  const handleSubmit = async (): Promise<void> => {
    if (!registrationDraft) {
      router.replace("/register");
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const data = await apiPost<AuthResponse>("/api/auth/register", {
        ...registrationDraft,
        avatarId: selectedAvatar,
      });
      setUser(data.user);
      clearRegistrationDraft();
      router.push("/assignments");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Registration failed";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10 text-gray-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900">VedaAI</div>
          <Link className="text-sm font-medium text-gray-600" href="/register">
            Back to details
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-none">
          <div className="text-xl font-semibold text-gray-900">Pick your avatar</div>
          <p className="mt-1 text-sm text-gray-500">
            Choose one to personalize your teacher profile.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {avatarIds.map((avatarId) => {
              const isSelected = avatarId === selectedAvatar;
              return (
                <button
                  key={avatarId}
                  type="button"
                  className={`flex flex-col items-center gap-3 rounded-xl border p-4 transition ${
                    isSelected
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 bg-white"
                  }`}
                  onClick={() => setSelectedAvatar(avatarId)}
                >
                  <img
                    alt={avatarId}
                    className="h-16 w-16 rounded-full border border-gray-200"
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarId}`}
                  />
                  <span className="text-xs font-medium text-gray-600">{avatarId}</span>
                </button>
              );
            })}
          </div>

          {submitError && <p className="mt-4 text-sm text-red-500">{submitError}</p>}

          <button
            className="mt-6 h-10 w-full rounded-lg bg-[#111111] text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
