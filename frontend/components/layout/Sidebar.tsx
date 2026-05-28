"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileText,
  Home,
  Settings,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import VedaLogo from "@/components/common/VedaLogo";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/groups", label: "My Groups", icon: Users },
  { href: "/assignments", label: "Assignments", icon: FileText },
  { href: "/toolkit", label: "AI Teacher's Toolkit", icon: Wand2 },
  { href: "/library", label: "My Library", icon: BookOpen },
];

export default function Sidebar(): JSX.Element {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-[200px] flex-col border-r border-gray-100 bg-white px-4 pb-4 pt-4 md:flex lg:flex">
      <div className="flex h-12 items-center px-1">
        <VedaLogo />
      </div>

      <Link
        href="/assignments/create"
        className="mt-4 flex h-10 items-center justify-center gap-2 rounded-lg bg-gray-900 text-sm font-medium text-white"
      >
        <Sparkles size={14} className="text-white" />
        Create Assignment
      </Link>

      <nav className="mt-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const ItemIcon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                isActive
                  ? "bg-gray-100 font-medium text-gray-900"
                  : "text-gray-600"
              }`}
            >
              <ItemIcon size={16} className="shrink-0" />
              <span>{item.label}</span>
              {item.label === "Assignments" && (
                <span className="ml-auto rounded-full bg-orange-500 px-2 py-0.5 text-[11px] font-medium text-white">
                  10
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <button
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600"
          type="button"
        >
          <Settings size={16} className="shrink-0" />
          Settings
        </button>

        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <div className="flex items-center gap-3">
            <img
              alt="Delhi Public School avatar"
              className="h-9 w-9 rounded-full border border-gray-200"
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=DelhiPublicSchool"
            />
            <div>
              <div className="text-sm font-semibold text-gray-900">Delhi Public School</div>
              <div className="text-xs text-gray-500">Bokaro Steel City</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
