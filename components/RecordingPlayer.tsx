"use client";

import { useMemo, useState } from "react";
import type { Recording } from "@/lib/types";
import { vimeoId, youtubeId } from "@/lib/media";

export function RecordingPlayer({ recordings }: { recordings: Recording[] }) {
  const [active, setActive] = useState(0);
  const current = recordings[active];
  const yt = useMemo(() => (current ? youtubeId(current.url) : null), [current]);
  const vm = useMemo(() => (current ? vimeoId(current.url) : null), [current]);

  if (recordings.length === 0) return null;

  return (
    <div className="mt-10 space-y-4">
      {recordings.length > 1 ? (
        <div role="tablist" aria-label="Recordings" className="flex flex-wrap gap-2">
          {recordings.map((recording, index) => (
            <button
              key={`${recording.label}-${index}`}
              type="button"
              role="tab"
              aria-selected={index === active}
              onClick={() => setActive(index)}
              className={`border px-4 py-2 font-ui text-sm ${
                index === active
                  ? "border-ink bg-ink text-study"
                  : "border-ink/20 hover:border-accent"
              }`}
            >
              {recording.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="font-ui text-sm text-ink/60">{recordings[0].label}</p>
      )}

      {current.source === "youtube" && yt ? (
        <div className="aspect-video w-full overflow-hidden bg-ink">
          <iframe
            title={current.label}
            src={`https://www.youtube-nocookie.com/embed/${yt}`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : current.source === "vimeo" && vm ? (
        <div className="aspect-video w-full overflow-hidden bg-ink">
          <iframe
            title={current.label}
            src={`https://player.vimeo.com/video/${vm}`}
            className="h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : current.source === "audio" ? (
        <audio controls className="w-full" src={current.url}>
          <a href={current.url}>{current.label}</a>
        </audio>
      ) : (
        <p>
          <a className="underline decoration-accent underline-offset-4" href={current.url}>
            Open {current.label}
          </a>
        </p>
      )}
    </div>
  );
}
