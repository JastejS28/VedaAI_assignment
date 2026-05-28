"use client";

import { useRouter } from "next/navigation";
import {
  Bot,
  FileDown,
  FileUp,
  ListChecks,
  Sparkles,
  WandSparkles,
} from "lucide-react";

const toolkitCards = [
  {
    title: "Prompt Booster",
    description:
      "Write clearer instructions for chapter-wise, difficulty-balanced question generation.",
    points: [
      "Define class + board + chapter scope",
      "Set marks and difficulty distribution",
      "Specify answer-key quality level",
    ],
  },
  {
    title: "Question Mix Planner",
    description:
      "Plan ideal question-type combinations before creating an assignment.",
    points: [
      "MCQ + short + long balance",
      "Diagram and numerical slots",
      "Time-allowed vs total marks alignment",
    ],
  },
  {
    title: "Review Checklist",
    description:
      "Quickly verify generated papers for syllabus alignment and classroom readiness.",
    points: [
      "Syllabus and grammar checks",
      "Duplication and ambiguity checks",
      "Answer key completeness",
    ],
  },
];

export default function ToolkitPage(): JSX.Element {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <div>
          <h1 className="text-xl font-semibold text-gray-900">AI Teacher&apos;s Toolkit</h1>
          <p className="text-[13px] text-gray-500">
            Practical tools to create better assignments faster.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {toolkitCards.map((card) => (
          <div key={card.title} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 text-gray-900">
              <Bot size={16} />
              <h2 className="text-base font-semibold">{card.title}</h2>
            </div>
            <p className="mt-2 text-sm text-gray-500">{card.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              {card.points.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <ListChecks size={14} className="mt-0.5 text-gray-400" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-base font-semibold text-gray-900">Recommended Workflow</h3>
          <div className="mt-4 space-y-3 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <FileUp size={15} className="text-gray-500" />
              Upload source PDF for passage-based questions
            </div>
            <div className="flex items-center gap-2">
              <WandSparkles size={15} className="text-gray-500" />
              Add clear instructions for section-wise output
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-gray-500" />
              Generate, review, and regenerate only weak sections
            </div>
            <div className="flex items-center gap-2">
              <FileDown size={15} className="text-gray-500" />
              Export final paper with answer key as PDF
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-base font-semibold text-gray-900">Next Best Actions</h3>
          <p className="mt-2 text-sm text-gray-500">
            Continue from here to create and refine your next assessment.
          </p>
          <div className="mt-4 space-y-2">
            <button
              type="button"
              className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white"
              onClick={() => router.push("/assignments/create")}
            >
              Create New Assignment
            </button>
            <button
              type="button"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700"
              onClick={() => router.push("/assignments")}
            >
              Review Existing Assignments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
