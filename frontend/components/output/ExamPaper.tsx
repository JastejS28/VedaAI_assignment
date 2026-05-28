import SectionBlock from "@/components/output/SectionBlock";

interface Question {
  id: number;
  text: string;
  type: "MCQ" | "short" | "long" | "diagram" | "numerical" | "truefalse";
  difficulty: "easy" | "moderate" | "hard";
  marks: number;
  options?: string[];
  answer?: string;
  imageUrl?: string;
  diagramData?: {
    renderType: "svg" | "dagre";
    svgContent?: string;
    nodes?: Array<{ id: string; label: string }>;
    edges?: Array<{ from: string; to: string; label?: string }>;
  } | null;
}

interface Section {
  id: string;
  title: string;
  questionTypeName: string;
  instruction: string;
  questions: Question[];
}

interface ExamPaperProps {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: number;
  totalMarks: number;
  instructions: string;
  sections: Section[];
  regeneratingSections: Set<string>;
  onRegenerateSection: (sectionId: string) => void;
}

export default function ExamPaper({
  schoolName,
  subject,
  className,
  timeAllowed,
  totalMarks,
  instructions,
  sections,
  regeneratingSections,
  onRegenerateSection,
}: ExamPaperProps): JSX.Element {
  return (
    <div className="rounded-b-xl border border-gray-200 bg-white px-6 py-8">
      <div className="text-center text-lg font-semibold text-gray-900">{schoolName}</div>
      <div className="mt-1 text-center text-sm text-gray-900">Subject: {subject}</div>
      <div className="text-center text-sm text-gray-900">Class: {className}</div>

      <div className="my-4 h-px bg-gray-200" />

      <div className="flex items-center justify-between text-xs text-gray-900">
        <span>Time Allowed: {timeAllowed} minutes</span>
        <span>Maximum Marks: {totalMarks}</span>
      </div>

      <div className="my-4 h-px bg-gray-200" />

      <p className="text-xs text-gray-900">{instructions}</p>

      <div className="mt-4 space-y-2 text-xs text-gray-900">
        <div>
          Name: <span className="inline-block w-32 border-b border-gray-400" />
        </div>
        <div>
          Roll Number: <span className="inline-block w-24 border-b border-gray-400" />
        </div>
        <div>
          Class/Section: <span className="inline-block w-24 border-b border-gray-400" />
        </div>
      </div>

      <div className="my-4 h-px bg-gray-200" />

      <div className="space-y-6">
        {sections.map((section) => (
          <SectionBlock
            key={section.id}
            id={section.id}
            title={section.title}
            questionTypeName={section.questionTypeName}
            instruction={section.instruction}
            questions={section.questions}
            isRegenerating={regeneratingSections.has(section.id)}
            onRegenerate={() => onRegenerateSection(section.id)}
          />
        ))}
      </div>

      <div className="my-6 text-center text-xs font-semibold text-gray-900">
        End of Question Paper
      </div>

      <details className="border-t border-gray-200 pt-4">
        <summary className="cursor-pointer text-sm font-semibold text-gray-900">
          Answer Key
        </summary>
        <div className="mt-3 space-y-2 text-xs text-gray-600">
          {sections.flatMap((section) =>
            section.questions.map((question, questionIndex) => ({
              sectionId: section.id,
              question,
              questionIndex,
            }))
          ).map(({ sectionId, question, questionIndex }) => (
            <div key={`answer-${sectionId}-${question.id}-${questionIndex}`}>
              {question.id}. {question.answer ?? "Answer not provided"}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
