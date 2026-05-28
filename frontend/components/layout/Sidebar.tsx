"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileText,
  LayoutGrid,
  Settings,
  Sparkles,
  Users,
  SquareStack,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutGrid },
  { href: "/groups", label: "My Groups", icon: Users },
  { href: "/assignments", label: "Assignments", icon: FileText },
  { href: "/toolkit", label: "AI Teacher's Toolkit", icon: SquareStack },
  { href: "/library", label: "My Library", icon: BookOpen, badge: "32" },
];

export default function Sidebar(): JSX.Element {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  return (
    <aside className="fixed left-3 top-3 hidden h-[calc(100vh-24px)] w-[220px] flex-col rounded-[22px] border border-gray-200 bg-white px-4 pb-4 pt-5 shadow-[0_10px_24px_rgba(17,24,39,0.06)] md:flex lg:flex">
      <div className="flex items-center px-1">
        <img
          src="/vedaai_logo.png"
          alt="VedaAI"
          className="h-12 w-12 rounded-xl object-cover shadow-[0_8px_16px_rgba(17,24,39,0.15)]"
        />
        <span className="ml-3 text-[23px] font-semibold tracking-[-0.02em] text-gray-900 leading-none">
          VedaAI
        </span>
      </div>

      <Link
        href="/assignments/create"
        className="mt-6 flex h-11 items-center justify-center gap-2 rounded-full border-[3px] border-[#E28255] bg-gradient-to-b from-[#2A3140] to-[#151A25] text-sm font-medium text-white shadow-[0_8px_16px_rgba(22,26,37,0.32)]"
      >
        <Sparkles size={14} className="text-white" />
        Create Assignment
      </Link>

      <nav className="mt-12 space-y-2.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
          const ItemIcon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-2xl px-3 py-3 text-[15px] ${
                isActive
                  ? "bg-gray-100 font-semibold text-gray-900"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <ItemIcon size={20} className="shrink-0 text-[#60697A]" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto rounded-full bg-[#EC7F18] px-3 py-0.5 text-xs font-semibold text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <button
          className="flex items-center gap-2 px-3 py-2 text-[15px] text-gray-600"
          type="button"
        >
          <Settings size={18} className="shrink-0 text-[#60697A]" />
          Settings
        </button>

        <div className="rounded-2xl bg-gray-100 p-3">
          <div className="flex items-center gap-3">
            <img
              alt={user?.schoolName ?? "School avatar"}
              className="h-11 w-11 rounded-full border border-gray-200"
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                user?.avatarId ?? "school"
              )}`}
            />
            <div>
              <div className="text-[15px] font-semibold text-gray-900">
                {user?.schoolName ?? "Your School"}
              </div>
              <div className="text-sm text-gray-500">{user?.city ?? "City"}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
