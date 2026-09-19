type Props = {
  rows?: number;
};

function Bone({ className }: { className: string }) {
  return <div className={`format-skel-bone ${className}`} />;
}

/** Placeholder archive rows shown while the format underline slides to a new tab. */
export function FormatArchiveSkeleton({ rows = 3 }: Props) {
  return (
    <div aria-busy="true" aria-live="polite" aria-label="Loading">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <Bone className="h-8 w-44 max-w-[55%]" />
        <Bone className="h-3 w-20" />
      </div>
      <div className="border-b border-ink/15">
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className="grid gap-6 border-t border-ink/15 py-8 md:grid-cols-[9.5rem_minmax(0,1fr)_11rem] md:gap-8"
          >
            <div className="space-y-3">
              <Bone className="h-3 w-24" />
              <Bone className="h-7 w-28" />
              <Bone className="h-3 w-16" />
            </div>
            <div className="space-y-3">
              <Bone className="h-9 w-[min(100%,22rem)]" />
              <Bone className="h-3 w-36" />
              <Bone className="h-3 w-[min(100%,28rem)]" />
              <Bone className="h-3 w-[min(100%,20rem)]" />
            </div>
            <div className="self-center border-l border-ink/12 pl-4">
              <Bone className="aspect-video w-full max-w-[11rem]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
