import Image from "next/image";
import type { Recording } from "@/lib/types";

function shortServiceLabel(label: string) {
  // "9:00 AM" → "9:00"; keep as-is when already short.
  return label.replace(/\s*(AM|PM)\s*$/i, "").trim() || label;
}

export function RecordingPlayer({
  recordings,
  title,
}: {
  recordings: Recording[];
  title: string;
}) {
  if (recordings.length === 0) return null;

  const showLabels = recordings.length > 1;

  return (
    <section className="mt-10 border-y border-ink/15 py-6" aria-label="Watch recordings">
      <div
        className={
          recordings.length > 1
            ? "grid gap-5 sm:grid-cols-2 sm:gap-4"
            : "mx-auto w-full max-w-2xl"
        }
      >
        {recordings.map((recording, index) => {
          const key = `${recording.label}-${index}`;
          const label = showLabels ? shortServiceLabel(recording.label) : null;
          const alt = label
            ? `Still from ${title} — ${recording.label}`
            : `Still from ${title}`;

          if (!recording.url) {
            return (
              <div
                key={key}
                className="border border-dashed border-ink/20 px-5 py-8"
              >
                {label ? (
                  <p className="mb-2 font-ui text-xs tracking-[0.16em] text-ink/45 uppercase">
                    {label}
                  </p>
                ) : null}
                <p className="font-display text-2xl">Recording forthcoming</p>
                <p className="mt-1 font-ui text-sm text-ink/55">
                  This service has a place here; its recording has not been published yet.
                </p>
              </div>
            );
          }

          const still = recording.image ? (
            <div className="relative aspect-video w-full overflow-hidden bg-ink ring-1 ring-ink/10">
              <Image
                src={recording.image}
                alt={alt}
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.02]"
                sizes={
                  recordings.length > 1
                    ? "(max-width: 639px) 100vw, 50vw"
                    : "(max-width: 767px) 100vw, 42rem"
                }
                priority={index === 0}
              />
              <span
                className="pointer-events-none absolute inset-0 bg-ink/0 transition group-hover:bg-ink/10"
                aria-hidden
              />
              <span
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                aria-hidden
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-study/90 text-ink shadow-sm ring-1 ring-ink/10 transition group-hover:scale-105 sm:h-14 sm:w-14">
                  <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current" aria-hidden>
                    <path d="M8 5.14v13.72L19 12 8 5.14z" />
                  </svg>
                </span>
              </span>
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center border border-ink/15 bg-ink/[0.04]">
              <span className="font-ui text-sm tracking-[0.12em] text-ink/50 uppercase">
                Watch on {recording.source === "youtube" ? "YouTube" : "video"}
              </span>
            </div>
          );

          return (
            <a
              key={key}
              href={recording.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              {still}
              {label ? (
                <p className="mt-2 font-ui text-xs tracking-[0.16em] text-ink/50 uppercase">
                  {label}
                </p>
              ) : (
                <span className="sr-only">Watch {title} on YouTube</span>
              )}
            </a>
          );
        })}
      </div>
    </section>
  );
}
