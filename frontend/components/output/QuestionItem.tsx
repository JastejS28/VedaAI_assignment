import DifficultyBadge from "@/components/output/DifficultyBadge";
import MCQOptions from "@/components/output/MCQOptions";
import DiagramRenderer from "@/components/output/DiagramRenderer";

interface Question {
  id: number;
  text: string;
  difficulty: "easy" | "moderate" | "hard";
  marks: number;
  options?: string[];
  imageUrl?: string;
  diagramData?: {
    renderType: "svg" | "dagre";
    svgContent?: string;
    nodes?: Array<{ id: string; label: string }>;
    edges?: Array<{ from: string; to: string; label?: string }>;
  } | null;
}

interface QuestionItemProps {
  question: Question;
}

export default function QuestionItem({ question }: QuestionItemProps): JSX.Element {
  return (
    <div className="flex flex-col gap-1 text-sm text-gray-900">
      <div className="flex flex-wrap items-start gap-2">
        <span className="font-medium">{question.id}.</span>
        <DifficultyBadge difficulty={question.difficulty} />
        <span className="flex-1">{question.text}</span>
        <span className="text-xs text-gray-500">[{question.marks} Marks]</span>
      </div>
      {question.options && question.options.length > 0 && (
        <MCQOptions options={question.options} />
      )}
      <DiagramRenderer imageUrl={question.imageUrl} diagramData={question.diagramData} />
    </div>
  );
}
