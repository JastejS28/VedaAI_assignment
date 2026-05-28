interface MCQOptionsProps {
  options: string[];
}

const labels = ["a", "b", "c", "d"];

export default function MCQOptions({ options }: MCQOptionsProps): JSX.Element {
  return (
    <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-900">
      {options.map((option, index) => (
        <div key={`${option}-${index}`} className="flex items-start gap-2">
          <span>({labels[index] ?? String.fromCharCode(97 + index)})</span>
          <span>{option}</span>
        </div>
      ))}
    </div>
  );
}
