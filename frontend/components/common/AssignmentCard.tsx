"use client";

import { MoreVertical } from "lucide-react";
import { useState } from "react";

export interface AssignmentCardProps {
  title: string;
  assignedOn: string;
  dueDate: string;
  onView?: () => void;
  onDelete?: () => void;
}

export default function AssignmentCard({
  title,
  assignedOn,
  dueDate,
  onView,
  onDelete,
}: AssignmentCardProps): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative flex h-[100px] flex-col rounded-xl border border-gray-200 bg-white px-5 py-4">
      <div className="flex items-start justify-between">
        <div className="text-base font-semibold text-gray-900">{title}</div>
        <button
          type="button"
          className="text-gray-400"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <MoreVertical size={16} />
        </button>
      </div>

      {menuOpen && (
        <div className="absolute right-4 top-10 z-10 w-36 rounded-lg border border-gray-200 bg-white shadow-lg">
          <button
            type="button"
            className="block w-full px-4 py-2 text-left text-sm text-gray-900"
            onClick={() => {
              setMenuOpen(false);
              onView?.();
            }}
          >
            View Assignment
          </button>
          <button
            type="button"
            className="block w-full px-4 py-2 text-left text-sm text-red-500"
            onClick={() => {
              setMenuOpen(false);
              onDelete?.();
            }}
          >
            Delete
          </button>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Assigned on :</span>
          <span className="font-medium text-gray-900">{assignedOn}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Due :</span>
          <span className="font-medium text-gray-900">{dueDate}</span>
        </div>
      </div>
    </div>
  );
}
