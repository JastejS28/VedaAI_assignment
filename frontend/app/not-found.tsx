import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
        <FileQuestion size={40} className="text-gray-400" />
      </div>
      <h1 className="mb-2 text-4xl font-bold text-gray-900">404</h1>
      <h2 className="mb-2 text-lg font-semibold text-gray-900">Page not found</h2>
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/assignments"
        className="inline-flex items-center gap-2 rounded-lg bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
      >
        Go to Assignments
      </Link>
    </div>
  );
}
