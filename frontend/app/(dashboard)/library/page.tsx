"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  Sparkles,
  SearchX,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import { LibrarySkeleton } from "@/components/common/Skeletons";
import { toast } from "sonner";

interface AssignmentItem {
  _id: string;
  title: string;
  subject: string;
  className: string;
  createdAt: string;
  status: string;
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
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

// Subject color palette for visual variety
const subjectColors: Record<string, { bg: string; text: string; icon: string }> = {
  Mathematics: { bg: "bg-blue-50", text: "text-blue-700", icon: "text-blue-500" },
  Science: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "text-emerald-500" },
  English: { bg: "bg-violet-50", text: "text-violet-700", icon: "text-violet-500" },
  Hindi: { bg: "bg-amber-50", text: "text-amber-700", icon: "text-amber-500" },
  Physics: { bg: "bg-cyan-50", text: "text-cyan-700", icon: "text-cyan-500" },
  Chemistry: { bg: "bg-rose-50", text: "text-rose-700", icon: "text-rose-500" },
  Biology: { bg: "bg-green-50", text: "text-green-700", icon: "text-green-500" },
  History: { bg: "bg-orange-50", text: "text-orange-700", icon: "text-orange-500" },
  Geography: { bg: "bg-teal-50", text: "text-teal-700", icon: "text-teal-500" },
  "Social Science": { bg: "bg-indigo-50", text: "text-indigo-700", icon: "text-indigo-500" },
};

const defaultColor = { bg: "bg-gray-50", text: "text-gray-700", icon: "text-gray-500" };

const starterResources = [
  {
    title: "Assessment Blueprint",
    description: "Balanced split for MCQ, short, long and diagram questions.",
  },
  {
    title: "Prompt Template",
    description: "Reusable structure for chapter-wise, board-aligned generation.",
  },
  {
    title: "Paper Quality Checklist",
    description: "Verify clarity, syllabus match, and answer-key correctness.",
  },
];

function getSubjectColor(subject: string) {
  return subjectColors[subject] ?? defaultColor;
}

export default function LibraryPage(): JSX.Element {
  const router = useRouter();
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    () => new Set()
  );

  useEffect(() => {
    let isMounted = true;

    const load = async (): Promise<void> => {
      try {
        const data = await apiGet<AssignmentsResponse>("/api/assignments");
        if (isMounted) {
          // Only show completed assignments in the library
          const completed = data.assignments.filter(
            (a) => a.status === "completed"
          );
          setAssignments(completed);

          // Auto-expand all subject groups initially
          const subjects = new Set(completed.map((a) => a.subject || "Other"));
          setExpandedSubjects(subjects);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load library";
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

  const groups = useMemo(
    () => groupBySubject(assignments),
    [assignments]
  );

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

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <BookOpen size={20} className="text-gray-900" />
          <h1 className="text-xl font-semibold text-gray-900">My Library</h1>
        </div>
        <p className="text-[13px] text-gray-500">
          All your generated assessments organized by subject.
        </p>
      </div>

      {/* Empty state */}
      {groups.length === 0 && (
        <div className="mb-5 flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-14 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 lg:h-24 lg:w-24">
            <SearchX size={40} className="text-gray-400" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Your library is empty
          </h2>
          <p className="mb-6 max-w-[300px] text-sm leading-relaxed text-gray-500">
            Completed assessments will appear here, organized by subject for
            easy access.
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-[#111111] px-5 py-2.5 text-sm font-medium text-white"
            onClick={() => router.push("/assignments/create")}
          >
            + Create Your First Assignment
          </button>
        </div>
      )}

      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-gray-700" />
          <h2 className="text-base font-semibold text-gray-900">Starter Resources</h2>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Handy references to improve your next AI-generated assessment.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
          {starterResources.map((resource) => (
            <div key={resource.title} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900">{resource.title}</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">{resource.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Subject groups */}
      <div className="space-y-4">
        {groups.map((group) => {
          const isExpanded = expandedSubjects.has(group.subject);
          const colors = getSubjectColor(group.subject);

          return (
            <div
              key={group.subject}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              {/* Collapsible header */}
              <button
                type="button"
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50"
                onClick={() => toggleSubject(group.subject)}
              >
                {/* Subject icon badge */}
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors.bg}`}
                >
                  <BookOpen size={18} className={colors.icon} />
                </div>

                {/* Subject name and count */}
                <div className="flex-1">
                  <div className="text-[15px] font-semibold text-gray-900">
                    {group.subject}
                  </div>
                  <div className="text-xs text-gray-500">
                    {group.assignments.length} assessment
                    {group.assignments.length !== 1 ? "s" : ""}
                  </div>
                </div>

                {/* Expand/collapse indicator */}
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-gray-600" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-600" />
                  )}
                </div>
              </button>

              {/* Cards inside group */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-5 pb-4 pt-2">
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {group.assignments.map((assignment) => (
                      <div
                        key={assignment._id}
                        className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3.5 transition-shadow hover:shadow-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-gray-900">
                            {assignment.title}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                            <span>
                              Class:{" "}
                              <span className="font-medium text-gray-700">
                                {assignment.className}
                              </span>
                            </span>
                            <span>•</span>
                            <span>{formatDate(assignment.createdAt)}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="ml-3 flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                          onClick={() =>
                            router.push(
                              `/assignments/${assignment._id}/output`
                            )
                          }
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
    </div>
  );
}
