"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";

const statusTimeline = [
  { time: 0, message: "Submitting your assignment..." },
  { time: 2000, message: "Analyzing content and context..." },
  { time: 5000, message: "Building question structure..." },
  { time: 10000, message: "Generating questions..." },
  { time: 18000, message: "Reviewing and formatting..." },
];

interface StatusResponse {
  success: boolean;
  status: "pending" | "processing" | "completed" | "failed";
}

interface RegenerateResponse {
  success: boolean;
  jobId: string;
}

export default function Page({ params }: { params: Promise<{ id: string }> }): JSX.Element {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState(statusTimeline[0].message);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(searchParams.get("jobId"));
  const [isRetrying, setIsRetrying] = useState(false);

  const timeline = useMemo(
    () =>
      statusTimeline.map((entry) =>
        setTimeout(() => {
          setStatusMessage(entry.message);
        }, entry.time)
      ),
    []
  );

  useEffect(() => {
    return () => {
      timeline.forEach((timer) => clearTimeout(timer));
    };
  }, [timeline]);

  useEffect(() => {
    if (!jobId) {
      return;
    }

    let pollInterval: NodeJS.Timeout | null = null;
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL ?? "");

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "subscribe", jobId }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data) as { type: string; assignmentId?: string; error?: string };
      if (msg.type === "generation_complete") {
        if (pollInterval) {
          clearInterval(pollInterval);
        }
        setStatusMessage("Done! Loading your paper...");
        router.push(`/assignments/${id}/output`);
      }
      if (msg.type === "generation_failed") {
        if (pollInterval) {
          clearInterval(pollInterval);
        }
        setError(msg.error ?? "Generation failed. Please try again.");
      }
    };

    ws.onclose = () => {
      pollInterval = setInterval(async () => {
        try {
          const data = await apiGet<StatusResponse>(`/api/assignments/${id}/status`);
          if (data.status === "completed") {
            if (pollInterval) {
              clearInterval(pollInterval);
            }
            setStatusMessage("Done! Loading your paper...");
            router.push(`/assignments/${id}/output`);
          }
          if (data.status === "failed") {
            if (pollInterval) {
              clearInterval(pollInterval);
            }
            setError("Generation failed. Please try again.");
          }
        } catch (err) {
          // Ignore polling errors.
        }
      }, 3000);
    };

    return () => {
      ws.close();
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [jobId, id, router]);

  const handleRetry = async (): Promise<void> => {
    setIsRetrying(true);
    setError(null);
    try {
      const data = await apiPost<RegenerateResponse>(
        `/api/assignments/${id}/regenerate`,
        {}
      );
      const newJobId = String(data.jobId);
      setJobId(newJobId);
      setStatusMessage(statusTimeline[0].message);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Retry failed";
      setError(message);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-[600px] flex-col items-center justify-center text-center">
      <div className="text-xl font-semibold text-gray-900">Generating Assessment</div>
      <p className="mt-2 text-sm text-gray-500">{statusMessage}</p>

      <div className="mt-6 h-2 w-full rounded-full bg-gray-200">
        <div className="h-2 w-1/2 rounded-full bg-gray-900" />
      </div>

      {error && (
        <div className="mt-6 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
          <button
            type="button"
            className="mt-3 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
            onClick={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? "Retrying..." : "Try Again"}
          </button>
        </div>
      )}
    </div>
  );
}
