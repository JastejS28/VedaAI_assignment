"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookCopy, ChevronDown, ChevronRight, Eye, SearchX } from "lucide-react";
import { apiGet } from "@/lib/api";
import { LibrarySkeleton } from "@/components/common/Skeletons";
import { toast } from "sonner";

interface AssignmentItem {
  _id: string;
  title: string;
  subject: string;
  className: string;
  createdAt: string;
  dueDate: string;
}

interface AssignmentsResponse {
  success: boolean;
  assignments: AssignmentItem[];
}

interface SubjectGroup {
  subject: string;
  assignments: AssignmentItem[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) {
    return "--";
  }
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function groupBySubject(assignments: AssignmentItem[]): SubjectGroup[] {
  const map = new Map<string, AssignmentItem[]>();
  for (const assignment of assignments) {
    const subject = assignment.subject || "Other";
    const existing = map.get(subject);
    if (existing) {
      existing.push(assignment);
    } else {
      map.set(subject, [assignment]);
    }
  }

  return Array.from(map.entries())
    .map(([subject, items]) => ({ subject, assignments: items }))
    .sort((a, b) => a.subject.localeCompare(b.subject));
}

export default function GroupsPage(): JSX.Element {
  const router = useRouter();
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let isMounted = true;

    const load = async (): Promise<void> => {
      try {
        const data = await apiGet<AssignmentsResponse>("/api/assignments");
        if (isMounted) {
          const allAssignments = data.assignments ?? [];
          setAssignments(allAssignments);
          setExpandedSubjects(new Set(allAssignments.map((a) => a.subject || "Other")));
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load groups";
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

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const groups = useMemo(() => groupBySubject(assignments), [assignments]);

  const toggleSubject = (subject: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subject)) {
        next.delete(subject);
      } else {
        next.add(subject);
      }
      return next;
    });
  };

  if (loading) {
    return <LibrarySkeleton />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <div>
          <h1 className="text-xl font-semibold text-gray-900">My Groups</h1>
          <p className="text-[13px] text-gray-500">
            Assignments grouped together by subject.
          </p>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {groups.length === 0 ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
            <SearchX size={44} className="text-gray-300" />
          </div>
          <div className="mt-5 text-lg font-semibold text-gray-900">No subject groups yet</div>
          <p className="mt-2 max-w-[320px] text-sm text-gray-500">
            Create assignments first. They will appear grouped by subject here.
          </p>
          <button
            type="button"
            className="mt-6 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white"
            onClick={() => router.push("/assignments/create")}
          >
            + Create Assignment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const isExpanded = expandedSubjects.has(group.subject);
            return (
              <div
                key={group.subject}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-gray-50"
                  onClick={() => toggleSubject(group.subject)}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                    <BookCopy size={18} className="text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] font-semibold text-gray-900">{group.subject}</div>
                    <div className="text-xs text-gray-500">
                      {group.assignments.length} assignment
                      {group.assignments.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-gray-600" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-600" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 pb-4 pt-2">
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      {group.assignments.map((assignment) => (
                        <div
                          key={assignment._id}
                          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3.5"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-gray-900">
                              {assignment.title}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                              <span>Assigned: {formatDate(assignment.createdAt)}</span>
                              <span>Due: {formatDate(assignment.dueDate)}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="ml-3 flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            onClick={() => router.push(`/assignments/${assignment._id}/output`)}
                          >
                            <Eye size={13} />
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
