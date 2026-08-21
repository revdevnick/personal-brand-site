import type { Metadata } from "next";
import { LedgerRow } from "@/components/LedgerRow";
import { getSermons } from "@/lib/content";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Listen",
  description: "Sermons and teachings. One message, as many recordings as were captured.",
};

export default function SermonsPage() {
  const sermons = getSermons();

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <p className="font-ui text-xs tracking-[0.2em] text-ink/50 uppercase">Listen</p>
      <h1 className="mt-4 font-display text-5xl">Sermons</h1>
      <p className="mt-4 max-w-xl text-ink/70">
        When I preach at Bethlehem there are often two services. Guest pulpits, when recorded, live here too. One sermon. As many links as exist.
      </p>
      <div className="mt-12">
        {sermons.map((sermon) => (
          <LedgerRow
            key={sermon.slug}
            href={`/sermons/${sermon.slug}/`}
            kicker={`${formatDate(sermon.date)}${sermon.scripture ? ` · ${sermon.scripture}` : ""}`}
            title={sermon.title}
            meta={[sermon.venue, sermon.series].filter(Boolean).join(" · ")}
          />
        ))}
      </div>
    </div>
  );
}
