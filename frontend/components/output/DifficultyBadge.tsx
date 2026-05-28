type Difficulty = "easy" | "moderate" | "hard";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

const colors: Record<Difficulty, string> = {
  easy: "bg-green-50 text-green-700 border-green-200",
  moderate: "bg-orange-50 text-orange-700 border-orange-200",
  hard: "bg-red-50 text-red-700 border-red-200",
};

const labels: Record<Difficulty, string> = {
  easy: "Easy",
  moderate: "Moderate",
  hard: "Challenging",
};

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps): JSX.Element {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${colors[difficulty]}`}
    >
      {labels[difficulty]}
    </span>
  );
}
