import type { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import SidebarCollapsed from "@/components/layout/SidebarCollapsed";
import TopBar from "@/components/layout/TopBar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-[#F3F4F6] text-gray-900">
      <Sidebar />
      <SidebarCollapsed />
      <div className="min-h-screen md:ml-16 lg:ml-[236px]">
        <TopBar />
        <main className="px-5 py-5 lg:px-6">
          <div className="mx-auto w-full max-w-[1240px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
