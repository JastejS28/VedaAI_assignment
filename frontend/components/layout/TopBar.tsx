"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, ChevronLeft, LayoutGrid, LogOut, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { apiPost } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function TopBar(): JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const keepSignedIn = useAuthStore((state) => state.keepSignedIn);
  const setKeepSignedIn = useAuthStore((state) => state.setKeepSignedIn);
  const logout = useAuthStore((state) => state.logout);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) {
        return;
      }
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async (): Promise<void> => {
    try {
      await apiPost("/api/auth/logout", {});
    } catch {
      // Ignore logout API failure and still clear client state.
    }
    logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-2 z-20 px-4 lg:px-5">
      <div className="flex h-14 items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 shadow-[0_8px_18px_rgba(17,24,39,0.06)]">
      <div className="flex items-center gap-3 text-gray-500">
        <ChevronLeft size={18} />
        <LayoutGrid size={14} />
        <span className="text-sm">Assignment</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative text-gray-500">
          <Bell size={20} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-orange-500" />
        </div>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full px-1.5 py-1 hover:bg-gray-50"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
          <img
            alt={user?.name ?? "Teacher"}
            className="h-8 w-8 rounded-full border border-gray-200"
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
              user?.avatarId ?? "teacher"
            )}`}
          />
          <span className="text-sm font-medium text-gray-900">
            {user?.name ?? "Teacher"}
          </span>
          <ChevronDown size={14} className="text-gray-500" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 z-40 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
                onClick={() => setKeepSignedIn(!keepSignedIn)}
              >
                <span className="flex items-center gap-2 text-gray-700">
                  <ShieldCheck size={14} />
                  Keep me signed in
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    keepSignedIn
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {keepSignedIn ? "On" : "Off"}
                </span>
              </button>
              <button
                type="button"
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </header>
  );
}
