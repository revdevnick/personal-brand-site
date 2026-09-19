"use client";

import { useState, type ReactNode } from "react";
import { FormatArchiveSkeleton } from "@/components/FormatArchiveSkeleton";
import { ReadFormatNav } from "@/components/ReadFormatNav";
import type { ActiveReadFormat } from "@/lib/read-formats";

type Props = {
  active: ActiveReadFormat;
  archiveId: string;
  archiveTitle: string;
  countLabel: string;
  children: ReactNode;
};

export function ReadShell({ active, archiveId, archiveTitle, countLabel, children }: Props) {
  const [transitionPending, setTransitionPending] = useState(false);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <header className="grid gap-8 border-b border-ink/15 pb-10 md:grid-cols-[minmax(0,1fr)_16rem] md:items-end">
        <div>
          <p className="font-ui text-xs tracking-[0.22em] text-accent uppercase">Read</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.98] sm:text-7xl">
            Writing, in one stream.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/68">
            Articles for this site first. Resources and publications (writing elsewhere) stay close
            when they help — and easy to quiet when they do not.
          </p>
        </div>
        <p className="border-l border-scripture/55 pl-5 font-ui text-sm leading-relaxed text-ink/58">
          Faith, technology, software, AI, and the rest of a life. Not a magazine brand. Notes from
          the work.
        </p>
      </header>

      <ReadFormatNav active={active} onTransitionPending={setTransitionPending} />

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
