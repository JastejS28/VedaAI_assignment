import { Bell, ChevronDown, ChevronLeft, LayoutGrid } from "lucide-react";

export default function TopBar(): JSX.Element {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
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
        <div className="flex items-center gap-2">
          <img
            alt="John Doe"
            className="h-8 w-8 rounded-full border border-gray-200"
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe"
          />
          <span className="text-sm font-medium text-gray-900">John Doe</span>
          <ChevronDown size={14} className="text-gray-500" />
        </div>
      </div>
    </header>
  );
}
