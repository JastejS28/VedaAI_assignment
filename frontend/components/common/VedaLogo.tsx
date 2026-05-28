interface VedaLogoProps {
  showText?: boolean;
}

export default function VedaLogo({ showText = true }: VedaLogoProps): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <svg
        aria-hidden="true"
        width="32"
        height="32"
        viewBox="0 0 32 32"
        className="shrink-0"
      >
        <rect width="32" height="32" rx="6" fill="#E8470A" />
        <path
          d="M9.5 11.5L16 20.5L22.5 11.5"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && <span className="text-lg font-bold text-gray-900">VedaAI</span>}
    </div>
  );
}
