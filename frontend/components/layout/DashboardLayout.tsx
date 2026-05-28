import type { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import SidebarCollapsed from "@/components/layout/SidebarCollapsed";
import TopBar from "@/components/layout/TopBar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Sidebar />
      <SidebarCollapsed />
      <div className="ml-0 min-h-screen md:ml-16 lg:ml-[200px]">
        <TopBar />
        <main className="px-6 py-6">
          <div className="mx-auto w-full max-w-[1200px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
