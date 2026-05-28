"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileText,
  Home,
  Settings,
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

export default function SidebarCollapsed(): JSX.Element {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-16 flex-col items-center border-r border-gray-100 bg-white py-4 md:flex lg:hidden">
      <div className="flex h-12 items-center">
        <VedaLogo showText={false} />
      </div>

      <nav className="mt-6 flex flex-1 flex-col items-center gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const ItemIcon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                isActive ? "bg-gray-100 text-gray-900" : "text-gray-600"
              }`}
              aria-label={item.label}
              title={item.label}
            >
              <ItemIcon size={18} />
            </Link>
          );
        })}
      </nav>

      <button
        className="mb-3 flex h-10 w-10 items-center justify-center text-gray-600"
        type="button"
        aria-label="Settings"
      >
        <Settings size={18} />
      </button>
    </aside>
  );
}
