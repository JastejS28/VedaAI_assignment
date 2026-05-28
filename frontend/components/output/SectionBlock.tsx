import { RotateCcw } from "lucide-react";
import QuestionItem from "@/components/output/QuestionItem";

interface SectionQuestion {
  id: number;
  text: string;
  difficulty: "easy" | "moderate" | "hard";
  marks: number;
  options?: string[];
  imageUrl?: string;
  diagramData?: {
    renderType: "svg" | "dagre";
    svgContent?: string;
  } | null;
}

interface SectionBlockProps {
  id: string;
  title: string;
  questionTypeName: string;
  instruction: string;
  questions: SectionQuestion[];
  isRegenerating?: boolean;
  onRegenerate?: () => void;
}

function SectionSkeleton(): JSX.Element {
  return (
    <div className="space-y-3 animate-pulse">
      {[0, 1, 2].map((index) => (
        <div key={index} className="h-3 w-full rounded-full bg-gray-200" />
      ))}
      <div className="h-3 w-4/5 rounded-full bg-gray-200" />
      <div className="h-3 w-2/3 rounded-full bg-gray-200" />
    </div>
  );
}

export default function SectionBlock({
  id,
  title,
  questionTypeName,
  instruction,
  questions,
  isRegenerating,
  onRegenerate,
}: SectionBlockProps): JSX.Element {
  return (
    <section className="relative pt-4">
      <button
        type="button"
        className="absolute right-0 top-0 rounded-full border border-gray-200 p-1 text-gray-400"
        onClick={onRegenerate}
        aria-label={`Regenerate section ${id}`}
      >
        <RotateCcw size={14} />
      </button>
      <div className="text-center text-base font-semibold text-gray-900">{title}</div>
      <div className="text-center text-sm font-medium text-gray-900">{questionTypeName}</div>
      <div className="mt-1 text-center text-xs italic text-gray-500">{instruction}</div>

      <div className="mt-4 space-y-3">
        {isRegenerating ? (
          <SectionSkeleton />
        ) : (
          questions.map((question, index) => (
            <QuestionItem key={`${id}-${question.id}-${index}`} question={question} />
          ))
        )}
      </div>
    </section>
  );
}
