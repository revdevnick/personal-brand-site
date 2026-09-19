"use client";

import { useState, type ReactNode } from "react";
import { FormatArchiveSkeleton } from "@/components/FormatArchiveSkeleton";
import { ListenFormatNav } from "@/components/ListenFormatNav";
import type { ActiveListenFormat } from "@/lib/listen-formats";

type Props = {
  active: ActiveListenFormat;
  archiveId: string;
  archiveTitle: string;
  countLabel: string;
  children: ReactNode;
};

const HEADERS = {
  sermons: {
    title: "Sermons",
    support: "Preach the word — in season and out of season. 2 Timothy 4:2.",
  },
  appearances: {
    title: "Appearances",
    support: "Interviews and other media.",
  },
} as const;

export function ListenShell({ active, archiveId, archiveTitle, countLabel, children }: Props) {
  const [transitionPending, setTransitionPending] = useState(false);
  const header = HEADERS[active];

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <header className="border-b border-ink/15 pb-10">
        <p className="font-ui text-xs tracking-[0.22em] text-accent uppercase">Listen</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.98] sm:text-7xl">
          {header.title}
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/68">{header.support}</p>
      </header>

      <ListenFormatNav active={active} onTransitionPending={setTransitionPending} />

      <section className="pt-12" aria-labelledby={transitionPending ? undefined : archiveId}>
        {transitionPending ? (
          <FormatArchiveSkeleton />
        ) : (
          <>
            <div className="mb-5 flex items-baseline justify-between gap-4">
              <h2 id={archiveId} className="font-display text-3xl">
                {archiveTitle}
              </h2>
              <p className="font-ui text-xs tracking-[0.15em] text-ink/45 uppercase">{countLabel}</p>
            </div>
            {children}
          </>
        )}
      </section>
    </main>
  );
}
