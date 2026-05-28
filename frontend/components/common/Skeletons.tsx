export function CardSkeleton(): JSX.Element {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white px-5 py-4">
      <div className="h-4 w-3/4 rounded bg-gray-200" />
      <div className="mt-6 flex items-center justify-between">
        <div className="h-3 w-1/3 rounded bg-gray-200" />
        <div className="h-3 w-1/4 rounded bg-gray-200" />
      </div>
    </div>
  );
}

export function AssignmentListSkeleton(): JSX.Element {
  return (
    <div>
      <div className="mb-6">
        <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-3 w-64 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

export function ExamPaperSkeleton(): JSX.Element {
  return (
    <div className="mx-auto w-full max-w-[720px]">
      {/* Dark banner skeleton */}
      <div className="animate-pulse rounded-t-xl bg-[#1A1A1A] px-6 py-5">
        <div className="h-4 w-2/3 rounded bg-gray-700" />
        <div className="mt-4 h-8 w-36 rounded-lg bg-gray-700" />
      </div>
      {/* Paper skeleton */}
      <div className="animate-pulse rounded-b-xl border border-gray-200 bg-white px-6 py-8">
        <div className="mx-auto h-5 w-1/2 rounded bg-gray-200" />
        <div className="mx-auto mt-2 h-3 w-1/3 rounded bg-gray-200" />
        <div className="my-6 h-px bg-gray-200" />
        <div className="flex justify-between">
          <div className="h-3 w-1/4 rounded bg-gray-200" />
          <div className="h-3 w-1/4 rounded bg-gray-200" />
        </div>
        <div className="my-6 h-px bg-gray-200" />
        <div className="space-y-4">
          <div className="h-3 w-full rounded bg-gray-200" />
          <div className="h-3 w-5/6 rounded bg-gray-200" />
          <div className="h-3 w-4/6 rounded bg-gray-200" />
          <div className="h-3 w-full rounded bg-gray-200" />
          <div className="h-3 w-3/4 rounded bg-gray-200" />
        </div>
        <div className="mt-8 space-y-3">
          <div className="mx-auto h-4 w-1/4 rounded bg-gray-200" />
          <div className="h-3 w-full rounded bg-gray-200" />
          <div className="h-3 w-5/6 rounded bg-gray-200" />
          <div className="h-3 w-4/6 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export function SectionSkeleton(): JSX.Element {
  return (
    <div className="animate-pulse space-y-3 py-4">
      <div className="mx-auto h-4 w-1/4 rounded bg-gray-200" />
      <div className="mx-auto h-3 w-1/3 rounded bg-gray-200" />
      <div className="space-y-3 pt-2">
        <div className="h-3 w-full rounded bg-gray-200" />
        <div className="h-3 w-5/6 rounded bg-gray-200" />
        <div className="h-3 w-4/6 rounded bg-gray-200" />
        <div className="h-3 w-full rounded bg-gray-200" />
      </div>
    </div>
  );
}

export function LibrarySkeleton(): JSX.Element {
  return (
    <div>
      <div className="mb-6">
        <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-3 w-56 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="mt-1 h-3 w-16 rounded bg-gray-200" />
              </div>
              <div className="h-7 w-7 rounded-full bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
