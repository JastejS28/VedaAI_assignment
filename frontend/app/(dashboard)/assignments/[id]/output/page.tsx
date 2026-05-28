"use client";

import { use, useEffect, useMemo, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import ExamPaper from "@/components/output/ExamPaper";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { ExamPaperSkeleton } from "@/components/common/Skeletons";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";

interface DiagramData {
  renderType: "svg" | "dagre";
  svgContent?: string;
}

interface Question {
  id: number;
  text: string;
  type: "MCQ" | "short" | "long" | "diagram" | "numerical" | "truefalse";
  difficulty: "easy" | "moderate" | "hard";
  marks: number;
  options?: string[];
  answer?: string;
  imageUrl?: string;
  diagramData?: DiagramData | null;
}

interface Section {
  id: string;
  title: string;
  questionTypeName: string;
  instruction: string;
  questions: Question[];
}

interface AssessmentPaper {
  title: string;
  schoolName: string;
  subject: string;
  className: string;
  board: string;
  timeAllowed: number;
  totalMarks: number;
  totalQuestions: number;
  instructions: string;
  sections: Section[];
}

interface PaperResponse {
  success: boolean;
  paper: AssessmentPaper;
}

interface RegenerateResponse {
  success: boolean;
  jobId: string;
}

interface ExportPdfResponse {
  success: boolean;
  jobId: string;
}

export default function Page({ params }: { params: Promise<{ id: string }> }): JSX.Element {
  const { id } = use(params);
  const [paper, setPaper] = useState<AssessmentPaper | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [regeneratingSections, setRegeneratingSections] = useState<Set<string>>(
    () => new Set()
  );

  // Fetch the paper JSON on mount
  useEffect(() => {
    let isMounted = true;

    const loadPaper = async (): Promise<void> => {
      try {
        const data = await apiGet<PaperResponse>(`/api/assignments/${id}/paper`);
        if (isMounted) {
          setPaper(data.paper);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load paper";
        if (isMounted) {
          setError(message);
          toast.error(message);
        }
      }
    };

    loadPaper();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Handle per-section regeneration
  const handleRegenerateSection = async (sectionId: string): Promise<void> => {
    if (!paper) {
      return;
    }

    setRegeneratingSections((prev) => new Set(prev).add(sectionId));
    const previousPaper = paper;

    try {
      const data = await apiPost<RegenerateResponse>(
        `/api/assignments/${id}/regenerate-section`,
        { sectionId }
      );

      const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL ?? "");
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "subscribe", jobId: data.jobId }));
      };
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data) as {
          type: string;
          sectionId?: string;
          section?: Section;
          error?: string;
        };
        if (msg.type === "section_updated" && msg.sectionId && msg.section) {
          setPaper((current) => {
            if (!current) {
              return current;
            }
            const updated = current.sections.map((section) =>
              section.id === msg.sectionId ? msg.section! : section
            );
            return { ...current, sections: updated as Section[] };
          });
          setRegeneratingSections((prev) => {
            const next = new Set(prev);
            next.delete(msg.sectionId ?? sectionId);
            return next;
          });
          ws.close();
        }
        if (msg.type === "generation_failed") {
          setPaper(previousPaper);
          setError(msg.error ?? "Failed to regenerate section.");
          setRegeneratingSections((prev) => {
            const next = new Set(prev);
            next.delete(sectionId);
            return next;
          });
          ws.close();
        }
      };
      ws.onclose = () => {
        // Clear regenerating state on disconnect as fallback
        setRegeneratingSections((prev) => {
          const next = new Set(prev);
          next.delete(sectionId);
          return next;
        });
      };
    } catch (err: unknown) {
      setPaper(previousPaper);
      const message = err instanceof Error ? err.message : "Failed to regenerate";
      setError(message);
      toast.error(message);
      setRegeneratingSections((prev) => {
        const next = new Set(prev);
        next.delete(sectionId);
        return next;
      });
    }
  };

  // Handle PDF download: POST to trigger export, then poll for file readiness
  const handleDownload = async (): Promise<void> => {
    setDownloading(true);
    setError(null);

    try {
      // 1. Trigger the PDF export job
      await apiPost<ExportPdfResponse>(
        `/api/assignments/${id}/export-pdf`,
        {}
      );

      // 2. Poll for PDF readiness, then download
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const maxAttempts = 20;
      const pollInterval = 1500; // 1.5s between polls

      let blob: Blob | null = null;
      let filename = "assessment.pdf";

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
          const response = await fetch(
            `${baseUrl}/api/assignments/${id}/download`,
            { credentials: "include" }
          );

          if (response.ok) {
            // Extract filename from Content-Disposition header
            const disposition = response.headers.get("content-disposition") ?? "";
            const match = disposition.match(/filename="(.+?)"/i);
            if (match?.[1]) {
              filename = match[1];
            }
            blob = await response.blob();
            break;
          }
        } catch {
          // PDF not ready yet, continue polling
        }

        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }

      if (!blob) {
        throw new Error("PDF generation is taking longer than expected. Please try again.");
      }

      // 3. Trigger browser download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Download failed";
      setError(message);
      toast.error(message);
    } finally {
      setDownloading(false);
    }
  };

  const headerMessage = useMemo(() => {
    if (!paper) {
      return "";
    }
    return `Here are your customized questions for ${paper.subject}, ${paper.className}`;
  }, [paper]);

  if (error && !paper) {
    return <div className="p-6 text-sm text-red-500">{error}</div>;
  }

  if (!paper) {
    return <ExamPaperSkeleton />;
  }

  return (
    <ErrorBoundary>
    <div className="mx-auto w-full max-w-[720px] pb-12">
      {/* Error toast */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Dark banner */}
      <div className="rounded-t-xl bg-[#1A1A1A] px-6 py-5 text-white">
        <p className="text-sm font-normal text-white/90">{headerMessage}</p>
        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/30 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download size={14} />
          )}
          {downloading ? "Preparing PDF..." : "Download as PDF"}
        </button>
      </div>

      {/* Exam paper */}
      <ExamPaper
        schoolName={paper.schoolName}
        subject={paper.subject}
        className={paper.className}
        timeAllowed={paper.timeAllowed}
        totalMarks={paper.totalMarks}
        instructions={paper.instructions}
        sections={paper.sections}
        regeneratingSections={regeneratingSections}
        onRegenerateSection={handleRegenerateSection}
      />
    </div>
    </ErrorBoundary>
  );
}
