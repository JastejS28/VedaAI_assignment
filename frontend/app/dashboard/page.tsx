"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  Sparkles,
  Wand2,
} from "lucide-react";
import { apiGet } from "@/lib/api";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/stores/authStore";

interface AssignmentItem {
  _id: string;
  title: string;
  subject: string;
  className: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
}

interface AssignmentsResponse {
  success: boolean;
  assignments: AssignmentItem[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) {
    return "--";
  }
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default function Page(): JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async (): Promise<void> => {
      try {
        const data = await apiGet<AssignmentsResponse>("/api/assignments");
        if (isMounted) {
          setAssignments(data.assignments ?? []);
        }
      } catch {
        if (isMounted) {
          setAssignments([]);
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

  const stats = useMemo(() => {
    const total = assignments.length;
    const completed = assignments.filter((a) => a.status === "completed").length;
    const inProgress = assignments.filter((a) => a.status === "processing").length;
    const drafts = assignments.filter((a) => a.status === "pending").length;
    return { total, completed, inProgress, drafts };
  }, [assignments]);

  const recentAssignments = assignments.slice(0, 4);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome back{user?.name ? `, ${user.name}` : ""}.
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage assignments, track generation status, and build better assessments with AI.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Assignments</span>
                <FileText size={16} className="text-gray-500" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{stats.total}</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Completed</span>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{stats.completed}</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">In Progress</span>
                <Clock3 size={16} className="text-amber-500" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{stats.inProgress}</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Pending Queue</span>
                <BookOpen size={16} className="text-indigo-500" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{stats.drafts}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5 xl:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Recent Assignments</h2>
                <button
                  type="button"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  onClick={() => router.push("/assignments")}
                >
                  View all
                </button>
              </div>

              {loading ? (
                <p className="text-sm text-gray-500">Loading assignments...</p>
              ) : recentAssignments.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                  No assignments created yet. Start with your first AI-generated assessment.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAssignments.map((assignment) => (
                    <button
                      type="button"
                      key={assignment._id}
                      className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left hover:bg-gray-50"
                      onClick={() => router.push(`/assignments/${assignment._id}/output`)}
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{assignment.title}</p>
                        <p className="text-xs text-gray-500">
                          {assignment.subject} • Class {assignment.className}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(assignment.createdAt)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-base font-semibold text-gray-900">Quick Actions</h2>
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white"
                  onClick={() => router.push("/assignments/create")}
                >
                  <Sparkles size={15} />
                  Create Assignment
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700"
                  onClick={() => router.push("/toolkit")}
                >
                  <Wand2 size={15} />
                  Open AI Teacher&apos;s Toolkit
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700"
                  onClick={() => router.push("/library")}
                >
                  <BookOpen size={15} />
                  Browse My Library
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
