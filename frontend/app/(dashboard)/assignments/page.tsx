"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SearchX, SlidersHorizontal } from "lucide-react";
import AssignmentCard from "@/components/common/AssignmentCard";
import { AssignmentListSkeleton } from "@/components/common/Skeletons";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";

interface AssignmentSummary {
  _id: string;
  title: string;
  createdAt: string;
  dueDate: string;
}

interface AssignmentsResponse {
  success: boolean;
  assignments: AssignmentSummary[];
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function Page(): JSX.Element {
  const router = useRouter();
  const [assignments, setAssignments] = useState<AssignmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAssignments = async (): Promise<void> => {
      try {
        const data = await apiGet<AssignmentsResponse>("/api/assignments");
        if (isMounted) {
          setAssignments(data.assignments ?? []);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load assignments";
        if (isMounted) {
          setError(message);
          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAssignments();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasAssignments = assignments.length > 0;
  const cards = useMemo(
    () =>
      assignments.map((assignment) => (
        <AssignmentCard
          key={assignment._id}
          title={assignment.title}
          assignedOn={formatDate(assignment.createdAt)}
          dueDate={formatDate(assignment.dueDate)}
          onView={() => router.push(`/assignments/${assignment._id}/output`)}
        />
      )),
    [assignments]
  );

  if (loading) {
    return <AssignmentListSkeleton />;
  }

  return (
    <div className="relative min-h-[calc(100vh-56px)]">
      <div className="flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <div>
          <div className="text-xl font-semibold text-gray-900">Assignments</div>
          <p className="text-[13px] text-gray-500">
            Manage and create assignments for your classes.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 md:flex-row md:items-center md:justify-between">
        <button
          type="button"
          className="flex items-center gap-2 text-sm text-gray-500"
        >
          <SlidersHorizontal size={16} />
          Filter By
        </button>
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm"
            placeholder="Search Assignment"
            type="text"
          />
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {!loading && !hasAssignments && (
        <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gray-100">
            <SearchX size={64} className="text-gray-300" />
          </div>
          <div className="mt-6 text-lg font-semibold text-gray-900">No assignments yet</div>
          <p className="mt-2 max-w-[320px] text-sm text-gray-500">
            Create your first assignment to start collecting and grading student
            submissions.
          </p>
          <button
            type="button"
            className="mt-6 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white"
            onClick={() => router.push("/assignments/create")}
          >
            + Create Your First Assignment
          </button>
        </div>
      )}

      {!loading && hasAssignments && (
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {cards}
        </div>
      )}

      <button
        type="button"
        className="fixed bottom-6 left-1/2 z-10 flex h-10 -translate-x-1/2 items-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white shadow-xl"
        onClick={() => router.push("/assignments/create")}
      >
        + Create Assignment
      </button>
    </div>
  );
}
